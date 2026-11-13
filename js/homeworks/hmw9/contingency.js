/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Contingency table, frequencies and Pearson's chi-square statistic
 *
 * Notation (r rows for the categories of X, c columns for F):
 *   n_ij  observed count of the pair (x_i, f_j)
 *   n_i·  row total, n_·j column total, n grand total
 *   E_ij = n_i· · n_·j / n   expected count under independence
 *   χ²   = Σ (n_ij − E_ij)² / E_ij,   df = (r − 1)(c − 1)
 */

/* =====================================================
 * 1. COUNTING
 * ===================================================== */

/* Natural order: "2" before "10", case-insensitive */
const naturalCompare = (a, b) =>
  a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });

/**
 * Categories of one variable: a preferred order first (if given),
 * then the remaining values in natural order.
 */
export function categoriesOf(values, preferred = []) {
  const present = new Set(values);
  const first = preferred.filter(v => present.has(v));
  const rest = [...present].filter(v => !first.includes(v)).sort(naturalCompare);
  return [...first, ...rest];
}

/**
 * Builds the r × c table of observed counts from raw records.
 * Records with an empty value in either variable are skipped and
 * counted in `skipped`.
 *
 * @param {string[][]} records  Raw rows.
 * @param {number} xIndex  Column of X (rows of the table).
 * @param {number} fIndex  Column of F (columns of the table).
 * @param {{ xOrder?: string[], fOrder?: string[] }} [order]
 */
export function buildTable(records, xIndex, fIndex, order = {}) {
  const xs = [];
  const fs = [];
  let skipped = 0;

  for (const record of records) {
    const x = record[xIndex] ?? '';
    const f = record[fIndex] ?? '';
    if (x === '' || f === '') { skipped++; continue; }
    xs.push(x);
    fs.push(f);
  }

  const rows = categoriesOf(xs, order.xOrder);
  const cols = categoriesOf(fs, order.fOrder);
  const rowIndex = new Map(rows.map((v, i) => [v, i]));
  const colIndex = new Map(cols.map((v, j) => [v, j]));

  const counts = rows.map(() => new Array(cols.length).fill(0));
  const xCodes = new Int32Array(xs.length);
  const fCodes = new Int32Array(fs.length);

  for (let k = 0; k < xs.length; k++) {
    const i = rowIndex.get(xs[k]);
    const j = colIndex.get(fs[k]);
    counts[i][j]++;
    xCodes[k] = i;
    fCodes[k] = j;
  }

  return { rows, cols, counts, n: xs.length, skipped, xCodes, fCodes };
}

/** Table of counts from a plain matrix (used by the simulations). */
export function tableFromCounts(counts, rows, cols) {
  const n = counts.flat().reduce((s, v) => s + v, 0);
  return {
    rows: rows ?? counts.map((_, i) => `x${i + 1}`),
    cols: cols ?? counts[0].map((_, j) => `f${j + 1}`),
    counts,
    n,
    skipped: 0
  };
}

/* =====================================================
 * 2. MARGINAL, JOINT AND CONDITIONAL FREQUENCIES
 * ===================================================== */

export function marginals({ counts }) {
  const rowTotals = counts.map(row => row.reduce((s, v) => s + v, 0));
  const colTotals = counts[0].map((_, j) => counts.reduce((s, row) => s + row[j], 0));
  const n = rowTotals.reduce((s, v) => s + v, 0);
  return { rowTotals, colTotals, n };
}

/**
 * All the frequencies the assignment asks for.
 *   joint:     f_ij = n_ij / n
 *   rowMarg:   f_i· = n_i· / n       (marginal of X)
 *   colMarg:   f_·j = n_·j / n       (marginal of F)
 *   rowProfiles[i][j] = n_ij / n_i·  (conditional of F given X = x_i)
 *   colProfiles[i][j] = n_ij / n_·j  (conditional of X given F = f_j)
 */
export function frequencies(table) {
  const { counts } = table;
  const { rowTotals, colTotals, n } = marginals(table);

  return {
    rowTotals,
    colTotals,
    n,
    joint: counts.map(row => row.map(v => v / n)),
    rowMarg: rowTotals.map(v => v / n),
    colMarg: colTotals.map(v => v / n),
    rowProfiles: counts.map((row, i) => row.map(v => v / rowTotals[i])),
    colProfiles: counts.map(row => row.map((v, j) => v / colTotals[j]))
  };
}

/* =====================================================
 * 3. EXPECTED COUNTS AND CHI-SQUARE
 * ===================================================== */

/** E_ij = n_i· · n_·j / n: the table independence would produce. */
export function expectedCounts(table) {
  const { rowTotals, colTotals, n } = marginals(table);
  return rowTotals.map(R => colTotals.map(C => (R * C) / n));
}

/** Pearson's χ² of a table of counts (fast path, no details). */
export function chiSquareStatistic(counts, rowTotals, colTotals, n) {
  let chi = 0;
  for (let i = 0; i < counts.length; i++) {
    for (let j = 0; j < counts[i].length; j++) {
      const e = (rowTotals[i] * colTotals[j]) / n;
      const d = counts[i][j] - e;
      chi += (d * d) / e;
    }
  }
  return chi;
}

/**
 * Full chi-square analysis of a table.
 *   contributions[i][j] = (O − E)² / E
 *   residuals[i][j]     = (O − E) / √E                (Pearson residual)
 *   adjusted[i][j]      = (O − E) / √(E (1 − f_i·)(1 − f_·j))
 *     (adjusted residual: approximately N(0, 1) under independence,
 *      so |value| > 2 marks a cell that departs from it)
 *   cramersV = √(χ² / (n · (min(r, c) − 1)))   in [0, 1]
 *
 * Rows or columns with total 0 cannot occur when the table is
 * built from records; a table with one row or one column has no
 * test (df = 0).
 */
export function chiSquareTest(table) {
  const { counts } = table;
  const { rowTotals, colTotals, n } = marginals(table);
  const r = counts.length;
  const c = counts[0].length;

  const expected = expectedCounts(table);
  const contributions = [];
  const residuals = [];
  const adjusted = [];
  let statistic = 0;
  let minExpected = Infinity;
  let smallCells = 0;

  for (let i = 0; i < r; i++) {
    contributions.push([]);
    residuals.push([]);
    adjusted.push([]);
    for (let j = 0; j < c; j++) {
      const e = expected[i][j];
      const d = counts[i][j] - e;
      const term = (d * d) / e;
      statistic += term;
      contributions[i].push(term);
      residuals[i].push(d / Math.sqrt(e));
      const shrink = (1 - rowTotals[i] / n) * (1 - colTotals[j] / n);
      adjusted[i].push(shrink > 0 ? d / Math.sqrt(e * shrink) : 0);
      minExpected = Math.min(minExpected, e);
      if (e < 5) smallCells++;
    }
  }

  const df = (r - 1) * (c - 1);
  const k = Math.min(r, c) - 1;

  return {
    expected,
    contributions,
    residuals,
    adjusted,
    statistic,
    df,
    n,
    minExpected,
    smallCells,
    cells: r * c,
    cramersV: k > 0 && n > 0 ? Math.sqrt(statistic / (n * k)) : 0
  };
}

/**
 * Yates' continuity correction for a 2 × 2 table:
 * Σ (|O − E| − ½)² / E, with |O − E| − ½ floored at 0.
 */
export function yatesStatistic(table) {
  const { counts } = table;
  if (counts.length !== 2 || counts[0].length !== 2) return null;
  const expected = expectedCounts(table);
  let chi = 0;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      const d = Math.max(0, Math.abs(counts[i][j] - expected[i][j]) - 0.5);
      chi += (d * d) / expected[i][j];
    }
  }
  return chi;
}
