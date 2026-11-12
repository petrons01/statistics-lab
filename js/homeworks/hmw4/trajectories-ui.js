/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * Section 07 — Sample Trajectories
 *
 * Simulates a few attackers and plots their paths for one of
 * four quantities, together with the theoretical mean and the
 * band mean ± 2 standard deviations at every step k:
 *
 *   total          S_k
 *   average        S_k / k
 *   normalized     S_k / √k
 *   standardized   (S_k − kμ) / (σ√k)   (supplementary)
 *
 * The same simulated paths are reused when only the quantity
 * changes, so the reader sees ONE set of attackers under
 * different normalizations.
 */

import { createModel, MODEL_IDS, DEFAULT_P } from './models.js';
import { simulateAttackers } from './simulation.js';
import { DEFAULT_SEED } from './random.js';
import { theoreticalMoments, QUANTITIES } from './statistics.js';
import {
  renderLineChart,
  downsample,
  padDomain,
  CHART_COLORS
} from './chart.js';

const SYSTEM_OPTIONS = [100, 300, 1000, 3000, 10000];
const DEFAULT_SYSTEMS = 1000;
const DEFAULT_PATHS = 10;
const MAX_PATHS = 20;
const MAX_POINTS = 600;   // drawn points per path

const QUANTITY_OPTIONS = [
  { id: 'total', label: 'S_k', axis: 'Total score S_k' },
  { id: 'average', label: 'S_k / k', axis: 'Average score S_k / k' },
  { id: 'normalized', label: 'S_k / √k', axis: 'Normalized score S_k / √k' },
  { id: 'standardized', label: 'Standardized', axis: '(S_k − kμ) / (σ√k)' }
];

/* =====================================================
 * 1. RENDER
 * ===================================================== */

const subscript = text => text.replace(/_(\w+)/g, '<sub>$1</sub>');

export function renderHmw4Trajectories() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw4-trajectories"
      aria-labelledby="hmw4-trajectories-title"
    >

      <div class="panel-label">
        07 / SAMPLE TRAJECTORIES
      </div>

      <h2 id="hmw4-trajectories-title">
        Watching Attackers Accumulate Their Scores
      </h2>

      <p>
        Each line is one attacker moving through the systems.
        At system k the attacker has collected the total score
        S<sub>k</sub>. Switch between the four quantities to see
        the same attackers under different normalizations.
      </p>

      <p>
        The amber dashed line is the theoretical mean of the
        selected quantity at each k. The shaded band is the
        mean ± 2 standard deviations, computed from
        E[S<sub>k</sub>] = kμ and Var(S<sub>k</sub>) = kσ².
      </p>


      <!-- CONTROLS -->

      <div class="hmw4-controls">

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-traj-model">Score model</label>
          <select id="hmw4-traj-model" class="hmw4-select">
            <option value="${MODEL_IDS.BERNOULLI}">Bernoulli</option>
            <option value="${MODEL_IDS.RADEMACHER}">Rademacher</option>
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-traj-p">Success probability p</label>
          <input id="hmw4-traj-p" class="hmw4-input" type="number"
                 min="0" max="1" step="0.05" value="${DEFAULT_P}" />
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-traj-n">Systems n</label>
          <select id="hmw4-traj-n" class="hmw4-select">
            ${SYSTEM_OPTIONS.map(n => `
              <option value="${n}" ${n === DEFAULT_SYSTEMS ? 'selected' : ''}>${n}</option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-traj-paths">Attackers shown</label>
          <input id="hmw4-traj-paths" class="hmw4-input" type="number"
                 min="1" max="${MAX_PATHS}" step="1" value="${DEFAULT_PATHS}" />
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw4-traj-seed">Random seed</label>
          <input id="hmw4-traj-seed" class="hmw4-input" type="number"
                 min="0" max="4294967295" step="1" value="${DEFAULT_SEED}" />
        </div>

        <div class="hmw4-field hmw4-field-action">
          <button type="button" id="hmw4-traj-reseed"
                  class="button button-ghost">
            New random seed
          </button>
        </div>

      </div>


      <!-- QUANTITY SELECTOR -->

      <div class="hmw4-segmented" role="radiogroup"
           aria-label="Quantity to plot">
        ${QUANTITY_OPTIONS.map((q, i) => `
          <label class="hmw4-segment">
            <input type="radio" name="hmw4-traj-quantity"
                   value="${q.id}" ${i === 0 ? 'checked' : ''} />
            <span>${subscript(q.label)}</span>
          </label>
        `).join('')}
      </div>


      <!-- CHART -->

      <div class="hmw4-chart" id="hmw4-traj-chart"></div>

      <div class="hmw4-legend" aria-hidden="true">
        <span>
          <i style="background:${CHART_COLORS.path}"></i>
          Simulated attackers
        </span>
        <span>
          <i style="background:${CHART_COLORS.theory}"></i>
          Theoretical mean
        </span>
        <span>
          <i style="background:${CHART_COLORS.band};opacity:.35"></i>
          Mean ± 2 SD
        </span>
      </div>

      <p id="hmw4-traj-status" class="hmw4-status"
         role="status" aria-live="polite"></p>


      <!-- VALUES AT k = n -->

      <div class="hmw4-metrics" id="hmw4-traj-metrics"></div>


      <!-- INTERPRETATION -->

      <div class="hmw4-interpretation" id="hmw4-traj-interpretation"></div>

      <p class="panel-note">
        The band holds at each fixed k: a single attacker is
        outside it with probability of about 5% at any given
        step. It is not a guarantee for the whole path, which
        crosses the band at some point much more often.
        A handful of attackers illustrates the dynamics;
        the distributions in the next sections use many more.
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
      ? `Bernoulli paths never decrease: each system adds 0 or 1.
         They grow along the line kp, and their spread around it
         grows like √k. Relative to the mean the spread shrinks,
         but in absolute terms the total scores of different
         attackers drift further and further apart.`
      : `Rademacher paths wander up and down around 0 with no
         preferred direction. The band widens like √k: after many
         systems the attackers have very different total scores,
         even though every one of them has expected score 0.`,

    average: bern
      ? `Dividing by k squeezes all paths onto the level p.
         Early on the averages jump between 0 and 1, then the
         band narrows like 1/√k and every attacker's success
         rate settles near p: the Law of Large Numbers.`
      : `Dividing by k squeezes all paths onto 0. The band narrows
         like 1/√k: the average score per system of every
         attacker becomes close to 0. This is the Law of Large
         Numbers seen on individual paths.`,

    normalized: bern
      ? `Dividing by √k keeps the band at constant width 2σ on
         each side, but the mean √k·p keeps growing: the whole
         picture drifts upward. S_k/√k does not settle on a
         fixed distribution for the Bernoulli model.`
      : `Dividing by √k keeps the band at a constant width
         ±2 around 0: the spread neither explodes nor vanishes.
         The paths keep fluctuating for ever, but at every k
         their values follow approximately N(0, 1): this is the
         scale of the Central Limit Theorem.`,

    standardized: bern
      ? `Subtracting the mean kp before dividing by σ√k removes
         the drift. The standardized Bernoulli score has mean 0
         and variance 1 at every k, and it is this quantity that
         converges in distribution to N(0, 1).`
      : `For the Rademacher model μ = 0 and σ = 1, so the
         standardized score is exactly S_k/√k: the two plots are
         identical.`
  };

  return texts[quantity].replace(/S_k/g, 'S<sub>k</sub>');
}

/* =====================================================
 * 3. INITIALIZE
 * ===================================================== */

/** Returns (s, k) => value of the quantity for total score s at step k. */
function valueAt(model, quantity) {
  const q = QUANTITIES[quantity];
  return (s, k) => (s - q.shift(k, model)) * q.scale(k, model);
}

const format = (value, digits = 3) =>
  value === null || !Number.isFinite(value) ? '—' : value.toFixed(digits);

export function initHmw4Trajectories() {
  const root = document.getElementById('hmw4-trajectories');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);

  const modelSelect = get('hmw4-traj-model');
  const pInput = get('hmw4-traj-p');
  const nSelect = get('hmw4-traj-n');
  const pathsInput = get('hmw4-traj-paths');
  const seedInput = get('hmw4-traj-seed');
  const reseedButton = get('hmw4-traj-reseed');
  const chartBox = get('hmw4-traj-chart');
  const status = get('hmw4-traj-status');
  const metrics = get('hmw4-traj-metrics');
  const explanation = get('hmw4-traj-interpretation');

  const controller = new AbortController();
  const { signal } = controller;

  // Last simulation, reused when only the quantity or the width changes.
  let current = null;

  function selectedQuantity() {
    return root.querySelector('input[name="hmw4-traj-quantity"]:checked').value;
  }

  /* ----- read and validate the form ----- */

  function readSettings() {
    const modelId = modelSelect.value;
    const p = Number(pInput.value);
    const n = Number(nSelect.value);
    const pathCount = Number(pathsInput.value);
    const seed = Number(seedInput.value);

    if (modelId === MODEL_IDS.BERNOULLI && !(p >= 0 && p <= 1)) {
      throw new RangeError('p must be a number between 0 and 1.');
    }
    if (!Number.isInteger(pathCount) || pathCount < 1 || pathCount > MAX_PATHS) {
      throw new RangeError(`Attackers shown must be an integer from 1 to ${MAX_PATHS}.`);
    }
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) {
      throw new RangeError('The seed must be an integer from 0 to 4294967295.');
    }

    return { modelId, p, n, pathCount, seed };
  }

  /* ----- simulate ----- */

  function simulate() {
    pInput.disabled = modelSelect.value === MODEL_IDS.RADEMACHER;

    let settings;
    try {
      settings = readSettings();
    } catch (error) {
      status.textContent = error.message;
      return;
    }

    const model = createModel(settings.modelId, settings.p);
    const started = performance.now();

    const result = simulateAttackers({
      model,
      nValues: [settings.n],
      m: Math.max(2, settings.pathCount),   // simulation needs m ≥ 2
      pathCount: settings.pathCount,
      seed: settings.seed
    });

    current = {
      model,
      n: settings.n,
      seed: settings.seed,
      paths: result.paths,
      elapsed: performance.now() - started
    };

    draw();
  }

  /* ----- draw the selected quantity ----- */

  function draw() {
    if (!current) return;

    const { model, n, paths } = current;
    const quantity = selectedQuantity();
    const option = QUANTITY_OPTIONS.find(q => q.id === quantity);

    if (theoreticalMoments(model, n, quantity) === null) {
      chartBox.innerHTML = '';
      metrics.innerHTML = '';
      explanation.innerHTML = '';
      status.textContent =
        'The standardized score is undefined when p = 0 or p = 1, ' +
        'because then σ = 0: every attacker has the same score.';
      return;
    }

    // Steps actually drawn (k ≥ 1; quantities divide by k or √k).
    const steps = downsample(
      Array.from({ length: n }, (_, i) => i + 1),
      MAX_POINTS
    );

    // Value of the quantity for total score s at step k
    // (same shift/scale definitions as statistics.js), and its theory.
    const theoryAt = k => theoreticalMoments(model, k, quantity);
    const transform = valueAt(model, quantity);

    const pathPoints = paths.map(path =>
      steps.map(k => [k, transform(path.totals[k], k)])
    );

    const theory = steps.map(k => {
      const { mean, variance } = theoryAt(k);
      const sd = Math.sqrt(variance);
      return { k, mean, low: mean - 2 * sd, high: mean + 2 * sd };
    });

    // y range: all data, the mean curve and the band at k = n.
    // The band is wider at small k for "average": it is clipped.
    const last = theory[theory.length - 1];
    const values = [
      ...pathPoints.flatMap(points => points.map(([, v]) => v)),
      ...theory.map(t => t.mean),
      last.low,
      last.high
    ];
    const yDomain = padDomain([Math.min(...values), Math.max(...values)]);

    chartBox.innerHTML = renderLineChart({
      width: chartBox.clientWidth,
      title: `${paths.length} simulated ${model.label} paths: ${option.axis.replace(/_/g, '')}`,
      xLabel: 'Systems attacked k',
      yLabel: option.axis,
      xDomain: [0, n],
      yDomain,
      band: { points: theory.map(t => [t.k, t.low, t.high]) },
      lines: [
        ...pathPoints.map(points => ({ points, opacity: 0.72 })),
        {
          points: theory.map(t => [t.k, t.mean]),
          color: CHART_COLORS.theory,
          width: 2,
          dash: '6 5'
        }
      ]
    });

    renderMetrics(quantity);
    explanation.innerHTML = `<p>${interpretation(model.id, quantity)}</p>`;

    status.textContent =
      `${paths.length} attacker${paths.length > 1 ? 's' : ''} × ${n} systems, ` +
      `${model.label}, seed ${current.seed} — simulated in ` +
      `${current.elapsed.toFixed(0)} ms.`;
  }

  /* ----- values at k = n ----- */

  function renderMetrics(quantity) {
    const { model, n, paths } = current;
    const theory = theoreticalMoments(model, n, quantity);
    const sd = Math.sqrt(theory.variance);

    const transform = valueAt(model, quantity);
    const finals = paths.map(path => transform(path.totals[n], n));

    const observedMean = finals.reduce((a, b) => a + b, 0) / finals.length;
    const outside = finals.filter(v => Math.abs(v - theory.mean) > 2 * sd).length;
    const digits = quantity === 'total' ? 2 : 3;

    const tiles = [
      ['THEORETICAL MEAN AT k = n', format(theory.mean, digits)],
      ['THEORETICAL SD AT k = n', format(sd, digits)],
      ['MEAN OF THE PATHS SHOWN', format(observedMean, digits)],
      ['RANGE OF THE PATHS SHOWN',
        `${format(Math.min(...finals), digits)} … ${format(Math.max(...finals), digits)}`],
      ['OUTSIDE THE BAND AT k = n', `${outside} / ${finals.length}`]
    ];

    metrics.innerHTML = tiles.map(([label, value]) => `
      <div class="hmw4-metric">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `).join('');
  }

  /* ----- events ----- */

  [modelSelect, nSelect].forEach(el =>
    el.addEventListener('change', simulate, { signal }));

  [pInput, pathsInput, seedInput].forEach(el =>
    el.addEventListener('change', simulate, { signal }));

  root.querySelectorAll('input[name="hmw4-traj-quantity"]').forEach(radio =>
    radio.addEventListener('change', draw, { signal }));

  reseedButton.addEventListener('click', () => {
    // A fresh seed for exploration. It is shown in the input,
    // so the resulting picture can always be reproduced.
    seedInput.value = Math.floor(Math.random() * 0x100000000);
    simulate();
  }, { signal });

  // Redraw at the new width when the container is resized.
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

  // Cleanup, called by app.js when leaving the page.
  return () => {
    controller.abort();
    observer.disconnect();
  };
}
