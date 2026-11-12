/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * Section 10 — Central Limit Theorem
 *
 * Convergence in distribution of the normalized score to N(0, 1):
 *
 *   P( Z_n ≤ x ) → Φ(x)  for every x,
 *
 * with Z_n = S_n / √n in the Rademacher case, and the centered
 * and standardized score (S_n − np) / √(np(1 − p)) in the
 * Bernoulli case, where S_n / √n itself does NOT converge.
 *
 * Three views for the same simulation:
 *   A. histogram of Z_n at a chosen n, with the N(0, 1) density;
 *   B. empirical CDF of Z_n against Φ, with the largest gap
 *      (Kolmogorov–Smirnov distance D) highlighted;
 *   C. D as a function of n, with two reference levels:
 *      discreteness of S_n (≈ Δ / (2√(2π)), shrinking like 1/√n)
 *      and sampling noise of m values (≈ 0.87 / √m, fixed).
 */

import { createModel, MODEL_IDS, DEFAULT_P } from './models.js';
import { simulateAttackers } from './simulation.js';
import { DEFAULT_SEED } from './random.js';
import {
  compareWithTheory,
  latticeOf,
  latticeHistogram,
  ksDistanceFromNormal,
  normalPdf,
  normalCdf
} from './statistics.js';
import {
  renderLineChart,
  renderHistogram,
  formatTick,
  CHART_COLORS
} from './chart.js';
import { maxSystemsFor, logSpacedSystems } from './lln-ui.js';

const ATTACKER_OPTIONS = [200, 500, 1000, 2000];
const DEFAULT_ATTACKERS = 1000;

// Mean of the asymptotic Kolmogorov distribution: √(π/2)·ln 2.
const KS_NOISE_CONSTANT = Math.sqrt(Math.PI / 2) * Math.LN2;

const QUANTITY_OPTIONS = [
  { id: 'normalized', label: 'S_n / √n' },
  { id: 'standardized', label: '(S_n − nμ) / (σ√n)' }
];

/* =====================================================
 * 1. RENDER
 * ===================================================== */

const subscript = text => text.replace(/_(\w+)/g, '<sub>$1</sub>');

export function renderHmw4Clt() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw4-clt"
      aria-labelledby="hmw4-clt-title"
    >

      <div class="panel-label">
        10 / CENTRAL LIMIT THEOREM
      </div>

      <h2 id="hmw4-clt-title">
        The Normal Law Emerges
      </h2>

      <p>
        The Central Limit Theorem concerns the shape of the
        fluctuations, not their size. In the symmetric Rademacher
        case the normalized score Z<sub>n</sub> = S<sub>n</sub>/√n
        has mean 0 and variance 1 for every n, and its distribution
        converges to the standard normal law:
      </p>

      <div class="math-display">
        P(S<sub>n</sub>/√n ≤ x) → Φ(x)
      </div>

      <p>
        This is convergence in distribution: the cumulative
        distribution function of Z<sub>n</sub> approaches Φ at
        every point. We measure the largest gap between the
        empirical CDF of the m attackers and Φ, the
        Kolmogorov–Smirnov distance D, and follow it as n grows.
        For the Bernoulli model, compare S<sub>n</sub>/√n with the
        standardized score: only the second one converges to N(0, 1).
      </p>


      <!-- CONTROLS -->

      <div class="hmw4-controls">

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-clt-model">Score model</label>
          <select id="hmw4-clt-model" class="hmw4-select">
            <option value="${MODEL_IDS.RADEMACHER}">Rademacher</option>
            <option value="${MODEL_IDS.BERNOULLI}">Bernoulli</option>
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-clt-p">Success probability p</label>
          <input id="hmw4-clt-p" class="hmw4-input" type="number"
                 min="0" max="1" step="0.05" value="${DEFAULT_P}" disabled />
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-clt-m">Attackers m (max n)</label>
          <select id="hmw4-clt-m" class="hmw4-select">
            ${ATTACKER_OPTIONS.map(m => `
              <option value="${m}" ${m === DEFAULT_ATTACKERS ? 'selected' : ''}>
                ${m} (n ≤ ${maxSystemsFor(m)})
              </option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-clt-n">Systems n shown</label>
          <select id="hmw4-clt-n" class="hmw4-select"></select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-clt-seed">Random seed</label>
          <input id="hmw4-clt-seed" class="hmw4-input" type="number"
                 min="0" max="4294967295" step="1" value="${DEFAULT_SEED}" />
        </div>

        <div class="hmw4-field hmw4-field-action">
          <button type="button" id="hmw4-clt-reseed"
                  class="button button-ghost">
            New random seed
          </button>
        </div>

      </div>

      <div class="hmw4-segmented" role="radiogroup"
           aria-label="Quantity compared with N(0, 1)">
        ${QUANTITY_OPTIONS.map((q, i) => `
          <label class="hmw4-segment">
            <input type="radio" name="hmw4-clt-quantity"
                   value="${q.id}" ${i === 0 ? 'checked' : ''} />
            <span>${subscript(q.label)}</span>
          </label>
        `).join('')}
      </div>


      <!-- CHART A + B -->

      <h3 id="hmw4-clt-at-n">Histogram and CDF</h3>

      <div class="hmw4-chart-pair">
        <div class="hmw4-chart" id="hmw4-clt-histogram"></div>
        <div class="hmw4-chart" id="hmw4-clt-cdf"></div>
      </div>

      <div class="hmw4-legend" aria-hidden="true">
        <span>
          <i style="background:${CHART_COLORS.path}"></i>
          Simulated attackers (density / empirical CDF)
        </span>
        <span>
          <i style="background:${CHART_COLORS.theory}"></i>
          N(0, 1) density / Φ
        </span>
        <span>
          <i style="background:${CHART_COLORS.title}"></i>
          Largest gap D
        </span>
      </div>


      <!-- CHART C -->

      <h3>Kolmogorov–Smirnov Distance as n Grows</h3>

      <div class="hmw4-chart" id="hmw4-clt-ks"></div>

      <div class="hmw4-legend" aria-hidden="true">
        <span>
          <i style="background:${CHART_COLORS.path}"></i>
          D between empirical CDF and Φ
        </span>
        <span>
          <i style="background:${CHART_COLORS.theory}"></i>
          Discreteness of Sₙ: Δ / (2√(2π)) (dashed)
        </span>
        <span>
          <i style="background:${CHART_COLORS.text}"></i>
          Sampling noise: 0.87 / √m (dotted)
        </span>
      </div>

      <p id="hmw4-clt-status" class="hmw4-status"
         role="status" aria-live="polite"></p>


      <!-- TABLE -->

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption id="hmw4-clt-caption"></caption>
          <thead>
            <tr>
              <th scope="col">n</th>
              <th scope="col">Mean of Z<sub>n</sub></th>
              <th scope="col">Variance (1/m)</th>
              <th scope="col">Within ±1.96</th>
              <th scope="col">KS distance D</th>
              <th scope="col">Discreteness</th>
              <th scope="col">Sampling noise</th>
            </tr>
          </thead>
          <tbody id="hmw4-clt-table"></tbody>
        </table>
      </div>


      <!-- INTERPRETATION -->

      <div class="hmw4-interpretation" id="hmw4-clt-interpretation"></div>

      <p class="panel-note">
        D is used here as a descriptive distance, not as a formal
        goodness-of-fit test: the data are discrete, so D cannot
        reach 0 for any finite n. The two reference levels are
        approximations of the typical size of each effect.
        In the theorem m plays no role; in the simulation it limits
        how small a distance we are able to observe.
      </p>

    </section>
  `;
}

/* =====================================================
 * 2. HELPERS
 * ===================================================== */

const fixed = (value, digits = 4) =>
  value === null || !Number.isFinite(value) ? '—' : value.toFixed(digits);

/**
 * Half of the largest jump of the CDF of a lattice variable,
 * in standardized units: Δ·φ(0)/2 with Δ = (b − a)/(σ√n).
 */
function discretenessLevel(model, n) {
  const [a, b] = model.values;
  const sigma = Math.sqrt(model.variance);
  if (!(sigma > 0)) return null;
  const delta = (b - a) / (sigma * Math.sqrt(n));
  return delta / (2 * Math.sqrt(2 * Math.PI));
}

/** Points of the empirical CDF as a step line, plus D's location. */
function empiricalCdfSteps(values, [xMin, xMax]) {
  const sorted = Float64Array.from(values).sort();
  const m = sorted.length;
  const points = [[xMin, 0]];
  let i = 0;

  while (i < m) {
    const x = sorted[i];
    const before = i / m;
    while (i < m && sorted[i] === x) i++;
    const after = i / m;
    points.push([x, before], [x, after]);
  }

  points.push([xMax, 1]);
  return points;
}

/* =====================================================
 * 3. INITIALIZE
 * ===================================================== */

export function initHmw4Clt() {
  const root = document.getElementById('hmw4-clt');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);

  const modelSelect = get('hmw4-clt-model');
  const pInput = get('hmw4-clt-p');
  const mSelect = get('hmw4-clt-m');
  const nSelect = get('hmw4-clt-n');
  const seedInput = get('hmw4-clt-seed');
  const reseedButton = get('hmw4-clt-reseed');
  const heading = get('hmw4-clt-at-n');
  const histogramBox = get('hmw4-clt-histogram');
  const cdfBox = get('hmw4-clt-cdf');
  const ksBox = get('hmw4-clt-ks');
  const status = get('hmw4-clt-status');
  const caption = get('hmw4-clt-caption');
  const tableBody = get('hmw4-clt-table');
  const explanation = get('hmw4-clt-interpretation');

  const controller = new AbortController();
  const { signal } = controller;

  let current = null;

  const quantity = () =>
    root.querySelector('input[name="hmw4-clt-quantity"]:checked').value;

  /* ----- simulate ----- */

  function simulate() {
    pInput.disabled = modelSelect.value === MODEL_IDS.RADEMACHER;

    const modelId = modelSelect.value;
    const p = Number(pInput.value);
    const m = Number(mSelect.value);
    const seed = Number(seedInput.value);

    if (modelId === MODEL_IDS.BERNOULLI && !(p >= 0 && p <= 1)) {
      status.textContent = 'p must be a number between 0 and 1.';
      return;
    }
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) {
      status.textContent = 'The seed must be an integer from 0 to 4294967295.';
      return;
    }

    const model = createModel(modelId, p);
    const nValues = logSpacedSystems(maxSystemsFor(m));
    const started = performance.now();

    const result = simulateAttackers({ model, nValues, m, seed, pathCount: 0 });

    // Keep the chosen n if it still exists, otherwise use the largest.
    const previous = Number(nSelect.value);
    nSelect.innerHTML = nValues.map(n => `<option value="${n}">${n}</option>`).join('');
    nSelect.value = nValues.includes(previous) ? previous : nValues[nValues.length - 1];

    current = {
      model,
      m,
      seed,
      nValues,
      snapshots: result.snapshots,
      elapsed: performance.now() - started
    };

    draw();
  }

  /* ----- draw ----- */

  function draw() {
    if (!current) return;

    const { model, m, nValues, snapshots } = current;
    const q = quantity();
    const option = QUANTITY_OPTIONS.find(o => o.id === q);

    // Per n: values of Z_n, summary, D.
    const rows = snapshots.map(snapshot => {
      const comparison = compareWithTheory(snapshot, model, q);
      if (comparison === null) return null;
      const values = comparison.values;
      const ks = ksDistanceFromNormal(values);
      let inside = 0;
      for (const z of values) if (Math.abs(z) <= 1.96) inside++;
      return {
        n: snapshot.n,
        snapshot,
        values,
        summary: comparison.empirical,
        ks,
        within: inside / values.length,
        discreteness: discretenessLevel(model, snapshot.n)
      };
    });

    if (rows.includes(null)) {
      [histogramBox, cdfBox, ksBox].forEach(box => { box.innerHTML = ''; });
      tableBody.innerHTML = '';
      caption.textContent = '';
      explanation.innerHTML = '';
      status.textContent =
        'The standardized score is undefined when p = 0 or p = 1, ' +
        'because then σ = 0: every attacker has the same score.';
      return;
    }

    const noise = KS_NOISE_CONSTANT / Math.sqrt(m);
    const selectedN = Number(nSelect.value);
    const row = rows.find(r => r.n === selectedN) ?? rows[rows.length - 1];

    heading.textContent = `Histogram and CDF at n = ${row.n}`;

    /* Common x range: N(0,1) bulk and the data */

    const xMin = Math.min(-4, row.summary.min - 0.3);
    const xMax = Math.max(4, row.summary.max + 0.3);
    const dense = Array.from({ length: 201 }, (_, i) => xMin + (xMax - xMin) * i / 200);

    /* A — histogram with N(0,1) density */

    const bins = latticeHistogram(row.values, latticeOf(model, row.n, q));

    histogramBox.innerHTML = renderHistogram({
      width: histogramBox.clientWidth,
      height: 280,
      title: `Histogram of ${option.label.replace(/_/g, '')} for ${model.label}, ` +
             `n = ${row.n}, m = ${m}, with the N(0, 1) density`,
      xLabel: option.label,
      bins,
      xDomain: [xMin, xMax],
      curve: dense.map(x => [x, normalPdf(x)]),
      markers: [{ x: 0 }]
    });

    /* B — empirical CDF against Φ, with the gap D */

    const steps = empiricalCdfSteps(row.values, [xMin, xMax]);
    const gapX = row.ks.location;
    const sorted = Float64Array.from(row.values).sort();
    const below = sorted.findIndex(v => v > gapX);
    const afterJump = (below === -1 ? sorted.length : below) / sorted.length;
    const beforeJump = sorted.findIndex(v => v >= gapX) / sorted.length;
    const phi = normalCdf(gapX);
    const gapEnd = Math.abs(afterJump - phi) >= Math.abs(phi - beforeJump)
      ? afterJump : beforeJump;

    cdfBox.innerHTML = renderLineChart({
      width: cdfBox.clientWidth,
      height: 280,
      title: `Empirical CDF of ${option.label.replace(/_/g, '')} against Φ, ` +
             `largest gap D = ${fixed(row.ks.distance)}`,
      xLabel: option.label,
      yLabel: 'P(Z ≤ x)',
      xDomain: [xMin, xMax],
      yDomain: [-0.03, 1.03],
      lines: [
        { points: dense.map(x => [x, normalCdf(x)]), color: CHART_COLORS.theory, width: 2.2 },
        { points: steps, width: 1.6 },
        { points: [[gapX, phi], [gapX, gapEnd]], color: CHART_COLORS.title, width: 3 }
      ]
    });

    /* C — D as a function of n (log scale) */

    const xDomain = [Math.log10(nValues[0]), Math.log10(nValues[nValues.length - 1])];
    const denseLog = Array.from({ length: 120 }, (_, i) =>
      xDomain[0] + (xDomain[1] - xDomain[0]) * i / 119);
    const yTop = Math.min(1.02, Math.max(
      ...rows.map(r => r.ks.distance),
      discretenessLevel(model, nValues[0]) ?? 0,
      noise
    ) * 1.12);

    ksBox.innerHTML = renderLineChart({
      width: ksBox.clientWidth,
      height: 280,
      title: `Kolmogorov–Smirnov distance from N(0, 1) as a function of n, ${model.label}`,
      xLabel: 'Systems n (log scale)',
      yLabel: 'KS distance D',
      xDomain,
      yDomain: [0, yTop],
      xTicks: [1, 2, 3, 4],
      xFormat: t => formatTick(10 ** t),
      lines: [
        { points: [[xDomain[0], noise], [xDomain[1], noise]],
          color: CHART_COLORS.text, width: 1.4, dash: '2 4' },
        // Not defined when σ = 0 (p = 0 or p = 1): no curve then.
        ...(model.variance > 0 ? [{
          points: denseLog.map(x => [x, discretenessLevel(model, 10 ** x)]),
          color: CHART_COLORS.theory, width: 1.8, dash: '6 5'
        }] : []),
        { points: rows.map(r => [Math.log10(r.n), r.ks.distance]), width: 2.6 }
      ]
    });

    /* Table */

    caption.textContent =
      `${model.label}, quantity ${option.label.replace(/_/g, '')}, m = ${m}. ` +
      `For N(0, 1): mean 0, variance 1, 95% of values within ±1.96.`;

    tableBody.innerHTML = rows.map(r => `
      <tr${r.n === row.n ? ' class="hmw4-row-selected"' : ''}>
        <th scope="row">${r.n}</th>
        <td>${fixed(r.summary.mean, 3)}</td>
        <td>${fixed(r.summary.empiricalVariance, 3)}</td>
        <td>${(100 * r.within).toFixed(1)}%</td>
        <td>${fixed(r.ks.distance)}</td>
        <td>${fixed(r.discreteness)}</td>
        <td>${fixed(noise)}</td>
      </tr>
    `).join('');

    /* Interpretation */

    const first = rows[0];
    const last = rows[rows.length - 1];
    const rawBernoulli = model.id === MODEL_IDS.BERNOULLI && q === 'normalized';

    let text;

    if (rawBernoulli) {
      text = `For the Bernoulli model, S<sub>n</sub>/√n has the right
        spread (variance p(1 − p)) but its mean √n·p keeps growing:
        the histogram drifts away from the N(0, 1) curve and D grows
        from ${fixed(first.ks.distance, 3)} at n = ${first.n} to
        ${fixed(last.ks.distance, 3)} at n = ${last.n}, close to the
        maximum value 1. There is no convergence to N(0, 1) here.
        Switch to the standardized score to see the theorem at work.`;
    } else {
      const floorReached = last.ks.distance < 1.6 * Math.max(noise, last.discreteness);
      text = `D falls from ${fixed(first.ks.distance, 3)} at n = ${first.n}
        to ${fixed(last.ks.distance, 3)} at n = ${last.n}, and the share of
        attackers within ±1.96 approaches 95%: the distribution of
        Z<sub>n</sub> approaches N(0, 1). At small n the gap is dominated
        by the discreteness of S<sub>n</sub> (the dashed curve, shrinking
        like 1/√n).
        ${floorReached
          ? `At large n it reaches the level of the sampling noise of
             m = ${m} attackers (about ${fixed(noise, 3)}): from there on,
             a larger m, not a larger n, would be needed to see the
             distance shrink further.`
          : `The distance is still above both reference levels: larger
             n would bring it further down.`}`;
    }

    explanation.innerHTML = `<p>${text}</p>`;

    status.textContent =
      `${m} attackers × ${last.n} systems, ${model.label}, seed ` +
      `${current.seed} — simulated in ${current.elapsed.toFixed(0)} ms.`;
  }

  /* ----- events ----- */

  [modelSelect, pInput, mSelect, seedInput].forEach(el =>
    el.addEventListener('change', simulate, { signal }));

  nSelect.addEventListener('change', draw, { signal });

  root.querySelectorAll('input[name="hmw4-clt-quantity"]').forEach(radio =>
    radio.addEventListener('change', draw, { signal }));

  reseedButton.addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 0x100000000);
    simulate();
  }, { signal });

  let lastWidth = 0;
  const observer = new ResizeObserver(() => {
    const width = ksBox.clientWidth;
    if (Math.abs(width - lastWidth) > 4) {
      lastWidth = width;
      draw();
    }
  });
  observer.observe(ksBox);

  simulate();

  return () => {
    controller.abort();
    observer.disconnect();
  };
}
