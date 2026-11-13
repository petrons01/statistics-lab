/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Sections 03, 04 and 05: from records to the table, the
 * chi-square statistic and the p-value
 *
 * The three sections share one selection (dataset, X, F), chosen
 * in section 03. Bundled datasets are fetched from
 * data/independence/; a CSV file chosen by the visitor is read in
 * the browser with FileReader and never leaves the computer.
 */

import { DATASETS, getDataset, loadDataset, parseCsv } from './dataset.js';
import { buildTable, frequencies, chiSquareTest, yatesStatistic } from './contingency.js';
import {
  chiSquarePdf, chiSquareQuantile, logChiSquareTail, formatPValue
} from './chi-square.js';
import { createPermutationTest } from './permutation.js';
import { renderProfileBars, categoryColor } from './bar-chart.js';
import { renderLineChart, renderHistogram, CHART_COLORS } from '../hmw4/chart.js';
import { escapeHtml, fmt, pct, signed, plural, residualStyle, strengthWord } from './format.js';

export const MAX_CATEGORIES = 12;
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const PERMUTATIONS = 1000;
const ALPHA = 0.05;

const TABLE_VIEWS = [
  { id: 'counts', label: 'Counts' },
  { id: 'joint', label: 'Joint f(x, f)' },
  { id: 'row', label: 'Row profiles f(F | X)' },
  { id: 'col', label: 'Column profiles f(X | F)' }
];

const TEST_VIEWS = [
  { id: 'observed', label: 'Observed O' },
  { id: 'expected', label: 'Expected E' },
  { id: 'contrib', label: '(O − E)² / E' },
  { id: 'adjusted', label: 'Adjusted residuals' }
];

const segmented = (name, views, label, small = false) => `
  <div class="hmw4-segmented${small ? ' hmw4-segmented-small' : ''}" role="radiogroup" aria-label="${label}">
    ${views.map((v, i) => `
      <label class="hmw4-segment">
        <input type="radio" name="${name}" value="${v.id}" ${i === 0 ? 'checked' : ''} />
        <span>${v.label}</span>
      </label>`).join('')}
  </div>`;

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw9Analysis() {
  return `
    <!-- 03 / FROM RECORDS TO THE TABLE -->

    <section class="panel hmw4-lab" id="hmw9-data" aria-labelledby="hmw9-data-title">

      <div class="panel-label">03 / FROM RECORDS TO THE TABLE</div>

      <h2 id="hmw9-data-title">Counting Pairs</h2>

      <p>
        Choose a dataset and two of its columns: X gives the rows of the
        table, F the columns. The program reads every record and adds one
        to the cell of its pair (x, f). The same choice is used by
        sections 04 and 05. You can also load your own CSV file: it is
        read by your browser and is not sent anywhere.
      </p>

      <div class="hmw4-controls hmw9-controls">

        <div class="hmw4-field hmw9-field-wide">
          <label class="hmw4-label" for="hmw9-dataset">Dataset</label>
          <select id="hmw9-dataset" class="hmw4-select">
            ${DATASETS.map((d, i) => `<option value="${d.id}" ${i === 0 ? 'selected' : ''}>${d.label}</option>`).join('')}
          </select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw9-x">Variable X (rows)</label>
          <select id="hmw9-x" class="hmw4-select"></select>
        </div>

        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw9-f">Variable F (columns)</label>
          <select id="hmw9-f" class="hmw4-select"></select>
        </div>

        <div class="hmw4-field">
          <span class="hmw4-label" id="hmw9-file-label">Your own data</span>
          <label class="hmw9-upload">
            <input id="hmw9-file" class="hmw9-file-input" type="file"
                   accept=".csv,.tsv,.txt,text/csv,text/plain"
                   aria-labelledby="hmw9-file-label hmw9-file-button" />
            <span id="hmw9-file-button">Load a CSV file</span>
          </label>
        </div>

      </div>

      <p id="hmw9-data-status" class="hmw4-status" role="status" aria-live="polite">Loading the dataset…</p>

      <div id="hmw9-data-about" class="hmw9-about"></div>

      <h3>3.1 — The Contingency Table</h3>

      ${segmented('hmw9-table-view', TABLE_VIEWS, 'Frequencies shown', true)}

      <div class="hmw4-table-wrap">
        <table class="hmw4-table hmw9-table">
          <caption id="hmw9-table-caption"></caption>
          <tbody id="hmw9-table-body"></tbody>
        </table>
      </div>

      <h3>3.2 — Conditional Distributions at a Glance</h3>

      <p>
        Each bar is the distribution of F within one category of X (a row
        profile); the dashed bar at the bottom is the marginal distribution
        of F over all records. If X and F were independent, every bar would
        look like the dashed one, up to random fluctuation.
      </p>

      <div class="hmw4-chart hmw9-chart-auto" id="hmw9-profile-chart"></div>
      <div class="hmw4-legend" id="hmw9-profile-legend" aria-hidden="true"></div>

      <div class="hmw4-interpretation" id="hmw9-data-interpretation"></div>

    </section>


    <!-- 04 / EXPECTED FREQUENCIES AND CHI-SQUARE -->

    <section class="panel hmw4-lab" id="hmw9-test" aria-labelledby="hmw9-test-title">

      <div class="panel-label">04 / EXPECTED FREQUENCIES AND χ²</div>

      <h2 id="hmw9-test-title">What Independence Would Predict</h2>

      <p>
        Under independence the expected count of a cell is
        E<sub>ij</sub> = n<sub>i·</sub> · n<sub>·j</sub> / n: the same
        totals, spread as if X told us nothing about F. The χ² statistic
        adds up the squared gaps between observed and expected counts,
        each scaled by E<sub>ij</sub>. Cells are coloured by their adjusted
        residual: teal where there are more records than independence
        predicts, coral where there are fewer; the deeper the colour, the
        larger the gap (|r| ≥ 4 at full strength).
      </p>

      <p class="hmw9-selection" id="hmw9-test-selection"></p>

      ${segmented('hmw9-test-view', TEST_VIEWS, 'Cell values shown', true)}

      <div class="hmw4-table-wrap">
        <table class="hmw4-table hmw9-table">
          <caption id="hmw9-test-caption"></caption>
          <tbody id="hmw9-test-body"></tbody>
        </table>
      </div>

      <div class="hmw4-metrics" id="hmw9-test-metrics"></div>

      <div class="hmw4-interpretation" id="hmw9-test-interpretation"></div>

    </section>


    <!-- 05 / THE P-VALUE -->

    <section class="panel hmw4-lab" id="hmw9-pvalue" aria-labelledby="hmw9-pvalue-title">

      <div class="panel-label">05 / THE P-VALUE</div>

      <h2 id="hmw9-pvalue-title">How Surprising Is This χ²?</h2>

      <p>
        The p-value is the probability, if X and F were independent, of a
        χ² at least as large as the observed one. We compute it in two
        independent ways. The theoretical p-value is the upper tail of the
        χ² distribution with (r − 1)(c − 1) degrees of freedom, valid for
        large expected counts. The permutation p-value shuffles the F
        column ${fmt(PERMUTATIONS)} times, which destroys any link with X
        while keeping both margins, and counts how often the shuffled
        tables reach the observed χ²: no approximation is involved.
      </p>

      <p class="hmw9-selection" id="hmw9-pvalue-selection"></p>

      <h3>5.1 — The Theoretical Tail</h3>
      <div class="hmw4-chart" id="hmw9-density-chart"></div>
      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${CHART_COLORS.theory}"></i> χ² density</span>
        <span><i style="background:${CHART_COLORS.title}"></i> Critical value at 5% (dashed)</span>
        <span><i style="background:${CHART_COLORS.path}"></i> Observed χ²</span>
      </div>
      <p class="hmw9-chart-note" id="hmw9-density-note"></p>

      <h3>5.2 — The Permutation Distribution</h3>
      <p id="hmw9-perm-status" class="hmw4-status" role="status" aria-live="polite"></p>
      <div class="hmw4-chart" id="hmw9-perm-chart"></div>
      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${CHART_COLORS.path};opacity:.55"></i> χ² of the shuffled tables</span>
        <span><i style="background:${CHART_COLORS.theory}"></i> χ² density</span>
        <span><i style="background:#f28b82"></i> Observed χ²</span>
      </div>

      <div class="hmw4-metrics" id="hmw9-pvalue-metrics"></div>

      <div class="hmw4-interpretation" id="hmw9-pvalue-interpretation"></div>

    </section>
  `;
}

/* =====================================================
 * 2. TABLES
 * ===================================================== */

const head = (corner, labels, extra) => `
  <tr>
    <th scope="col" class="hmw9-corner">${corner}</th>
    ${labels.map(l => `<th scope="col">${escapeHtml(l)}</th>`).join('')}
    ${extra !== undefined ? `<th scope="col" class="hmw9-total">${extra}</th>` : ''}
  </tr>`;

const corner = (xName, fName) =>
  `${escapeHtml(xName)} <span aria-hidden="true">↓</span> · ${escapeHtml(fName)} <span aria-hidden="true">→</span>`;

/** Section 03: the table in one of four views, with margins. */
function contingencyTableHtml(state, view) {
  const { table, freq, xName, fName } = state;
  const { rows, cols, counts } = table;
  const cell = v => `<td>${v}</td>`;
  const tot = v => `<td class="hmw9-total">${v}</td>`;
  let body = '';
  let caption = '';

  if (view === 'counts') {
    caption = `Observed counts n<sub>ij</sub>, with row totals n<sub>i·</sub>, column totals n<sub>·j</sub> and n = ${fmt(table.n)}.`;
    body = head(corner(xName, fName), cols, 'Total')
      + rows.map((r, i) => `<tr><th scope="row">${escapeHtml(r)}</th>${counts[i].map(v => cell(fmt(v))).join('')}${tot(fmt(freq.rowTotals[i]))}</tr>`).join('')
      + `<tr class="hmw9-total-row"><th scope="row">Total</th>${freq.colTotals.map(v => tot(fmt(v))).join('')}${tot(fmt(table.n))}</tr>`;
  } else if (view === 'joint') {
    caption = 'Joint relative frequencies f<sub>ij</sub> = n<sub>ij</sub> / n. The margins are the marginal frequencies of X (last column) and of F (last row).';
    body = head(corner(xName, fName), cols, `f(${escapeHtml(xName)})`)
      + rows.map((r, i) => `<tr><th scope="row">${escapeHtml(r)}</th>${freq.joint[i].map(v => cell(pct(v, 2))).join('')}${tot(pct(freq.rowMarg[i], 2))}</tr>`).join('')
      + `<tr class="hmw9-total-row"><th scope="row">f(${escapeHtml(fName)})</th>${freq.colMarg.map(v => tot(pct(v, 2))).join('')}${tot('100.00%')}</tr>`;
  } else if (view === 'row') {
    caption = `Conditional frequencies of F given X: each row is divided by its total n<sub>i·</sub> and sums to 100%. The last row is the marginal of F: under independence every row would be close to it.`;
    body = head(corner(xName, fName), cols, 'Total')
      + rows.map((r, i) => `<tr><th scope="row">${escapeHtml(r)}</th>${freq.rowProfiles[i].map(v => cell(pct(v))).join('')}${tot('100%')}</tr>`).join('')
      + `<tr class="hmw9-total-row"><th scope="row">All records</th>${freq.colMarg.map(v => tot(pct(v))).join('')}${tot('100%')}</tr>`;
  } else {
    caption = `Conditional frequencies of X given F: each column is divided by its total n<sub>·j</sub> and sums to 100%. The last column is the marginal of X: under independence every column would be close to it.`;
    body = head(corner(xName, fName), cols, 'All records')
      + rows.map((r, i) => `<tr><th scope="row">${escapeHtml(r)}</th>${freq.colProfiles[i].map(v => cell(pct(v))).join('')}${tot(pct(freq.rowMarg[i]))}</tr>`).join('')
      + `<tr class="hmw9-total-row"><th scope="row">Total</th>${cols.map(() => tot('100%')).join('')}${tot('100%')}</tr>`;
  }

  return { caption, body };
}

/** Section 04: observed, expected, contributions or residuals, coloured by residual. */
function testTableHtml(state, view) {
  const { table, test, xName, fName } = state;
  const { rows, cols, counts } = table;
  const { expected, contributions, adjusted } = test;

  const value = (i, j) => {
    if (view === 'observed') return fmt(counts[i][j]);
    if (view === 'expected') return fmt(expected[i][j], 1);
    if (view === 'contrib') return fmt(contributions[i][j], 2);
    return signed(adjusted[i][j], 2);
  };

  const captions = {
    observed: 'Observed counts O<sub>ij</sub>.',
    expected: 'Expected counts E<sub>ij</sub> = n<sub>i·</sub> n<sub>·j</sub> / n under independence. Cells below 5 are marked with *.',
    contrib: `Contributions (O − E)² / E of each cell; their sum is χ² = ${fmt(test.statistic, 2)}.`,
    adjusted: 'Adjusted residuals (O − E) / √(E (1 − f<sub>i·</sub>)(1 − f<sub>·j</sub>)): about N(0, 1) under independence, so |r| &gt; 2 marks a cell that departs from it.'
  };

  const body = head(corner(xName, fName), cols)
    + rows.map((r, i) => `<tr><th scope="row">${escapeHtml(r)}</th>${cols.map((_, j) =>
      `<td${residualStyle(adjusted[i][j])}>${value(i, j)}${view === 'expected' && expected[i][j] < 5 ? ' *' : ''}</td>`).join('')}</tr>`).join('');

  return { caption: captions[view], body };
}

/* =====================================================
 * 3. TEXTS
 * ===================================================== */

const label = v => `<strong>${escapeHtml(v)}</strong>`;

/** Total variation distance between a row profile and the marginal. */
const tvDistance = (profile, marginal) => 0.5 * profile.reduce((s, v, j) => s + Math.abs(v - marginal[j]), 0);

function dataInterpretation(state) {
  const { table, freq, xName, fName } = state;
  const { rows, cols } = table;

  // Most frequent F category overall, and its share in each row
  const top = freq.colMarg.indexOf(Math.max(...freq.colMarg));
  const shares = rows.map((r, i) => ({ r, v: freq.rowProfiles[i][top], tv: tvDistance(freq.rowProfiles[i], freq.colMarg), n: freq.rowTotals[i] }));
  const sorted = [...shares].sort((a, b) => b.v - a.v);
  const far = [...shares].sort((a, b) => b.tv - a.tv)[0];
  const near = [...shares].sort((a, b) => a.tv - b.tv)[0];

  const paragraphs = [];

  paragraphs.push(`
    <strong>Marginal and conditional frequencies.</strong> Over all
    ${fmt(table.n)} records, ${label(cols[top])} is the most frequent value of
    ${escapeHtml(fName)}: ${pct(freq.colMarg[top])}. Within the categories of
    ${escapeHtml(xName)} its share ranges from ${pct(sorted[sorted.length - 1].v)}
    (${label(sorted[sorted.length - 1].r)}) to ${pct(sorted[0].v)}
    (${label(sorted[0].r)}).`);

  if (rows.length > 1) {
    paragraphs.push(`
      <strong>How far are the rows from the marginal?</strong> A simple
      measure is the total variation distance ½ Σ<sub>j</sub> |f(f<sub>j</sub> | x<sub>i</sub>) − f(f<sub>j</sub>)|,
      the share of that row's records that would have to change category
      of F for the row to match the marginal. It is largest for ${label(far.r)}
      (${pct(far.tv)}, ${plural(far.n, 'record')}) and smallest for
      ${label(near.r)} (${pct(near.tv)}). Differences of a few points can
      be chance in a small table; section 04 measures them against what
      chance would produce.`);
  }

  if (table.skipped > 0) {
    paragraphs.push(`${plural(table.skipped, 'record')} with an empty value in
      ${escapeHtml(xName)} or ${escapeHtml(fName)} were left out.`);
  }

  return paragraphs.map(p => `<p>${p}</p>`).join('');
}

function testInterpretation(state, critical, logP) {
  const { table, test, xName, fName } = state;
  const reject = test.statistic > critical;
  const paragraphs = [];

  paragraphs.push(reject
    ? `<strong>Decision at the 5% level: dependence.</strong> χ² = ${fmt(test.statistic, 2)}
       exceeds the critical value ${fmt(critical, 2)} of the χ² distribution with
       ${test.df} degrees of freedom (p = ${formatPValue(logP)}). If ${escapeHtml(xName)} and
       ${escapeHtml(fName)} were independent, a gap this large between observed and expected
       counts would almost never arise by chance, so we reject independence.`
    : `<strong>Decision at the 5% level: no evidence against independence.</strong>
       χ² = ${fmt(test.statistic, 2)} is below the critical value ${fmt(critical, 2)}
       (p = ${formatPValue(logP)}). The observed gaps are of the size chance alone
       produces. This does not prove independence: a weak dependence may simply be too small
       to detect with ${fmt(test.n)} records.`);

  // Cells that drive the statistic
  const cells = [];
  table.rows.forEach((r, i) => table.cols.forEach((c, j) =>
    cells.push({ r, c, adj: test.adjusted[i][j], share: test.contributions[i][j] / test.statistic })));
  const driving = cells.filter(cell => Math.abs(cell.adj) > 2).sort((a, b) => Math.abs(b.adj) - Math.abs(a.adj));

  if (reject && driving.length > 0) {
    const shown = driving.slice(0, 3).map(cell =>
      `(${escapeHtml(cell.r)}, ${escapeHtml(cell.c)}): ${cell.adj > 0 ? 'more' : 'fewer'} records than expected, r = ${signed(cell.adj, 1)}`);
    paragraphs.push(`<strong>Where the dependence is.</strong> ${driving.length} of
      ${test.cells} cells have |adjusted residual| &gt; 2. The largest: ${shown.join('; ')}.`);
  }

  const v = test.cramersV;
  paragraphs.push(`<strong>How strong?</strong> χ² grows with n, so it measures
    evidence, not strength. Cramér's V = √(χ² / (n (min(r, c) − 1))) = ${fmt(v, 3)}
    rescales it to [0, 1]: by the usual rough convention the association is
    <strong>${strengthWord(v)}</strong>.${reject && v < 0.1
      ? ' Here a significant but negligible association is the typical effect of a large sample.'
      : ''}`);

  if (test.smallCells > 0) {
    const cochranOk = test.minExpected >= 1 && test.smallCells <= 0.2 * test.cells;
    paragraphs.push(cochranOk
      ? `<strong>A few small expected counts.</strong> ${test.smallCells} of ${test.cells}
         cells have E &lt; 5 (smallest ${fmt(test.minExpected, 2)}), within Cochran's rule
         (no E &lt; 1, at most 20% of the cells below 5): the χ² approximation is still
         considered adequate, and section 05 checks it with permutations.`
      : `<strong>Caution: Cochran's rule is not met.</strong> ${test.smallCells} of
         ${test.cells} cells have E &lt; 5, and the smallest is ${fmt(test.minExpected, 2)}
         (the rule asks for no E &lt; 1 and at most 20% of the cells below 5). The χ²
         distribution is a large-sample approximation and may be inaccurate here; the
         permutation p-value of section 05 does not rely on it. Merging rare categories, or
         Fisher's exact test for 2 × 2 tables, are the usual remedies.`);
  }

  const yates = yatesStatistic(table);
  if (yates !== null) {
    paragraphs.push(`For a 2 × 2 table, Yates' continuity correction
      Σ (|O − E| − ½)² / E gives ${fmt(yates, 2)} (p = ${formatPValue(logChiSquareTail(yates, 1))}),
      a slightly more conservative version of the same test.`);
  }

  return paragraphs.map(par => `<p>${par}</p>`).join('');
}

/* =====================================================
 * 4. INITIALIZE
 * ===================================================== */

export function initHmw9Analysis() {
  const root = document.getElementById('hmw9-data');
  if (!root) return () => {};

  const $ = id => document.getElementById(id);
  const datasetSelect = $('hmw9-dataset');
  const xSelect = $('hmw9-x');
  const fSelect = $('hmw9-f');
  const fileInput = $('hmw9-file');
  const status = $('hmw9-data-status');
  const about = $('hmw9-data-about');

  const controller = new AbortController();
  const { signal } = controller;

  let source = null;          // { id, label, columns, records, meta }
  let state = null;           // current analysis
  let upload = null;          // the visitor's parsed file
  let job = 0;                // permutation run token
  let timer = null;
  const widths = {};

  /* ---------- data source ---------- */

  function fillVariableSelects(columns, defaultX, defaultF) {
    const options = columns.map((name, i) => `<option value="${i}">${escapeHtml(name)}</option>`).join('');
    xSelect.innerHTML = options;
    fSelect.innerHTML = options;
    xSelect.value = String(defaultX);
    fSelect.value = String(defaultF);
  }

  async function useBundled(id) {
    const meta = getDataset(id);
    status.textContent = `Loading ${meta.file}…`;
    try {
      const parsed = await loadDataset(id, signal);
      if (signal.aborted) return;
      source = { id, label: meta.label, ...parsed, meta };
      fillVariableSelects(parsed.columns,
        parsed.columns.indexOf(meta.defaultX), parsed.columns.indexOf(meta.defaultF));
      about.innerHTML = `
        <p>${escapeHtml(meta.description)} Columns:</p>
        <ul>${parsed.columns.map(c => `<li><strong>${escapeHtml(c)}</strong>: ${escapeHtml(meta.columns[c] ?? '')}</li>`).join('')}</ul>`;
      analyse();
    } catch (error) {
      if (signal.aborted) return;
      status.textContent = `The dataset could not be loaded: ${error.message}`;
    }
  }

  function useUpload() {
    source = { id: 'upload', label: upload.name, columns: upload.columns, records: upload.records, meta: null };
    fillVariableSelects(upload.columns, 0, Math.min(1, upload.columns.length - 1));
    about.innerHTML = `<p>Your file <strong>${escapeHtml(upload.name)}</strong>:
      ${plural(upload.records.length, 'record')}, ${plural(upload.columns.length, 'column')},
      separator “${upload.separator === '\t' ? 'tab' : upload.separator}”. It stays in this browser tab.</p>`;
    analyse();
  }

  function readFile(file) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      status.textContent = `${file.name} is ${(file.size / 1048576).toFixed(1)} MB; the limit is 20 MB. The previous selection is still shown.`;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (signal.aborted) return;
      const parsed = parseCsv(reader.result);
      if (parsed.columns.length < 2 || parsed.records.length === 0) {
        status.textContent = (parsed.columns.length < 2
          ? `${file.name}: the file needs at least two columns, with their names on the first line.`
          : `${file.name}: the file has a header but no records.`) + ' The previous selection is still shown.';
        return;
      }
      upload = { name: file.name, ...parsed };
      let option = datasetSelect.querySelector('option[value="upload"]');
      if (!option) {
        option = document.createElement('option');
        option.value = 'upload';
        datasetSelect.append(option);
      }
      option.textContent = `Your file: ${file.name}`;
      datasetSelect.value = 'upload';
      useUpload();
    };
    reader.onerror = () => { status.textContent = 'The file could not be read.'; };
    reader.readAsText(file);
  }

  /* ---------- analysis ---------- */

  function clearOutputs(message) {
    state = null;
    job++;
    status.textContent = message;
    for (const id of ['hmw9-table-body', 'hmw9-test-body', 'hmw9-profile-chart', 'hmw9-profile-legend',
      'hmw9-data-interpretation', 'hmw9-test-metrics', 'hmw9-test-interpretation', 'hmw9-density-chart',
      'hmw9-perm-chart', 'hmw9-pvalue-metrics', 'hmw9-pvalue-interpretation', 'hmw9-density-note', 'hmw9-perm-status']) {
      $(id).innerHTML = '';
    }
    for (const id of ['hmw9-table-caption', 'hmw9-test-caption']) $(id).innerHTML = '';
    $('hmw9-test-selection').textContent = message;
    $('hmw9-pvalue-selection').textContent = message;
  }

  function analyse() {
    if (!source) return;
    const xIndex = Number(xSelect.value);
    const fIndex = Number(fSelect.value);
    const xName = source.columns[xIndex];
    const fName = source.columns[fIndex];

    if (xIndex === fIndex) {
      clearOutputs('Choose two different columns for X and F.');
      return;
    }

    const order = source.meta?.order ?? {};
    const table = buildTable(source.records, xIndex, fIndex, { xOrder: order[xName], fOrder: order[fName] });

    if (table.n === 0) {
      clearOutputs('No record has a value in both columns.');
      return;
    }
    for (const [name, cats] of [[xName, table.rows], [fName, table.cols]]) {
      if (cats.length > MAX_CATEGORIES) {
        clearOutputs(`“${name}” has ${cats.length} different values; this page handles up to ${MAX_CATEGORIES} per variable. Choose a categorical column with fewer values.`);
        return;
      }
    }
    if (table.rows.length < 2 || table.cols.length < 2) {
      clearOutputs(`“${table.rows.length < 2 ? xName : fName}” takes a single value, so there is nothing to compare: choose a column with at least two values.`);
      return;
    }

    const freq = frequencies(table);
    const test = chiSquareTest(table);
    state = { source, table, freq, test, xName, fName };

    status.textContent = `${source.label}: ${fmt(table.n)} records, ${xName} with ${table.rows.length} categories × ${fName} with ${table.cols.length}.`;

    const selection = `Selection of section 03: ${source.label}, X = ${xName}, F = ${fName}, n = ${fmt(table.n)}.`;
    $('hmw9-test-selection').textContent = selection;
    $('hmw9-pvalue-selection').textContent = selection;

    renderSection03();
    renderSection04();
    renderSection05();
  }

  function renderSection03() {
    const view = root.querySelector('input[name="hmw9-table-view"]:checked')?.value ?? 'counts';
    const { caption, body } = contingencyTableHtml(state, view);
    $('hmw9-table-caption').innerHTML = caption;
    $('hmw9-table-body').innerHTML = body;
    $('hmw9-data-interpretation').innerHTML = dataInterpretation(state);
    $('hmw9-profile-legend').innerHTML = state.table.cols.map((c, j) =>
      `<span><i style="background:${categoryColor(j)}"></i> ${escapeHtml(c)}</span>`).join('');
    drawProfiles();
  }

  function drawProfiles() {
    if (!state) return;
    const box = $('hmw9-profile-chart');
    widths.profile = box.clientWidth;
    const { table, freq, xName, fName } = state;
    box.innerHTML = renderProfileBars({
      width: box.clientWidth,
      title: `Distribution of ${fName} within each category of ${xName}, and overall`,
      bars: [
        ...table.rows.map((r, i) => ({ label: r, values: freq.rowProfiles[i] })),
        { label: 'All records', values: freq.colMarg, marginal: true }
      ]
    });
  }

  function renderSection04() {
    const view = $('hmw9-test').querySelector('input[name="hmw9-test-view"]:checked')?.value ?? 'observed';
    const { caption, body } = testTableHtml(state, view);
    $('hmw9-test-caption').innerHTML = caption;
    $('hmw9-test-body').innerHTML = body;

    const { test } = state;
    const critical = chiSquareQuantile(ALPHA, test.df);
    const logP = logChiSquareTail(test.statistic, test.df);
    state.critical = critical;
    state.logP = logP;

    $('hmw9-test-metrics').innerHTML = [
      ['χ² STATISTIC', fmt(test.statistic, 2)],
      ['DEGREES OF FREEDOM (r − 1)(c − 1)', fmt(test.df)],
      ['CRITICAL VALUE, 5%', fmt(critical, 3)],
      ['P-VALUE (χ² TAIL)', formatPValue(logP)],
      ["CRAMÉR'S V", fmt(test.cramersV, 3)],
      ['SMALLEST EXPECTED', `${fmt(test.minExpected, 2)}${test.smallCells ? ` (${test.smallCells} cells &lt; 5)` : ''}`]
    ].map(([l, v]) => `<div class="hmw4-metric"><span>${l}</span><strong>${v}</strong></div>`).join('');

    $('hmw9-test-interpretation').innerHTML = testInterpretation(state, critical, logP);
  }

  /* ---------- section 05 ---------- */

  function densityRange(df, statistic) {
    const base = chiSquareQuantile(0.0005, df) * 1.15;
    const onChart = statistic <= base * 1.6;
    return { xMax: onChart ? Math.max(base, statistic * 1.08) : base, onChart };
  }

  function drawDensity() {
    if (!state) return;
    const box = $('hmw9-density-chart');
    widths.density = box.clientWidth;
    const { test, critical } = state;
    const { df, statistic } = test;
    const { xMax, onChart } = densityRange(df, statistic);

    const points = [];
    const x0 = df === 1 ? xMax * 0.004 : 0;
    for (let k = 0; k <= 300; k++) {
      const x = x0 + ((xMax - x0) * k) / 300;
      points.push([x, chiSquarePdf(x, df)]);
    }
    const peak = Math.max(...points.filter(([x]) => x >= xMax * 0.03).map(([, y]) => y));
    const yMax = peak * 1.12;

    const tail = onChart ? points.filter(([x]) => x >= statistic) : [];
    if (onChart && tail.length > 0) tail.unshift([statistic, Math.min(chiSquarePdf(statistic, df), yMax)]);

    box.innerHTML = renderLineChart({
      width: box.clientWidth,
      height: 280,
      title: `Density of the chi-square distribution with ${df} degrees of freedom, with the observed statistic`,
      xLabel: `χ² with ${df} degree${df > 1 ? 's' : ''} of freedom`,
      yLabel: 'Density',
      xDomain: [0, xMax],
      yDomain: [0, yMax],
      band: tail.length > 1 ? { points: tail.map(([x, y]) => [x, 0, y]), color: CHART_COLORS.path, opacity: 0.35 } : null,
      lines: [
        { points, color: CHART_COLORS.theory, width: 2 },
        { points: [[critical, 0], [critical, yMax]], color: CHART_COLORS.title, width: 1.2, dash: '5 4' },
        ...(onChart ? [{ points: [[statistic, 0], [statistic, yMax]], color: CHART_COLORS.path, width: 2 }] : [])
      ]
    });

    $('hmw9-density-note').innerHTML = onChart
      ? `The shaded area to the right of χ² = ${fmt(statistic, 2)} is the p-value, ${formatPValue(state.logP)}.`
      : `The observed χ² = ${fmt(statistic, 2)} lies far to the right of this chart, ${fmt(statistic / critical, 0)} times the critical value. The area beyond it, the p-value, is ${formatPValue(state.logP)}: too small to see, but still computed accurately, in logarithms: ln p = ${signed(state.logP, 1)}.`;
  }

  function drawPermutation() {
    if (!state || !state.perm) return;
    const box = $('hmw9-perm-chart');
    widths.perm = box.clientWidth;
    const { test, critical, perm } = state;
    const stats = perm.statistics;
    if (stats.length === 0) { box.innerHTML = ''; return; }

    const high = Math.max(chiSquareQuantile(0.001, test.df), ...stats);
    const showObserved = test.statistic <= high * 1.3;
    const xMax = showObserved ? Math.max(high, test.statistic * 1.05) : high;
    const binCount = 30;
    const width = xMax / binCount;
    const bins = Array.from({ length: binCount }, (_, k) => ({ from: k * width, to: (k + 1) * width, count: 0 }));
    for (const s of stats) bins[Math.min(binCount - 1, Math.floor(s / width))].count++;
    bins.forEach(b => { b.density = b.count / (stats.length * width); });

    const curve = [];
    const x0 = test.df === 1 ? xMax * 0.01 : 0;
    for (let k = 0; k <= 200; k++) {
      const x = x0 + ((xMax - x0) * k) / 200;
      curve.push([x, chiSquarePdf(x, test.df)]);
    }
    const yMax = Math.max(...bins.map(b => b.density), ...curve.filter(([x]) => x > xMax * 0.04).map(([, y]) => y)) * 1.1;

    box.innerHTML = renderHistogram({
      width: box.clientWidth,
      height: 260,
      title: `Chi-square statistics of ${stats.length} shuffled tables, with the chi-square density`,
      xLabel: 'χ² of a shuffled table',
      bins,
      xDomain: [0, xMax],
      yMax,
      curve,
      markers: [
        { x: critical, color: CHART_COLORS.title, dash: '5 4' },
        ...(showObserved ? [{ x: test.statistic, color: '#f28b82' }] : [])
      ]
    });
  }

  function renderPValueMetrics() {
    const { test, perm, logP } = state;
    const done = perm ? perm.done : 0;
    const exceed = perm ? perm.atLeast : 0;
    const permP = perm && done > 0 ? perm.pValue : NaN;
    const floor = 1 / (done + 1);

    $('hmw9-pvalue-metrics').innerHTML = [
      ['P-VALUE, χ² DISTRIBUTION', formatPValue(logP)],
      ['P-VALUE, PERMUTATIONS', done === 0 ? '—' : exceed === 0 ? `&lt; ${floor.toFixed(4)}` : permP.toFixed(4)],
      ['SHUFFLED TABLES', fmt(done)],
      ['WITH χ² ≥ OBSERVED', fmt(exceed)],
      ['MEAN χ² OF SHUFFLES', done === 0 ? '—' : `${fmt(perm.statistics.reduce((s, v) => s + v, 0) / done, 2)} (df = ${test.df})`]
    ].map(([l, v]) => `<div class="hmw4-metric"><span>${l}</span><strong>${v}</strong></div>`).join('');

    if (!perm || done < PERMUTATIONS) {
      $('hmw9-pvalue-interpretation').innerHTML = '';
      return;
    }

    const theoretical = Math.exp(logP);
    const paragraphs = [];
    if (exceed === 0) {
      paragraphs.push(`<strong>None of the ${fmt(done)} shuffled tables reached
        χ² = ${fmt(test.statistic, 2)}</strong>; the largest was ${fmt(Math.max(...perm.statistics), 2)}.
        The permutation test can only say p &lt; 1/(B + 1) = ${floor.toFixed(4)}: to resolve
        a p-value of ${formatPValue(logP)} it would need ${logP < -80 * Math.LN10
          ? 'more shuffles than there are atoms in the observable universe (about 10⁸⁰)'
          : `on the order of 1/p = ${formatPValue(-logP)} shuffles`}.
        Both methods agree on the decision; the χ² distribution supplies the order of
        magnitude.`);
    } else {
      const agree = Math.abs(permP - theoretical) <= Math.max(0.01, 3 * Math.sqrt(permP * (1 - permP) / done));
      paragraphs.push(`<strong>${fmt(exceed)} of ${fmt(done)} shuffled tables reached
        the observed χ²</strong>, so the permutation p-value is (1 + ${exceed}) / (1 + ${done}) =
        ${permP.toFixed(4)}, against ${formatPValue(logP)} from the χ² distribution.
        ${agree
          ? 'The two agree within the Monte Carlo error of the permutations: the large-sample approximation works for this table.'
          : 'The difference exceeds the Monte Carlo error of the permutations: the χ² approximation is not reliable for this table (see the expected counts in section 04), and the permutation value is the one to trust.'}`);
    }
    paragraphs.push(`The histogram is the distribution of χ² <em>when independence holds by
      construction</em>. It follows the χ² density with ${test.df} degree${test.df > 1 ? 's' : ''} of
      freedom${test.smallCells ? ' only roughly, because some expected counts are small' : ''}, and its
      mean is close to df, the mean of that distribution.`);
    $('hmw9-pvalue-interpretation').innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  function renderSection05() {
    drawDensity();
    startPermutations();
  }

  function startPermutations() {
    const token = ++job;
    clearTimeout(timer);
    const { table, test } = state;
    const perm = createPermutationTest(table, test.statistic, {});
    state.perm = perm;
    const chunk = Math.max(1, Math.ceil(300000 / table.n));
    const permStatus = $('hmw9-perm-status');
    let ticks = 0;

    const tick = () => {
      if (token !== job || signal.aborted) return;
      perm.run(Math.min(chunk, PERMUTATIONS - perm.done));
      ticks++;
      const finished = perm.done >= PERMUTATIONS;
      if (finished || ticks % 8 === 0) {
        permStatus.textContent = finished
          ? `${fmt(PERMUTATIONS)} random shuffles of the ${state.fName} column (seed 2026).`
          : `Shuffling… ${fmt(perm.done)} of ${fmt(PERMUTATIONS)}`;
        drawPermutation();
        renderPValueMetrics();
      }
      if (!finished) timer = setTimeout(tick, 0);
    };
    permStatus.textContent = `Shuffling… 0 of ${fmt(PERMUTATIONS)}`;
    renderPValueMetrics();
    timer = setTimeout(tick, 0);
  }

  /* ---------- events ---------- */

  datasetSelect.addEventListener('change', () => {
    if (datasetSelect.value === 'upload' && upload) useUpload();
    else useBundled(datasetSelect.value);
  }, { signal });
  xSelect.addEventListener('change', analyse, { signal });
  fSelect.addEventListener('change', analyse, { signal });
  fileInput.addEventListener('change', () => readFile(fileInput.files[0]), { signal });

  root.querySelectorAll('input[name="hmw9-table-view"]').forEach(input =>
    input.addEventListener('change', () => state && renderSection03(), { signal }));
  $('hmw9-test').querySelectorAll('input[name="hmw9-test-view"]').forEach(input =>
    input.addEventListener('change', () => state && renderSection04(), { signal }));

  const observer = new ResizeObserver(() => {
    if (!state) return;
    if (Math.abs($('hmw9-profile-chart').clientWidth - (widths.profile ?? 0)) > 4) drawProfiles();
    if (Math.abs($('hmw9-density-chart').clientWidth - (widths.density ?? 0)) > 4) drawDensity();
    if (Math.abs($('hmw9-perm-chart').clientWidth - (widths.perm ?? 0)) > 4) drawPermutation();
  });
  ['hmw9-profile-chart', 'hmw9-density-chart', 'hmw9-perm-chart'].forEach(id => observer.observe($(id)));

  useBundled(DATASETS[0].id);

  return () => {
    job++;
    clearTimeout(timer);
    controller.abort();
    observer.disconnect();
  };
}
