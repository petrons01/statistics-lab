/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * Section 09 — Law of Large Numbers
 *
 * Weak Law of Large Numbers for the average score:
 *
 *   P( |S_n / n − μ| > ε )  →  0   as n → ∞.
 *
 * m independent attackers are simulated and observed at about
 * twelve values of n, evenly spaced on a logarithmic scale.
 * Two charts:
 *   A. spread of S_n / n across attackers (2.5%, 50%, 97.5%
 *      empirical quantiles) inside the corridor μ ± ε;
 *   B. empirical probability of leaving the corridor, compared
 *      with the normal approximation and Chebyshev's bound.
 *
 * The largest n depends on m, because the simulation budget is
 * max(n) × m ≤ 2,000,000 increments.
 */

import { createModel, MODEL_IDS, DEFAULT_P } from './models.js';
import { simulateAttackers, SIMULATION_LIMITS } from './simulation.js';
import { DEFAULT_SEED } from './random.js';
import { llnExceedance, normalCdf } from './statistics.js';
import {
  renderLineChart,
  formatTick,
  padDomain,
  CHART_COLORS
} from './chart.js';

const ATTACKER_OPTIONS = [100, 200, 500, 1000, 2000];
const DEFAULT_ATTACKERS = 200;
const DEFAULT_EPSILON = 0.05;
const N_POINTS = 12;
const MIN_N = 10;

/* =====================================================
 * 1. VALUES OF n
 * ===================================================== */

/** Largest n allowed by the budget for m attackers. */
export function maxSystemsFor(m) {
  return Math.min(
    SIMULATION_LIMITS.maxN,
    Math.floor(SIMULATION_LIMITS.maxIncrements / m)
  );
}

/**
 * About `count` values from MIN_N to maxN, evenly spaced in log n,
 * rounded to two significant digits (10, 16, 26, 42, ...).
 * The largest value is always maxN itself.
 */
export function logSpacedSystems(maxN, count = N_POINTS) {
  const values = new Set();
  const a = Math.log10(MIN_N);
  const b = Math.log10(maxN);

  for (let i = 0; i < count; i++) {
    const raw = 10 ** (a + (b - a) * i / (count - 1));
    const rounded = Number(raw.toPrecision(2));
    values.add(Math.min(maxN, Math.max(MIN_N, rounded)));
  }

  values.add(maxN);
  return [...values].sort((x, y) => x - y);
}

/* =====================================================
 * 2. RENDER
 * ===================================================== */

export function renderHmw4Lln() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw4-lln"
      aria-labelledby="hmw4-lln-title"
    >

      <div class="panel-label">
        09 / LAW OF LARGE NUMBERS
      </div>

      <h2 id="hmw4-lln-title">
        The Average Score Settles Down
      </h2>

      <p>
        Fix a tolerance ε. An attacker "misses" the expected rate μ
        if the average score S<sub>n</sub>/n is farther than ε
        from μ. The weak Law of Large Numbers states that the
        probability of a miss tends to zero as the number of
        systems grows:
      </p>

      <div class="math-display">
        P(|S<sub>n</sub>/n − μ| &gt; ε) → 0
      </div>

      <p>
        We estimate this probability as the fraction of the m
        simulated attackers that miss, for increasing n on a
        logarithmic axis, and compare it with two theoretical
        references: Chebyshev's bound σ²/(nε²), which always holds,
        and the normal approximation 2(1 − Φ(ε√n/σ)) suggested by
        the Central Limit Theorem.
      </p>


      <!-- CONTROLS -->

      <div class="hmw4-controls">

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-lln-model">Score model</label>
          <select id="hmw4-lln-model" class="hmw4-select">
            <option value="${MODEL_IDS.BERNOULLI}">Bernoulli</option>
            <option value="${MODEL_IDS.RADEMACHER}">Rademacher</option>
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-lln-p">Success probability p</label>
          <input id="hmw4-lln-p" class="hmw4-input" type="number"
                 min="0" max="1" step="0.05" value="${DEFAULT_P}" />
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-lln-epsilon">Tolerance ε</label>
          <input id="hmw4-lln-epsilon" class="hmw4-input" type="number"
                 min="0.005" max="0.5" step="0.005" value="${DEFAULT_EPSILON}" />
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-lln-m">Attackers m (max n)</label>
          <select id="hmw4-lln-m" class="hmw4-select">
            ${ATTACKER_OPTIONS.map(m => `
              <option value="${m}" ${m === DEFAULT_ATTACKERS ? 'selected' : ''}>
                ${m} (n ≤ ${maxSystemsFor(m)})
              </option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-lln-seed">Random seed</label>
          <input id="hmw4-lln-seed" class="hmw4-input" type="number"
                 min="0" max="4294967295" step="1" value="${DEFAULT_SEED}" />
        </div>

        <div class="hmw4-field hmw4-field-action">
          <button type="button" id="hmw4-lln-reseed"
                  class="button button-ghost">
            New random seed
          </button>
        </div>

      </div>


      <!-- CHART A -->

      <h3>Spread of the Average Score</h3>

      <div class="hmw4-chart" id="hmw4-lln-spread"></div>

      <div class="hmw4-legend" aria-hidden="true">
        <span>
          <i style="background:${CHART_COLORS.path}"></i>
          Empirical 2.5%, 50%, 97.5% quantiles of Sₙ/n
        </span>
        <span>
          <i style="background:${CHART_COLORS.band};opacity:.35"></i>
          μ ± 2σ/√n
        </span>
        <span>
          <i style="background:${CHART_COLORS.text}"></i>
          Corridor μ ± ε
        </span>
      </div>


      <!-- CHART B -->

      <h3>Probability of Missing the Corridor</h3>

      <div class="hmw4-chart" id="hmw4-lln-probability"></div>

      <div class="hmw4-legend" aria-hidden="true">
        <span>
          <i style="background:${CHART_COLORS.path}"></i>
          Empirical fraction of attackers
        </span>
        <span>
          <i style="background:${CHART_COLORS.theory}"></i>
          Normal approximation
        </span>
        <span>
          <i style="background:${CHART_COLORS.theory};opacity:.5"></i>
          Chebyshev bound (dashed)
        </span>
      </div>

      <p id="hmw4-lln-status" class="hmw4-status"
         role="status" aria-live="polite"></p>


      <!-- TABLE -->

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption id="hmw4-lln-caption"></caption>
          <thead>
            <tr>
              <th scope="col">n</th>
              <th scope="col">Attackers outside</th>
              <th scope="col">Empirical P̂</th>
              <th scope="col">Normal approx.</th>
              <th scope="col">Chebyshev bound</th>
            </tr>
          </thead>
          <tbody id="hmw4-lln-table"></tbody>
        </table>
      </div>


      <!-- INTERPRETATION -->

      <div class="hmw4-interpretation" id="hmw4-lln-interpretation"></div>

      <p class="panel-note">
        P̂ is itself an estimate based on m attackers: its standard
        error is √(P(1 − P)/m), at most 0.5/√m. With few attackers
        the empirical curve is visibly noisy, and an empirical value
        of 0 only means that no attacker out of m missed.
        For small n the curve can even rise, because S<sub>n</sub>/n
        takes only a few values: the Law of Large Numbers is a
        statement about the limit, not about every single n.
      </p>

    </section>
  `;
}

/* =====================================================
 * 3. HELPERS
 * ===================================================== */

const formatProbability = value =>
  value === 0 ? '0' : value < 0.0001 ? value.toExponential(1) : value.toFixed(4);

/** Empirical quantile of sorted values (nearest rank). */
function quantile(sorted, q) {
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(q * sorted.length) - 1)
  );
  return sorted[index];
}

/** Log-spaced x positions (as log10 n) for smooth theory curves. */
function denseLogN(minN, maxN, points = 160) {
  const a = Math.log10(minN);
  const b = Math.log10(maxN);
  return Array.from({ length: points }, (_, i) => a + (b - a) * i / (points - 1));
}

/* =====================================================
 * 4. INITIALIZE
 * ===================================================== */

export function initHmw4Lln() {
  const root = document.getElementById('hmw4-lln');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);

  const modelSelect = get('hmw4-lln-model');
  const pInput = get('hmw4-lln-p');
  const epsilonInput = get('hmw4-lln-epsilon');
  const mSelect = get('hmw4-lln-m');
  const seedInput = get('hmw4-lln-seed');
  const reseedButton = get('hmw4-lln-reseed');
  const spreadBox = get('hmw4-lln-spread');
  const probabilityBox = get('hmw4-lln-probability');
  const status = get('hmw4-lln-status');
  const caption = get('hmw4-lln-caption');
  const tableBody = get('hmw4-lln-table');
  const explanation = get('hmw4-lln-interpretation');

  const controller = new AbortController();
  const { signal } = controller;

  let current = null;

  /* ----- simulate (model, p, m or seed changed) ----- */

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

    const result = simulateAttackers({
      model,
      nValues,
      m,
      seed,
      pathCount: 0
    });

    current = {
      model,
      m,
      seed,
      nValues,
      snapshots: result.snapshots,
      // Sorted averages per n, for the quantiles of chart A.
      sortedAverages: result.snapshots.map(s => Float64Array.from(s.averages).sort()),
      elapsed: performance.now() - started
    };

    draw();
  }

  /* ----- draw (also when only ε or the width changes) ----- */

  function draw() {
    if (!current) return;

    const epsilon = Number(epsilonInput.value);
    if (!(epsilon > 0 && epsilon <= 1)) {
      status.textContent = 'ε must be a positive number not larger than 1.';
      return;
    }

    const { model, m, nValues, snapshots, sortedAverages } = current;
    const mu = model.mean;
    const sigma = Math.sqrt(model.variance);
    const minN = nValues[0];
    const maxN = nValues[nValues.length - 1];

    const logTicks = [1, 2, 3, 4];
    const xDomain = [Math.log10(minN), Math.log10(maxN)];
    const xFormat = t => formatTick(10 ** t);
    const dense = denseLogN(minN, maxN);

    /* Chart A — spread of S_n / n */

    const quantileLine = q => sortedAverages.map((sorted, i) =>
      [Math.log10(nValues[i]), quantile(sorted, q)]);

    const low = quantileLine(0.025);
    const mid = quantileLine(0.5);
    const high = quantileLine(0.975);

    const spreadValues = [
      ...low.map(([, y]) => y),
      ...high.map(([, y]) => y),
      mu - epsilon,
      mu + epsilon
    ];

    spreadBox.innerHTML = renderLineChart({
      width: spreadBox.clientWidth,
      height: 300,
      title: `Empirical quantiles of the average score for ${model.label}, ` +
             `m = ${m}, with the corridor μ ± ${epsilon}`,
      xLabel: 'Systems n (log scale)',
      yLabel: 'S_n / n',
      xDomain,
      yDomain: padDomain([Math.min(...spreadValues), Math.max(...spreadValues)]),
      xTicks: logTicks,
      xFormat,
      band: {
        points: dense.map(x => {
          const half = 2 * sigma / Math.sqrt(10 ** x);
          return [x, mu - half, mu + half];
        })
      },
      lines: [
        { points: [[xDomain[0], mu + epsilon], [xDomain[1], mu + epsilon]],
          color: CHART_COLORS.text, width: 1.2, dash: '3 4' },
        { points: [[xDomain[0], mu - epsilon], [xDomain[1], mu - epsilon]],
          color: CHART_COLORS.text, width: 1.2, dash: '3 4' },
        { points: [[xDomain[0], mu], [xDomain[1], mu]],
          color: CHART_COLORS.theory, width: 1.6, dash: '6 5' },
        { points: low, width: 2 },
        { points: high, width: 2 },
        { points: mid, width: 1.4, opacity: 0.6 }
      ]
    });

    /* Chart B — probability of a miss */

    const rows = snapshots.map(s => llnExceedance(s, model, epsilon));

    probabilityBox.innerHTML = renderLineChart({
      width: probabilityBox.clientWidth,
      height: 300,
      title: `Probability that S_n/n misses μ by more than ${epsilon}: ` +
             `simulation, normal approximation and Chebyshev bound`,
      xLabel: 'Systems n (log scale)',
      yLabel: 'P(|S_n/n − μ| > ε)',
      xDomain,
      yDomain: [-0.02, 1.02],
      xTicks: logTicks,
      xFormat,
      lines: [
        {
          points: dense.map(x => [x, Math.min(1, model.variance / (10 ** x * epsilon * epsilon))]),
          color: CHART_COLORS.theory, width: 1.6, dash: '6 5', opacity: 0.8
        },
        {
          points: dense.map(x => [x, sigma > 0
            ? 2 * (1 - normalCdf(epsilon * Math.sqrt(10 ** x) / sigma))
            : 0]),
          color: CHART_COLORS.theory, width: 2
        },
        {
          points: rows.map(r => [Math.log10(r.n), r.empiricalProbability]),
          width: 2.6
        }
      ]
    });

    /* Table */

    caption.textContent =
      `${model.label}, ε = ${epsilon}, m = ${m} attackers. ` +
      `Standard error of P̂ at most ${(0.5 / Math.sqrt(m)).toFixed(3)}.`;

    tableBody.innerHTML = rows.map(r => `
      <tr>
        <th scope="row">${r.n}</th>
        <td>${r.outside} / ${m}</td>
        <td>${formatProbability(r.empiricalProbability)}</td>
        <td>${formatProbability(r.normalApproximation)}</td>
        <td>${formatProbability(r.chebyshevBound)}</td>
      </tr>
    `).join('');

    /* Interpretation */

    // First n from which ALL the following values are below 5%.
    let lastAbove = -1;
    rows.forEach((r, i) => { if (r.empiricalProbability >= 0.05) lastAbove = i; });
    const settled = lastAbove < rows.length - 1;
    const settledFrom = settled ? rows[lastAbove + 1].n : null;

    // n at which the normal approximation reaches 5%: ε√n/σ = 1.96.
    const nNormal = sigma > 0 ? Math.ceil((1.96 * sigma / epsilon) ** 2) : 1;
    // n at which Chebyshev's bound reaches 5%: σ²/(nε²) = 0.05.
    const nChebyshev = sigma > 0 ? Math.ceil(model.variance / (0.05 * epsilon ** 2)) : 1;

    // Rademacher lattice effect: for odd n, S_n is odd and never 0,
    // so |S_n / n| ≥ 1/n. If ε < 1/n, every attacker misses.
    const forced = model.id === MODEL_IDS.RADEMACHER
      ? nValues.filter(n => n % 2 === 1 && epsilon < 1 / n)
      : [];

    const latticeNote = forced.length > 0
      ? `For odd n = ${forced.join(', ')} every attacker misses: S<sub>n</sub>
         is then odd and can never be 0, so |S<sub>n</sub>/n| ≥ 1/n &gt; ε.
         This is the discreteness of S<sub>n</sub>, not a failure of the law.`
      : '';

    const outcome = settled
      ? `With ε = ${epsilon}, fewer than 5% of the attackers miss the
         corridor from n = ${settledFrom} systems on.`
      : `With ε = ${epsilon}, the fraction of attackers outside the
         corridor is still above 5% at n = ${maxN}: the convergence
         is happening, but more systems are needed. Choose fewer
         attackers to reach a larger n, or a wider ε.`;

    explanation.innerHTML = `
      <p>
        ${outcome}
        The normal approximation predicts the 5% level at about
        n ≈ ${nNormal}, while Chebyshev's inequality only guarantees
        it from n ≈ ${nChebyshev}: the bound is always true but very
        conservative. Both scale like σ²/ε² (here σ² = ${Number(model.variance.toPrecision(4))}):
        halving ε requires four times as many systems, and a score
        with a larger variance needs more systems. Rademacher
        (σ² = 1) needs about 4.4 times more than Bernoulli with
        p = 0.35 (σ² = 0.2275). In chart A this is the funnel of the
        average score narrowing like 1/√n until it fits inside the
        corridor.
        ${latticeNote}
      </p>`;

    status.textContent =
      `${m} attackers × ${maxN} systems, ${model.label}, ` +
      `seed ${current.seed} — simulated in ${current.elapsed.toFixed(0)} ms.`;
  }

  /* ----- events ----- */

  [modelSelect, pInput, mSelect, seedInput].forEach(el =>
    el.addEventListener('change', simulate, { signal }));

  // Changing ε does not require a new simulation.
  epsilonInput.addEventListener('change', draw, { signal });

  reseedButton.addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 0x100000000);
    simulate();
  }, { signal });

  let lastWidth = 0;
  const observer = new ResizeObserver(() => {
    const width = spreadBox.clientWidth;
    if (Math.abs(width - lastWidth) > 4) {
      lastWidth = width;
      draw();
    }
  });
  observer.observe(spreadBox);

  simulate();

  return () => {
    controller.abort();
    observer.disconnect();
  };
}
