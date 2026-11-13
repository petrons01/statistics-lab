/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * The chi-square distribution: density, upper tail (p-value), quantiles
 *
 * If Z_1, …, Z_k are independent N(0, 1), Z_1² + … + Z_k² has the
 * chi-square distribution with k degrees of freedom, whose density is
 *
 *   f(x) = x^(k/2 − 1) e^(−x/2) / (2^(k/2) Γ(k/2)),   x > 0.
 *
 * Its upper tail is a regularized incomplete gamma function:
 *
 *   P(χ²_k ≥ x) = Q(k/2, x/2),  Q(a, y) = Γ(a, y) / Γ(a).
 *
 * As for Φ in Homework 5.2, the tail is computed directly and in
 * logarithms: p-values of real tables reach 10⁻²⁵⁰, far below the
 * resolution of 1 − P near 1, and sometimes below the smallest
 * double. Methods: the power series of P for y < a + 1, Legendre's
 * continued fraction for Q beyond (evaluated with Lentz's
 * algorithm), as in Numerical Recipes §6.2.
 */

/* =====================================================
 * 1. LOG-GAMMA (LANCZOS, g = 7, 9 TERMS)
 * ===================================================== */

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028,
  771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
];
const LOG_SQRT_2PI = 0.5 * Math.log(2 * Math.PI);

/** ln Γ(x) for x > 0, relative error about 10⁻¹⁵. */
export function logGamma(x) {
  if (x < 0.5) {
    // Reflection: Γ(x) Γ(1 − x) = π / sin(πx)
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  }
  const z = x - 1;
  let sum = LANCZOS[0];
  for (let i = 1; i < 9; i++) sum += LANCZOS[i] / (z + i);
  const t = z + 7.5;
  return LOG_SQRT_2PI + (z + 0.5) * Math.log(t) - t + Math.log(sum);
}

/* =====================================================
 * 2. REGULARIZED INCOMPLETE GAMMA, IN LOGS
 * ===================================================== */

const EPS = 1e-16;
const TINY = 1e-300;
const MAX_ITER = 10000;

/** ln of the prefactor y^a e^(−y) / Γ(a). */
const logPrefactor = (a, y) => a * Math.log(y) - y - logGamma(a);

/** P(a, y) by its power series (fast for y < a + 1). */
function lowerSeries(a, y) {
  let term = 1 / a;
  let sum = term;
  for (let n = 1; n < MAX_ITER; n++) {
    term *= y / (a + n);
    sum += term;
    if (Math.abs(term) < Math.abs(sum) * EPS) break;
  }
  return Math.exp(logPrefactor(a, y)) * sum;
}

/** ln Q(a, y) by the continued fraction (fast for y ≥ a + 1). */
function logUpperFraction(a, y) {
  let b = y + 1 - a;
  let c = 1 / TINY;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < MAX_ITER; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < TINY) d = TINY;
    c = b + an / c;
    if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < EPS) break;
  }
  return logPrefactor(a, y) + Math.log(h);
}

/** ln Q(a, y), the log of the regularized upper incomplete gamma. */
export function logGammaQ(a, y) {
  if (y <= 0) return 0;              // Q(a, 0) = 1
  if (y < a + 1) return Math.log1p(-lowerSeries(a, y));
  return logUpperFraction(a, y);
}

/* =====================================================
 * 3. THE CHI-SQUARE DISTRIBUTION
 * ===================================================== */

/** Density of χ²_k at x. */
export function chiSquarePdf(x, k) {
  if (x < 0) return 0;
  if (x === 0) return k === 2 ? 0.5 : k < 2 ? Infinity : 0;
  const a = k / 2;
  return Math.exp((a - 1) * Math.log(x) - x / 2 - a * Math.LN2 - logGamma(a));
}

/** Natural log of the p-value P(χ²_k ≥ x). */
export function logChiSquareTail(x, k) {
  return logGammaQ(k / 2, x / 2);
}

/** p-value P(χ²_k ≥ x); 0 only if it is below the smallest double. */
export function chiSquareTail(x, k) {
  return Math.exp(logChiSquareTail(x, k));
}

/** P(χ²_k ≤ x). */
export function chiSquareCdf(x, k) {
  return -Math.expm1(logChiSquareTail(x, k));
}

/**
 * Upper quantile: the x with P(χ²_k ≥ x) = alpha (the critical
 * value of the test at level alpha). Bisection on the log tail,
 * which is decreasing in x: 200 halvings reach full precision.
 */
export function chiSquareQuantile(alpha, k) {
  const target = Math.log(alpha);
  let lo = 0;
  let hi = Math.max(1, k);
  while (logChiSquareTail(hi, k) > target) hi *= 2;
  for (let i = 0; i < 200 && hi - lo > 1e-14 * hi; i++) {
    const mid = (lo + hi) / 2;
    if (logChiSquareTail(mid, k) > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/* =====================================================
 * 4. FORMATTING A p-VALUE
 * ===================================================== */

/**
 * Writes p from its natural log, so that values below the smallest
 * double (about 10⁻³⁰⁸) are still printed: ln p → p = m · 10^e.
 */
export function formatPValue(logP, digits = 3) {
  if (!Number.isFinite(logP)) return logP > 0 ? '1' : '0';
  const p = Math.exp(logP);
  if (p >= 0.001) return p.toFixed(Math.max(digits, 3)).replace(/0+$/, '').replace(/\.$/, '');
  const log10 = logP / Math.LN10;
  let exponent = Math.floor(log10);
  let mantissa = 10 ** (log10 - exponent);
  if (mantissa >= 9.995) { mantissa = 1; exponent += 1; }
  return `${mantissa.toFixed(digits - 1)}·10${superscript(exponent)}`;
}

const SUPERSCRIPTS = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };

export function superscript(value) {
  return String(value).split('').map(ch => SUPERSCRIPTS[ch] ?? ch).join('');
}
