/*
 * Statistics-Lab — Homework 5.2 (internal folder: hmw8)
 * Section 06 — Accuracy against the References
 *
 * A — the web tables: Wikipedia (16 values, 15 decimals) and
 *     NIST (410 values, 5 decimals), for every method.
 * B — the whole left half-line: error of each method on the
 *     1001 points z = 0, −0.01, …, −10 of the high-precision grid.
 */

import { METHODS, getMethod } from './normal-cdf.js';
import { WIKIPEDIA, NIST, FINE_GRID, referenceCdf } from './reference.js';
import { renderLineChart, CHART_COLORS } from '../hmw4/chart.js';
import { relativeError } from './calculator-ui.js';

export const METHOD_COLORS = {
  trapezoid: '#7fb2ff',
  simpson: '#c39bff',
  taylor: '#ff8f7a',
  positive: '#f8c879',
  fraction: '#ffd1f0',
  as7126: '#ff8f7a',
  nr: '#7fb2ff',
  west: '#f8c879',
  hybrid: CHART_COLORS.path
};

const GROUPS = [
  { id: 'integration', label: 'Integration', methods: ['trapezoid', 'simpson', 'hybrid'] },
  { id: 'series', label: 'Series and fraction', methods: ['taylor', 'positive', 'fraction', 'hybrid'] },
  { id: 'approx', label: 'Approximations', methods: ['as7126', 'nr', 'west', 'hybrid'] }
];

const FLOOR = -17;
const CEILING = 2;

/* =====================================================
 * 1. COMPARISONS (also used by sections 07 and 08)
 * ===================================================== */

/** z values of the NIST table: 0.00 … 4.09. */
export const NIST_POINTS = Object.entries(NIST).flatMap(([row, values]) =>
  values.map((area, j) => ({ z: (Math.round(Number(row) * 100) + j) / 100, area })));

export function webAgreement(method) {
  const wikipedia = WIKIPEDIA.map(([k, printed]) => {
    const p = 2 * method.compute(k).value - 1;
    return { k, printed, computed: p, match: Number.isFinite(p) && p.toFixed(15) === printed };
  });

  const nistMisses = NIST_POINTS.filter(({ z, area }) => {
    const a = method.compute(z).value - 0.5;
    return !(Number.isFinite(a) && Math.round(a * 1e5) === Math.round(area * 1e5));
  });

  return {
    wikipedia,
    wikipediaMatches: wikipedia.filter(w => w.match).length,
    nistMatches: NIST_POINTS.length - nistMisses.length,
    nistMisses
  };
}

/** Relative errors on the grid z = 0 … −10 (NaN where a method has no value). */
export function gridErrors(method) {
  return FINE_GRID.map(z => {
    const { value } = method.compute(z);
    return Number.isFinite(value) ? relativeError(value, referenceCdf(z)) : NaN;
  });
}

/* =====================================================
 * 2. RENDER
 * ===================================================== */

export function renderHmw8Accuracy() {
  return `
    <section class="panel hmw4-lab" id="hmw8-acc" aria-labelledby="hmw8-acc-title">

      <div class="panel-label">06 / ACCURACY</div>

      <h2 id="hmw8-acc-title">How Many Digits Are Right?</h2>

      <h3>6.1 — Against the Tables Found on the Web</h3>

      <p>
        Two published tables serve as trusted references. The article
        on the 68–95–99.7 rule in Wikipedia lists P(|Z| &lt; k) = 2Φ(k) − 1
        to 15 decimals for k = 0.5, 1, …, 8. The NIST/SEMATECH
        e-Handbook of Statistical Methods lists the area from 0 to z,
        Φ(z) − ½, to 5 decimals for z = 0.00, 0.01, …, 4.09. A method
        agrees with an entry when its value, rounded the same way, is
        the printed one.
      </p>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table hmw8-table-wiki">
          <caption>
            The Wikipedia values and our method (series + continued
            fraction), both with 15 decimals.
          </caption>
          <thead>
            <tr>
              <th scope="col">k</th>
              <th scope="col">P(|Z| &lt; k), Wikipedia</th>
              <th scope="col">2Φ(k) − 1, our method</th>
              <th scope="col">Same 15 decimals</th>
            </tr>
          </thead>
          <tbody id="hmw8-acc-wiki"></tbody>
        </table>
      </div>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption>
            Agreement of every method with the two web tables.
          </caption>
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col">Wikipedia, of 16</th>
              <th scope="col">NIST, of 410</th>
              <th scope="col">NIST entries missed</th>
            </tr>
          </thead>
          <tbody id="hmw8-acc-web"></tbody>
        </table>
      </div>

      <div class="hmw4-interpretation" id="hmw8-acc-web-text"></div>


      <h3>6.2 — Across the Left Tail</h3>

      <p>
        Fifteen decimals say nothing about the tail: Φ(−8) ≈ 6.2·10⁻¹⁶
        rounds to 0. The chart compares each method with the
        high-precision values on 1001 points from z = 0 to z = −10.
        Relative error asks how many significant digits are right;
        absolute error, how far the value is from Φ.
      </p>

      <div class="hmw4-segmented" role="radiogroup" aria-label="Methods shown">
        ${GROUPS.map((g, i) => `
          <label class="hmw4-segment">
            <input type="radio" name="hmw8-acc-group" value="${g.id}" ${i === 0 ? 'checked' : ''} />
            <span>${g.label}</span>
          </label>`).join('')}
      </div>

      <div class="hmw4-segmented hmw4-segmented-small" role="radiogroup" aria-label="Error type">
        <label class="hmw4-segment">
          <input type="radio" name="hmw8-acc-type" value="relative" checked />
          <span>Relative error</span>
        </label>
        <label class="hmw4-segment">
          <input type="radio" name="hmw8-acc-type" value="absolute" />
          <span>Absolute error</span>
        </label>
      </div>

      <div class="hmw4-chart" id="hmw8-acc-chart"></div>

      <div class="hmw4-legend" id="hmw8-acc-legend" aria-hidden="true"></div>

      <div class="hmw4-interpretation" id="hmw8-acc-chart-text"></div>

      <p class="panel-note">
        Each point is the worst error among the 11 grid points of an
        interval of width 0.1. Errors below 10⁻¹⁷ (the value is the double nearest to Φ) are
        drawn on the bottom line, errors above 100 on the top line. The
        continued fraction has no value at z = 0 and needs thousands of
        steps near it; it is meant for the tail only.
      </p>

    </section>
  `;
}

/* =====================================================
 * 3. INITIALIZE
 * ===================================================== */

const SUPERSCRIPT = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const powerOfTen = t => `10${String(t).split('').map(c => SUPERSCRIPT[c] ?? c).join('')}`;

const GROUP_TEXT = {
  integration: `
    <strong>Integration is accurate in absolute terms only.</strong>
    With N = 100 Simpson's rule is within about 4·10⁻¹⁰ of Φ everywhere
    (the trapezoidal rule within 4·10⁻⁶), but in relative terms both
    collapse in the tail: they compute ½ − ∫₀<sup>|z|</sup> φ, and when Φ(z)
    is smaller than their absolute error no digit is right. Our hybrid
    (teal) stays near 10⁻¹⁵.`,
  series: `
    <strong>Three series, three behaviours.</strong> The alternating
    Taylor series of the course notes loses about 0.22·z² digits to
    cancellation and is useless beyond z ≈ −6. The positive series has
    no cancellation inside the sum, but ½ − φ(z)·S is again a
    difference: it is excellent for z &gt; −2 and fails in the tail.
    The continued fraction is the opposite: hopeless near 0, accurate
    to about 10⁻¹⁵ for z ≤ −2. Joining the two at |z| = 2 gives our hybrid.`,
  approx: `
    <strong>Fixed formulas, fixed accuracy.</strong> Abramowitz–Stegun
    7.1.26 has absolute error below 10⁻⁷, but its relative error grows
    to 2% at z = −10. The Numerical Recipes erfc used in Homework 3 keeps
    a relative error near 10⁻⁷ everywhere, enough for any chart. Hart's
    rational approximation reaches 10⁻¹⁵ near the centre and 10⁻⁸ in the
    tail: absolute double precision, at a fixed cost of a few dozen
    operations.`
};

export function initHmw8Accuracy() {
  const root = document.getElementById('hmw8-acc');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);
  const wikiBody = get('hmw8-acc-wiki');
  const webBody = get('hmw8-acc-web');
  const webText = get('hmw8-acc-web-text');
  const chartBox = get('hmw8-acc-chart');
  const legend = get('hmw8-acc-legend');
  const chartText = get('hmw8-acc-chart-text');

  const controller = new AbortController();
  const { signal } = controller;
  let lastWidth = 0;

  /* 6.1 — web tables */

  const agreements = Object.fromEntries(METHODS.map(m => [m.id, webAgreement(m)]));

  wikiBody.innerHTML = agreements.hybrid.wikipedia.map(w => `
    <tr>
      <th scope="row">${w.k}</th>
      <td>${w.printed}</td>
      <td>${w.computed.toFixed(15)}</td>
      <td>${w.match ? 'yes' : 'no'}</td>
    </tr>`).join('');

  webBody.innerHTML = METHODS.map(m => {
    const a = agreements[m.id];
    const misses = a.nistMisses.map(p => p.z.toFixed(2));
    return `
      <tr${m.id === 'hybrid' ? ' class="hmw4-row-selected"' : ''}>
        <th scope="row">${m.label}</th>
        <td>${a.wikipediaMatches}</td>
        <td>${a.nistMatches}</td>
        <td>${misses.length === 0 ? '—' : misses.length <= 4 ? misses.join(', ') : `${misses.slice(0, 3).join(', ')} and ${misses.length - 3} more`}</td>
      </tr>`;
  }).join('');

  const nist136 = NIST_POINTS.find(p => p.z === 1.36);
  const exact136 = referenceCdf(1.36) - 0.5;
  const as = agreements.as7126;

  webText.innerHTML = `
    <p>
      <strong>Our method reproduces all ${agreements.hybrid.wikipediaMatches} Wikipedia values to 15 decimals</strong>,
      and so does Hart's approximation. The other methods match only the
      entries where their error happens to stay below half a unit in the
      15th decimal.
    </p>
    <p>
      <strong>The NIST table has one wrong digit.</strong> Every accurate
      method misses exactly one entry, z = 1.36, printed as
      ${nist136.area.toFixed(5)}: the true area is ${exact136.toFixed(10)}…, which
      rounds to ${exact136.toFixed(5)}. The value lies only 3.8·10⁻⁸ above the
      rounding boundary, so a table computed with an error of that size
      can print the lower digit. Indeed the only method that matches all
      ${as.nistMatches} entries is Abramowitz–Stegun 7.1.26, whose error is about
      10⁻⁷. A reference is only as good as its precision: 5 decimals
      cannot test anything beyond 5 decimals.
    </p>`;

  /* 6.2 — error on the grid */

  const relative = Object.fromEntries(METHODS.map(m => [m.id, gridErrors(m)]));
  const absolute = Object.fromEntries(METHODS.map(m => [m.id,
    relative[m.id].map((r, i) => r * referenceCdf(FINE_GRID[i]))]));

  const selected = name => root.querySelector(`input[name="${name}"]:checked`).value;

  function draw() {
    const group = GROUPS.find(g => g.id === selected('hmw8-acc-group'));
    const type = selected('hmw8-acc-type');
    const data = type === 'relative' ? relative : absolute;

    const toLog = e => (Number.isNaN(e) ? null
      : e <= 0 ? FLOOR : Math.min(CEILING, Math.max(FLOOR, Math.log10(e))));

    /* Worst error in each interval of width 0.1 (10 grid points):
       the envelope is readable, single points scatter by rounding */
    const envelope = errors => {
      const points = [];
      for (let start = 0; start < FINE_GRID.length - 1; start += 10) {
        const block = errors.slice(start, start + 11).filter(e => !Number.isNaN(e));
        if (block.length === 0) continue;
        points.push([FINE_GRID[start] - 0.05, toLog(Math.max(...block))]);
      }
      return points;
    };

    const lines = group.methods.map(id => ({
      points: envelope(data[id]),
      color: METHOD_COLORS[id],
      width: id === 'hybrid' ? 2 : 1.4,
      opacity: id === 'hybrid' ? 1 : 0.9
    }));

    const compact = chartBox.clientWidth < 520;
    const yTicks = [];
    for (let t = FLOOR + 1; t <= CEILING; t += compact ? 4 : 2) yTicks.push(t);

    chartBox.innerHTML = renderLineChart({
      width: chartBox.clientWidth,
      height: 340,
      title: `${type === 'relative' ? 'Relative' : 'Absolute'} error of ${group.label.toLowerCase()} methods for z from −10 to 0, log scale`,
      xLabel: 'z',
      yLabel: `${type === 'relative' ? 'Relative' : 'Absolute'} error (log scale)`,
      xDomain: [-10, 0],
      yDomain: [FLOOR - 0.3, CEILING + 0.3],
      yTicks,
      yFormat: powerOfTen,
      lines
    });

    legend.innerHTML = group.methods.map(id => `
      <span><i style="background:${METHOD_COLORS[id]}"></i> ${getMethod(id).label}</span>`).join('');

    chartText.innerHTML = `<p>${GROUP_TEXT[group.id]}</p>`;
    lastWidth = chartBox.clientWidth;
  }

  root.querySelectorAll('input[type="radio"]').forEach(r =>
    r.addEventListener('change', draw, { signal }));

  const observer = new ResizeObserver(() => {
    if (Math.abs(chartBox.clientWidth - lastWidth) > 4) draw();
  });
  observer.observe(chartBox);

  draw();

  return () => {
    controller.abort();
    observer.disconnect();
  };
}
