/*
 * Statistics-Lab — Homework 5.2 (internal folder: hmw8)
 * Numerical methods for the standard normal CDF
 *
 *   Φ(z) = ∫_{−∞}^{z} φ(t) dt,   φ(t) = e^{−t²/2} / √(2π)
 *
 * Every method returns { value, cost }, where cost is the number
 * of evaluations of φ, of terms of a series or of steps of a
 * continued fraction (0 for fixed-length formulas).
 *
 * Throughout, Q(x) = 1 − Φ(x) = Φ(−x) is the upper tail. Computing
 * a small tail as 1 − (something close to 1) loses relative
 * accuracy, so the tail methods compute Q directly and use
 * Φ(z) = Q(−z) for z < 0 and Φ(z) = 1 − Q(z) for z > 0.
 */

import { trapezoid, simpson } from '../hmw7/riemann.js';
import { normalCdf as numericalRecipesErfcCdf } from '../hmw4/statistics.js';

const SQRT_2PI = Math.sqrt(2 * Math.PI);

/** Standard normal density φ(z). */
export const density = z => Math.exp(-(z * z) / 2) / SQRT_2PI;

/*
 * φ(x) for the series and the continued fraction, with the
 * splitting used by W. J. Cody: x = s + r, where s keeps four
 * binary digits after the point, so s² is exact in double
 * precision and e^{−x²/2} = e^{−s²/2} · e^{−(x − s)(x + s)/2}.
 * Computing x² directly would carry a relative error of about
 * x²/2 · 10⁻¹⁶ into the result (5·10⁻¹⁵ at x = 10).
 */
export function accurateDensity(x) {
  const s = Math.trunc(x * 16) / 16;
  const d = (x - s) * (x + s);
  return (Math.exp(-(s * s) / 2) * Math.exp(-d / 2)) / SQRT_2PI;
}

/* Φ from the upper tail Q(|z|), for methods that compute the tail */
const fromTail = (z, tail) => (z < 0 ? tail : 1 - tail);

/* =====================================================
 * 1. NUMERICAL INTEGRATION OF φ ON [0, |z|]
 * =====================================================
 * Φ(z) = ½ ± ∫₀^|z| φ(t) dt, with the composite rules of
 * Homework 5.1. Absolute error O(h²) and O(h⁴); for z ≪ 0 the
 * subtraction ½ − ∫ cancels and the relative error is large.
 */

export function trapezoidCdf(z, N = 100) {
  if (z === 0) return { value: 0.5, cost: 0 };
  const r = trapezoid(density, 0, Math.abs(z), N);
  return { value: z > 0 ? 0.5 + r.value : 0.5 - r.value, cost: r.evaluations };
}

export function simpsonCdf(z, N = 100) {
  if (z === 0) return { value: 0.5, cost: 0 };
  const r = simpson(density, 0, Math.abs(z), N);
  return { value: z > 0 ? 0.5 + r.value : 0.5 - r.value, cost: r.evaluations };
}

/* =====================================================
 * 2. SERIES
 * =====================================================
 * Taylor series of erf, in the form of the course notes
 * (Hogg–McKean–Craig, section 3.4):
 *
 *   Φ(z) = ½ + (1/√(2π)) Σ (−1)^k z^{2k+1} / (2^k (2k+1) k!)
 *
 * It converges for every z, but its terms alternate in sign and
 * grow up to about e^{z²/2} before decreasing: their sum, of size
 * at most ½, is the difference of huge numbers. About
 * 0.22·z² decimal digits are lost to cancellation.
 */

const MAX_TERMS = 2000;

export function taylorCdf(z) {
  let a = z;                     // a_k = (−1)^k z^{2k+1} / (2^k k!)
  let sum = z;                   // Σ a_k / (2k + 1)
  let k = 0;

  while (k < MAX_TERMS) {
    k++;
    a *= -(z * z) / (2 * k);
    const term = a / (2 * k + 1);
    sum += term;
    if (!Number.isFinite(sum)) return { value: NaN, cost: k + 1 };
    if (Math.abs(term) <= 1e-17 * Math.abs(sum)) break;
  }

  return { value: 0.5 + sum / SQRT_2PI, cost: k + 1 };
}

/** Φ after 1, 2, …, K terms of the Taylor series (for the charts). */
export function taylorPartialSums(z, K) {
  const out = [];
  let a = z;
  let sum = z;
  out.push(0.5 + sum / SQRT_2PI);

  for (let k = 1; k < K; k++) {
    a *= -(z * z) / (2 * k);
    sum += a / (2 * k + 1);
    out.push(0.5 + sum / SQRT_2PI);
  }

  return out;
}

/*
 * The same function written with positive terms only
 * (Marsaglia, 2004):
 *
 *   Φ(z) = ½ + φ(z) · (z + z³/3 + z⁵/(3·5) + z⁷/(3·5·7) + …)
 *
 * No cancellation inside the sum. For z < 0 the result ½ − φ·S is
 * still a difference, and loses accuracy in the far left tail.
 */
export function positiveSeriesCdf(z) {
  let b = z;
  let sum = z;
  let k = 0;

  while (k < MAX_TERMS) {
    k++;
    b *= (z * z) / (2 * k + 1);
    sum += b;
    if (Math.abs(b) <= 1e-17 * Math.abs(sum)) break;
  }

  return { value: 0.5 + accurateDensity(z) * sum, cost: k + 1 };
}

/* =====================================================
 * 3. LAPLACE'S CONTINUED FRACTION FOR THE TAIL
 * =====================================================
 *
 *   Q(x) = φ(x) / (x + 1/(x + 2/(x + 3/(x + …))))     x > 0
 *
 * Evaluated with the modified Lentz algorithm, stopping when a
 * step changes the value by less than one unit in 10¹⁶. Fast for
 * large x (about 14 steps at x = 8), very slow near 0.
 */

const MAX_STEPS = 5000;
const TINY = 1e-300;

export function tailContinuedFraction(x) {
  let f = x;
  let C = x;
  let D = 0;
  let k = 0;

  while (k < MAX_STEPS) {
    k++;
    D = x + k * D;
    if (D === 0) D = TINY;
    C = x + k / C;
    if (C === 0) C = TINY;
    D = 1 / D;
    const delta = C * D;
    f *= delta;
    if (Math.abs(delta - 1) < 1e-16) break;
  }

  return { tail: accurateDensity(x) / f, cost: k };
}

export function continuedFractionCdf(z) {
  if (z === 0) return { value: NaN, cost: 0 };      // the fraction needs x > 0
  const { tail, cost } = tailContinuedFraction(Math.abs(z));
  return { value: fromTail(z, tail), cost };
}

/* =====================================================
 * 4. PUBLISHED APPROXIMATIONS
 * ===================================================== */

/*
 * Abramowitz & Stegun 7.1.26 (Hastings): with x = |z|/√2,
 *   erfc(x) ≈ (a₁t + a₂t² + … + a₅t⁵) e^{−x²},  t = 1/(1 + p·x),
 * |error of erf| ≤ 1.5·10⁻⁷.
 */
export function abramowitzStegunCdf(z) {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741
    + t * (-1.453152027 + t * 1.061405429))));
  const tail = 0.5 * poly * Math.exp(-x * x);
  return { value: fromTail(z, tail), cost: 0 };
}

/*
 * The approximation already used by Homework 3 (hmw4/statistics.js):
 * erfc from Numerical Recipes, a Chebyshev fit of
 * erfc(x)·e^{x²}, relative error below 1.2·10⁻⁷.
 */
export function numericalRecipesCdf(z) {
  return { value: numericalRecipesErfcCdf(z), cost: 0 };
}

/*
 * Hart (1968), algorithm 5666, as published by G. West,
 * "Better approximations to cumulative normal functions" (2005):
 * a ratio of two polynomials times e^{−z²/2} for |z| < 7.07, a short
 * continued fraction beyond. Designed for double precision in
 * absolute terms.
 */
export function hartWestCdf(z) {
  const x = Math.abs(z);
  let tail;

  if (x > 37) {
    tail = 0;
  } else {
    const e = Math.exp(-(x * x) / 2);

    if (x < 7.07106781186547) {
      let num = 3.52624965998911e-2 * x + 0.700383064443688;
      num = num * x + 6.37396220353165;
      num = num * x + 33.912866078383;
      num = num * x + 112.079291497871;
      num = num * x + 221.213596169931;
      num = num * x + 220.206867912376;

      let den = 8.83883476483184e-2 * x + 1.75566716318264;
      den = den * x + 16.064177579207;
      den = den * x + 86.7807322029461;
      den = den * x + 296.564248779674;
      den = den * x + 637.333633378831;
      den = den * x + 793.826512519948;
      den = den * x + 440.413735824752;

      tail = (e * num) / den;
    } else {
      let b = x + 0.65;
      b = x + 4 / b;
      b = x + 3 / b;
      b = x + 2 / b;
      b = x + 1 / b;
      tail = e / b / 2.506628274631;
    }
  }

  return { value: fromTail(z, tail), cost: 0 };
}

/* =====================================================
 * 5. OUR METHOD: SERIES + CONTINUED FRACTION
 * =====================================================
 * |z| < 2: the positive series, which needs at most 25 terms
 *          and loses at most about one digit for z > −2.
 * |z| ≥ 2: the continued fraction for the tail, which needs at
 *          most about 100 steps and keeps full relative accuracy
 *          however small Q is.
 */
export const HYBRID_SWITCH = 2;

export function hybridCdf(z) {
  if (Number.isNaN(z)) return { value: NaN, cost: 0 };
  if (Math.abs(z) < HYBRID_SWITCH) return positiveSeriesCdf(z);
  if (!Number.isFinite(z)) return { value: z > 0 ? 1 : 0, cost: 0 };

  const { tail, cost } = tailContinuedFraction(Math.abs(z));
  return { value: fromTail(z, tail), cost };
}

/* =====================================================
 * 6. CATALOG
 * ===================================================== */

export const METHODS = [
  { id: 'trapezoid', label: 'Trapezoidal rule (N = 100)', family: 'Integration', compute: z => trapezoidCdf(z), costUnit: 'φ evals' },
  { id: 'simpson', label: 'Simpson rule (N = 100)', family: 'Integration', compute: z => simpsonCdf(z), costUnit: 'φ evals' },
  { id: 'taylor', label: 'Taylor series of erf', family: 'Series', compute: taylorCdf, costUnit: 'terms' },
  { id: 'positive', label: 'Positive series (Marsaglia)', family: 'Series', compute: positiveSeriesCdf, costUnit: 'terms' },
  { id: 'fraction', label: 'Laplace continued fraction', family: 'Continued fraction', compute: continuedFractionCdf, costUnit: 'steps' },
  { id: 'as7126', label: 'Abramowitz–Stegun 7.1.26', family: 'Approximation of erf', compute: abramowitzStegunCdf, costUnit: 'fixed' },
  { id: 'nr', label: 'Numerical Recipes erfc (Homework 3)', family: 'Approximation of erf', compute: numericalRecipesCdf, costUnit: 'fixed' },
  { id: 'west', label: 'Hart 5666 / West', family: 'Rational approximation', compute: hartWestCdf, costUnit: 'fixed' },
  { id: 'hybrid', label: 'Series + continued fraction (ours)', family: 'Hybrid', compute: hybridCdf, costUnit: 'terms or steps', costUnitAt: z => (Math.abs(z) < HYBRID_SWITCH ? 'terms' : 'steps') }
];

export const getMethod = id => METHODS.find(m => m.id === id);
