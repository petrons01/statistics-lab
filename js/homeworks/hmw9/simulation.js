/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Simulated populations with a controlled amount of dependence
 *
 * X has fixed marginal probabilities p_i. Given X = x_i, F follows
 * a mixture: with probability 1 − δ it is drawn from a fixed
 * distribution q (the same for every row), with probability δ it
 * takes the category "paired" with x_i. So
 *
 *   π_ij = p_i · [(1 − δ) q_j + δ · 1{j = i mod c}].
 *
 * δ = 0 gives independence exactly (π_ij = p_i q_j); larger δ makes
 * the row profiles differ more and more.
 */

import { createRandom } from '../hmw4/random.js';

export const TABLE_SHAPES = Object.freeze([
  { id: '2x2', label: '2 × 2', p: [0.6, 0.4], q: [0.7, 0.3] },
  { id: '3x3', label: '3 × 3', p: [0.5, 0.3, 0.2], q: [0.5, 0.3, 0.2] },
  { id: '3x4', label: '3 × 4', p: [0.5, 0.3, 0.2], q: [0.4, 0.3, 0.2, 0.1] }
]);

export function getShape(id) {
  return TABLE_SHAPES.find(s => s.id === id) ?? TABLE_SHAPES[0];
}

/** Joint probabilities π_ij of the population. */
export function populationJoint(shape, delta) {
  const { p, q } = shape;
  const c = q.length;
  return p.map((pi, i) => q.map((qj, j) => pi * ((1 - delta) * qj + (j === i % c ? delta : 0))));
}

/**
 * Cramér's V of the population itself: the value the sample V
 * estimates. φ² = Σ (π_ij − π_i· π_·j)² / (π_i· π_·j).
 */
export function populationCramersV(joint) {
  const rowM = joint.map(row => row.reduce((s, v) => s + v, 0));
  const colM = joint[0].map((_, j) => joint.reduce((s, row) => s + row[j], 0));
  // Categories with probability 0 never appear: leave them out
  let phi2 = 0;
  joint.forEach((row, i) => row.forEach((v, j) => {
    const e = rowM[i] * colM[j];
    if (e > 0) phi2 += ((v - e) ** 2) / e;
  }));
  const r = rowM.filter(v => v > 0).length;
  const c = colM.filter(v => v > 0).length;
  const k = Math.min(r, c) - 1;
  return k > 0 ? Math.sqrt(phi2 / k) : 0;
}

/** Cumulative probabilities of a flattened joint table. */
function cumulative(joint) {
  const flat = joint.flat();
  const total = flat.reduce((s, v) => s + v, 0);
  let acc = 0;
  return flat.map(v => (acc += v / total));
}

/**
 * A sampler of tables: each call to draw(n) returns the r × c
 * counts of n independent observations from the population.
 */
export function createTableSampler(joint, seed) {
  const uniform = createRandom(seed);
  const cdf = cumulative(joint);
  const r = joint.length;
  const c = joint[0].length;
  const last = cdf.length - 1;

  return function draw(n) {
    const flat = new Array(r * c).fill(0);
    for (let k = 0; k < n; k++) {
      const u = uniform();
      let cell = 0;
      while (cell < last && u >= cdf[cell]) cell++;
      flat[cell]++;
    }
    return Array.from({ length: r }, (_, i) => flat.slice(i * c, i * c + c));
  };
}
