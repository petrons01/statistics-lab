/*
 * Statistics-Lab — Homework 4.2 (internal folder: hmw6)
 * Score distributions on {0, 1, ..., 10}
 *
 * Each penetration attempt receives a score between 0 and 10,
 * drawn from a fixed discrete distribution. For every
 * distribution we compute exactly, from its probabilities:
 *
 *   μ  = Σ k p_k                    (mean)
 *   σ² = Σ (k − μ)² p_k             (variance)
 *   μ₃, μ₄ = Σ (k − μ)³ p_k, Σ (k − μ)⁴ p_k
 *   skewness = μ₃ / σ³,  excess kurtosis κ = μ₄ / σ⁴ − 3
 *
 * μ₄ (through κ) is needed because the variability of the sample
 * variance depends on it:  Var(s²) = σ⁴ (2/(n − 1) + κ/n).
 *
 * Sampling uses the inverse-CDF method: draw U uniform on [0, 1)
 * and return the smallest k with F(k) > U.
 */

export const SCORE_VALUES = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

function binomialPmf(n, p) {
  const pmf = [];
  let coefficient = 1;
  for (let k = 0; k <= n; k++) {
    pmf.push(coefficient * p ** k * (1 - p) ** (n - k));
    coefficient = coefficient * (n - k) / (k + 1);
  }
  return pmf;
}

/* The distributions offered on the page. "difficulty" is the default. */
const DEFINITIONS = {
  difficulty: {
    label: 'Difficulty profile',
    description:
      'Most attempts obtain low scores and few reach the top: a skewed ' +
      'profile in which deep penetrations are rare.',
    pmf: [0.12, 0.14, 0.15, 0.14, 0.12, 0.10, 0.08, 0.06, 0.04, 0.03, 0.02]
  },
  binomial: {
    label: 'Binomial(10, 0.35)',
    description:
      'The score counts successes in 10 independent sub-attacks, each ' +
      'with probability 0.35: the Bernoulli model of Homework 3 summed ' +
      'over 10 steps.',
    pmf: binomialPmf(10, 0.35)
  },
  uniform: {
    label: 'Discrete uniform',
    description:
      'Every score from 0 to 10 is equally likely: no information about ' +
      'the attack, maximum spread for a symmetric distribution.',
    pmf: new Array(11).fill(1 / 11)
  },
  rare: {
    label: 'Rare breach',
    description:
      'Almost every attempt scores 0, a few partial successes, and a ' +
      'small chance of a full breach (10): a heavy-tailed profile.',
    pmf: [0.70, 0.10, 0.05, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.04]
  }
};

export const DEFAULT_DISTRIBUTION = 'difficulty';

/**
 * Builds a distribution with its exact moments and a sampler.
 * @param {string} id One of the keys of DEFINITIONS.
 */
export function createScoreDistribution(id = DEFAULT_DISTRIBUTION) {
  const definition = DEFINITIONS[id];
  if (!definition) {
    throw new RangeError(
      `Unknown distribution "${id}". Use one of: ${Object.keys(DEFINITIONS).join(', ')}.`
    );
  }

  const pmf = definition.pmf;
  const total = pmf.reduce((a, b) => a + b, 0);
  if (pmf.length !== 11 || pmf.some(p => p < 0) || Math.abs(total - 1) > 1e-12) {
    throw new RangeError(`Invalid probabilities for "${id}".`);
  }

  const mean = pmf.reduce((sum, p, k) => sum + k * p, 0);
  const central = power => pmf.reduce((sum, p, k) => sum + (k - mean) ** power * p, 0);
  const variance = central(2);
  const m3 = central(3);
  const m4 = central(4);

  // Cumulative probabilities for inverse-CDF sampling.
  const cdf = [];
  pmf.reduce((sum, p, k) => (cdf[k] = sum + p), 0);
  cdf[10] = 1;   // guard against rounding: F(10) is exactly 1

  return Object.freeze({
    id,
    label: definition.label,
    description: definition.description,
    pmf: Object.freeze([...pmf]),
    mean,
    variance,
    skewness: m3 / variance ** 1.5,
    excessKurtosis: m4 / variance ** 2 - 3,
    fourthMoment: m4,

    /** One score, from a uniform generator on [0, 1). */
    draw(uniform) {
      const u = uniform();
      let k = 0;
      while (u >= cdf[k]) k++;
      return k;
    }
  });
}

/** Ids and labels, in display order. */
export function listScoreDistributions() {
  return Object.entries(DEFINITIONS).map(([id, d]) => ({ id, label: d.label }));
}

/* =====================================================
 * THEORY FOR SAMPLES OF SIZE n
 * ===================================================== */

/**
 * Exact moments of the sampling mean and the sampling variance
 * of n i.i.d. scores:
 *
 *   E[x̄] = μ                 Var(x̄)  = σ² / n
 *   E[s²] = σ²               Var(s²) = σ⁴ (2/(n − 1) + κ/n)
 *   E[SS/n] = (n − 1)/n · σ²  (biased version)
 */
export function samplingTheory(distribution, n) {
  if (!Number.isInteger(n) || n < 2) {
    throw new RangeError('n must be an integer of at least 2.');
  }
  const { mean, variance, excessKurtosis } = distribution;
  return {
    n,
    meanOfMeans: mean,
    varianceOfMeans: variance / n,
    meanOfVariances: variance,
    varianceOfVariances: variance ** 2 * (2 / (n - 1) + excessKurtosis / n),
    meanOfBiasedVariances: (n - 1) / n * variance
  };
}
