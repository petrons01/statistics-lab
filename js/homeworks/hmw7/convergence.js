/*
 * Statistics-Lab — Homework 5.1 (internal folder: hmw7)
 * Convergence and efficiency experiment
 *
 * For one function, every method is run with N = M = 3, 9, 27, …,
 * 19683 subintervals or layers. For each size we record the value,
 * the error against the exact integral, the number of evaluations
 * of f and the time. The observed order p is the slope of
 * log|error| against log N over the last four sizes: error ∝ N^(−p).
 */

import { riemannSum, trapezoid } from './riemann.js';
import { lebesgueSums } from './lebesgue.js';
import { topLevel } from './functions.js';

export const SWEEP_SIZES = [3, 9, 27, 81, 243, 729, 2187, 6561, 19683];

export const METHODS = [
  { id: 'left', family: 'riemann', label: 'Riemann, left endpoint' },
  { id: 'midpoint', family: 'riemann', label: 'Riemann, midpoint' },
  { id: 'trapezoid', family: 'riemann', label: 'Trapezoidal rule' },
  { id: 'upper', family: 'lebesgue', label: 'Lebesgue, upper sum' },
  { id: 'lower', family: 'lebesgue', label: 'Lebesgue, lower sum' },
  { id: 'mean', family: 'lebesgue', label: 'Lebesgue, mean of lower and upper' }
];

/* An error this small is rounding, not discretization */
export function isExact(error, exact) {
  return Math.abs(error) <= 1e-15 * Math.max(1, Math.abs(exact));
}

/** Runs all methods for every size of the sweep. */
export function convergenceSweep(fn, sizes = SWEEP_SIZES) {
  return sizes.map(n => {
    let started = performance.now();
    const left = riemannSum(fn.f, fn.a, fn.b, n, 'left');
    const midpoint = riemannSum(fn.f, fn.a, fn.b, n, 'midpoint');
    const trap = trapezoid(fn.f, fn.a, fn.b, n);
    const riemannTime = (performance.now() - started) / 3;

    started = performance.now();
    const lebesgue = lebesgueSums(fn, n, topLevel(fn, n));
    const lebesgueTime = performance.now() - started;

    const values = {
      left: left.value,
      midpoint: midpoint.value,
      trapezoid: trap.value,
      upper: lebesgue.upper,
      lower: lebesgue.lower,
      mean: lebesgue.mean
    };

    const errors = Object.fromEntries(
      Object.entries(values).map(([id, v]) => [id, v - fn.exact]));

    return {
      n,
      values,
      errors,
      evaluations: {
        left: left.evaluations,
        midpoint: midpoint.evaluations,
        trapezoid: trap.evaluations,
        upper: lebesgue.evaluations,
        lower: lebesgue.evaluations,
        mean: lebesgue.evaluations
      },
      time: { riemann: riemannTime, lebesgue: lebesgueTime }
    };
  });
}

/**
 * Observed order of convergence: least-squares slope of
 * log|error| on log n over the last `points` sizes.
 * Returns { order } or { exact: true } or { diverges: true }.
 */
export function observedOrder(rows, methodId, exact, points = 4) {
  const tail = rows.slice(-points);
  const errors = tail.map(r => r.errors[methodId]);

  if (errors.some(e => !Number.isFinite(e))) return { diverges: true };
  if (errors.every(e => isExact(e, exact))) return { exact: true };

  const pairs = tail
    .map(r => [Math.log(r.n), Math.abs(r.errors[methodId])])
    .filter(([, e]) => !isExact(e, exact))
    .map(([x, e]) => [x, Math.log(e)]);

  if (pairs.length < 2) return { exact: true };

  const mx = pairs.reduce((s, [x]) => s + x, 0) / pairs.length;
  const my = pairs.reduce((s, [, y]) => s + y, 0) / pairs.length;
  const sxy = pairs.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0);
  const sxx = pairs.reduce((s, [x]) => s + (x - mx) ** 2, 0);

  return { order: -sxy / sxx };
}

/** First size of the sweep with |error| ≤ tolerance (null if none). */
export function firstBelow(rows, methodId, tolerance) {
  const row = rows.find(r => Math.abs(r.errors[methodId]) <= tolerance);
  return row ? { n: row.n, evaluations: row.evaluations[methodId] } : null;
}
