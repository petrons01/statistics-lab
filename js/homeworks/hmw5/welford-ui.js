/*
 * Statistics-Lab — Homework 4.1 (internal folder: hmw5)
 * Section 06 — Step-by-Step Laboratory
 *
 * The user enters a list of values (or generates scores). Every
 * step of Knuth's and Welford's recurrences is shown in a table,
 * the running mean is plotted with ± one running standard
 * deviation, and the final result is checked against the
 * two-pass computation.
 */

import { welfordSteps, twoPassSummary } from './welford.js';
import { createRandom, DEFAULT_SEED } from '../hmw4/random.js';
import { renderLineChart, padDomain, niceTicks, CHART_COLORS } from '../hmw4/chart.js';

const EXAMPLE = '4, 7, 13, 16';
const MAX_VALUES = 1000;
const MAX_TABLE_ROWS = 60;
const RANDOM_COUNT = 20;

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw5Lab() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw5-lab"
      aria-labelledby="hmw5-lab-title"
    >

      <div class="panel-label">
        06 / STEP-BY-STEP LABORATORY
      </div>

      <h2 id="hmw5-lab-title">
        Watching the Recurrences Work
      </h2>

      <p>
        Enter a list of numbers separated by commas or spaces, or
        generate penetration scores between 0 and 10. Each row of
        the table is one application of the three lines of
        section 05.
      </p>


      <!-- INPUT -->

      <div class="hmw4-controls hmw5-input-controls">

        <div class="hmw4-field hmw5-field-wide">
          <label class="hmw4-label" for="hmw5-lab-values">
            Values x<sub>1</sub>, x<sub>2</sub>, … (up to ${MAX_VALUES})
          </label>
          <textarea id="hmw5-lab-values" class="hmw4-input hmw5-textarea"
                    rows="3" spellcheck="false">${EXAMPLE}</textarea>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw5-lab-seed">Random seed</label>
          <input id="hmw5-lab-seed" class="hmw4-input" type="number"
                 min="0" max="4294967295" step="1" value="${DEFAULT_SEED}" />
        </div>

        <div class="hmw4-field hmw4-field-action">
          <button type="button" id="hmw5-lab-random" class="button button-ghost">
            ${RANDOM_COUNT} random scores 0–10
          </button>
        </div>

        <div class="hmw4-field hmw4-field-action">
          <button type="button" id="hmw5-lab-example" class="button button-ghost">
            Example {${EXAMPLE}}
          </button>
        </div>

        <div class="hmw4-field hmw4-field-action">
          <button type="button" id="hmw5-lab-run" class="button button-primary">
            Compute →
          </button>
        </div>

      </div>

      <p id="hmw5-lab-status" class="hmw4-status"
         role="status" aria-live="polite"></p>


      <!-- RESULT -->

      <div class="hmw4-metrics" id="hmw5-lab-metrics"></div>


      <!-- TABLE -->

      <h3>Every Step</h3>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption id="hmw5-lab-caption">
            δ = x<sub>k</sub> − M<sub>k−1</sub> is computed with the old
            mean; SS<sub>k</sub> = SS<sub>k−1</sub> + δ·(x<sub>k</sub> − M<sub>k</sub>).
            The last column is the direct recurrence of section 04,
            computed independently.
          </caption>
          <thead>
            <tr>
              <th scope="col">k</th>
              <th scope="col">x<sub>k</sub></th>
              <th scope="col">M<sub>k−1</sub></th>
              <th scope="col">δ</th>
              <th scope="col">M<sub>k</sub></th>
              <th scope="col">x<sub>k</sub> − M<sub>k</sub></th>
              <th scope="col">SS<sub>k</sub></th>
              <th scope="col">s<sub>k</sub>² = SS/(k−1)</th>
              <th scope="col">s<sub>k</sub>² direct</th>
            </tr>
          </thead>
          <tbody id="hmw5-lab-table"></tbody>
        </table>
      </div>


      <!-- CHART -->

      <h3>Running Mean and Standard Deviation</h3>

      <div class="hmw4-chart" id="hmw5-lab-chart"></div>

      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${CHART_COLORS.path}"></i> Values xₖ</span>
        <span><i style="background:${CHART_COLORS.theory}"></i> Running mean Mₖ</span>
        <span><i style="background:${CHART_COLORS.band};opacity:.35"></i> Mₖ ± sₖ</span>
      </div>

      <p class="panel-note">
        The first row has no δ and no variance: with one value
        the mean is the value itself, SS<sub>1</sub> = 0 and the
        sample variance is not defined. Every later row needs only
        the previous row and the new value.
      </p>

    </section>
  `;
}

/* =====================================================
 * 2. HELPERS
 * ===================================================== */

/** Parses "4, 7 13;16" into numbers. Throws on invalid tokens. */
export function parseValues(text) {
  const tokens = text.split(/[\s,;]+/).filter(t => t !== '');

  if (tokens.length === 0) {
    throw new RangeError('Enter at least one number.');
  }
  if (tokens.length > MAX_VALUES) {
    throw new RangeError(`At most ${MAX_VALUES} values are allowed.`);
  }

  return tokens.map(token => {
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new RangeError(`"${token}" is not a valid number.`);
    }
    return value;
  });
}

function formatNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e7 || abs < 1e-4) return value.toExponential(4);
  return Number(value.toPrecision(7)).toString();
}

/* =====================================================
 * 3. INITIALIZE
 * ===================================================== */

export function initHmw5Lab() {
  const root = document.getElementById('hmw5-lab');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);

  const valuesInput = get('hmw5-lab-values');
  const seedInput = get('hmw5-lab-seed');
  const randomButton = get('hmw5-lab-random');
  const exampleButton = get('hmw5-lab-example');
  const runButton = get('hmw5-lab-run');
  const status = get('hmw5-lab-status');
  const metrics = get('hmw5-lab-metrics');
  const tableBody = get('hmw5-lab-table');
  const chartBox = get('hmw5-lab-chart');

  const controller = new AbortController();
  const { signal } = controller;

  let current = null;

  function compute() {
    let values;
    try {
      values = parseValues(valuesInput.value);
    } catch (error) {
      status.textContent = error.message;
      return;
    }

    const steps = welfordSteps(values);
    const reference = twoPassSummary(values);
    const last = steps[steps.length - 1];

    current = { values, steps, reference };

    /* Metrics */

    const difference = last.sampleVariance === null
      ? null
      : Math.abs(last.sampleVariance - reference.sampleVariance);

    metrics.innerHTML = [
      ['VALUES k', String(last.k)],
      ['MEAN M<sub>k</sub>', formatNumber(last.mean)],
      ['SUM OF SQUARES SS<sub>k</sub>', formatNumber(last.ss)],
      ['SAMPLE VARIANCE s²', formatNumber(last.sampleVariance)],
      ['POPULATION VARIANCE SS/k', formatNumber(last.ss / last.k)]
    ].map(([label, value]) => `
      <div class="hmw4-metric">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>`).join('');

    /* Table (first rows only, for long inputs) */

    const shown = steps.slice(0, MAX_TABLE_ROWS);
    tableBody.innerHTML = shown.map(s => `
      <tr>
        <th scope="row">${s.k}</th>
        <td>${formatNumber(s.x)}</td>
        <td>${formatNumber(s.previousMean)}</td>
        <td>${formatNumber(s.delta)}</td>
        <td>${formatNumber(s.mean)}</td>
        <td>${s.k === 1 ? '—' : formatNumber(s.x - s.mean)}</td>
        <td>${formatNumber(s.ss)}</td>
        <td>${formatNumber(s.sampleVariance)}</td>
        <td>${formatNumber(s.directVariance)}</td>
      </tr>`).join('') + (steps.length > MAX_TABLE_ROWS ? `
      <tr>
        <th scope="row">…</th>
        <td colspan="8">${steps.length - MAX_TABLE_ROWS} more steps not shown;
          the final values are in the tiles above.</td>
      </tr>` : '');

    status.textContent =
      `${last.k} value${last.k > 1 ? 's' : ''} processed in one pass. ` +
      (difference === null
        ? 'Enter at least two values to obtain a sample variance.'
        : difference === 0
          ? 'Welford and the two-pass formula give exactly the same sample variance.'
          : `Welford and the two-pass formula agree up to ${difference.toExponential(1)}.`);

    draw();
  }

  function draw() {
    if (!current) return;
    const { values, steps } = current;

    const points = values.map((x, i) => [i + 1, x]);
    const means = steps.map(s => [s.k, s.mean]);
    const band = steps
      .filter(s => s.sampleVariance !== null)
      .map(s => {
        const sd = Math.sqrt(s.sampleVariance);
        return [s.k, s.mean - sd, s.mean + sd];
      });

    const all = [...values, ...band.flatMap(([, low, high]) => [low, high])];
    const xMax = Math.max(2, values.length);

    chartBox.innerHTML = renderLineChart({
      width: chartBox.clientWidth,
      height: 280,
      title: `Values, running mean and running standard deviation for ${values.length} values`,
      xLabel: 'Step k',
      yLabel: 'Value',
      xDomain: [1, xMax],
      // Steps are integers: keep only integer ticks.
      xTicks: niceTicks(1, xMax, 7).filter(Number.isInteger),
      yDomain: padDomain([Math.min(...all), Math.max(...all)]),
      band: band.length > 1 ? { points: band } : null,
      lines: [
        // Values as dots (zero-length segments with round caps).
        ...(values.length <= 200
          ? points.map(p => ({ points: [p, p], width: 7, opacity: 0.85 }))
          : [{ points, width: 1, opacity: 0.5 }]),
        { points: means, color: CHART_COLORS.theory, width: 2.2 }
      ]
    });
  }

  /* ----- events ----- */

  runButton.addEventListener('click', compute, { signal });

  exampleButton.addEventListener('click', () => {
    valuesInput.value = EXAMPLE;
    compute();
  }, { signal });

  randomButton.addEventListener('click', () => {
    const seed = Number(seedInput.value);
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xFFFFFFFF) {
      status.textContent = 'The seed must be an integer from 0 to 4294967295.';
      return;
    }
    const uniform = createRandom(seed);
    valuesInput.value = Array.from({ length: RANDOM_COUNT },
      () => Math.floor(uniform() * 11)).join(', ');
    compute();
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

  compute();

  return () => {
    controller.abort();
    observer.disconnect();
  };
}
