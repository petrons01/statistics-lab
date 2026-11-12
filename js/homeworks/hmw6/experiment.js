/*
 * Statistics-Lab — Homework 4.2 (internal folder: hmw6)
 * Sampling-mean and sampling-variance experiment
 *
 * m hackers, each attempting n systems. Hacker j receives the
 * scores X_j1, ..., X_jn (i.i.d., from the chosen distribution)
 * and computes, with Welford's recurrence (Homework 4.1):
 *
 *   x̄_j  = sampling mean of the n scores
 *   s²_j = sampling variance  SS / (n − 1)
 *
 * Because Welford's recurrence gives the running mean and
 * variance after every score, ONE pass over the scores yields
 * the results for every requested n: the values at n = 10 are
 * the state of the accumulator after the 10th system. As in
 * Homework 3, results for different n are therefore snapshots of
 * the same score sequences, not independent samples.
 *
 * Across the m hackers we then compute the average and the
 * spread of the x̄_j and of the s²_j, again with Welford.
 */

import { createAccumulator, addValue, sampleVariance } from '../hmw5/welford.js';
import { createRandom, DEFAULT_SEED } from '../hmw4/random.js';
import { samplingTheory } from './score-distributions.js';

export const DEFAULT_N_VALUES = Object.freeze([2, 5, 10, 30, 100, 300, 1000]);
export const DEFAULT_HACKERS = 1000;

export const EXPERIMENT_LIMITS = Object.freeze({
  maxN: 10000,
  maxHackers: 5000,
  maxScores: 3000000     // max(n) × m
});

/* =====================================================
 * 1. SIMULATION
 * ===================================================== */

/**
 * @param {object} options
 * @param {object} options.distribution From createScoreDistribution().
 * @param {number[]} [options.nValues] Systems per hacker to record (≥ 2).
 * @param {number} [options.m] Number of hackers.
 * @param {number} [options.seed]
 * @returns {{ settings, snapshots: { n, means, variances, biasedVariances }[] }}
 */
export function runSamplingExperiment({
  distribution,
  nValues = DEFAULT_N_VALUES,
  m = DEFAULT_HACKERS,
  seed = DEFAULT_SEED
} = {}) {

  if (!distribution || typeof distribution.draw !== 'function') {
    throw new TypeError('distribution must come from createScoreDistribution().');
  }
  if (
    !Array.isArray(nValues) || nValues.length === 0 ||
    nValues.some(n => !Number.isInteger(n) || n < 2 || n > EXPERIMENT_LIMITS.maxN) ||
    new Set(nValues).size !== nValues.length
  ) {
    throw new RangeError(
      `nValues must contain distinct integers between 2 and ${EXPERIMENT_LIMITS.maxN}.`
    );
  }
  if (!Number.isInteger(m) || m < 2 || m > EXPERIMENT_LIMITS.maxHackers) {
    throw new RangeError(`m must be an integer between 2 and ${EXPERIMENT_LIMITS.maxHackers}.`);
  }

  const sortedN = [...nValues].sort((a, b) => a - b);
  const maxN = sortedN[sortedN.length - 1];

  if (maxN * m > EXPERIMENT_LIMITS.maxScores) {
    throw new RangeError(
      `Too many scores: max(n) × m = ${maxN * m}, limit ${EXPERIMENT_LIMITS.maxScores}.`
    );
  }

  const uniform = createRandom(seed);

  const snapshots = sortedN.map(n => ({
    n,
    means: new Float64Array(m),
    variances: new Float64Array(m),
    biasedVariances: new Float64Array(m)
  }));

  for (let hacker = 0; hacker < m; hacker++) {
    const acc = createAccumulator();
    let next = 0;

    for (let system = 1; system <= maxN; system++) {
      addValue(acc, distribution.draw(uniform));

      if (system === sortedN[next]) {
        const snapshot = snapshots[next];
        snapshot.means[hacker] = acc.mean;
        snapshot.variances[hacker] = sampleVariance(acc);
        snapshot.biasedVariances[hacker] = acc.ss / acc.count;
        next++;
      }
    }
  }

  return {
    settings: {
      distributionId: distribution.id,
      distributionLabel: distribution.label,
      mu: distribution.mean,
      sigma2: distribution.variance,
      nValues: sortedN,
      maxN,
      m,
      seed,
      scores: maxN * m
    },
    snapshots
  };
}

/* =====================================================
 * 2. SUMMARIES ACROSS HACKERS
 * ===================================================== */

/** Average and sample standard deviation of m values (Welford). */
function describe(values) {
  const acc = createAccumulator();
  for (const v of values) addValue(acc, v);
  return {
    average: acc.mean,
    standardDeviation: Math.sqrt(sampleVariance(acc))
  };
}

/**
 * Compares, for one n, the averages over the m hackers with μ and
 * σ², and the spread of the sampling means and variances with
 * their theoretical standard deviations.
 *
 * Standard errors of the averages: SD / √m. The z-scores
 * (average − expected) / theoretical SE say whether the difference
 * from μ or σ² is compatible with sampling noise.
 */
export function summarizeSnapshot(snapshot, distribution) {
  const m = snapshot.means.length;
  const theory = samplingTheory(distribution, snapshot.n);

  const means = describe(snapshot.means);
  const variances = describe(snapshot.variances);
  const biased = describe(snapshot.biasedVariances);

  const seMean = Math.sqrt(theory.varianceOfMeans / m);
  const seVariance = Math.sqrt(theory.varianceOfVariances / m);

  return {
    n: snapshot.n,
    m,
    theory,

    averageOfMeans: means.average,
    sdOfMeans: means.standardDeviation,
    theoreticalSdOfMeans: Math.sqrt(theory.varianceOfMeans),
    zMean: (means.average - distribution.mean) / seMean,

    averageOfVariances: variances.average,
    sdOfVariances: variances.standardDeviation,
    theoreticalSdOfVariances: Math.sqrt(theory.varianceOfVariances),
    zVariance: (variances.average - distribution.variance) / seVariance,

    averageOfBiasedVariances: biased.average,
    // SS/n = (n − 1)/n · s², so its standard error scales by the same factor.
    zBiasedAgainstSigma2:
      (biased.average - distribution.variance) / ((snapshot.n - 1) / snapshot.n * seVariance),

    standardErrorOfMeans: seMean,
    standardErrorOfVariances: seVariance
  };
}
