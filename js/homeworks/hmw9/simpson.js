/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Stratified analysis of 2 × 2 tables (Simpson's paradox)
 *
 * When a third variable Z (the department) is related both to X
 * (gender) and to F (admission), the X × F table pooled over Z can
 * show an association that disappears, or reverses, inside every
 * level of Z. The Cochran–Mantel–Haenszel test asks whether X and F
 * are associated within the strata, with Z held fixed:
 *
 *   for each stratum k with table [[a, b], [c, d]] and total n_k,
 *   E(a_k)   = (a + b)(a + c) / n_k
 *   Var(a_k) = (a + b)(c + d)(a + c)(b + d) / (n_k² (n_k − 1))
 *   CMH      = (Σ (a_k − E(a_k)))² / Σ Var(a_k)   ~ χ² with 1 df
 *
 * and the Mantel–Haenszel common odds ratio is
 *   OR_MH = Σ (a_k d_k / n_k) / Σ (b_k c_k / n_k).
 */

import { buildTable, chiSquareTest } from './contingency.js';

/**
 * Splits the records by the column `zIndex` and builds the X × F
 * table inside each stratum, plus the pooled table.
 */
export function stratify(records, xIndex, fIndex, zIndex, order = {}) {
  const pooled = buildTable(records, xIndex, fIndex, order);
  const levels = buildTable(records, zIndex, fIndex, {}).rows;

  const strata = levels.map(level => {
    const subset = records.filter(r => r[zIndex] === level);
    // Same row and column order as the pooled table
    const table = buildTable(subset, xIndex, fIndex, { xOrder: pooled.rows, fOrder: pooled.cols });
    return { level, table, test: chiSquareTest(table) };
  });

  return { pooled, pooledTest: chiSquareTest(pooled), strata };
}

/** Cochran–Mantel–Haenszel statistic and common odds ratio of 2 × 2 strata. */
export function mantelHaenszel(tables) {
  let deviation = 0;
  let variance = 0;
  let orNum = 0;
  let orDen = 0;

  for (const { counts } of tables) {
    const [[a, b], [c, d]] = counts;
    const n = a + b + c + d;
    if (n < 2) continue;
    deviation += a - ((a + b) * (a + c)) / n;
    variance += ((a + b) * (c + d) * (a + c) * (b + d)) / (n * n * (n - 1));
    orNum += (a * d) / n;
    orDen += (b * c) / n;
  }

  return { statistic: (deviation * deviation) / variance, df: 1, oddsRatio: orNum / orDen };
}

/** Odds ratio of a single 2 × 2 table: (a d) / (b c). */
export const oddsRatio = ([[a, b], [c, d]]) => (a * d) / (b * c);
