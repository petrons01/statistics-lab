/*
 * Statistics-Lab — Homework 5.1 (internal folder: hmw7)
 * Section 04 — The Lab: Vertical Slices and Horizontal Layers
 *
 * One function, N subintervals for the Riemann sum, M layers for
 * the Lebesgue sums. The two partitions are drawn side by side and
 * their values compared with the exact integral.
 */

import { FUNCTIONS, DEFAULT_FUNCTION, getFunction, topLevel } from './functions.js';
import { RIEMANN_RULES, riemannSum, riemannTags } from './riemann.js';
import { lebesgueSums } from './lebesgue.js';
import { renderSlicesChart, RIEMANN_COLOR, LEBESGUE_COLOR } from './slices-chart.js';

const MAX_PARTS = 2000;
const DEFAULT_N = 8;
const DEFAULT_M = 8;

/* 1/√x is unbounded: the drawing stops at y = 5 */
const DRAW_CAP = 5;

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw7Lab() {
  return `
    <section class="panel hmw4-lab" id="hmw7-lab" aria-labelledby="hmw7-lab-title">

      <div class="panel-label">04 / THE LAB</div>

      <h2 id="hmw7-lab-title">Vertical Slices and Horizontal Layers</h2>

      <p>
        Choose a function, the number N of subintervals of the domain
        and the number M of layers of the range. On the left, the
        Riemann sum adds N rectangles whose heights are values of f.
        On the right, the Lebesgue sums add M horizontal layers of
        height Δ whose widths are measures of preimages: the light
        part is {f &gt; y<sub>k</sub>} (upper sum), the dark part
        {f &gt; y<sub>k+1</sub>} (lower sum).
      </p>

      <div class="hmw4-controls">

        <div class="hmw4-field hmw7-field-function">
          <label class="hmw4-label" for="hmw7-lab-fn">Function</label>
          <select id="hmw7-lab-fn" class="hmw4-select">
            ${FUNCTIONS.map(fn => `
              <option value="${fn.id}" ${fn.id === DEFAULT_FUNCTION ? 'selected' : ''}>${fn.label}</option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw7-lab-rule">Riemann tags</label>
          <select id="hmw7-lab-rule" class="hmw4-select">
            ${RIEMANN_RULES.map(r => `
              <option value="${r.id}" ${r.id === 'midpoint' ? 'selected' : ''}>${r.label}</option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw7-lab-n">Subintervals N</label>
          <input id="hmw7-lab-n" class="hmw4-input" type="number"
                 min="1" max="${MAX_PARTS}" step="1" value="${DEFAULT_N}" />
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw7-lab-m">Layers M</label>
          <input id="hmw7-lab-m" class="hmw4-input" type="number"
                 min="1" max="${MAX_PARTS}" step="1" value="${DEFAULT_M}" />
        </div>

      </div>

      <p id="hmw7-lab-status" class="hmw4-status" role="status" aria-live="polite"></p>

      <div class="hmw4-chart-pair">
        <div>
          <h3 class="hmw7-chart-title">Riemann: partition of the domain</h3>
          <div class="hmw4-chart" id="hmw7-lab-riemann"></div>
          <div class="hmw4-legend" aria-hidden="true">
            <span><i style="background:${RIEMANN_COLOR}"></i> Rectangles of width h</span>
            <span><i style="background:#e8f4f6"></i> f</span>
          </div>
        </div>
        <div>
          <h3 class="hmw7-chart-title">Lebesgue: partition of the range</h3>
          <div class="hmw4-chart" id="hmw7-lab-lebesgue"></div>
          <div class="hmw4-legend" aria-hidden="true">
            <span><i style="background:${LEBESGUE_COLOR};opacity:.45"></i> Upper sum only</span>
            <span><i style="background:${LEBESGUE_COLOR}"></i> Lower sum</span>
          </div>
        </div>
      </div>

      <div class="hmw4-metrics" id="hmw7-lab-metrics"></div>

      <div class="hmw4-interpretation" id="hmw7-lab-interpretation"></div>

    </section>
  `;
}

/* =====================================================
 * 2. HELPERS
 * ===================================================== */

export function formatValue(value, digits = 8) {
  if (value === Infinity) return '∞';
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(digits);
}

export function formatError(error, exact = 1) {
  if (!Number.isFinite(error)) return '∞';
  if (Math.abs(error) <= 1e-15 * Math.max(1, Math.abs(exact))) return '0 (exact)';
  const sign = error > 0 ? '+' : '−';
  return `${sign}${Math.abs(error).toExponential(2)}`;
}

const readCount = input => {
  const value = Number(input.value);
  return Number.isInteger(value) && value >= 1 && value <= MAX_PARTS ? value : null;
};

/* =====================================================
 * 3. INTERPRETATION
 * ===================================================== */

function interpretation(fn, rule, N, M, rSum, leb) {
  const rErr = rSum.value - fn.exact;
  const meanErr = leb.mean - fn.exact;
  const paragraphs = [];

  if (fn.id === 'invsqrt') {
    paragraphs.push(`
      <strong>An unbounded function.</strong> f(0) = ∞, so every
      Riemann sum that evaluates f at x = 0 (left tags, the
      trapezoidal rule) is infinite: a function that is not bounded
      has no Riemann integral in the proper sense, only an improper
      one, lim<sub>ε→0</sub> ∫<sub>ε</sub><sup>1</sup> = 2.
      ${rule === 'left'
        ? 'Choose midpoint or right tags to see a finite sum.'
        : `With ${rule} tags the sum is finite and approaches 2, slowly: error ${formatError(rErr)}.`}
    `);
    paragraphs.push(`
      <strong>Lebesgue cuts the range at T = ${leb.top.toFixed(2)}.</strong>
      It integrates min(f, T): the part above T, worth exactly 1/T =
      ${(1 / leb.top).toFixed(4)}, is missing, and it shrinks as M
      (and T = M<sup>2/3</sup>) grows. The mean Lebesgue sum has
      error ${formatError(meanErr)}. The drawing stops at y = ${DRAW_CAP}.
    `);
    return paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  const bracketed = leb.lower <= fn.exact + 1e-12 && fn.exact <= leb.upper + 1e-12;

  paragraphs.push(`
    <strong>${bracketed ? 'The exact value lies between the two Lebesgue sums.' : 'Lebesgue sums.'}</strong>
    Lower ${formatValue(leb.lower, 6)} ≤ ${fn.exactLabel} ≤ upper ${formatValue(leb.upper, 6)}.
    Their gap is Δ·μ(f &gt; 0) = ${(leb.upper - leb.lower).toFixed(6)}: one layer
    height times the length where f is positive, so it closes like 1/M
    for any bounded function.
  `);

  if (fn.id === 'step13' || fn.id === 'step10') {
    const valuesOnLevels = fn.id === 'step13' ? M % 3 === 0 : true;
    paragraphs.push(`
      <strong>A simple function.</strong> f takes only the values
      ${fn.id === 'step13' ? '1 and 3' : '1 and 0'}, so {f &gt; t} is either
      ${fn.id === 'step13' ? '[0, 1], [½, 1]' : '[0, ½)'} or empty.
      ${valuesOnLevels
        ? `The levels include the values of f, and the upper Lebesgue sum
           is exact (error ${formatError(leb.upper - fn.exact, fn.exact)}).`
        : `With M = ${M} the value 1 is not a level (M is not a
           multiple of 3): one layer straddles it, and the upper sum
           overestimates that layer, error ${formatError(leb.upper - fn.exact, fn.exact)}.
           Try M = 3.`}
      ${Math.abs(rErr) <= 1e-15
        ? `The Riemann sum is exact too: with N = ${N} the jump at x = ½
           is a grid point and every ${rule} tag sees the right value.
           Try an odd N.`
        : `The Riemann sum errs only in the subinterval at the jump
           x = ½: error ${formatError(rErr, fn.exact)}, at most
           (jump × h) = ${((fn.id === 'step13' ? 2 : 1) / N).toFixed(4)}.`}
    `);
  } else if (fn.id === 'abs') {
    paragraphs.push(`
      <strong>The mean Lebesgue sum is exact for every M.</strong>
      μ(f &gt; t) = 1 − 2t is a straight line in t, and the mean of the
      lower and upper sums integrates a straight line exactly
      (error ${formatError(meanErr, fn.exact)}). The corner at x = ½
      is invisible from the range. Riemann error:
      ${formatError(rErr, fn.exact)}${Math.abs(rErr) <= 1e-15
        ? `, also exact: with N even the corner is a grid point and f is
           a straight line on every subinterval. An odd N puts the corner
           inside one of them.`
        : '.'}
    `);
  } else {
    paragraphs.push(`
      <strong>Both approaches approach ${fn.exactLabel}.</strong>
      Riemann (${rule}, N = ${N}): error ${formatError(rErr, fn.exact)} with
      ${rSum.evaluations} evaluations of f. Lebesgue mean (M = ${M}):
      error ${formatError(meanErr, fn.exact)}, but each level needs a
      bisection to locate the preimage, ${leb.evaluations.toLocaleString('en-US')}
      evaluations in total. Near the flat point of f
      (${fn.id === 'square' || fn.id === 'sinc' ? 'x = 0' : 'x = π/2'}) the edges of
      consecutive layers jump far apart: one thin layer of the range
      covers a wide piece of the domain.
    `);
  }

  return paragraphs.map(p => `<p>${p}</p>`).join('');
}

/* =====================================================
 * 4. INITIALIZE
 * ===================================================== */

export function initHmw7Lab() {
  const root = document.getElementById('hmw7-lab');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);
  const fnSelect = get('hmw7-lab-fn');
  const ruleSelect = get('hmw7-lab-rule');
  const nInput = get('hmw7-lab-n');
  const mInput = get('hmw7-lab-m');
  const status = get('hmw7-lab-status');
  const riemannBox = get('hmw7-lab-riemann');
  const lebesgueBox = get('hmw7-lab-lebesgue');
  const metrics = get('hmw7-lab-metrics');
  const explanation = get('hmw7-lab-interpretation');

  const controller = new AbortController();
  const { signal } = controller;

  let lastWidth = 0;
  let current = null;

  function compute() {
    const N = readCount(nInput);
    const M = readCount(mInput);

    if (N === null || M === null) {
      status.textContent = `N and M must be whole numbers from 1 to ${MAX_PARTS}.`;
      return;
    }

    const fn = getFunction(fnSelect.value);
    const rule = ruleSelect.value;
    const rSum = riemannSum(fn.f, fn.a, fn.b, N, rule);
    const leb = lebesgueSums(fn, M, topLevel(fn, M), { keepIntervals: true });

    current = { fn, rule, N, M, rSum, leb, tags: riemannTags(fn.a, fn.b, N, rule) };

    status.textContent =
      `${fn.formula} on ${fn.domain}, exact integral ${fn.exactLabel}. ` +
      `Riemann: ${N} subinterval${N > 1 ? 's' : ''} of width ${((fn.b - fn.a) / N).toPrecision(3)}. ` +
      `Lebesgue: ${M} layer${M > 1 ? 's' : ''} of height Δ = ${leb.delta.toPrecision(3)} ` +
      `up to ${Number.isFinite(fn.sup) ? 'sup f' : 'T'} = ${leb.top.toPrecision(3)}.`;

    metrics.innerHTML = [
      ['EXACT INTEGRAL', formatValue(fn.exact)],
      [`RIEMANN SUM (${rule.toUpperCase()})`, formatValue(rSum.value)],
      ['RIEMANN ERROR', formatError(rSum.value - fn.exact, fn.exact)],
      ['LEBESGUE LOWER · UPPER', `${formatValue(leb.lower, 4)} · ${formatValue(leb.upper, 4)}`],
      ['LEBESGUE MEAN', formatValue(leb.mean)],
      ['LEBESGUE MEAN ERROR', formatError(leb.mean - fn.exact, fn.exact)],
      ['EVALUATIONS OF f', `${rSum.evaluations.toLocaleString('en-US')} · ${leb.evaluations.toLocaleString('en-US')}`]
    ].map(([label, value]) => `
      <div class="hmw4-metric">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>`).join('');

    explanation.innerHTML = interpretation(fn, rule, N, M, rSum, leb);

    draw();
  }

  function draw() {
    if (!current) return;
    const { fn, rule, N, M, leb, tags } = current;
    const yMax = Number.isFinite(fn.sup) ? fn.sup * 1.12 : DRAW_CAP;

    riemannBox.innerHTML = renderSlicesChart({
      width: riemannBox.clientWidth,
      title: `Riemann sum of ${fn.formula} with ${N} subintervals and ${rule} tags`,
      fn,
      yMax,
      mode: 'riemann',
      riemann: { N, tags }
    });

    lebesgueBox.innerHTML = renderSlicesChart({
      width: lebesgueBox.clientWidth,
      title: `Lebesgue sums of ${fn.formula} with ${M} layers of the range`,
      fn,
      yMax,
      mode: 'lebesgue',
      lebesgue: { M, top: leb.top, preimages: leb.preimages }
    });

    lastWidth = riemannBox.clientWidth;
  }

  [fnSelect, ruleSelect].forEach(el => el.addEventListener('change', compute, { signal }));
  [nInput, mInput].forEach(el => el.addEventListener('input', compute, { signal }));

  const observer = new ResizeObserver(() => {
    if (Math.abs(riemannBox.clientWidth - lastWidth) > 4) draw();
  });
  observer.observe(riemannBox);

  compute();

  return () => {
    controller.abort();
    observer.disconnect();
  };
}
