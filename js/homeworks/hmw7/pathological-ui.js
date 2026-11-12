/*
 * Statistics-Lab — Homework 5.1 (internal folder: hmw7)
 * Section 06 — Pathological Functions: Dirichlet and Thomae
 */

import {
  dirichletSums,
  thomaeSums,
  THOMAE_SIZES,
  thomaeOfInput
} from './pathological.js';
import { renderLineChart } from '../hmw4/chart.js';
import { RIEMANN_COLOR, LEBESGUE_COLOR } from './slices-chart.js';
import { powerOfTen, superscript } from './convergence-ui.js';

const DIRICHLET_SIZES = [10, 100, 1000, 10000];
const UPPER_COLOR = '#ff8f7a';

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw7Pathological() {
  return `
    <section class="panel hmw4-lab" id="hmw7-path" aria-labelledby="hmw7-path-title">

      <div class="panel-label">06 / PATHOLOGICAL FUNCTIONS</div>

      <h2 id="hmw7-path-title">Where the Two Integrals Part Ways</h2>

      <p>
        Both functions below live on [0, 1] and are built from the
        rational numbers, which are dense (every interval contains
        some) but countable, hence of measure 0. Rational and
        irrational points cannot be told apart in floating point (see
        6.3), so here every tag is stored exactly as r + s·√2 with r
        and s rational: it is irrational exactly when s ≠ 0.
      </p>


      <h3>6.1 — Dirichlet's Function</h3>

      <div class="math-display">
        D(x) = 1 if x ∈ ℚ, &nbsp; 0 if x ∉ ℚ
      </div>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption>
            Riemann sums with N equal subintervals: tags at the midpoints
            (2i + 1)/(2N), which are rational, or at i/N + (√2 − 1)/N,
            which are irrational. Darboux sums use sup D and inf D on
            each subinterval.
          </caption>
          <thead>
            <tr>
              <th scope="col">N</th>
              <th scope="col">Rational tags</th>
              <th scope="col">Irrational tags</th>
              <th scope="col">Upper Darboux</th>
              <th scope="col">Lower Darboux</th>
              <th scope="col">Lebesgue</th>
            </tr>
          </thead>
          <tbody id="hmw7-path-dirichlet"></tbody>
        </table>
      </div>

      <div class="hmw4-interpretation">
        <p>
          <strong>Not Riemann integrable.</strong> Every subinterval
          contains rationals and irrationals, so sup D = 1 and
          inf D = 0 on each: the upper Darboux sum is 1 and the lower
          is 0 for every partition. Riemann sums give 1 or 0 depending
          only on where the tags are chosen, however fine the
          partition: there is no limit.
        </p>
        <p>
          <strong>Lebesgue integral 0, with M = 1.</strong> For
          0 ≤ t &lt; 1 the layer {D &gt; t} is ℚ ∩ [0, 1]. Listing the
          rationals q<sub>1</sub>, q<sub>2</sub>, … and covering q<sub>k</sub>
          with an interval of length ε/2<sup>k</sup> covers them all with
          total length ε, for any ε &gt; 0: their measure is 0. So
          D = 0 almost everywhere and ∫D dμ = 1·μ(ℚ ∩ [0, 1]) = 0.
          A single layer gives the exact answer.
        </p>
      </div>


      <h3>6.2 — Thomae's Function</h3>

      <div class="math-display">
        T(p/q) = 1/q, &nbsp; T(x) = 0 if x ∉ ℚ
      </div>

      <p>
        Here p/q is in lowest terms, with q ≥ 1, and T(0) = T(0/1) = 1:
        T(½) = ½, T(⅓) = T(⅔) = ⅓, and so on.
      </p>

      <div class="hmw4-chart" id="hmw7-path-chart"></div>

      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${UPPER_COLOR}"></i> Upper Darboux sum</span>
        <span><i style="background:${RIEMANN_COLOR};opacity:.55"></i> Riemann, left tags i/N (dashed)</span>
        <span><i style="background:${RIEMANN_COLOR}"></i> Riemann, midpoint tags</span>
      </div>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption>
            Sums for Thomae's function with N equal subintervals. The
            lower Darboux sum and the sum with irrational tags are 0 for
            every N.
          </caption>
          <thead>
            <tr>
              <th scope="col">N</th>
              <th scope="col">Left tags i/N</th>
              <th scope="col">Midpoint tags</th>
              <th scope="col">Irrational tags</th>
              <th scope="col">Upper Darboux</th>
              <th scope="col">Lebesgue</th>
            </tr>
          </thead>
          <tbody id="hmw7-path-thomae"></tbody>
        </table>
      </div>

      <div class="hmw4-interpretation" id="hmw7-path-thomae-text"></div>


      <h3>6.3 — What the Computer Actually Sees</h3>

      <p>
        A double is a fraction m/2<sup>e</sup>: every floating-point
        number is rational, and most rationals (1/3, 1/10) cannot be
        stored exactly. A program for D(x) can therefore only return 1,
        and one for T(x) sees an enormous power of two as denominator.
        Type a number in [0, 1], as a decimal or as a fraction p/q:
      </p>

      <div class="hmw4-controls">
        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw7-path-input">Number x</label>
          <input id="hmw7-path-input" class="hmw4-input" type="text"
                 value="0.1" inputmode="decimal" autocomplete="off" spellcheck="false" />
        </div>
      </div>

      <div class="hmw4-metrics" id="hmw7-path-metrics"></div>

      <p id="hmw7-path-input-text" class="hmw4-status" role="status" aria-live="polite"></p>

    </section>
  `;
}

/* =====================================================
 * 2. HELPERS
 * ===================================================== */

const plain = value => (value === 0 ? '0' : value === 1 ? '1' : value.toFixed(6));

function slope(xs, ys) {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const sxy = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const sxx = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  return sxy / sxx;
}

/* =====================================================
 * 3. INITIALIZE
 * ===================================================== */

export function initHmw7Pathological() {
  const root = document.getElementById('hmw7-path');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);
  const dirichletBody = get('hmw7-path-dirichlet');
  const thomaeBody = get('hmw7-path-thomae');
  const thomaeText = get('hmw7-path-thomae-text');
  const chartBox = get('hmw7-path-chart');
  const input = get('hmw7-path-input');
  const metrics = get('hmw7-path-metrics');
  const inputText = get('hmw7-path-input-text');

  const controller = new AbortController();
  const { signal } = controller;
  let lastWidth = 0;

  /* 6.1 — Dirichlet */

  dirichletBody.innerHTML = DIRICHLET_SIZES.map(N => {
    const s = dirichletSums(N);
    return `
      <tr>
        <th scope="row">${N.toLocaleString('en-US')}</th>
        <td>${plain(s.rationalTags)}</td>
        <td>${plain(s.irrationalTags)}</td>
        <td>${plain(s.upper)}</td>
        <td>${plain(s.lower)}</td>
        <td>${plain(s.lebesgue)}</td>
      </tr>`;
  }).join('');

  /* 6.2 — Thomae */

  const thomae = THOMAE_SIZES.map(thomaeSums);
  const logN = thomae.map(s => Math.log10(s.N));
  const upperSlope = slope(logN, thomae.map(s => Math.log10(s.upper)));

  thomaeBody.innerHTML = thomae.map(s => `
    <tr>
      <th scope="row">${s.N.toLocaleString('en-US')}</th>
      <td>${s.left.toExponential(3)}</td>
      <td>${s.midpoint.toExponential(3)}</td>
      <td>${plain(s.irrationalTags)}</td>
      <td>${s.upper.toExponential(3)}</td>
      <td>0</td>
    </tr>`).join('');

  const first = thomae[0];
  const last = thomae[thomae.length - 1];

  thomaeText.innerHTML = `
    <p>
      <strong>Riemann integrable, with integral 0.</strong> The lower
      Darboux sum is always 0 (every subinterval contains irrationals),
      and the upper one falls from ${first.upper.toFixed(3)} at N = ${first.N}
      to ${last.upper.toFixed(4)} at N = ${last.N.toLocaleString('en-US')}: only
      finitely many points have T ≥ ε (those with q ≤ 1/ε), and they
      fit in subintervals of total length that vanishes as N grows.
      The gap closes, so T is Riemann integrable, but slowly: on the
      chart the upper sum falls roughly like N<sup>${upperSlope.toFixed(2)}</sup>.
      Riemann sums with rational tags also tend to 0, irregularly,
      because T(i/N) depends on the divisors of N.
    </p>
    <p>
      <strong>Lebesgue: 0 at once.</strong> For every t &gt; 0 the set
      {T &gt; t} is finite, and T &gt; 0 only on the rationals, a set
      of measure 0. T is continuous at every irrational and
      discontinuous at every rational: its discontinuities have
      measure 0, which by Lebesgue's criterion is exactly why it is
      Riemann integrable, while Dirichlet's function, discontinuous
      everywhere, is not.
    </p>`;

  function drawChart() {
    const series = [
      { key: 'upper', color: UPPER_COLOR },
      { key: 'left', color: RIEMANN_COLOR, dash: '6 5' },
      { key: 'midpoint', color: RIEMANN_COLOR }
    ];
    const values = thomae.flatMap(s => [s.upper, s.left, s.midpoint].map(Math.log10));

    chartBox.innerHTML = renderLineChart({
      width: chartBox.clientWidth,
      height: 290,
      title: 'Upper Darboux sum and Riemann sums of Thomae\'s function against N, log-log scale',
      xLabel: 'Subintervals N (log scale)',
      yLabel: 'Sum (log scale)',
      xDomain: [0.9, 4.1],
      yDomain: [Math.floor(Math.min(...values)) - 0.2, 0.1],
      xTicks: [1, 2, 3, 4],
      xFormat: powerOfTen,
      yTicks: [-4, -3, -2, -1, 0],
      yFormat: t => (t === 0 ? '1' : powerOfTen(t)),
      lines: series.flatMap(s => {
        const points = thomae.map((row, i) => [logN[i], Math.log10(row[s.key])]);
        return [
          { points, color: s.color, width: 1.8, dash: s.dash },
          ...points.map(p => ({ points: [p, p], color: s.color, width: 7 }))
        ];
      })
    });

    lastWidth = chartBox.clientWidth;
  }

  /* 6.3 — Floating point */

  function showInput() {
    const r = thomaeOfInput(input.value);

    if (!r) {
      metrics.innerHTML = '';
      inputText.textContent = 'Enter a number between 0 and 1, such as 0.1, 0.75 or 1/3.';
      return;
    }

    const fraction = ({ num, den }) => (den === 1n ? `${num}` : `${num}/${den}`);

    metrics.innerHTML = [
      ['THE NUMBER YOU MEAN', fraction(r.exact)],
      ['T OF THAT NUMBER', r.thomaeExact === 0 ? '0' : `1/${r.exact.den} = ${r.thomaeExact.toPrecision(4)}`],
      ['THE DOUBLE STORED', fraction(r.stored)],
      ['T OF THE STORED DOUBLE', r.thomaeStored.toPrecision(4)]
    ].map(([label, value]) => `
      <div class="hmw4-metric hmw7-metric-wrap">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>`).join('');

    inputText.textContent = r.storedIsExact
      ? `${fraction(r.exact)} has a power of two as denominator, so the double is exact and T is computed correctly. ` +
        'Such dyadic fractions are the only rationals a computer stores exactly.'
      : `The double is not ${fraction(r.exact)} but a nearby fraction with denominator 2${superscript(r.stored.den.toString(2).length - 1)}, ` +
        `so T would return ${r.thomaeStored.toPrecision(3)} instead of ${r.thomaeExact.toPrecision(3)}. ` +
        'And D would return 1 for every input, rational or not: both functions can only be studied with exact representations.';
  }

  input.addEventListener('input', showInput, { signal });

  const observer = new ResizeObserver(() => {
    if (Math.abs(chartBox.clientWidth - lastWidth) > 4) drawChart();
  });
  observer.observe(chartBox);

  drawChart();
  showInput();

  return () => {
    controller.abort();
    observer.disconnect();
  };
}
