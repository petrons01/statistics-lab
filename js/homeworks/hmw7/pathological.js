/*
 * Statistics-Lab — Homework 5.1 (internal folder: hmw7)
 * Pathological functions: Dirichlet and Thomae
 *
 *   Dirichlet  D(x) = 1 if x is rational, 0 otherwise
 *   Thomae     T(x) = 1/q if x = p/q in lowest terms (T(0) = 1),
 *              0 if x is irrational
 *
 * A double is always a rational number m/2^e, so "is x rational?"
 * cannot be asked of a floating-point value. Points are therefore
 * represented exactly: a tag is r + s·√2 with r, s rational, and it
 * is irrational exactly when s ≠ 0. Riemann sums are then computed
 * on these exact tags.
 */

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/* -----------------------------------------------------
 * Exact tags r + s·√2 inside the cell [i/N, (i+1)/N]
 * ----------------------------------------------------- */

/** Rational tag at the midpoint: (2i + 1)/(2N), no √2 part. */
const rationalTag = (i, N) => ({ p: 2 * i + 1, q: 2 * N, sqrt2: 0 });

/**
 * Irrational tag i/N + (√2 − 1)/N = (i − 1)/N + √2/N:
 * inside the cell because 0 < √2 − 1 < 1, irrational because
 * its √2 coefficient 1/N is not 0.
 */
const irrationalTag = (i, N) => ({ p: i - 1, q: N, sqrt2: 1 / N });

const dirichletAt = tag => (tag.sqrt2 === 0 ? 1 : 0);

export function thomaeAtRational(p, q) {
  if (p === 0) return 1;                  // 0 = 0/1
  return gcd(p, q) / q;                   // 1/(q / gcd)
}

const thomaeAt = tag => (tag.sqrt2 === 0 ? thomaeAtRational(tag.p, tag.q) : 0);

/* -----------------------------------------------------
 * Riemann and Darboux sums on [0, 1] with N cells
 * ----------------------------------------------------- */

export function dirichletSums(N) {
  let rational = 0;
  let irrational = 0;

  for (let i = 0; i < N; i++) {
    rational += dirichletAt(rationalTag(i, N));
    irrational += dirichletAt(irrationalTag(i, N));
  }

  return {
    N,
    rationalTags: rational / N,
    irrationalTags: irrational / N,
    upper: 1,     // every cell contains a rational: sup D = 1
    lower: 0,     // and an irrational: inf D = 0
    lebesgue: 0
  };
}

/*
 * Largest value of T on the cell [i/N, (i+1)/N]: 1/q for the
 * smallest q such that some p/q lies in the cell, i.e.
 * ceil(i·q/N) ≤ floor((i+1)·q/N). Integer arithmetic only.
 */
function thomaeSupOnCell(i, N) {
  for (let q = 1; q <= N; q++) {
    const lowest = Math.ceil((i * q) / N);
    const highest = Math.floor(((i + 1) * q) / N);
    if (lowest <= highest) return 1 / q;
  }
  return 1 / N;
}

export function thomaeSums(N) {
  let left = 0;
  let midpoint = 0;
  let irrational = 0;
  let upper = 0;

  for (let i = 0; i < N; i++) {
    left += thomaeAtRational(i, N);
    midpoint += thomaeAt(rationalTag(i, N));
    irrational += thomaeAt(irrationalTag(i, N));
    upper += thomaeSupOnCell(i, N);
  }

  return {
    N,
    left: left / N,
    midpoint: midpoint / N,
    irrationalTags: irrational / N,
    upper: upper / N,
    lower: 0,
    lebesgue: 0
  };
}

export const THOMAE_SIZES = [10, 30, 100, 300, 1000, 3000, 10000];

/* -----------------------------------------------------
 * What a computer actually stores
 * ----------------------------------------------------- */

/** Exact value of a double as a reduced fraction of BigInts. */
export function doubleAsFraction(x) {
  if (!Number.isFinite(x)) return null;
  if (x === 0) return { num: 0n, den: 1n };

  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, x);
  const bits = view.getBigUint64(0);

  const sign = bits >> 63n ? -1n : 1n;
  const exponentBits = Number((bits >> 52n) & 0x7ffn);
  const fraction = bits & 0xfffffffffffffn;

  /* x = mantissa · 2^exponent with an integer mantissa */
  let mantissa = exponentBits === 0 ? fraction : fraction | (1n << 52n);
  let exponent = (exponentBits === 0 ? 1 : exponentBits) - 1075;

  while (mantissa % 2n === 0n && exponent < 0) {
    mantissa /= 2n;
    exponent++;
  }

  return exponent >= 0
    ? { num: sign * mantissa * 2n ** BigInt(exponent), den: 1n }
    : { num: sign * mantissa, den: 2n ** BigInt(-exponent) };
}

function bigGcd(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}

/**
 * Reads "p/q" or a terminating decimal such as "0.1" as an exact
 * fraction (the number the user means, not the double).
 */
export function parseExactRational(text) {
  const s = String(text).trim();

  let match = s.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (match) {
    const num = BigInt(match[1]);
    const den = BigInt(match[2]);
    if (den === 0n) return null;
    const g = bigGcd(num, den) || 1n;
    return { num: num / g, den: den / g };
  }

  match = s.match(/^(-?)(\d*)\.?(\d*)$/);
  if (match && (match[2] || match[3])) {
    const digits = (match[2] || '0') + match[3];
    let num = BigInt(digits) * (match[1] ? -1n : 1n);
    let den = 10n ** BigInt(match[3].length);
    const g = bigGcd(num, den) || 1n;
    return { num: num / g, den: den / g };
  }

  return null;
}

/**
 * Thomae's function of the number typed and of the double that
 * represents it. Inputs are restricted to [0, 1].
 */
export function thomaeOfInput(text) {
  const exact = parseExactRational(text);
  if (!exact) return null;

  const value = Number(exact.num) / Number(exact.den);
  if (!(value >= 0 && value <= 1)) return null;

  const stored = doubleAsFraction(value);

  return {
    exact,
    stored,
    value,
    thomaeExact: exact.num === 0n ? 1 : 1 / Number(exact.den),
    thomaeStored: stored.num === 0n ? 1 : 1 / Number(stored.den),
    storedIsExact: exact.num === stored.num && exact.den === stored.den
  };
}
