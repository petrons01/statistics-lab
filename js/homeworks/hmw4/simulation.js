/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * Penetration process simulation
 *
 * Modelling assumption:
 *   - n systems, attacked one after the other by each attacker;
 *   - m attackers, mutually independent;
 *   - attacker j obtains i.i.d. scores X_1, ..., X_n
 *     (law given by models.js) and accumulates
 *
 *       S_k = X_1 + ... + X_k,   k = 1, ..., n.
 *
 * For each requested n and each attacker we record S_n.
 * The other two quantities of the assignment follow directly:
 *
 *       average score     S_n / n
 *       normalized score  S_n / sqrt(n)
 *
 * Sampling note:
 *   the outcomes at different n are snapshots of the SAME
 *   m random walks (S_100 contains S_30 of the same attacker).
 *   They show how each process evolves; they are not
 *   independent samples for each n.
 */

import { createRandom, DEFAULT_SEED } from './random.js';

export const DEFAULT_N_VALUES = Object.freeze([10, 30, 100, 300, 1000]);
export const DEFAULT_M = 500;
export const DEFAULT_PATH_COUNT = 10;

export const SIMULATION_LIMITS = Object.freeze({
  maxN: 10000,              // systems per attacker
  maxM: 2000,               // attackers
  maxNValues: 12,           // distinct n values compared
  maxPathCount: 20,         // paths kept for plotting
  maxIncrements: 2000000    // max(n) * m, browser budget
});

/* =====================================================
 * 1. THE THREE QUANTITIES
 * ===================================================== */

/** Average score S_n / n. */
export function averageScore(total, n) {
  return total / n;
}

/** Normalized total score S_n / sqrt(n). */
export function normalizedScore(total, n) {
  return total / Math.sqrt(n);
}

/* =====================================================
 * 2. VALIDATION
 * ===================================================== */

function validate({ model, nValues, m, pathCount }) {

  if (
    !model ||
    typeof model.draw !== 'function' ||
    !Number.isFinite(model.mean) ||
    !Number.isFinite(model.variance)
  ) {
    throw new TypeError(
      'model must be created with createModel() from models.js.'
    );
  }

  if (
    !Array.isArray(nValues) ||
    nValues.length === 0 ||
    nValues.length > SIMULATION_LIMITS.maxNValues ||
    nValues.some(n =>
      !Number.isInteger(n) || n < 1 || n > SIMULATION_LIMITS.maxN
    ) ||
    new Set(nValues).size !== nValues.length
  ) {
    throw new RangeError(
      `nValues must contain 1–${SIMULATION_LIMITS.maxNValues} ` +
      `distinct integers between 1 and ${SIMULATION_LIMITS.maxN}.`
    );
  }

  if (!Number.isInteger(m) || m < 2 || m > SIMULATION_LIMITS.maxM) {
    throw new RangeError(
      `m must be an integer between 2 and ${SIMULATION_LIMITS.maxM}.`
    );
  }

  if (
    !Number.isInteger(pathCount) ||
    pathCount < 0 ||
    pathCount > SIMULATION_LIMITS.maxPathCount
  ) {
    throw new RangeError(
      `pathCount must be an integer between 0 and ` +
      `${SIMULATION_LIMITS.maxPathCount}.`
    );
  }

  const increments = Math.max(...nValues) * m;

  if (increments > SIMULATION_LIMITS.maxIncrements) {
    throw new RangeError(
      `Too many increments: max(n) × m = ${increments}, ` +
      `limit ${SIMULATION_LIMITS.maxIncrements}.`
    );
  }
}

/* =====================================================
 * 3. SIMULATION
 * ===================================================== */

/**
 * Simulates m independent attackers over max(nValues) systems.
 *
 * @param {object} options
 * @param {object} options.model Model from createModel().
 * @param {number[]} [options.nValues] System counts to record.
 * @param {number} [options.m] Number of attackers.
 * @param {number} [options.seed] PRNG seed.
 * @param {number} [options.pathCount] Attackers whose full
 *   path S_0, ..., S_maxN is kept for plotting
 *   (reduced to m if larger).
 *
 * @returns {{
 *   settings: object,
 *   paths: { attacker: number, totals: Int32Array }[],
 *   snapshots: {
 *     n: number,
 *     totals: Int32Array,
 *     averages: Float64Array,
 *     normalized: Float64Array
 *   }[]
 * }}
 */
export function simulateAttackers({
  model,
  nValues = DEFAULT_N_VALUES,
  m = DEFAULT_M,
  seed = DEFAULT_SEED,
  pathCount = DEFAULT_PATH_COUNT
} = {}) {

  validate({ model, nValues, m, pathCount });

  // createRandom validates the seed and throws if invalid.
  const uniform = createRandom(seed);

  const sortedN = [...nValues].sort((a, b) => a - b);
  const maxN = sortedN[sortedN.length - 1];
  const keptPaths = Math.min(pathCount, m);

  // One snapshot per requested n, one slot per attacker.
  const snapshots = sortedN.map(n => ({
    n,
    totals: new Int32Array(m),
    averages: new Float64Array(m),
    normalized: new Float64Array(m)
  }));

  const paths = [];

  for (let attacker = 0; attacker < m; attacker++) {

    // Full path only for the first keptPaths attackers.
    // totals[k] = S_k, with S_0 = 0 as starting point.
    const pathTotals = attacker < keptPaths
      ? new Int32Array(maxN + 1)
      : null;

    let total = 0;     // running sum S_k
    let next = 0;      // index of the next snapshot to fill

    for (let k = 1; k <= maxN; k++) {

      total += model.draw(uniform);

      if (pathTotals) pathTotals[k] = total;

      // sortedN is increasing, so one pointer is enough.
      if (k === sortedN[next]) {
        const snap = snapshots[next];
        snap.totals[attacker] = total;
        snap.averages[attacker] = averageScore(total, k);
        snap.normalized[attacker] = normalizedScore(total, k);
        next++;
      }
    }

    if (pathTotals) {
      paths.push({ attacker: attacker + 1, totals: pathTotals });
    }
  }

  return {
    settings: {
      modelId: model.id,
      modelLabel: model.label,
      p: model.p,
      mean: model.mean,
      variance: model.variance,
      nValues: sortedN,
      maxN,
      m,
      seed,
      pathCount: keptPaths,
      increments: maxN * m
    },
    paths,
    snapshots
  };
}
