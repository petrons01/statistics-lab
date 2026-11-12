/*
 * Statistics-Lab — Homework 4.2 (internal folder: hmw6)
 * Section 04 — The Experiment: Averages versus μ and σ²
 *
 * m hackers × n systems. Each hacker's sampling mean and sampling
 * variance are computed with Welford's recurrence; their averages
 * over the m hackers are compared with μ and σ², for every n.
 * The biased version SS/n is shown next to s² = SS/(n − 1).
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

const HACKER_OPTIONS = [100, 500, 1000, 2000];
const DEFAULT_SHOWN_N = 10;
const HACKERS_LISTED = 6;

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw6Sampling() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw6-sampling"
      aria-labelledby="hmw6-sampling-title"
    >

      <div class="panel-label">
        04 / THE EXPERIMENT
      </div>

      <h2 id="hmw6-sampling-title">
        Do the Averages Recover μ and σ²?
      </h2>

      <p>
        Every hacker attempts n systems and receives n scores. With
        Welford's recurrence of Homework 4.1, updated once per
        system, each hacker obtains a sampling mean x̄<sub>j</sub>
        and a sampling variance s<sub>j</sub>² = SS/(n − 1). We then
        average these m values and compare the averages with μ and
        σ². A single pass gives the results for all seven values of
        n, because Welford's accumulator holds the current mean and
        variance after every system.
      </p>


      <!-- CONTROLS -->

      <div class="hmw4-controls">

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw6-samp-dist">Score distribution</label>
          <select id="hmw6-samp-dist" class="hmw4-select">
            ${listScoreDistributions().map(d => `
              <option value="${d.id}" ${d.id === DEFAULT_DISTRIBUTION ? 'selected' : ''}>${d.label}</option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw6-samp-m">Hackers m</label>
          <select id="hmw6-samp-m" class="hmw4-select">
            ${HACKER_OPTIONS.map(m => `
              <option value="${m}" ${m === DEFAULT_HACKERS ? 'selected' : ''}>${m}</option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw6-samp-n">Systems n (detail)</label>
          <select id="hmw6-samp-n" class="hmw4-select">
            ${DEFAULT_N_VALUES.map(n => `
              <option value="${n}" ${n === DEFAULT_SHOWN_N ? 'selected' : ''}>${n}</option>
            `).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw6-samp-seed">Random seed</label>
          <input id="hmw6-samp-seed" class="hmw4-input" type="number"
                 min="0" max="4294967295" step="1" value="${DEFAULT_SEED}" />
        </div>

        <div class="hmw4-field hmw4-field-action">
          <button type="button" id="hmw6-samp-reseed" class="button button-ghost">
            New random seed
          </button>
        </div>

      </div>

      <p id="hmw6-samp-status" class="hmw4-status" role="status" aria-live="polite"></p>


      <!-- DETAIL FOR ONE n -->

      <h3 id="hmw6-samp-detail-title">Results for n systems</h3>

      <div class="hmw4-metrics" id="hmw6-samp-metrics"></div>

      <h3>The First Hackers</h3>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table hmw6-table-narrow">
          <caption id="hmw6-samp-hackers-caption"></caption>
          <thead>
            <tr>
              <th scope="col">Hacker j</th>
              <th scope="col">Sampling mean x̄<sub>j</sub></th>
              <th scope="col">Sampling variance s<sub>j</sub>²</th>
            </tr>
          </thead>
          <tbody id="hmw6-samp-hackers"></tbody>
        </table>
      </div>


      <!-- ALL n -->

      <h3>Averages over the m Hackers, for Every n</h3>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption id="hmw6-samp-caption"></caption>
          <thead>
            <tr>
              <th scope="col">n</th>
              <th scope="col">Average of x̄<sub>j</sub></th>
              <th scope="col">μ</th>
              <th scope="col">z</th>
              <th scope="col">Average of s<sub>j</sub>²</th>
              <th scope="col">σ²</th>
              <th scope="col">z</th>
              <th scope="col">Average of SS/n</th>
              <th scope="col">(n−1)/n · σ²</th>
            </tr>
          </thead>
          <tbody id="hmw6-samp-table"></tbody>
        </table>
      </div>

      <div class="hmw4-interpretation" id="hmw6-samp-interpretation"></div>

      <p class="panel-note">
        z = (average − expected value) / (theoretical standard
        deviation / √m): the distance from μ or σ² in units of the
        standard error of an average of m values. Values within ±2
        are compatible with sampling noise. The rows for different n
        come from the same score sequences, observed after n systems,
        so they are not independent of each other.
      </p>

    </section>
  `;
}

/* =====================================================
 * 2. HELPERS
 * ===================================================== */

const fixed = (value, digits = 4) =>
  value === null || !Number.isFinite(value) ? '—' : value.toFixed(digits);

/* =====================================================
 * 3. INITIALIZE
 * ===================================================== */

export function initHmw6Sampling() {
  const root = document.getElementById('hmw6-sampling');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);

  const distSelect = get('hmw6-samp-dist');
  const mSelect = get('hmw6-samp-m');
  const nSelect = get('hmw6-samp-n');
  const seedInput = get('hmw6-samp-seed');
  const reseedButton = get('hmw6-samp-reseed');
  const status = get('hmw6-samp-status');
  const detailTitle = get('hmw6-samp-detail-title');
  const metrics = get('hmw6-samp-metrics');
  const hackersCaption = get('hmw6-samp-hackers-caption');
  const hackersBody = get('hmw6-samp-hackers');
  const caption = get('hmw6-samp-caption');
  const tableBody = get('hmw6-samp-table');
  const explanation = get('hmw6-samp-interpretation');

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

    status.textContent =
      `${m} hackers × ${result.settings.maxN} systems = ` +
      `${result.settings.scores.toLocaleString('en-US')} scores, ` +
      `${distribution.label}, seed ${seed} — simulated in ` +
      `${current.elapsed.toFixed(0)} ms.`;

    draw();
  }

  function draw() {
    if (!current) return;

    const { distribution: d, m, snapshots, rows } = current;
    const n = Number(nSelect.value);
    const index = rows.findIndex(r => r.n === n);
    const row = rows[index];
    const snapshot = snapshots[index];

    /* Detail tiles */

    detailTitle.textContent = `Results for n = ${n} systems per hacker`;

    metrics.innerHTML = [
      ['AVERAGE OF SAMPLING MEANS', fixed(row.averageOfMeans)],
      ['THEORETICAL MEAN μ', fixed(d.mean)],
      ['AVERAGE OF SAMPLING VARIANCES', fixed(row.averageOfVariances)],
      ['THEORETICAL VARIANCE σ²', fixed(d.variance)],
      ['AVERAGE OF SS/n (BIASED)', fixed(row.averageOfBiasedVariances)]
    ].map(([label, value]) => `
      <div class="hmw4-metric">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>`).join('');

    /* First hackers */

    hackersCaption.textContent =
      `Each hacker's own estimates after n = ${n} systems. ` +
      `They scatter around μ = ${fixed(d.mean, 3)} and σ² = ${fixed(d.variance, 3)}; ` +
      `the averages over all ${m} hackers are much closer.`;

    hackersBody.innerHTML = Array.from({ length: HACKERS_LISTED }, (_, j) => `
      <tr>
        <th scope="row">${j + 1}</th>
        <td>${fixed(snapshot.means[j])}</td>
        <td>${fixed(snapshot.variances[j])}</td>
      </tr>`).join('');

    /* All n */

    caption.textContent =
      `${d.label}: μ = ${fixed(d.mean)}, σ² = ${fixed(d.variance)}, m = ${m} hackers.`;

    tableBody.innerHTML = rows.map(r => `
      <tr${r.n === n ? ' class="hmw4-row-selected"' : ''}>
        <th scope="row">${r.n}</th>
        <td>${fixed(r.averageOfMeans)}</td>
        <td>${fixed(d.mean)}</td>
        <td>${fixed(r.zMean, 2)}</td>
        <td>${fixed(r.averageOfVariances)}</td>
        <td>${fixed(d.variance)}</td>
        <td>${fixed(r.zVariance, 2)}</td>
        <td>${fixed(r.averageOfBiasedVariances)}</td>
        <td>${fixed(r.theory.meanOfBiasedVariances)}</td>
      </tr>`).join('');

    /* Interpretation */

    const maxZMean = Math.max(...rows.map(r => Math.abs(r.zMean)));
    const maxZVar = Math.max(...rows.map(r => Math.abs(r.zVariance)));
    const smallest = rows[0];

    explanation.innerHTML = `
      <p>
        <strong>${maxZMean <= 2.5 && maxZVar <= 2.5
          ? 'Both averages hit their target.'
          : 'Both averages stay close to their target.'}</strong>
        For every n, the average of the sampling means stays within
        ${maxZMean.toFixed(1)} standard errors of μ, and the average of
        the sampling variances within ${maxZVar.toFixed(1)} standard
        errors of σ². This is what E[x̄] = μ and E[s²] = σ² predict:
        both are unbiased estimators, whatever n is, even n = 2.
        ${maxZMean > 2.5 || maxZVar > 2.5
          ? `An occasional |z| above 2 is expected about once in twenty
             comparisons, and the rows share the same scores, so one
             unusual group of hackers can affect several of them.`
          : ''}
      </p>
      <p>
        <strong>Dividing by n instead of n − 1 is biased.</strong>
        At n = ${smallest.n} the average of SS/n is
        ${fixed(smallest.averageOfBiasedVariances, 3)}, about
        (n − 1)/n = ${fixed((smallest.n - 1) / smallest.n, 3)} of σ²,
        ${Math.abs(smallest.zBiasedAgainstSigma2).toFixed(0)} standard errors
        away from it. The bias fades as n grows, because (n − 1)/n → 1.
      </p>
      <p>
        <strong>Single hackers are not precise, the averages are.</strong>
        One hacker's x̄<sub>j</sub> and s<sub>j</sub>² can be far from μ
        and σ², especially for small n (see the first hackers above).
        Averaging over m hackers shrinks this noise by √m. How the
        spread of the individual estimates depends on n is the subject
        of the next section.
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

  simulate();

  return () => controller.abort();
}
