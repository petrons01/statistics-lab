/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * Penetration score models
 *
 * Each model describes the law of a single increment X_i,
 * the penetration score obtained on one system:
 *
 *   Bernoulli(p):  X in {0, 1},  P(X = 1) = p
 *   Rademacher:    X in {-1, +1}, P(X = +1) = P(X = -1) = 1/2
 *
 * For each model we provide:
 *   - draw(uniform): one random increment, built from a
 *     uniform generator on [0, 1) (see random.js);
 *   - mean and variance of a single increment, i.e. the
 *     theoretical values mu = E[X] and sigma^2 = Var(X)
 *     that every later comparison is based on.
 */

export const MODEL_IDS = Object.freeze({
  BERNOULLI: 'bernoulli',
  RADEMACHER: 'rademacher'
});

export const DEFAULT_P = 0.35;

/**
 * Builds a score model.
 *
 * @param {'bernoulli'|'rademacher'} id Model identifier.
 * @param {number} [p] Success probability (Bernoulli only).
 * @returns {{
 *   id: string,
 *   label: string,
 *   p: number|null,
 *   values: number[],
 *   mean: number,
 *   variance: number,
 *   draw: (uniform: () => number) => number
 * }}
 */
export function createModel(id, p = DEFAULT_P) {

  if (id === MODEL_IDS.BERNOULLI) {

    if (
      typeof p !== 'number' ||
      !Number.isFinite(p) ||
      p < 0 ||
      p > 1
    ) {
      throw new RangeError(
        'Bernoulli probability p must be a number in [0, 1].'
      );
    }

    return Object.freeze({
      id,
      label: `Bernoulli (p = ${p})`,
      p,
      values: [0, 1],

      // E[X] = 0 * (1 - p) + 1 * p = p
      mean: p,

      // E[X^2] = p, so Var(X) = p - p^2 = p(1 - p)
      variance: p * (1 - p),

      // P(U < p) = p for U uniform on [0, 1)
      draw: uniform => (uniform() < p ? 1 : 0)
    });
  }

  if (id === MODEL_IDS.RADEMACHER) {

    return Object.freeze({
      id,
      label: 'Rademacher (±1)',
      p: null,
      values: [-1, 1],

      // E[X] = (+1)(1/2) + (-1)(1/2) = 0
      mean: 0,

      // X^2 = 1 always, so Var(X) = E[X^2] - 0^2 = 1
      variance: 1,

      // P(U < 1/2) = 1/2
      draw: uniform => (uniform() < 0.5 ? 1 : -1)
    });
  }

  throw new RangeError(
    'Model must be "bernoulli" or "rademacher".'
  );
}
