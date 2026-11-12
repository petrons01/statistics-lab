/*
 * Statistics-Lab — Homework 5.2 (internal folder: hmw8)
 * Section 07 — Efficiency
 *
 * A — cost and accuracy of every method in one table. Times are
 *     measured in this browser, one method per tick, so the page
 *     stays responsive while they run.
 * B — how the cost buys accuracy: integration rules against N,
 *     Taylor series against the number of terms.
 */

import { METHODS, trapezoidCdf, simpsonCdf, taylorPartialSums } from './normal-cdf.js';
import { FINE_GRID, referenceCdf } from './reference.js';
import { renderLineChart, CHART_COLORS } from '../hmw4/chart.js';
import { relativeError } from './calculator-ui.js';
import { METHOD_COLORS } from './accuracy-ui.js';

const TIMING_POINTS = 4000;
const TIMING_BUDGET_MS = 60;
const SWEEP_N = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
const TAYLOR_Z = [2, 4, 6];
const TAYLOR_TERMS = 130;

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const powerOfTen = t => `10${String(t).split('').map(c => SUPERSCRIPT[c] ?? c).join('')}`;

/* =====================================================
 * 1. MEASUREMENTS
 * ===================================================== */

/** Cost and errors of one method over the grids. */
export function profileMethod(method) {
  let costSum = 0;
  let costMax = 0;
  let count = 0;
  let maxRelative = 0;
  let maxAbsolute = 0;

  for (let i = -800; i <= 800; i++) {
    const { cost } = method.compute(i / 100);
    costSum += cost;
    costMax = Math.max(costMax, cost);
    count++;
  }

  for (const zNeg of FINE_GRID) {
    const ref = referenceCdf(zNeg);
    for (const z of zNeg === 0 ? [0] : [zNeg, -zNeg]) {
      const { value } = method.compute(z);
      if (!Number.isFinite(value)) continue;              // the fraction at z = 0
      const reference = z <= 0 ? ref : 1 - ref;
      maxAbsolute = Math.max(maxAbsolute, Math.abs(value - reference));
      if (z <= 0) maxRelative = Math.max(maxRelative, relativeError(value, reference));
    }
  }

  return { costAverage: costSum / count, costMax, maxRelative, maxAbsolute };
}

/** Nanoseconds per call on z spread over [−8, 8]. */
export function timeMethod(method) {
  const zs = Array.from({ length: TIMING_POINTS }, (_, i) => -8 + 16 * ((i * 0.6180339887) % 1));
  let sink = 0;
  let calls = 0;
  const started = performance.now();
  let elapsed = 0;

  do {
    for (const z of zs) sink += method.compute(z).value || 0;
    calls += zs.length;
    elapsed = performance.now() - started;
  } while (elapsed < TIMING_BUDGET_MS);

  return { nanoseconds: (elapsed / calls) * 1e6, sink };
}

/* =====================================================
 * 2. RENDER
 * ===================================================== */

export function renderHmw8Efficiency() {
  return `
    <section class="panel hmw4-lab" id="hmw8-eff" aria-labelledby="hmw8-eff-title">

      <div class="panel-label">07 / EFFICIENCY</div>

      <h2 id="hmw8-eff-title">What Each Digit Costs</h2>

      <p>
        Cost is counted in evaluations of φ (integration), terms
        (series) or steps (continued fraction), averaged over the 1601
        points z = −8, −7.99, …, 8. Times are measured in this browser on
        the same range of z: they depend on the device, the ratios much
        less.
      </p>

      <p id="hmw8-eff-status" class="hmw4-status" role="status" aria-live="polite"></p>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption>
            Cost, time and worst error of each method. Relative error on
            z = 0, −0.01, …, −10; absolute error on z from −10 to 10.
          </caption>
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col">Average cost</th>
              <th scope="col">Worst cost</th>
              <th scope="col">Time per call</th>
              <th scope="col">Worst relative error</th>
              <th scope="col">Worst absolute error</th>
            </tr>
          </thead>
          <tbody id="hmw8-eff-table"></tbody>
        </table>
      </div>

      <div class="hmw4-interpretation" id="hmw8-eff-interpretation"></div>


      <h3>7.1 — Buying Accuracy with Work</h3>

      <div class="hmw4-chart-pair">
        <div>
          <div class="hmw4-chart" id="hmw8-eff-rules"></div>
          <div class="hmw4-legend" aria-hidden="true">
            <span><i style="background:${METHOD_COLORS.trapezoid}"></i> Trapezoidal</span>
            <span><i style="background:${METHOD_COLORS.simpson}"></i> Simpson</span>
          </div>
        </div>
        <div>
          <div class="hmw4-chart" id="hmw8-eff-taylor"></div>
          <div class="hmw4-legend" aria-hidden="true">
            ${TAYLOR_Z.map((z, i) => `
              <span><i style="background:${[CHART_COLORS.path, CHART_COLORS.theory, '#ff8f7a'][i]}"></i> z = ${z}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="hmw4-interpretation">
        <p>
          <strong>Left: the integration rules at z = 2.</strong> Doubling N
          divides the error of the trapezoidal rule by 4 and that of
          Simpson's rule by 16: orders 2 and 4, as for the functions of
          Homework 5.1. Simpson's rule reaches 10⁻¹⁴ with about a
          thousand evaluations of φ; the trapezoidal rule, with an error of
          3·10⁻⁸ at N = 1024, would need about two million.
        </p>
        <p>
          <strong>Right: the Taylor series.</strong> At z = 2 the error
          falls to 10⁻¹⁶ in about 20 terms. At z = 4 and z = 6 the partial
          sums first swing up to about 23 and 2·10⁵, and the error then
          stops falling at a floor of about 2·10⁻¹⁵ and 3·10⁻¹¹: roughly
          10⁻¹⁶ times the largest partial sum, the rounding errors of the
          big terms that never cancel. More terms cannot remove them; only
          a different formula can.
        </p>
      </div>

    </section>
  `;
}

/* =====================================================
 * 3. INITIALIZE
 * ===================================================== */

const formatError = e => (!Number.isFinite(e) ? '∞' : e === 0 ? '0' : e.toExponential(1));

export function initHmw8Efficiency() {
  const root = document.getElementById('hmw8-eff');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);
  const status = get('hmw8-eff-status');
  const tableBody = get('hmw8-eff-table');
  const explanation = get('hmw8-eff-interpretation');
  const rulesBox = get('hmw8-eff-rules');
  const taylorBox = get('hmw8-eff-taylor');

  const controller = new AbortController();
  const { signal } = controller;
  let lastWidth = 0;
  let timer = null;

  /* A — table, filled one method per tick */

  const rows = [];

  function costText(m, value) {
    if (m.costUnit === 'fixed') return 'fixed';
    return `${value.toFixed(value < 10 ? 1 : 0)} ${m.costUnit}`;
  }

  function renderTable() {
    tableBody.innerHTML = rows.map(({ m, p, t }) => `
      <tr${m.id === 'hybrid' ? ' class="hmw4-row-selected"' : ''}>
        <th scope="row">${m.label}</th>
        <td>${costText(m, p.costAverage)}</td>
        <td>${m.costUnit === 'fixed' ? 'fixed' : p.costMax.toLocaleString('en-US')}</td>
        <td>${t ? `${t.nanoseconds.toFixed(0)} ns` : '…'}</td>
        <td>${formatError(p.maxRelative)}</td>
        <td>${formatError(p.maxAbsolute)}</td>
      </tr>`).join('');
  }

  function finish() {
    const time = id => rows.find(r => r.m.id === id).t.nanoseconds;
    const ratio = time('hybrid') / time('west');

    status.textContent = `Times measured on ${TIMING_POINTS.toLocaleString('en-US')} values of z, repeated for at least ${TIMING_BUDGET_MS} ms per method.`;

    explanation.innerHTML = `
      <p>
        <strong>Fixed formulas are the fastest.</strong> Hart's rational
        approximation takes ${time('west').toFixed(0)} ns per call: one exponential
        and about thirty arithmetic operations, whatever z is. Our hybrid takes
        ${time('hybrid').toFixed(0)} ns, about ${ratio.toFixed(0)} times as long,
        because it adds up to about a hundred terms or steps. In exchange its
        relative error stays near 10⁻¹⁵ in the far tail, where Hart's grows to
        10⁻⁸.
      </p>
      <p>
        <strong>Integration is the most expensive route:</strong>
        ${time('simpson').toFixed(0)} ns for Simpson with N = 100, for an
        absolute error of 4·10⁻¹⁰ and no relative accuracy in the tail. It is the right tool when nothing better is known about
        the integrand; for Φ, the series and continued fraction exploit
        its structure. Libraries choose fixed formulas for speed, split by
        ranges of z, as Hart's does and as W. J. Cody's (used by R and
        many others) does with a relative accuracy close to ours.
      </p>`;
  }

  function measure(index = 0) {
    if (signal.aborted) return;

    if (index >= METHODS.length) {
      finish();
      return;
    }

    const m = METHODS[index];
    rows[index] = { m, p: profileMethod(m), t: null };
    renderTable();

    timer = setTimeout(() => {
      if (signal.aborted) return;
      rows[index].t = timeMethod(m);
      renderTable();
      timer = setTimeout(() => measure(index + 1), 0);
    }, 0);
  }

  status.textContent = 'Measuring…';

  /* B — charts */

  const phi2 = 1 - referenceCdf(-2);
  const rules = SWEEP_N.map(n => ({
    n,
    trapezoid: Math.abs(trapezoidCdf(2, n).value - phi2),
    simpson: Math.abs(simpsonCdf(2, n).value - phi2)
  }));

  const taylor = TAYLOR_Z.map(z => {
    const exact = 1 - referenceCdf(-z);
    return taylorPartialSums(z, TAYLOR_TERMS).map(v => Math.abs(v - exact));
  });

  const toLog = e => Math.max(-17, Math.log10(Math.max(e, 1e-17)));

  function drawCharts() {
    const width = rulesBox.clientWidth;
    const compact = width < 420;

    const ruleLines = ['trapezoid', 'simpson'].flatMap(id => {
      const points = rules.map(r => [Math.log2(r.n), toLog(r[id])]);
      return [
        { points, color: METHOD_COLORS[id], width: 1.8 },
        ...points.map(p => ({ points: [p, p], color: METHOD_COLORS[id], width: 7 }))
      ];
    });

    rulesBox.innerHTML = renderLineChart({
      width,
      height: 300,
      title: 'Absolute error of the trapezoidal and Simpson rules for Φ(2) against N, log scales',
      xLabel: 'Subintervals N (log scale)',
      yLabel: '|Error| (log scale)',
      xDomain: [0.7, 10.3],
      yDomain: [-17.3, 0],
      xTicks: compact ? [2, 6, 10] : [1, 2, 4, 6, 8, 10],
      xFormat: t => String(2 ** t),
      yTicks: compact ? [-16, -12, -8, -4, 0] : [-16, -14, -12, -10, -8, -6, -4, -2, 0],
      yFormat: t => (t === 0 ? '1' : powerOfTen(t)),
      lines: ruleLines
    });

    const colors = [CHART_COLORS.path, CHART_COLORS.theory, '#ff8f7a'];
    const taylorLines = taylor.map((errors, i) => ({
      points: errors.map((e, k) => [k + 1, toLog(e)]),
      color: colors[i],
      width: 1.8
    }));

    taylorBox.innerHTML = renderLineChart({
      width: taylorBox.clientWidth,
      height: 300,
      title: 'Absolute error of the Taylor series for Φ(z) against the number of terms, at z = 2, 4 and 6',
      xLabel: 'Terms of the Taylor series',
      yLabel: '|Error| (log scale)',
      xDomain: [0, TAYLOR_TERMS],
      yDomain: [-17.3, 8],
      yTicks: compact ? [-16, -8, 0, 8] : [-16, -12, -8, -4, 0, 4, 8],
      yFormat: t => (t === 0 ? '1' : powerOfTen(t)),
      lines: taylorLines
    });

    lastWidth = width;
  }

  const observer = new ResizeObserver(() => {
    if (Math.abs(rulesBox.clientWidth - lastWidth) > 4) drawCharts();
  });
  observer.observe(rulesBox);

  drawCharts();
  timer = setTimeout(() => measure(0), 50);

  return () => {
    controller.abort();
    observer.disconnect();
    clearTimeout(timer);
  };
}
