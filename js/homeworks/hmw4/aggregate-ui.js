/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * Section 11 — Aggregate Penetration Score
 *
 * The aggregate score of m attackers on n systems is
 *
 *   T(n, m) = S_n^(1) + ... + S_n^(m),
 *
 * a sum of n·m i.i.d. increments, therefore
 *
 *   E[T] = m n μ,   SD(T) = σ √(m n),   T / (m n) → μ.
 *
 * One simulation of 1000 attackers up to n = 1000 provides all
 * nine cells n ∈ {10, 100, 1000} × m ∈ {10, 100, 1000}:
 * T(n, m) uses the first m attackers observed after n systems.
 * The cells are nested subsets of the same experiment, not
 * independent samples.
 */

import { createModel, MODEL_IDS, DEFAULT_P } from './models.js';
import { simulateAttackers } from './simulation.js';
import { DEFAULT_SEED } from './random.js';
import { renderLineChart, formatTick, padDomain, CHART_COLORS } from './chart.js';

const GRID_N = [10, 100, 1000];
const GRID_M = [10, 100, 1000];

// One colour per number of systems n, to tell the dots apart.
const N_COLORS = {
  10: CHART_COLORS.path,
  100: '#7fb2ff',
  1000: CHART_COLORS.title
};

/* =====================================================
 * 1. COMPUTATION (no DOM: testable on its own)
 * ===================================================== */

/**
 * Aggregate score for every (n, m) cell of the grid.
 * @returns {object[]} One row per cell, sorted by m then n.
 */
export function aggregateGrid(model, snapshots) {
  const sigma = Math.sqrt(model.variance);
  const rows = [];

  for (const m of GRID_M) {
    for (const n of GRID_N) {
      const snapshot = snapshots.find(s => s.n === n);

      let total = 0;
      for (let j = 0; j < m; j++) total += snapshot.totals[j];

      const units = m * n;
      const expected = units * model.mean;
      const sd = sigma * Math.sqrt(units);

      rows.push({
        n,
        m,
        units,
        total,
        expected,
        sd,
        zScore: sd > 0 ? (total - expected) / sd : null,
        rate: total / units,
        relativeSd: model.mean !== 0 ? sd / Math.abs(expected) : null
      });
    }
  }

  return rows;
}

/* =====================================================
 * 2. RENDER
 * ===================================================== */

export function renderHmw4Aggregate() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw4-aggregate"
      aria-labelledby="hmw4-aggregate-lab-title"
    >

      <div class="panel-label">
        11 / SYSTEM SIZE, ATTACKERS AND AGGREGATE SCORE
      </div>

      <h2 id="hmw4-aggregate-lab-title">
        How n and m Shape the Aggregate Penetration Score
      </h2>

      <p>
        The aggregate penetration score T sums the total scores of
        all m attackers after n systems. It is a sum of n·m
        independent increments, so its behaviour depends on n and m
        only through their product:
      </p>

      <div class="math-display">
        E[T] = mnμ<br />
        SD(T) = σ√(mn)
      </div>

      <p>
        Below, one simulation of 1000 attackers on 1000 systems is
        read at every combination of n ∈ {10, 100, 1000} and
        m ∈ {10, 100, 1000}. Each cell gives one value of T,
        compared with its expectation through the z-score
        (T − E[T]) / SD(T), and the overall rate per attack T/(mn).
      </p>


      <!-- CONTROLS -->

      <div class="hmw4-controls">

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-agg-model">Score model</label>
          <select id="hmw4-agg-model" class="hmw4-select">
            <option value="${MODEL_IDS.BERNOULLI}">Bernoulli</option>
            <option value="${MODEL_IDS.RADEMACHER}">Rademacher</option>
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-agg-p">Success probability p</label>
          <input id="hmw4-agg-p" class="hmw4-input" type="number"
                 min="0" max="1" step="0.05" value="${DEFAULT_P}" />
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-agg-seed">Random seed</label>
          <input id="hmw4-agg-seed" class="hmw4-input" type="number"
                 min="0" max="4294967295" step="1" value="${DEFAULT_SEED}" />
        </div>

        <div class="hmw4-field hmw4-field-action">
          <button type="button" id="hmw4-agg-reseed"
                  class="button button-ghost">
            New random seed
          </button>
        </div>

      </div>


      <!-- CHART -->

      <h3>Rate per Attack T/(mn) against the Number of Attacks mn</h3>

      <div class="hmw4-chart" id="hmw4-agg-chart"></div>

      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${N_COLORS[10]}"></i> n = 10</span>
        <span><i style="background:${N_COLORS[100]}"></i> n = 100</span>
        <span><i style="background:${N_COLORS[1000]}"></i> n = 1000</span>
        <span>
          <i style="background:${CHART_COLORS.band};opacity:.35"></i>
          μ ± 2σ/√(mn)
        </span>
      </div>

      <p id="hmw4-agg-status" class="hmw4-status"
         role="status" aria-live="polite"></p>


      <!-- TABLE -->

      <h3>The Nine Combinations</h3>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption id="hmw4-agg-caption"></caption>
          <thead>
            <tr>
              <th scope="col">Systems n</th>
              <th scope="col">Attackers m</th>
              <th scope="col">Attacks mn</th>
              <th scope="col">T simulated</th>
              <th scope="col">E[T] = mnμ</th>
              <th scope="col">SD(T) = σ√(mn)</th>
              <th scope="col">z-score</th>
              <th scope="col">Rate T/(mn)</th>
              <th scope="col">SD(T) / E[T]</th>
            </tr>
          </thead>
          <tbody id="hmw4-agg-table"></tbody>
        </table>
      </div>


      <!-- INTERPRETATION -->

      <div class="hmw4-interpretation" id="hmw4-agg-interpretation"></div>

      <p class="panel-note">
        The nine cells are read from the same simulation: T(n, m)
        uses the first m attackers after n systems, so cells share
        attackers and increments and are not independent samples.
        Each cell is a single realization of T; the z-score says
        how unusual that realization is under the model.
      </p>

    </section>
  `;
}

/* =====================================================
 * 3. HELPERS
 * ===================================================== */

function formatNumber(value, digits = 4) {
  if (value === null || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1000) return Math.round(value).toLocaleString('en-US');
  if (abs === 0) return '0';
  return Number(value.toPrecision(digits)).toString();
}

/* =====================================================
 * 4. INITIALIZE
 * ===================================================== */

export function initHmw4Aggregate() {
  const root = document.getElementById('hmw4-aggregate');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);

  const modelSelect = get('hmw4-agg-model');
  const pInput = get('hmw4-agg-p');
  const seedInput = get('hmw4-agg-seed');
  const reseedButton = get('hmw4-agg-reseed');
  const chartBox = get('hmw4-agg-chart');
  const status = get('hmw4-agg-status');
  const caption = get('hmw4-agg-caption');
  const tableBody = get('hmw4-agg-table');
  const explanation = get('hmw4-agg-interpretation');

  const controller = new AbortController();
  const { signal } = controller;

  let current = null;

  /* ----- simulate ----- */

  function simulate() {
    pInput.disabled = modelSelect.value === MODEL_IDS.RADEMACHER;

    const modelId = modelSelect.value;
    const p = Number(pInput.value);
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
    const started = performance.now();

    const result = simulateAttackers({
      model,
      nValues: GRID_N,
      m: Math.max(...GRID_M),
      seed,
      pathCount: 0
    });

    current = {
      model,
      seed,
      rows: aggregateGrid(model, result.snapshots),
      elapsed: performance.now() - started
    };

    draw();
  }

  /* ----- draw ----- */

  function draw() {
    if (!current) return;

    const { model, rows } = current;
    const mu = model.mean;
    const sigma = Math.sqrt(model.variance);

    /* Chart: rate against log10(mn), one dot per cell */

    const logUnits = rows.map(r => Math.log10(r.units));
    const xDomain = [Math.min(...logUnits) - 0.25, Math.max(...logUnits) + 0.25];
    const dense = Array.from({ length: 120 }, (_, i) =>
      xDomain[0] + (xDomain[1] - xDomain[0]) * i / 119);

    const widest = 2 * sigma / Math.sqrt(10 ** xDomain[0]);
    const yValues = [...rows.map(r => r.rate), mu - widest, mu + widest];

    chartBox.innerHTML = renderLineChart({
      width: chartBox.clientWidth,
      height: 300,
      title: `Aggregate rate per attack T/(mn) for the nine combinations ` +
             `of n and m, ${model.label}`,
      xLabel: 'Number of attacks mn (log scale)',
      yLabel: 'T / (mn)',
      xDomain,
      yDomain: padDomain([Math.min(...yValues), Math.max(...yValues)]),
      xTicks: [2, 3, 4, 5, 6],
      xFormat: t => (10 ** t >= 1e6 ? `${10 ** t / 1e6}M` : formatTick(10 ** t)),
      band: {
        points: dense.map(x => {
          const half = 2 * sigma / Math.sqrt(10 ** x);
          return [x, mu - half, mu + half];
        })
      },
      lines: [
        { points: [[xDomain[0], mu], [xDomain[1], mu]],
          color: CHART_COLORS.theory, width: 1.6, dash: '6 5' },
        // Zero-length segments with round caps are drawn as dots.
        // Cells with the same mn are shifted slightly by n
        // (n = 10 left, n = 1000 right) so that no dot hides another.
        ...rows.map(r => {
          const x = Math.log10(r.units) + 0.05 * (GRID_N.indexOf(r.n) - 1);
          return { points: [[x, r.rate], [x, r.rate]], color: N_COLORS[r.n], width: 11 };
        })
      ]
    });

    /* Table */

    caption.textContent =
      `${model.label}: μ = ${formatNumber(mu)}, σ = ${formatNumber(sigma)}. ` +
      `Rows sorted by number of attackers m, then systems n.`;

    tableBody.innerHTML = rows.map(r => `
      <tr>
        <th scope="row">${r.n}</th>
        <td>${r.m}</td>
        <td>${r.units.toLocaleString('en-US')}</td>
        <td>${formatNumber(r.total)}</td>
        <td>${formatNumber(r.expected)}</td>
        <td>${formatNumber(r.sd)}</td>
        <td>${r.zScore === null ? '—' : r.zScore.toFixed(2)}</td>
        <td>${formatNumber(r.rate)}</td>
        <td>${r.relativeSd === null ? '—' : (100 * r.relativeSd).toFixed(2) + '%'}</td>
      </tr>
    `).join('');

    /* Interpretation */

    const smallest = rows.reduce((a, b) => (b.units < a.units ? b : a));
    const largest = rows.reduce((a, b) => (b.units > a.units ? b : a));
    const extreme = rows.filter(r => r.zScore !== null && Math.abs(r.zScore) > 2).length;
    const bern = model.id === MODEL_IDS.BERNOULLI;

    explanation.innerHTML = `
      <p>
        <strong>Only the product mn matters for T.</strong>
        Ten attackers on 1000 systems and 1000 attackers on 10
        systems make the same 10,000 attacks, and T has the same
        mean and standard deviation in both cases: in the chart
        their dots share the same position on the mn axis
        (shifted very slightly only to keep them all visible).
      </p>
      <p>
        <strong>Absolute versus relative uncertainty.</strong>
        From ${smallest.units.toLocaleString('en-US')} to
        ${largest.units.toLocaleString('en-US')} attacks, SD(T) grows
        from ${formatNumber(smallest.sd)} to ${formatNumber(largest.sd)}:
        the aggregate score becomes harder to predict in absolute
        terms. The rate T/(mn), instead, gets closer to μ
        ${bern
          ? `= ${formatNumber(mu)} (relative error from
             ${(100 * smallest.relativeSd).toFixed(1)}% to
             ${(100 * largest.relativeSd).toFixed(2)}%)`
          : '= 0'}:
        the band narrows like 1/√(mn), the Law of Large Numbers
        applied to all attacks together.
        ${bern ? '' : `For the Rademacher model the expected aggregate is 0
        for every n and m: adding attackers and systems never moves the
        expected score, it only widens the range of possible outcomes.`}
      </p>
      <p>
        <strong>Different roles for single attackers.</strong>
        n and m are interchangeable for T, but not for the
        questions of the previous sections. How far one attacker's
        average S<sub>n</sub>/n is from μ depends only on n
        (sections 07 and 09). How well the m simulated attackers
        reveal the distribution of S<sub>n</sub> depends on m
        (sections 08 and 10): more attackers do not make a single
        attacker more predictable, they make our picture of all
        attackers more accurate.
      </p>
      <p>
        ${extreme === 0
          ? 'All nine z-scores lie within ±2: every simulated T is consistent with its expectation.'
          : `${extreme} of the nine z-scores ${extreme === 1 ? 'lies' : 'lie'} outside ±2. Values beyond ±2 are expected
             about 5% of the time, and the cells share attackers, so a single unusual
             attacker group can affect several cells at once.`}
      </p>`;

    status.textContent =
      `${Math.max(...GRID_M)} attackers × ${Math.max(...GRID_N)} systems, ` +
      `${model.label}, seed ${current.seed} — simulated in ` +
      `${current.elapsed.toFixed(0)} ms.`;
  }

  /* ----- events ----- */

  [modelSelect, pInput, seedInput].forEach(el =>
    el.addEventListener('change', simulate, { signal }));

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
