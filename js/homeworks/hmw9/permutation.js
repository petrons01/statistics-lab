/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Permutation test of independence
 *
 * Under independence, which F value goes with which X value is
 * arbitrary. Shuffling the F column breaks any link while keeping
 * both marginal distributions exactly as observed. Repeating the
 * shuffle B times gives the distribution of χ² under independence
 * for THIS table, with no large-sample approximation:
 *
 *   p̂ = (1 + #{b : χ²_b ≥ χ²_obs}) / (1 + B).
 *
 * The +1 counts the observed table itself as one of the
 * arrangements, so p̂ is never 0: its smallest value is 1/(B + 1).
 */

import { createRandom } from '../hmw4/random.js';
import { chiSquareStatistic } from './contingency.js';

/** In-place Fisher–Yates shuffle with the seeded generator. */
function shuffle(array, uniform) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(uniform() * (i + 1));
    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}

/**
 * Creates a permutation test that can run in chunks, so that the
 * page stays responsive on 20,000 records.
 *
 * @param {{ xCodes: Int32Array, fCodes: Int32Array, rows: string[], cols: string[] }} table
 * @param {number} observed  χ² of the observed table.
 * @param {{ seed?: number }} [options]
 */
export function createPermutationTest(table, observed, { seed } = {}) {
  const { xCodes, rows, cols } = table;
  const r = rows.length;
  const c = cols.length;
  const n = xCodes.length;
  const f = Int32Array.from(table.fCodes);
  const uniform = createRandom(seed);

  // The margins never change under shuffling
  const rowTotals = new Array(r).fill(0);
  const colTotals = new Array(c).fill(0);
  for (let k = 0; k < n; k++) {
    rowTotals[xCodes[k]]++;
    colTotals[f[k]]++;
  }

  const counts = Array.from({ length: r }, () => new Array(c).fill(0));
  const statistics = [];
  let atLeast = 0;

  // Tolerance: a shuffled table equal to the observed one must count
  const threshold = observed * (1 - 1e-12);

  function step() {
    shuffle(f, uniform);
    for (const row of counts) row.fill(0);
    for (let k = 0; k < n; k++) counts[xCodes[k]][f[k]]++;
    const chi = chiSquareStatistic(counts, rowTotals, colTotals, n);
    statistics.push(chi);
    if (chi >= threshold) atLeast++;
  }

  return {
    /** Runs `count` more permutations. */
    run(count) {
      for (let b = 0; b < count; b++) step();
    },
    get done() { return statistics.length; },
    get statistics() { return statistics; },
    get atLeast() { return atLeast; },
    get pValue() { return (1 + atLeast) / (1 + statistics.length); }
  };
}
