/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * Section 08 — Distributions of the Three Quantities
 *
 * m independent attackers are simulated up to n = 1000 and
 * observed at n = 10, 30, 100, 300, 1000. For the selected
 * quantity we draw one histogram per n, with the normal
 * approximation N(E[Q], Var(Q)) on top, and a table comparing
 * empirical and theoretical mean and variance.
 *
 * Common scale (default): all histograms of a quantity share
 * the same x axis, so the change in spread with n is visible.
 * Own scale: each histogram uses its own x axis, to compare
 * shapes (useful for the Central Limit Theorem).
 */

import { createModel, MODEL_IDS, DEFAULT_P } from './models.js';
import { simulateAttackers, DEFAULT_N_VALUES } from './simulation.js';
import { DEFAULT_SEED } from './random.js';
import {
  compareWithTheory,
  latticeOf,
  latticeHistogram,
  normalPdf
} from './statistics.js';
import { renderHistogram, padDomain, CHART_COLORS } from './chart.js';

const ATTACKER_OPTIONS = [100, 300, 1000, 2000];
const DEFAULT_ATTACKERS = 1000;

const QUANTITY_OPTIONS = [
  { id: 'total', label: 'S_n', axis: 'S_n' },
  { id: 'average', label: 'S_n / n', axis: 'S_n / n' },
  { id: 'normalized', label: 'S_n / √n', axis: 'S_n / √n' },
  { id: 'standardized', label: 'Standardized', axis: '(S_n − nμ) / (σ√n)' }
];

const SCALE_OPTIONS = [
  { id: 'common', label: 'Common x scale' },
  { id: 'own', label: 'Own x scale' }
];

/* =====================================================
 * 1. RENDER
 * ===================================================== */

const subscript = text => text.replace(/_(\w+)/g, '<sub>$1</sub>');

export function renderHmw4Distributions() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw4-distributions"
      aria-labelledby="hmw4-distributions-title"
    >

      <div class="panel-label">
        08 / DISTRIBUTIONS OF THE THREE QUANTITIES
      </div>

      <h2 id="hmw4-distributions-title">
        From Single Paths to Distributions
      </h2>

      <p>
        A single attacker gives one value of S<sub>n</sub>.
        To see its distribution we simulate m independent
        attackers and look at the histogram of their m values,
        for n = ${DEFAULT_N_VALUES.join(', ')} systems.
      </p>

      <p>
        Bars are densities (total area 1). The amber curve is the
        normal density with the theoretical mean and variance of
        the selected quantity, and the dashed line marks its
        theoretical mean. With the common x scale, the histograms
        of one quantity can be compared directly: the change in
        width from left to right is the change in variance.
      </p>


      <!-- CONTROLS -->

      <div class="hmw4-controls">

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-dist-model">Score model</label>
          <select id="hmw4-dist-model" class="hmw4-select">
            <option value="${MODEL_IDS.BERNOULLI}">Bernoulli</option>
            <option value="${MODEL_IDS.RADEMACHER}">Rademacher</option>
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-dist-p">Success probability p</label>
          <input id="hmw4-dist-p" class="hmw4-input" type="number"
                 min="0" max="1" step="0.05" value="${DEFAULT_P}" />
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-dist-m">Attackers m</label>
          <select id="hmw4-dist-m" class="hmw4-select">
            ${ATTACKER_OPTIONS.map(m => `
              <option value="${m}" ${m === DEFAULT_ATTACKERS ? 'selected' : ''}>${m}</option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-dist-seed">Random seed</label>
          <input id="hmw4-dist-seed" class="hmw4-input" type="number"
                 min="0" max="4294967295" step="1" value="${DEFAULT_SEED}" />
        </div>

        <div class="hmw4-field hmw4-field-action">
          <button type="button" id="hmw4-dist-reseed"
                  class="button button-ghost">
            New random seed
          </button>
        </div>

      </div>


      <!-- QUANTITY AND SCALE -->

      <div class="hmw4-segmented" role="radiogroup"
           aria-label="Quantity to display">
        ${QUANTITY_OPTIONS.map((q, i) => `
          <label class="hmw4-segment">
            <input type="radio" name="hmw4-dist-quantity"
                   value="${q.id}" ${i === 0 ? 'checked' : ''} />
            <span>${subscript(q.label)}</span>
          </label>
        `).join('')}
      </div>

      <div class="hmw4-segmented hmw4-segmented-small" role="radiogroup"
           aria-label="Horizontal scale of the histograms">
        ${SCALE_OPTIONS.map((s, i) => `
          <label class="hmw4-segment">
            <input type="radio" name="hmw4-dist-scale"
                   value="${s.id}" ${i === 0 ? 'checked' : ''} />
            <span>${s.label}</span>
          </label>
        `).join('')}
      </div>


      <!-- HISTOGRAMS -->

      <div class="hmw4-hist-grid" id="hmw4-dist-grid"></div>

      <div class="hmw4-legend" aria-hidden="true">
        <span>
          <i style="background:${CHART_COLORS.path};opacity:.7"></i>
          Simulated attackers (density)
        </span>
        <span>
          <i style="background:${CHART_COLORS.theory}"></i>
          Normal density N(E[Q], Var(Q))
        </span>
      </div>

      <p id="hmw4-dist-status" class="hmw4-status"
         role="status" aria-live="polite"></p>


      <!-- THEORY VS DATA -->

      <h3>Theory versus Simulation</h3>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption id="hmw4-dist-caption"></caption>
          <thead>
            <tr>
              <th scope="col">n</th>
              <th scope="col">E[Q]</th>
              <th scope="col">Empirical mean</th>
              <th scope="col">Var(Q)</th>
              <th scope="col">Empirical var. (1/m)</th>
              <th scope="col">Sample var. (1/(m−1))</th>
              <th scope="col">Ratio emp. / theory</th>
            </tr>
          </thead>
          <tbody id="hmw4-dist-table"></tbody>
        </table>
      </div>


      <!-- INTERPRETATION -->

      <div class="hmw4-interpretation" id="hmw4-dist-interpretation"></div>

      <p class="panel-note">
        The five histograms are snapshots of the same m random
        walks taken at different n, not five independent samples.
        For each n separately, the m values are independent.
        The normal curve is drawn for reference on every
        histogram; whether it fits is exactly what the Central
        Limit Theorem is about.
      </p>

    </section>
  `;
}

/* =====================================================
 * 2. INTERPRETATION TEXTS
 * ===================================================== */

function interpretation(modelId, quantity) {
  const bern = modelId === MODEL_IDS.BERNOULLI;

  const texts = {
    total: bern
      ? `With the common scale, the histogram of S_n moves to the
         right (its mean np grows) and becomes wider (its variance
         np(1 − p) grows linearly in n). Attackers who visit more
         systems collect more successes, but they also differ more
         from one another in absolute terms.`
      : `The histogram of S_n stays centred on 0 but spreads out:
         the variance equals n, so the standard deviation grows
         like √n. The longer the process, the more the total
         scores of different attackers differ.`,

    average: bern
      ? `The histograms of S_n/n all stay centred on p and become
         narrower and taller as n grows: the variance p(1 − p)/n
         goes to 0. This concentration around p is the Law of
         Large Numbers.`
      : `The histograms of S_n/n stay centred on 0 and collapse
         towards it: the variance 1/n goes to 0. Almost every
         attacker ends with an average score per system close to
         0: the Law of Large Numbers.`,

    normalized: bern
      ? `Dividing by √n keeps the width constant (variance
         p(1 − p) for every n), but the centre √n·p keeps moving
         right. For the Bernoulli model S_n/√n does not converge
         to N(0, 1): the histogram has a stable width but no
         stable position.`
      : `Dividing by √n gives histograms that neither widen nor
         shrink: mean 0 and variance 1 for every n. With the own
         scale, notice how the coarse histogram at n = 10 becomes
         a smooth bell matching N(0, 1) at n = 1000: the Central
         Limit Theorem.`,

    standardized: bern
      ? `After subtracting np and dividing by √(np(1 − p)), the
         Bernoulli histograms all have mean 0 and variance 1,
         and they approach the N(0, 1) curve as n grows. This is
         the quantity covered by the Central Limit Theorem.`
      : `For the Rademacher model the standardized score coincides
         with S_n/√n, because μ = 0 and σ = 1.`
  };

  return texts[quantity].replace(/S_n/g, 'S<sub>n</sub>');
}

/* =====================================================
 * 3. HELPERS
 * ===================================================== */

/** Short number format for tables and captions. */
function formatNumber(value) {
  if (value === null || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs === 0) return '0';
  if (abs < 0.001) return value.toExponential(2);
  if (abs >= 1000) return value.toFixed(1);
  return Number(value.toPrecision(4)).toString();
}

/** Normal density N(mean, variance) sampled on [a, b]. */
function normalCurve(mean, variance, [a, b], points = 121) {
  const sd = Math.sqrt(variance);
  if (!(sd > 0)) return [];
  return Array.from({ length: points }, (_, i) => {
    const x = a + (b - a) * i / (points - 1);
    return [x, normalPdf((x - mean) / sd) / sd];
  });
}

/* =====================================================
 * 4. INITIALIZE
 * ===================================================== */

export function initHmw4Distributions() {
  const root = document.getElementById('hmw4-distributions');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);

  const modelSelect = get('hmw4-dist-model');
  const pInput = get('hmw4-dist-p');
  const mSelect = get('hmw4-dist-m');
  const seedInput = get('hmw4-dist-seed');
  const reseedButton = get('hmw4-dist-reseed');
  const grid = get('hmw4-dist-grid');
  const status = get('hmw4-dist-status');
  const caption = get('hmw4-dist-caption');
  const tableBody = get('hmw4-dist-table');
  const explanation = get('hmw4-dist-interpretation');

  const controller = new AbortController();
  const { signal } = controller;

  let current = null;

  const checked = name =>
    root.querySelector(`input[name="${name}"]:checked`).value;

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
    const started = performance.now();

    const result = simulateAttackers({
      model,
      nValues: DEFAULT_N_VALUES,
      m,
      seed,
      pathCount: 0
    });

    current = {
      model,
      m,
      seed,
      snapshots: result.snapshots,
      elapsed: performance.now() - started
    };

    draw();
  }

  /* ----- draw histograms, table and text ----- */

  function draw() {
    if (!current) return;

    const { model, m, snapshots } = current;
    const quantity = checked('hmw4-dist-quantity');
    const scale = checked('hmw4-dist-scale');
    const option = QUANTITY_OPTIONS.find(q => q.id === quantity);

    // Theory and data for every n.
    const panels = snapshots.map(snapshot => {
      const comparison = compareWithTheory(snapshot, model, quantity);
      if (comparison === null) return null;

      const bins = latticeHistogram(
        comparison.values,
        latticeOf(model, snapshot.n, quantity)
      );
      const sd = Math.sqrt(comparison.theory.variance);

      // Own range: data and theoretical mean ± 4 SD.
      const range = [
        Math.min(bins[0].from, comparison.theory.mean - 4 * sd),
        Math.max(bins[bins.length - 1].to, comparison.theory.mean + 4 * sd)
      ];

      return { n: snapshot.n, comparison, bins, range };
    });

    if (panels.includes(null)) {
      grid.innerHTML = '';
      tableBody.innerHTML = '';
      caption.textContent = '';
      explanation.innerHTML = '';
      status.textContent =
        'The standardized score is undefined when p = 0 or p = 1, ' +
        'because then σ = 0: every attacker has the same score.';
      return;
    }

    // Common range: union of all own ranges.
    const commonRange = [
      Math.min(...panels.map(panel => panel.range[0])),
      Math.max(...panels.map(panel => panel.range[1]))
    ];

    /* Histogram cards */

    grid.innerHTML = panels.map(panel => `
      <figure class="hmw4-hist-card">
        <figcaption>n = ${panel.n}</figcaption>
        <div class="hmw4-hist-chart" data-n="${panel.n}"></div>
        <p class="hmw4-hist-stats">
          mean ${formatNumber(panel.comparison.empirical.mean)}
          <span>(${formatNumber(panel.comparison.theory.mean)})</span><br />
          var ${formatNumber(panel.comparison.empirical.empiricalVariance)}
          <span>(${formatNumber(panel.comparison.theory.variance)})</span>
        </p>
      </figure>
    `).join('');

    panels.forEach(panel => {
      const box = grid.querySelector(`.hmw4-hist-chart[data-n="${panel.n}"]`);
      const xDomain = padDomain(scale === 'common' ? commonRange : panel.range, 0.02);
      const { mean, variance } = panel.comparison.theory;

      box.innerHTML = renderHistogram({
        width: box.clientWidth,
        height: 200,
        title: `${model.label}: histogram of ${option.axis.replace(/_/g, '')} ` +
               `for n = ${panel.n}, m = ${m}`,
        xLabel: '',
        bins: panel.bins,
        xDomain,
        curve: normalCurve(mean, variance, xDomain, 161),
        markers: [{ x: mean }]
      });
    });

    /* Table */

    caption.innerHTML =
      `${model.label}, quantity ${subscript(option.axis)}, ` +
      `m = ${m} attackers. Values in brackets under each ` +
      `histogram are the theoretical ones.`;

    tableBody.innerHTML = panels.map(({ n, comparison }) => {
      const { theory, empirical } = comparison;
      const ratio = theory.variance > 0
        ? empirical.empiricalVariance / theory.variance
        : null;
      return `
        <tr>
          <th scope="row">${n}</th>
          <td>${formatNumber(theory.mean)}</td>
          <td>${formatNumber(empirical.mean)}</td>
          <td>${formatNumber(theory.variance)}</td>
          <td>${formatNumber(empirical.empiricalVariance)}</td>
          <td>${formatNumber(empirical.sampleVariance)}</td>
          <td>${ratio === null ? '—' : ratio.toFixed(3)}</td>
        </tr>`;
    }).join('');

    explanation.innerHTML = `<p>${interpretation(model.id, quantity)}</p>`;

    status.textContent =
      `${m} attackers × ${DEFAULT_N_VALUES[DEFAULT_N_VALUES.length - 1]} systems, ` +
      `${model.label}, seed ${current.seed} — simulated in ` +
      `${current.elapsed.toFixed(0)} ms. With m = ${m}, an empirical ` +
      `variance typically differs from the theoretical one by about ` +
      `${(100 * Math.sqrt(2 / m)).toFixed(0)}%.`;
  }

  /* ----- events ----- */

  [modelSelect, pInput, mSelect, seedInput].forEach(el =>
    el.addEventListener('change', simulate, { signal }));

  root.querySelectorAll(
    'input[name="hmw4-dist-quantity"], input[name="hmw4-dist-scale"]'
  ).forEach(radio => radio.addEventListener('change', draw, { signal }));

  reseedButton.addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 0x100000000);
    simulate();
  }, { signal });

  // Redraw when the grid width changes (histogram sizes follow it).
  let lastWidth = 0;
  const observer = new ResizeObserver(() => {
    const width = grid.clientWidth;
    if (Math.abs(width - lastWidth) > 4) {
      lastWidth = width;
      draw();
    }
  });
  observer.observe(grid);

  simulate();

  return () => {
    controller.abort();
    observer.disconnect();
  };
}
