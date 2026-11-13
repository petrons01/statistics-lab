/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Section 06 — The Lab: the test on data we control
 *
 * A population with a chosen amount of dependence δ (simulation.js).
 * One sample shows a single test; 1,000 samples show how the test
 * behaves: how often it rejects independence (5% of the time when
 * δ = 0, the type I error; more often as δ or n grow, the power) and
 * how the χ² statistics compare with the χ² distribution.
 */

import { TABLE_SHAPES, getShape, populationJoint, populationCramersV, createTableSampler } from './simulation.js';
import { tableFromCounts, marginals, chiSquareTest } from './contingency.js';
import { chiSquarePdf, chiSquareQuantile, logChiSquareTail, formatPValue } from './chi-square.js';
import { renderHistogram, CHART_COLORS } from '../hmw4/chart.js';
import { DEFAULT_SEED } from '../hmw4/random.js';
import { fmt, pct, residualStyle, strengthWord } from './format.js';

const REPETITIONS = 1000;
const MIN_N = 20;
const MAX_N = 10000;
const ALPHA = 0.05;

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw9Lab() {
  return `
    <section class="panel hmw4-lab" id="hmw9-lab" aria-labelledby="hmw9-lab-title">

      <div class="panel-label">06 / THE LAB</div>

      <h2 id="hmw9-lab-title">The Test on Data We Control</h2>

      <p>
        With real data we never know whether X and F are truly independent.
        Here we do: the population has X with fixed probabilities, and F
        copies a category paired with X with probability δ, otherwise it is
        drawn from the same distribution for every row. δ = 0 is exact
        independence. Draw one sample of size n, then ${fmt(REPETITIONS)}
        samples, and watch how often the test rejects independence.
      </p>

      <div class="hmw4-controls">

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw9-lab-shape">Table</label>
          <select id="hmw9-lab-shape" class="hmw4-select">
            ${TABLE_SHAPES.map((s, i) => `<option value="${s.id}" ${i === 0 ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw9-lab-n">Sample size n</label>
          <input id="hmw9-lab-n" class="hmw4-input" type="number" min="${MIN_N}" max="${MAX_N}" step="1" value="200" />
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw9-lab-delta">Dependence δ</label>
          <input id="hmw9-lab-delta" class="hmw4-input" type="number" min="0" max="0.9" step="0.01" value="0" />
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw9-lab-seed">Seed</label>
          <input id="hmw9-lab-seed" class="hmw4-input" type="number" min="0" max="4294967295" step="1" value="${DEFAULT_SEED}" />
        </div>

      </div>

      <p id="hmw9-lab-status" class="hmw4-status" role="status" aria-live="polite"></p>

      <h3>6.1 — One Sample</h3>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table hmw9-table hmw9-table-small">
          <caption>Observed counts of one sample, coloured by adjusted residual as in section 04.</caption>
          <tbody id="hmw9-lab-table"></tbody>
        </table>
      </div>

      <div class="hmw4-metrics" id="hmw9-lab-one"></div>

      <h3>6.2 — ${fmt(REPETITIONS)} Samples</h3>

      <div class="hmw4-chart" id="hmw9-lab-chart"></div>
      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${CHART_COLORS.path};opacity:.55"></i> χ² of the samples</span>
        <span><i style="background:${CHART_COLORS.theory}"></i> χ² density under independence</span>
        <span><i style="background:${CHART_COLORS.title}"></i> Critical value at 5% (dashed)</span>
      </div>

      <div class="hmw4-metrics" id="hmw9-lab-many"></div>

      <div class="hmw4-interpretation" id="hmw9-lab-interpretation"></div>

    </section>
  `;
}

/* =====================================================
 * 2. INITIALIZE
 * ===================================================== */

const readInteger = (input, min, max) => {
  const v = Number(input.value);
  return Number.isInteger(v) && v >= min && v <= max ? v : null;
};

export function initHmw9Lab() {
  const root = document.getElementById('hmw9-lab');
  if (!root) return () => {};

  const $ = id => document.getElementById(id);
  const shapeSelect = $('hmw9-lab-shape');
  const nInput = $('hmw9-lab-n');
  const deltaInput = $('hmw9-lab-delta');
  const seedInput = $('hmw9-lab-seed');
  const status = $('hmw9-lab-status');
  const chartBox = $('hmw9-lab-chart');

  const controller = new AbortController();
  const { signal } = controller;
  let result = null;
  let lastWidth = 0;
  let timer = null;

  function compute() {
    const n = readInteger(nInput, MIN_N, MAX_N);
    const seed = readInteger(seedInput, 0, 0xFFFFFFFF);
    const delta = Number(deltaInput.value);

    if (n === null || seed === null || deltaInput.value.trim() === '' || !(delta >= 0 && delta <= 0.9)) {
      status.textContent = `n must be a whole number from ${MIN_N} to ${fmt(MAX_N)}, δ a number from 0 to 0.9, the seed a whole number from 0 to 4294967295.`;
      return;
    }

    const shape = getShape(shapeSelect.value);
    const joint = populationJoint(shape, delta);
    const trueV = populationCramersV(joint);
    const draw = createTableSampler(joint, seed);
    const r = shape.p.length;
    const c = shape.q.length;
    const df = (r - 1) * (c - 1);
    const critical = chiSquareQuantile(ALPHA, df);

    // One sample (the first draw of the sequence), then the repetitions
    let first = null;
    const statistics = [];
    let rejected = 0;
    let skipped = 0;

    for (let b = 0; b < REPETITIONS + 1; b++) {
      const table = tableFromCounts(draw(n), shape.p.map((_, i) => `x${i + 1}`), shape.q.map((_, j) => `f${j + 1}`));
      const { rowTotals, colTotals } = marginals(table);
      if (rowTotals.includes(0) || colTotals.includes(0)) {
        if (b === 0) first = { table, test: null };
        else skipped++;
        continue;
      }
      const test = chiSquareTest(table);
      if (b === 0) { first = { table, test }; continue; }
      statistics.push(test.statistic);
      if (test.statistic > critical) rejected++;
    }

    result = { shape, n, delta, seed, trueV, df, critical, first, statistics, rejected, skipped };

    status.textContent =
      `Population: ${shape.label} table, δ = ${delta}. ` +
      (delta === 0
        ? 'X and F are exactly independent (Cramér\'s V = 0).'
        : `Population Cramér's V = ${trueV.toFixed(3)} (${strengthWord(trueV)} association).`);

    renderOne();
    renderMany();
    draw2();
  }

  function renderOne() {
    const { first } = result;
    const { table, test } = first;
    $('hmw9-lab-table').innerHTML = `
      <tr><th scope="col">X ↓ · F →</th>${table.cols.map(c => `<th scope="col">${c}</th>`).join('')}</tr>
      ${table.rows.map((row, i) => `<tr><th scope="row">${row}</th>${table.counts[i].map((v, j) =>
        `<td${test ? residualStyle(test.adjusted[i][j]) : ''}>${fmt(v)}</td>`).join('')}</tr>`).join('')}`;

    if (!test) {
      $('hmw9-lab-one').innerHTML = '<div class="hmw4-metric"><span>NO TEST</span><strong>An empty row or column: increase n</strong></div>';
      return;
    }
    const logP = logChiSquareTail(test.statistic, test.df);
    $('hmw9-lab-one').innerHTML = [
      ['χ²', fmt(test.statistic, 2)],
      ['P-VALUE', formatPValue(logP)],
      ["SAMPLE CRAMÉR'S V", fmt(test.cramersV, 3)],
      ['DECISION AT 5%', test.statistic > result.critical ? 'Reject independence' : 'Do not reject']
    ].map(([l, v]) => `<div class="hmw4-metric"><span>${l}</span><strong>${v}</strong></div>`).join('');
  }

  function renderMany() {
    const { statistics, rejected, skipped, df, delta, n, trueV } = result;
    const valid = statistics.length;
    const rate = valid ? rejected / valid : NaN;
    const mean = valid ? statistics.reduce((s, v) => s + v, 0) / valid : NaN;
    const se = valid ? Math.sqrt(ALPHA * (1 - ALPHA) / valid) : NaN;

    $('hmw9-lab-many').innerHTML = [
      [delta === 0 ? 'REJECTED (TYPE I ERROR)' : 'REJECTED (POWER)', `${pct(rate, 1)} of ${fmt(valid)}`],
      ['MEAN χ²', `${fmt(mean, 2)} (df = ${df})`],
      ['CRITICAL VALUE, 5%', fmt(result.critical, 3)],
      ...(skipped ? [['SKIPPED', `${fmt(skipped)} with an empty row or column`]] : [])
    ].map(([l, v]) => `<div class="hmw4-metric"><span>${l}</span><strong>${v}</strong></div>`).join('');

    const paragraphs = [];
    if (valid === 0) {
      $('hmw9-lab-interpretation').innerHTML = '<p>Every sample had an empty row or column, so no test was possible: increase n.</p>';
      return;
    }
    if (delta === 0) {
      const inBand = Math.abs(rate - ALPHA) <= 2.5 * se;
      paragraphs.push(`<strong>Independence holds, and the test still rejects it
        ${pct(rate, 1)} of the time.</strong> That is the type I error: by construction
        a 5% test wrongly rejects a true independence in about 5% of the samples
        (here ${inBand ? 'within' : 'outside'} the Monte Carlo band 5% ± ${pct(2.5 * se, 1)}).
        The histogram follows the χ² density with ${df} degree${df > 1 ? 's' : ''} of freedom and
        its mean, ${fmt(mean, 2)}, is close to df: this is the distribution the p-value is
        computed from.${n < 50 ? ' With n this small some expected counts fall below 5 and the fit is rougher.' : ''}`);
      if (result.first.test && result.first.test.statistic > result.critical) {
        paragraphs.push(`The single sample of 6.1 is one of these false alarms: it rejects
          independence although the population is independent by construction. Change the
          seed to draw other samples: about one in twenty will do the same.`);
      }
    } else {
      paragraphs.push(`<strong>The population is dependent (V = ${trueV.toFixed(3)}), and the
        test detects it in ${pct(rate, 1)} of the samples</strong>: this is its power for
        n = ${fmt(n)}. The other ${pct(1 - rate, 1)} are type II errors, where a real
        dependence goes unnoticed. The histogram has moved to the right of the χ² density:
        its mean ${fmt(mean, 2)} is about df + n·V²·(min(r, c) − 1) = ${fmt(df + n * trueV * trueV * (Math.min(result.shape.p.length, result.shape.q.length) - 1), 1)}.`);
      paragraphs.push(trueV < 0.1
        ? `Try a larger n: with enough data even this ${strengthWord(trueV)} association
           (V = ${trueV.toFixed(3)}) is rejected almost every time. Statistical significance
           says the dependence is real, not that it is large.`
        : `Try a smaller n, or a smaller δ: the power falls, and a real dependence is often
           missed. Not rejecting independence is not proof of independence.`);
    }
    $('hmw9-lab-interpretation').innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  function draw2() {
    if (!result) return;
    lastWidth = chartBox.clientWidth;
    const { statistics, df, critical } = result;
    if (statistics.length === 0) { chartBox.innerHTML = ''; return; }

    const sorted = [...statistics].sort((a, b) => a - b);
    const p99 = sorted[Math.floor(0.99 * (sorted.length - 1))];
    const xMax = Math.max(chiSquareQuantile(0.001, df), p99) * 1.05;
    const binCount = 36;
    const width = xMax / binCount;
    const bins = Array.from({ length: binCount }, (_, k) => ({ from: k * width, to: (k + 1) * width, count: 0 }));
    for (const s of statistics) if (s < xMax) bins[Math.floor(s / width)].count++;
    bins.forEach(b => { b.density = b.count / (statistics.length * width); });

    const curve = [];
    const x0 = df === 1 ? xMax * 0.01 : 0;
    for (let k = 0; k <= 200; k++) {
      const x = x0 + ((xMax - x0) * k) / 200;
      curve.push([x, chiSquarePdf(x, df)]);
    }
    const yMax = Math.max(...bins.map(b => b.density), ...curve.filter(([x]) => x > xMax * 0.04).map(([, y]) => y)) * 1.1;

    chartBox.innerHTML = renderHistogram({
      width: chartBox.clientWidth,
      height: 260,
      title: `Chi-square statistics of ${statistics.length} simulated samples, with the chi-square density`,
      xLabel: 'χ² of a sample',
      bins,
      xDomain: [0, xMax],
      yMax,
      curve,
      markers: [{ x: critical, color: CHART_COLORS.title, dash: '5 4' }]
    });
  }

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(compute, 150);
  };

  shapeSelect.addEventListener('change', compute, { signal });
  [nInput, deltaInput, seedInput].forEach(el => el.addEventListener('input', schedule, { signal }));

  const observer = new ResizeObserver(() => {
    if (Math.abs(chartBox.clientWidth - lastWidth) > 4) draw2();
  });
  observer.observe(chartBox);

  compute();

  return () => {
    clearTimeout(timer);
    controller.abort();
    observer.disconnect();
  };
}
