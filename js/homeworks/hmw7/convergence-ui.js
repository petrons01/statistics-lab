/*
 * Statistics-Lab — Homework 5.1 (internal folder: hmw7)
 * Section 05 — Accuracy, Convergence and Efficiency
 *
 * A — one function: error against N (or M) on log-log axes, and a
 *     table with the observed order, the cost to reach 10⁻⁶ and the
 *     time of the largest run.
 * B — all seven functions: do Riemann and Lebesgue reach the same
 *     value? Computed one function at a time, after the first draw,
 *     so the page stays responsive.
 */

import { FUNCTIONS, DEFAULT_FUNCTION, getFunction } from './functions.js';
import {
  SWEEP_SIZES,
  METHODS,
  convergenceSweep,
  observedOrder,
  firstBelow,
  isExact
} from './convergence.js';
import { renderLineChart } from '../hmw4/chart.js';
import { RIEMANN_COLOR, LEBESGUE_COLOR } from './slices-chart.js';
import { formatValue, formatError } from './lab-ui.js';

const TOLERANCE = 1e-6;
const FLOOR = -16;                     // log10 of an error at rounding level

const PLOTTED = [
  { id: 'left', color: RIEMANN_COLOR, dash: '6 5', label: 'Riemann, left endpoint' },
  { id: 'midpoint', color: RIEMANN_COLOR, label: 'Riemann, midpoint' },
  { id: 'upper', color: LEBESGUE_COLOR, dash: '6 5', label: 'Lebesgue, upper sum' },
  { id: 'mean', color: LEBESGUE_COLOR, label: 'Lebesgue, mean' }
];

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const superscript = t => String(t).split('').map(ch => SUPERSCRIPT[ch] ?? ch).join('');
export const powerOfTen = t => `10${superscript(t)}`;

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw7Convergence() {
  return `
    <section class="panel hmw4-lab" id="hmw7-conv" aria-labelledby="hmw7-conv-title">

      <div class="panel-label">05 / CONVERGENCE AND EFFICIENCY</div>

      <h2 id="hmw7-conv-title">How Fast, and at What Cost?</h2>

      <p>
        Each method is run with N = M = 3, 9, 27, …, 19683 subintervals
        or layers. On log–log axes an error that falls like N<sup>−p</sup>
        is a straight line of slope −p: p is the order of convergence.
        The cost is counted in evaluations of f, which does not depend
        on the computer; times are given for reference.
      </p>

      <div class="hmw4-controls">
        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw7-conv-fn">Function</label>
          <select id="hmw7-conv-fn" class="hmw4-select">
            ${FUNCTIONS.map(fn => `
              <option value="${fn.id}" ${fn.id === DEFAULT_FUNCTION ? 'selected' : ''}>${fn.label}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <p id="hmw7-conv-status" class="hmw4-status" role="status" aria-live="polite"></p>

      <div class="hmw4-chart" id="hmw7-conv-chart"></div>

      <div class="hmw4-legend" aria-hidden="true">
        ${PLOTTED.map(p => `
          <span><i style="background:${p.color};${p.dash ? 'opacity:.55' : ''}"></i> ${p.label}${p.dash ? ' (dashed)' : ''}</span>
        `).join('')}
      </div>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption id="hmw7-conv-caption"></caption>
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col">Value at 19683</th>
              <th scope="col">Error</th>
              <th scope="col">Order p</th>
              <th scope="col">Size for 10⁻⁶</th>
              <th scope="col">Evaluations</th>
            </tr>
          </thead>
          <tbody id="hmw7-conv-table"></tbody>
        </table>
      </div>

      <div class="hmw4-interpretation" id="hmw7-conv-interpretation"></div>


      <h3>Do Both Approaches Reach the Same Value?</h3>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption>
            Riemann midpoint sum and mean Lebesgue sum with N = M = 19683,
            for the seven functions. Orders are measured over the last
            four sizes of the sweep.
          </caption>
          <thead>
            <tr>
              <th scope="col">Function</th>
              <th scope="col">Exact</th>
              <th scope="col">Riemann error</th>
              <th scope="col">Order</th>
              <th scope="col">Lebesgue error</th>
              <th scope="col">Order</th>
              <th scope="col">|Riemann − Lebesgue|</th>
            </tr>
          </thead>
          <tbody id="hmw7-conv-summary"></tbody>
        </table>
      </div>

      <p class="panel-note">
        "0 (exact)" means an error below 10⁻¹⁵ relative to the value,
        the size of rounding errors in double precision; on the chart
        these points sit on the bottom line. The Lebesgue method finds
        each preimage by bisection, about 50 evaluations of f per
        crossing point and level: that is where its cost comes from.
      </p>

    </section>
  `;
}

/* =====================================================
 * 2. HELPERS
 * ===================================================== */

const sweeps = new Map();

function getSweep(fn) {
  if (!sweeps.has(fn.id)) {
    const started = performance.now();
    const rows = convergenceSweep(fn);
    sweeps.set(fn.id, { rows, elapsed: performance.now() - started });
  }
  return sweeps.get(fn.id);
}

export function orderLabel(result) {
  if (result.diverges) return 'diverges (∞)';
  if (result.exact) return 'exact';
  return result.order.toFixed(2);
}

const logError = (error, exact) =>
  isExact(error, exact) ? FLOOR : Math.max(FLOOR, Math.log10(Math.abs(error)));

/* =====================================================
 * 3. INTERPRETATION
 * ===================================================== */

function interpretation(fn, rows) {
  const order = id => observedOrder(rows, id, fn.exact);
  const cost = id => firstBelow(rows, id, TOLERANCE);
  const mid = cost('midpoint');
  const mean = cost('mean');
  const upper = cost('upper');

  const costLine = (label, c) => c
    ? `${label} reaches 10⁻⁶ at ${c.n.toLocaleString('en-US')} with ${c.evaluations.toLocaleString('en-US')} evaluations`
    : `${label} does not reach 10⁻⁶ within 19683`;

  switch (fn.id) {
    case 'step13':
    case 'step10':
      return `
        <p><strong>Here Lebesgue wins outright.</strong> f is a simple
        function, so the upper Lebesgue sum is exact from M = 3
        (${upper ? `${upper.evaluations} evaluations` : ''}): the levels
        contain the values of f. Every Riemann sum keeps an error of
        order h = 1/N from the one subinterval that contains the jump
        (order ${orderLabel(order('left'))} for left tags), and
        ${costLine('the midpoint sum', mid)}. The trapezoidal rule is
        exact here only by coincidence: with N = 3<sup>k</sup> the jump
        falls exactly in the middle of a subinterval, where averaging
        the two ends gives the right area.</p>`;

    case 'abs':
      return `
        <p><strong>A corner is harmless for both.</strong> Riemann
        midpoint converges with order ${orderLabel(order('midpoint'))}
        (${costLine('it', mid)}). The mean Lebesgue sum is exact for every
        M, because μ(f &gt; t) = 1 − 2t is linear in t; the one-sided
        Lebesgue sums converge with order ${orderLabel(order('upper'))}.</p>`;

    case 'invsqrt':
      return `
        <p><strong>Nobody converges fast.</strong> Left tags and the
        trapezoidal rule use f(0) = ∞ and give ∞ for every N. Midpoint
        tags avoid 0 and converge with order ${orderLabel(order('midpoint'))}:
        the first subinterval alone carries an error of about
        0.59/√N. The mean Lebesgue sum, which integrates min(f, T) with
        T = M<sup>2/3</sup>, converges with order ${orderLabel(order('mean'))},
        close to the 2/3 predicted by balancing the missing tail 1/T
        against the layer error. Neither reaches 10⁻⁶ here, but the
        Lebesgue approach handles the singularity without any special
        treatment of x = 0: the layer {f &gt; t} = (0, 1/t²) simply
        gets thinner.</p>`;

    default:
      return `
        <p><strong>For a smooth function, Riemann is cheaper.</strong>
        Midpoint and trapezoidal sums converge with order
        ${orderLabel(order('midpoint'))}, and ${costLine('the midpoint sum', mid)}.
        The mean Lebesgue sum converges with order
        ${orderLabel(order('mean'))}, and ${costLine('it', mean)}, because
        every level costs a bisection.</p>
        <p><strong>Why 1.5 and not 2?</strong> The mean Lebesgue sum is
        the trapezoidal rule applied to g(t) = μ(f &gt; t) on the range.
        Where f has a flat point (f′ = 0, here at
        ${fn.id === 'square' ? 'x = 0' : fn.id === 'sinc' ? 'x = 0' : 'x = π/2'}),
        g behaves like a square root and has infinite slope, which
        costs half an order. Riemann is hurt by corners and jumps in x;
        Lebesgue is hurt by flat spots, where a thin layer of the range
        corresponds to a wide piece of the domain.</p>`;
  }
}

/* =====================================================
 * 4. INITIALIZE
 * ===================================================== */

export function initHmw7Convergence() {
  const root = document.getElementById('hmw7-conv');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);
  const fnSelect = get('hmw7-conv-fn');
  const status = get('hmw7-conv-status');
  const chartBox = get('hmw7-conv-chart');
  const caption = get('hmw7-conv-caption');
  const tableBody = get('hmw7-conv-table');
  const explanation = get('hmw7-conv-interpretation');
  const summaryBody = get('hmw7-conv-summary');

  const controller = new AbortController();
  const { signal } = controller;
  let lastWidth = 0;
  let timer = null;

  function drawChart(fn, rows) {
    const x = rows.map(r => Math.log10(r.n));
    const lines = PLOTTED.map(p => ({
      points: rows
        .filter(r => Number.isFinite(r.errors[p.id]))
        .map(r => [Math.log10(r.n), logError(r.errors[p.id], fn.exact)]),
      color: p.color,
      width: 1.8,
      dash: p.dash
    }));

    const dots = PLOTTED.flatMap(p => rows
      .filter(r => Number.isFinite(r.errors[p.id]))
      .map(r => {
        const point = [Math.log10(r.n), logError(r.errors[p.id], fn.exact)];
        return { points: [point, point], color: p.color, width: 7 };
      }));

    const finite = lines.flatMap(l => l.points.map(([, y]) => y));
    const top = Math.ceil(Math.max(0, ...finite) + 0.3);
    const compact = chartBox.clientWidth < 520;
    const yTicks = [];
    for (let t = FLOOR; t <= top; t += compact ? 4 : 2) yTicks.push(t);

    chartBox.innerHTML = renderLineChart({
      width: chartBox.clientWidth,
      height: 320,
      title: `Absolute error against N or M for ${fn.formula}, log-log scale`,
      xLabel: 'Subintervals N or layers M (log scale)',
      yLabel: '|Error| (log scale)',
      xDomain: [x[0] - 0.1, x[x.length - 1] + 0.1],
      yDomain: [FLOOR - 0.6, top],
      xTicks: [1, 2, 3, 4],
      xFormat: t => powerOfTen(t),
      yTicks,
      yFormat: t => (t === FLOOR ? 'exact' : powerOfTen(t)),
      lines: [...lines, ...dots]
    });

    lastWidth = chartBox.clientWidth;
  }

  function draw() {
    const fn = getFunction(fnSelect.value);
    const { rows, elapsed } = getSweep(fn);
    const last = rows[rows.length - 1];

    status.textContent =
      `${fn.formula} on ${fn.domain}, exact ${fn.exactLabel}. ` +
      `${SWEEP_SIZES.length} sizes × 6 methods computed in ${elapsed.toFixed(0)} ms; ` +
      `the largest Lebesgue run took ${last.time.lebesgue.toFixed(1)} ms, ` +
      `a Riemann sum with N = 19683 ${last.time.riemann.toFixed(2)} ms.`;

    drawChart(fn, rows);

    caption.textContent = `${fn.formula}: value and error at N = M = 19683; observed order p over the last four sizes; first N or M of the sequence 3, 9, 27, … with |error| ≤ 10⁻⁶, and the evaluations of f it takes.`;

    tableBody.innerHTML = METHODS.map(m => {
      const reached = firstBelow(rows, m.id, TOLERANCE);
      return `
        <tr>
          <th scope="row">${m.label}</th>
          <td>${formatValue(last.values[m.id], 10)}</td>
          <td>${formatError(last.errors[m.id], fn.exact)}</td>
          <td>${orderLabel(observedOrder(rows, m.id, fn.exact))}</td>
          <td>${reached ? reached.n.toLocaleString('en-US') : 'not reached'}</td>
          <td>${reached ? reached.evaluations.toLocaleString('en-US') : '—'}</td>
        </tr>`;
    }).join('');

    explanation.innerHTML = interpretation(fn, rows);
  }

  function summaryRow(fn) {
    const { rows } = getSweep(fn);
    const last = rows[rows.length - 1];
    return `
      <tr>
        <th scope="row">${fn.label}</th>
        <td>${fn.exactLabel}</td>
        <td>${formatError(last.errors.midpoint, fn.exact)}</td>
        <td>${orderLabel(observedOrder(rows, 'midpoint', fn.exact))}</td>
        <td>${formatError(last.errors.mean, fn.exact)}</td>
        <td>${orderLabel(observedOrder(rows, 'mean', fn.exact))}</td>
        <td>${Math.abs(last.values.midpoint - last.values.mean).toExponential(1)}</td>
      </tr>`;
  }

  /* The summary is filled one function per tick */
  function fillSummary(index = 0) {
    if (signal.aborted || index >= FUNCTIONS.length) return;
    summaryBody.insertAdjacentHTML('beforeend', summaryRow(FUNCTIONS[index]));
    timer = setTimeout(() => fillSummary(index + 1), 0);
  }

  fnSelect.addEventListener('change', draw, { signal });

  const observer = new ResizeObserver(() => {
    if (Math.abs(chartBox.clientWidth - lastWidth) > 4) {
      drawChart(getFunction(fnSelect.value), getSweep(getFunction(fnSelect.value)).rows);
    }
  });
  observer.observe(chartBox);

  draw();
  timer = setTimeout(() => fillSummary(0), 0);

  return () => {
    controller.abort();
    observer.disconnect();
    clearTimeout(timer);
  };
}
