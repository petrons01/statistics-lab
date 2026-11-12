/*
 * Statistics-Lab — Homework 4.2 (internal folder: hmw6)
 * Section 02 — The Score Distribution
 *
 * Shows the probabilities of the selected distribution on
 * {0, ..., 10} with its mean, and a table with the exact moments
 * of all the distributions offered on the page.
 */

import {
  createScoreDistribution,
  listScoreDistributions,
  DEFAULT_DISTRIBUTION
} from './score-distributions.js';
import { renderHistogram, CHART_COLORS } from '../hmw4/chart.js';

const fixed = (value, digits = 4) => Number(value.toFixed(digits)).toString();

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw6Distribution() {
  const all = listScoreDistributions().map(({ id }) => createScoreDistribution(id));

  return `
    <section
      class="panel hmw4-lab"
      id="hmw6-distribution"
      aria-labelledby="hmw6-distribution-title"
    >

      <div class="panel-label">
        02 / THE SCORE DISTRIBUTION
      </div>

      <h2 id="hmw6-distribution-title">
        A Score from 0 to 10 for Every Attempt
      </h2>

      <p>
        Each penetration attempt receives an integer score between
        0 (no progress) and 10 (complete compromise), drawn from a
        fixed distribution. The default is a <strong>difficulty
        profile</strong>: low scores are common and high scores
        rare. Three alternatives are available in every section of
        this page, to see which results depend on the distribution
        and which do not.
      </p>

      <p>
        From the probabilities p<sub>k</sub> we compute exactly
        μ = Σ k·p<sub>k</sub> and σ² = Σ (k − μ)²·p<sub>k</sub>,
        and also the skewness and the excess kurtosis κ, which
        will be needed for the variability of the sample variance.
        Scores are drawn with the inverse-CDF method: a uniform
        number U in [0, 1) gives the smallest k with F(k) &gt; U.
      </p>

      <div class="hmw4-segmented" role="radiogroup" aria-label="Score distribution">
        ${all.map(d => `
          <label class="hmw4-segment">
            <input type="radio" name="hmw6-dist-choice" value="${d.id}"
                   ${d.id === DEFAULT_DISTRIBUTION ? 'checked' : ''} />
            <span>${d.label}</span>
          </label>
        `).join('')}
      </div>

      <div class="hmw4-chart-pair">
        <div class="hmw4-chart" id="hmw6-dist-chart"></div>
        <div>
          <div class="hmw4-metrics hmw6-metrics-compact" id="hmw6-dist-metrics"></div>
          <div class="hmw4-interpretation" id="hmw6-dist-description"></div>
        </div>
      </div>

      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${CHART_COLORS.path};opacity:.7"></i> P(X = k)</span>
        <span><i style="background:${CHART_COLORS.theory}"></i> Mean μ</span>
      </div>

      <h3>All Distributions</h3>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption>
            Exact moments computed from the probabilities.
            κ &lt; 0: lighter tails than the normal; κ &gt; 0: heavier.
          </caption>
          <thead>
            <tr>
              <th scope="col">Distribution</th>
              <th scope="col">μ</th>
              <th scope="col">σ²</th>
              <th scope="col">σ</th>
              <th scope="col">Skewness</th>
              <th scope="col">Excess kurtosis κ</th>
            </tr>
          </thead>
          <tbody id="hmw6-dist-table">
            ${all.map(d => `
              <tr data-id="${d.id}">
                <th scope="row">${d.label}</th>
                <td>${fixed(d.mean)}</td>
                <td>${fixed(d.variance)}</td>
                <td>${fixed(Math.sqrt(d.variance))}</td>
                <td>${fixed(d.skewness, 3)}</td>
                <td>${fixed(d.excessKurtosis, 3)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>

    </section>
  `;
}

/* =====================================================
 * 2. INITIALIZE
 * ===================================================== */

export function initHmw6Distribution() {
  const root = document.getElementById('hmw6-distribution');
  if (!root) return () => {};

  const chartBox = root.querySelector('#hmw6-dist-chart');
  const metrics = root.querySelector('#hmw6-dist-metrics');
  const description = root.querySelector('#hmw6-dist-description');

  const controller = new AbortController();
  const { signal } = controller;

  function draw() {
    const id = root.querySelector('input[name="hmw6-dist-choice"]:checked').value;
    const d = createScoreDistribution(id);

    chartBox.innerHTML = renderHistogram({
      width: chartBox.clientWidth,
      height: 260,
      title: `Probabilities of the ${d.label} distribution on the scores 0 to 10`,
      xLabel: 'Score k',
      yLabel: 'P(X = k)',
      // One bar per score, centred on k, height = probability.
      bins: d.pmf.map((p, k) => ({ from: k - 0.5, to: k + 0.5, density: p })),
      xDomain: [-0.7, 10.7],
      markers: [{ x: d.mean }]
    });

    metrics.innerHTML = [
      ['MEAN μ', fixed(d.mean)],
      ['VARIANCE σ²', fixed(d.variance)],
      ['SKEWNESS', fixed(d.skewness, 3)],
      ['EXCESS KURTOSIS κ', fixed(d.excessKurtosis, 3)]
    ].map(([label, value]) => `
      <div class="hmw4-metric">
        <span>${label}</span>
        <strong>${value}</strong>
      </div>`).join('');

    description.innerHTML = `<p>${d.description}</p>`;

    root.querySelectorAll('#hmw6-dist-table tr').forEach(row =>
      row.classList.toggle('hmw4-row-selected', row.dataset.id === id));
  }

  root.querySelectorAll('input[name="hmw6-dist-choice"]').forEach(radio =>
    radio.addEventListener('change', draw, { signal }));

  let lastWidth = 0;
  const observer = new ResizeObserver(() => {
    const width = chartBox.clientWidth;
    if (Math.abs(width - lastWidth) > 4) {
      lastWidth = width;
      draw();
    }
  });
  observer.observe(chartBox);

  draw();

  return () => {
    controller.abort();
    observer.disconnect();
  };
}
