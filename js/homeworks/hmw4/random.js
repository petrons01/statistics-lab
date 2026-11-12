/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * Seeded pseudo-random number generator
 *
 * Every simulation in this homework must be reproducible:
 * the same seed must always produce the same trajectories,
 * so that results shown on the page can be checked again.
 * Math.random() cannot be seeded, so we use our own generator.
 *
 * Algorithm: Mulberry32 (32-bit state, period 2^32).
 * It is fast, simple and statistically adequate for
 * simulations of a few million draws.
 *
 * WARNING: this generator is NOT cryptographically secure.
 * Its output is fully predictable from the seed. It must
 * never be used for keys, tokens or any security purpose.
 */

export const DEFAULT_SEED = 2026;

const UINT32_RANGE = 4294967296; // 2^32

/**
 * Creates a seeded uniform generator on [0, 1).
 *
 * @param {number} seed Integer from 0 to 4294967295.
 * @returns {() => number} A function returning a new
 *   uniform value in [0, 1) at every call.
 */
export function createRandom(seed = DEFAULT_SEED) {

  if (
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 0xFFFFFFFF
  ) {
    throw new RangeError(
      'Seed must be an integer from 0 to 4294967295.'
    );
  }

  // Internal 32-bit state, updated at every draw.
  let state = seed >>> 0;

  return function uniform() {

    // 1. Advance the state by a fixed odd constant
    //    (a Weyl sequence): this guarantees period 2^32.
    state = (state + 0x6D2B79F5) >>> 0;

    // 2. Scramble the state with xor-shifts and
    //    32-bit multiplications, so that consecutive
    //    outputs look independent.
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    t = (t ^ (t >>> 14)) >>> 0;

    // 3. Map the 32-bit integer to [0, 1).
    return t / UINT32_RANGE;
  };
}
