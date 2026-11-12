/*
 * Statistics-Lab — Homework 4.2 (internal folder: hmw6)
 * Section 05 — Variability as n Grows
 *
 * How much do the sampling means and the sampling variances of
 * different hackers differ from each other, as the number of
 * systems n increases? Theory:
 *
 *   SD(x̄)  = σ / √n
 *   SD(s²) = σ² √(2/(n − 1) + κ/n)
 *
 * Both fall like 1/√n: a straight line of slope −1/2 on log-log
 * axes. Histograms of x̄ and s² for a chosen n show the shape of
 * the two sampling distributions.
 */

import {
  createScoreDistribution,
  listScoreDistributions,
  DEFAULT_DISTRIBUTION
} from './score-distributions.js';
import {
  runSamplingExperiment,
  summarizeSnapshot,
  DEFAULT_N_VALUES,
  DEFAULT_HACKERS
} from './experiment.js';
import { DEFAULT_SEED } from '../hmw4/random.js';
import { latticeHistogram, normalPdf } from '../hmw4/statistics.js';
import {
  renderLineChart,
  renderHistogram,
  formatTick,
  padDomain,
  CHART_COLORS
} from '../hmw4/chart.js';

const HACKER_OPTIONS = [100, 500, 1000, 2000];
const DEFAULT_SHOWN_N = 10;
const VARIANCE_COLOR = '#7fb2ff';

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw6Variability() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw6-variability"
      aria-labelledby="hmw6-variability-title"
    >

      <div class="panel-label">
        05 / VARIABILITY AS n GROWS
      </div>

      <h2 id="hmw6-variability-title">
        More Systems, More Reliable Estimates
      </h2>

      <p>
        The averages over all hackers are close to μ and σ² for every
        n. The individual estimates are not: two hackers who attempt
        only a few systems can obtain very different x̄ and s². Their
        spread, measured by the standard deviation across the m
        hackers, is predicted by the theory of section 03:
      </p>

      <div class="math-display">
        SD(x̄) = σ / √n<br />
        SD(s²) = σ²·√(2/(n−1) + κ/n)
      </div>


      <!-- CONTROLS -->

      <div class="hmw4-controls">

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw6-var-dist">Score distribution</label>
          <select id="hmw6-var-dist" class="hmw4-select">
            ${listScoreDistributions().map(d => `
              <option value="${d.id}" ${d.id === DEFAULT_DISTRIBUTION ? 'selected' : ''}>${d.label}</option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw6-var-m">Hackers m</label>
          <select id="hmw6-var-m" class="hmw4-select">
            ${HACKER_OPTIONS.map(m => `
              <option value="${m}" ${m === DEFAULT_HACKERS ? 'selected' : ''}>${m}</option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw6-var-n">Systems n (histograms)</label>
          <select id="hmw6-var-n" class="hmw4-select">
            ${DEFAULT_N_VALUES.map(n => `
              <option value="${n}" ${n === DEFAULT_SHOWN_N ? 'selected' : ''}>${n}</option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw6-var-seed">Random seed</label>
          <input id="hmw6-var-seed" class="hmw4-input" type="number"
                 min="0" max="4294967295" step="1" value="${DEFAULT_SEED}" />
        </div>

        <div class="hmw4-field hmw4-field-action">
          <button type="button" id="hmw6-var-reseed" class="button button-ghost">
            New random seed
          </button>
        </div>

      </div>


      <!-- LOG-LOG CHART -->

      <h3>Standard Deviation across Hackers (log–log scale)</h3>

      <div class="hmw4-chart" id="hmw6-var-chart"></div>

      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${CHART_COLORS.path}"></i> SD of sampling means x̄ (dots: simulation)</span>
        <span><i style="background:${VARIANCE_COLOR}"></i> SD of sampling variances s² (dots: simulation)</span>
        <span><i style="background:${CHART_COLORS.theory}"></i> Theory (dashed)</span>
      </div>

      <p id="hmw6-var-status" class="hmw4-status" role="status" aria-live="polite"></p>


      <!-- HISTOGRAMS -->

      <h3 id="hmw6-var-hist-title">Sampling Distributions</h3>

      <div class="hmw4-chart-pair">
        <div class="hmw4-chart" id="hmw6-var-hist-mean"></div>
        <div class="hmw4-chart" id="hmw6-var-hist-variance"></div>
      </div>

      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${CHART_COLORS.path};opacity:.7"></i> m hackers (density)</span>
        <span><i style="background:${CHART_COLORS.theory}"></i> Normal with the theoretical mean and variance</span>
      </div>


      <!-- TABLE -->

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption id="hmw6-var-caption"></caption>
          <thead>
            <tr>
              <th scope="col">n</th>
              <th scope="col">SD of x̄ (simulated)</th>
              <th scope="col">σ/√n</th>
              <th scope="col">Ratio</th>
              <th scope="col">SD of s² (simulated)</th>
              <th scope="col">σ²√(2/(n−1)+κ/n)</th>
              <th scope="col">Ratio</th>
            </tr>
          </thead>
          <tbody id="hmw6-var-table"></tbody>
        </table>
      </div>

      <div class="hmw4-interpretation" id="hmw6-var-interpretation"></div>

      <p class="panel-note">
        The standard deviations across hackers are themselves
        estimated from m values, with a relative error of roughly
        1/√(2m) for x̄ (about 2% with m = 1000), and more for s² when
        the distribution has heavy tails. The theoretical curves use
        the exact μ, σ² and κ of the chosen distribution.
      </p>

    </section>
  `;
}

/* =====================================================
 * 2. HELPERS
 * ===================================================== */

const fixed = (value, digits = 4) =>
  value === null || !Number.isFinite(value) ? '—' : value.toFixed(digits);

function normalCurve(mean, variance, [a, b], points = 161) {
  const sd = Math.sqrt(variance);
  return Array.from({ length: points }, (_, i) => {
    const x = a + (b - a) * i / (points - 1);
    return [x, normalPdf((x - mean) / sd) / sd];
  });
}

/* =====================================================
 * 3. INITIALIZE
 * ===================================================== */

export function initHmw6Variability() {
  const root = document.getElementById('hmw6-variability');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);

  const distSelect = get('hmw6-var-dist');
  const mSelect = get('hmw6-var-m');
  const nSelect = get('hmw6-var-n');
  const seedInput = get('hmw6-var-seed');
  const reseedButton = get('hmw6-var-reseed');
  const chartBox = get('hmw6-var-chart');
  const status = get('hmw6-var-status');
  const histTitle = get('hmw6-var-hist-title');
  const meanBox = get('hmw6-var-hist-mean');
  const varianceBox = get('hmw6-var-hist-variance');
  const caption = get('hmw6-var-caption');
  const tableBody = get('hmw6-var-table');
  const explanation = get('hmw6-var-interpretation');

  const controller = new AbortController();
  const { signal } = controller;

  let current = null;

  function simulate() {
    const seed = Number(seedInput.value);
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) {
      status.textContent = 'The seed must be an integer from 0 to 4294967295.';
      return;
    }

    const distribution = createScoreDistribution(distSelect.value);
    const m = Number(mSelect.value);
    const started = performance.now();
    const result = runSamplingExperiment({ distribution, m, seed });

    current = {
      distribution,
      m,
      seed,
      snapshots: result.snapshots,
      rows: result.snapshots.map(s => summarizeSnapshot(s, distribution)),
      elapsed: performance.now() - started
    };

    draw();
  }

  function draw() {
    if (!current) return;

    const { distribution: d, m, snapshots, rows } = current;

    /* A — log-log chart of the standard deviations */

    const logN = rows.map(r => Math.log10(r.n));
    const xDomain = [Math.log10(rows[0].n) - 0.1, Math.log10(rows[rows.length - 1].n) + 0.1];
    const dense = Array.from({ length: 100 }, (_, i) =>
      xDomain[0] + (xDomain[1] - xDomain[0]) * i / 99);

    const theoryMean = x => Math.log10(Math.sqrt(d.variance / 10 ** x));
    const theoryVariance = x => {
      const n = 10 ** x;
      return Math.log10(d.variance * Math.sqrt(2 / (n - 1) + d.excessKurtosis / n));
    };

    const logValues = [
      ...rows.map(r => Math.log10(r.sdOfMeans)),
      ...rows.map(r => Math.log10(r.sdOfVariances)),
      theoryMean(xDomain[1]),
      theoryVariance(Math.log10(2))
    ];
    const yDomain = padDomain([Math.min(...logValues), Math.max(...logValues)], 0.08);
    const yTicks = [];
    for (let t = Math.ceil(yDomain[0]); t <= Math.floor(yDomain[1]); t++) yTicks.push(t);

    const dot = (x, y, color) => ({ points: [[x, y], [x, y]], color, width: 10 });

    chartBox.innerHTML = renderLineChart({
      width: chartBox.clientWidth,
      height: 300,
      title: `Standard deviation of the sampling means and variances across ${m} hackers, ` +
             `against n, ${d.label}, log-log scale`,
      xLabel: 'Systems per hacker n (log scale)',
      yLabel: 'Standard deviation (log scale)',
      xDomain,
      yDomain,
      xTicks: [0.30103, 1, 2, 3],
      xFormat: t => formatTick(Math.round(10 ** t)),
      yTicks,
      yFormat: t => formatTick(10 ** t),
      lines: [
        { points: dense.filter(x => 10 ** x > 1.5).map(x => [x, theoryVariance(x)]),
          color: CHART_COLORS.theory, width: 1.6, dash: '6 5' },
        { points: dense.map(x => [x, theoryMean(x)]),
          color: CHART_COLORS.theory, width: 1.6, dash: '6 5' },
        { points: rows.map((r, i) => [logN[i], Math.log10(r.sdOfVariances)]), color: VARIANCE_COLOR, width: 1.2, opacity: 0.6 },
        { points: rows.map((r, i) => [logN[i], Math.log10(r.sdOfMeans)]), width: 1.2, opacity: 0.6 },
        ...rows.map((r, i) => dot(logN[i], Math.log10(r.sdOfVariances), VARIANCE_COLOR)),
        ...rows.map((r, i) => dot(logN[i], Math.log10(r.sdOfMeans), CHART_COLORS.path))
      ]
    });

    status.textContent =
      `${m} hackers, ${d.label}, seed ${current.seed} — simulated in ` +
      `${current.elapsed.toFixed(0)} ms. On log–log axes a slope of −1/2 means ` +
      `"divide by √10 for every factor 10 in n".`;

    /* B — histograms at the chosen n */

    const n = Number(nSelect.value);
    const index = rows.findIndex(r => r.n === n);
    const row = rows[index];
    const snapshot = snapshots[index];

    histTitle.textContent = `Sampling Distributions at n = ${n}`;

    // Scores are integers: x̄ is a multiple of 1/n, s² a multiple of 1/(n(n−1)).
    const meanBins = latticeHistogram(snapshot.means, { step: 1 / n, firstPoint: 0 });
    const varianceBins = latticeHistogram(snapshot.variances, { step: 1 / (n * (n - 1)), firstPoint: 0 });

    const meanSd = row.theoreticalSdOfMeans;
    const meanDomain = [
      Math.min(meanBins[0].from, d.mean - 4 * meanSd),
      Math.max(meanBins[meanBins.length - 1].to, d.mean + 4 * meanSd)
    ];
    const varianceSd = row.theoreticalSdOfVariances;
    const varianceDomain = [
      Math.min(varianceBins[0].from, Math.max(0, d.variance - 4 * varianceSd)) - 0.01,
      Math.max(varianceBins[varianceBins.length - 1].to, d.variance + 4 * varianceSd)
    ];

    meanBox.innerHTML = renderHistogram({
      width: meanBox.clientWidth,
      height: 250,
      title: `Histogram of the ${m} sampling means at n = ${n}`,
      xLabel: 'Sampling mean x̄',
      bins: meanBins,
      xDomain: meanDomain,
      curve: normalCurve(d.mean, row.theory.varianceOfMeans, meanDomain),
      markers: [{ x: d.mean }]
    });

    varianceBox.innerHTML = renderHistogram({
      width: varianceBox.clientWidth,
      height: 250,
      title: `Histogram of the ${m} sampling variances at n = ${n}`,
      xLabel: 'Sampling variance s²',
      bins: varianceBins,
      xDomain: varianceDomain,
      curve: normalCurve(d.variance, row.theory.varianceOfVariances, varianceDomain),
      markers: [{ x: d.variance }]
    });

    /* Table */

    caption.textContent =
      `${d.label}: σ = ${fixed(Math.sqrt(d.variance))}, σ² = ${fixed(d.variance)}, ` +
      `κ = ${fixed(d.excessKurtosis, 3)}, m = ${m} hackers. Sample standard deviations ` +
      `(denominator m − 1) across hackers.`;

    tableBody.innerHTML = rows.map(r => `
      <tr${r.n === n ? ' class="hmw4-row-selected"' : ''}>
        <th scope="row">${r.n}</th>
        <td>${fixed(r.sdOfMeans)}</td>
        <td>${fixed(r.theoreticalSdOfMeans)}</td>
        <td>${fixed(r.sdOfMeans / r.theoreticalSdOfMeans, 3)}</td>
        <td>${fixed(r.sdOfVariances)}</td>
        <td>${fixed(r.theoreticalSdOfVariances)}</td>
        <td>${fixed(r.sdOfVariances / r.theoreticalSdOfVariances, 3)}</td>
      </tr>`).join('');

    /* Interpretation */

    const r10 = rows.find(r => r.n === 10);
    const r1000 = rows.find(r => r.n === 1000);
    const ratioMeans = r10.sdOfMeans / r1000.sdOfMeans;
    const ratioVariances = r10.sdOfVariances / r1000.sdOfVariances;
    const relativeMean = r1000.theoreticalSdOfMeans / Math.abs(d.mean);
    const relativeVariance = r1000.theoreticalSdOfVariances / d.variance;

    explanation.innerHTML = `
      <p>
        <strong>Both spreads fall like 1/√n.</strong> From n = 10 to
        n = 1000 (a factor 100), the standard deviation of the sampling
        means falls from ${fixed(r10.sdOfMeans, 3)} to
        ${fixed(r1000.sdOfMeans, 3)}, a factor ${ratioMeans.toFixed(1)},
        and that of the sampling variances from ${fixed(r10.sdOfVariances, 3)}
        to ${fixed(r1000.sdOfVariances, 3)}, a factor ${ratioVariances.toFixed(1)}:
        both close to √100 = 10. Quadrupling the systems per hacker halves
        the uncertainty of each hacker's estimates.
      </p>
      <p>
        <strong>The variance is harder to estimate than the mean.</strong>
        At n = 1000 a single hacker's x̄ has a relative uncertainty of about
        ${(100 * relativeMean).toFixed(1)}% of μ, while s² has about
        ${(100 * relativeVariance).toFixed(1)}% of σ². The precision of s²
        depends on the tails of the distribution through κ
        = ${fixed(d.excessKurtosis, 3)}${d.excessKurtosis > 1
          ? ': with heavy tails, rare extreme scores make s² unstable'
          : ''}.
      </p>
      <p>
        <strong>The shapes approach the normal.</strong> At small n the
        histogram of s² is skewed to the right and cannot go below 0; as n
        grows both histograms become narrow and bell-shaped around μ and σ²,
        as the Central Limit Theorem of Homework 3 predicts for averages.
      </p>`;
  }

  /* ----- events ----- */

  [distSelect, mSelect, seedInput].forEach(el =>
    el.addEventListener('change', simulate, { signal }));

  nSelect.addEventListener('change', draw, { signal });

  reseedButton.addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 0x100000000);
    simulate();
  }, { signal });

  let lastWidth = 0;
  const observer = new ResizeObserver(() => {
    const width = chartBox.clientWidth;
    if (Math.abs(width - lastWidth) > 4) {
      lastWidth = width;
      draw();
    }
  });
  observer.observe(chartBox);

  simulate();

  return () => {
    controller.abort();
    observer.disconnect();
  };
}
