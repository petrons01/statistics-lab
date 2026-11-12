/*
 * Statistics-Lab — Homework 4.1 (internal folder: hmw5)
 * Section 07 — Numerical Stability
 *
 * The same data are shifted by a growing offset c (x_i + c).
 * Shifting does not change the variance, so the exact answer is
 * known. We compare the sample variance computed by:
 *
 *   - Welford's recurrence,
 *   - the two-pass formula (reference),
 *   - the naive one-pass formula  SS = Σx² − (Σx)² / n.
 *
 * Integer data are used, so x_i + c is represented exactly in
 * double precision for every c ≤ 10^15: any error comes from the
 * algorithm, not from storing the data.
 */

import { welfordSummary, twoPassSummary, naiveSummary } from './welford.js';
import { createRandom, DEFAULT_SEED } from '../hmw4/random.js';
import { renderLineChart, CHART_COLORS } from '../hmw4/chart.js';

const OFFSET_EXPONENTS = [0, 2, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const NAIVE_COLOR = '#ff8f7a';

const DATASETS = {
  example: { label: 'Example {4, 7, 13, 16}', values: () => [4, 7, 13, 16] },
  scores: {
    label: '1000 random scores 0–10',
    values: () => {
      const uniform = createRandom(DEFAULT_SEED);
      return Array.from({ length: 1000 }, () => Math.floor(uniform() * 11));
    }
  }
};

/* =====================================================
 * 1. COMPUTATION (no DOM)
 * ===================================================== */

/** Correct significant digits: −log10(relative error), from 0 to 16. */
export function correctDigits(computed, exact) {
  if (computed === null || !Number.isFinite(computed)) return 0;
  const error = Math.abs(computed - exact) / Math.abs(exact);
  if (error === 0) return 16;
  return Math.max(0, Math.min(16, -Math.log10(error)));
}

/**
 * Sample variance of base + c with the three methods, for every c.
 * The exact value is the variance of the unshifted data.
 */
export function stabilityTable(base) {
  const exact = twoPassSummary(base).sampleVariance;

  return OFFSET_EXPONENTS.map(e => {
    const offset = 10 ** e;
    const shifted = base.map(x => x + offset);
    const welford = welfordSummary(shifted).sampleVariance;
    const twoPass = twoPassSummary(shifted).sampleVariance;
    const naive = naiveSummary(shifted).sampleVariance;

    return {
      exponent: e,
      offset,
      exact,
      welford,
      twoPass,
      naive,
      digitsWelford: correctDigits(welford, exact),
      digitsNaive: correctDigits(naive, exact)
    };
  });
}

/* =====================================================
 * 2. RENDER
 * ===================================================== */

export function renderHmw5Stability() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw5-stability"
      aria-labelledby="hmw5-stability-title"
    >

      <div class="panel-label">
        07 / NUMERICAL STABILITY
      </div>

      <h2 id="hmw5-stability-title">
        Why Not Simply Σx² − n·x̄²?
      </h2>

      <p>
        The identity SS = Σx² − (Σx)²/n also allows a single pass,
        and is exact in real arithmetic. In floating-point
        arithmetic it is not: when the values share a large offset,
        Σx² and (Σx)²/n become two huge, almost equal numbers, and
        their difference loses most of its significant digits. This
        is called catastrophic cancellation.
      </p>

      <p>
        To see it, we add the same constant c to every value. The
        variance does not change, so the correct answer is known.
        Integer data are used, so the shifted values are stored
        exactly in double precision up to c = 10<sup>15</sup>: every
        error comes from the formula, not from the data.
      </p>


      <!-- CONTROLS -->

      <div class="hmw4-segmented" role="radiogroup" aria-label="Data set">
        ${Object.entries(DATASETS).map(([id, data], i) => `
          <label class="hmw4-segment">
            <input type="radio" name="hmw5-stab-data" value="${id}" ${i === 0 ? 'checked' : ''} />
            <span>${data.label}</span>
          </label>
        `).join('')}
      </div>


      <!-- CHART -->

      <div class="hmw4-chart" id="hmw5-stab-chart"></div>

      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${CHART_COLORS.path}"></i> Welford</span>
        <span><i style="background:${NAIVE_COLOR}"></i> Naive Σx² − (Σx)²/n</span>
      </div>


      <!-- TABLE -->

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption id="hmw5-stab-caption"></caption>
          <thead>
            <tr>
              <th scope="col">Offset c</th>
              <th scope="col">Welford s²</th>
              <th scope="col">Two-pass s²</th>
              <th scope="col">Naive s²</th>
              <th scope="col">Correct digits Welford</th>
              <th scope="col">Correct digits naive</th>
            </tr>
          </thead>
          <tbody id="hmw5-stab-table"></tbody>
        </table>
      </div>

      <div class="hmw4-interpretation" id="hmw5-stab-interpretation"></div>

      <p class="panel-note">
        Double precision carries about 16 significant decimal
        digits. The naive formula subtracts two numbers of size
        about n·c² to obtain one of size n·σ², so its relative error
        grows like (c/σ)²: about two digits lost for every factor 10
        in c. Welford never forms c², but it still stores a running
        mean of size c, rounded to 16 digits: its error grows only
        like c/σ, about one digit per factor 10. With many values
        and very large offsets even the two-pass formula degrades,
        because the sum of the data is no longer exact.
      </p>

    </section>
  `;
}

/* =====================================================
 * 3. INITIALIZE
 * ===================================================== */

function formatVariance(value) {
  if (value === null || !Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e6 || abs < 1e-3) return value.toExponential(4);
  return Number(value.toPrecision(10)).toString();
}

export function initHmw5Stability() {
  const root = document.getElementById('hmw5-stability');
  if (!root) return () => {};

  const chartBox = root.querySelector('#hmw5-stab-chart');
  const caption = root.querySelector('#hmw5-stab-caption');
  const tableBody = root.querySelector('#hmw5-stab-table');
  const explanation = root.querySelector('#hmw5-stab-interpretation');

  const controller = new AbortController();
  const { signal } = controller;

  let rows = [];
  let datasetId = 'example';

  function compute() {
    datasetId = root.querySelector('input[name="hmw5-stab-data"]:checked').value;
    const base = DATASETS[datasetId].values();
    rows = stabilityTable(base);

    caption.textContent =
      `${DATASETS[datasetId].label}: exact sample variance ` +
      `${formatVariance(rows[0].exact)}. Correct digits = −log10(relative error), ` +
      `capped between 0 and 16.`;

    tableBody.innerHTML = rows.map(r => `
      <tr>
        <th scope="row">10<sup>${r.exponent}</sup></th>
        <td>${formatVariance(r.welford)}</td>
        <td>${formatVariance(r.twoPass)}</td>
        <td>${formatVariance(r.naive)}</td>
        <td>${r.digitsWelford.toFixed(1)}</td>
        <td>${r.digitsNaive.toFixed(1)}</td>
      </tr>`).join('');

    const firstWrong = rows.find(r => r.digitsNaive < 3);
    const negative = rows.find(r => r.naive !== null && r.naive < 0);
    const worstWelford = Math.min(...rows.map(r => r.digitsWelford));

    explanation.innerHTML = `
      <p>
        ${worstWelford >= 15.5
          ? 'Welford returns the exact variance for every offset up to 10<sup>15</sup>, while the naive formula'
          : `Welford keeps at least ${worstWelford.toFixed(1)} correct digits
             for every offset up to 10<sup>15</sup>, while the naive formula
             loses precision about twice as fast and`}${firstWrong ? ` has fewer than
          3 correct digits from c = 10<sup>${firstWrong.exponent}</sup>` : ''}${negative
          ? `; at c = 10<sup>${negative.exponent}</sup> it even returns a
             negative variance (${formatVariance(negative.naive)}),
             which is impossible`
          : ''}.
        Both methods use one pass and constant memory: only the order
        of the operations differs, and with it what happens to the
        rounding errors.
      </p>`;

    draw();
  }

  function draw() {
    if (rows.length === 0) return;

    chartBox.innerHTML = renderLineChart({
      width: chartBox.clientWidth,
      height: 280,
      title: 'Correct significant digits of the sample variance as the offset grows, Welford and naive formula',
      xLabel: 'Offset c (log scale)',
      yLabel: 'Correct digits',
      xDomain: [0, 15],
      yDomain: [-0.5, 16.5],
      xTicks: [0, 3, 6, 9, 12, 15],
      xFormat: t => (t === 0 ? '1' : `1e${t}`),
      lines: [
        { points: rows.map(r => [r.exponent, r.digitsNaive]), color: NAIVE_COLOR, width: 2.4 },
        { points: rows.map(r => [r.exponent, r.digitsWelford]), width: 2.6 },
        ...rows.map(r => ({ points: [[r.exponent, r.digitsNaive], [r.exponent, r.digitsNaive]], color: NAIVE_COLOR, width: 8 })),
        ...rows.map(r => ({ points: [[r.exponent, r.digitsWelford], [r.exponent, r.digitsWelford]], width: 8 }))
      ]
    });
  }

  root.querySelectorAll('input[name="hmw5-stab-data"]').forEach(radio =>
    radio.addEventListener('change', compute, { signal }));

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
