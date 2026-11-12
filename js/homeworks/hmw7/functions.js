/*
 * Statistics-Lab — Homework 5.1 (internal folder: hmw7)
 * The test functions
 *
 * The seven functions of the assignment, each with:
 *   - its domain [a, b] and exact integral, used to measure errors;
 *   - its supremum (Infinity for 1/√x, which is unbounded);
 *   - its monotone pieces, used by the Lebesgue method to find
 *     the preimages {x : f(x) > t} by bisection (lebesgue.js);
 *   - the exact measure of {f > t} where a closed form exists,
 *     used only to test the bisection (never by the methods).
 *
 * All functions are non-negative on their domain, so the levels
 * of the Lebesgue partition start at 0.
 */

const PI = Math.PI;

/* Si(π) = ∫₀^π sin(x)/x dx, computed with mpmath at 40 digits. */
const SI_PI = 1.8519370519824661;

export const FUNCTIONS = [
  {
    id: 'sin',
    label: 'sin(x) on [0, π]',
    formula: 'f(x) = sin x',
    domain: '[0, π]',
    a: 0,
    b: PI,
    f: x => Math.sin(x),
    exact: 2,
    exactLabel: '2',
    sup: 1,
    pieces: [
      { from: 0, to: PI / 2, trend: 'increasing' },
      { from: PI / 2, to: PI, trend: 'decreasing' }
    ],
    measureAbove: t => (t < 0 ? PI : t < 1 ? PI - 2 * Math.asin(t) : 0),
    xTicks: [[0, '0'], [PI / 2, 'π/2'], [PI, 'π']],
    note: 'Smooth: every method converges to 2.'
  },
  {
    id: 'square',
    label: 'x² on [0, 1]',
    formula: 'f(x) = x²',
    domain: '[0, 1]',
    a: 0,
    b: 1,
    f: x => x * x,
    exact: 1 / 3,
    exactLabel: '1/3',
    sup: 1,
    pieces: [{ from: 0, to: 1, trend: 'increasing' }],
    measureAbove: t => (t < 0 ? 1 : t < 1 ? 1 - Math.sqrt(t) : 0),
    note: 'Smooth and increasing.'
  },
  {
    id: 'step13',
    label: 'Step 1 → 3 on [0, 1]',
    formula: 'f(x) = 1 for x < ½, 3 for x ≥ ½',
    domain: '[0, 1]',
    a: 0,
    b: 1,
    f: x => (x < 0.5 ? 1 : 3),
    exact: 2,
    exactLabel: '2',
    sup: 3,
    breaks: [0.5],
    pieces: [
      { from: 0, to: 0.5, trend: 'constant' },
      { from: 0.5, to: 1, trend: 'constant' }
    ],
    measureAbove: t => (t < 1 ? 1 : t < 3 ? 0.5 : 0),
    note: 'A simple function: two values, one jump.'
  },
  {
    id: 'abs',
    label: '|x − ½| on [0, 1]',
    formula: 'f(x) = |x − ½|',
    domain: '[0, 1]',
    a: 0,
    b: 1,
    f: x => Math.abs(x - 0.5),
    exact: 0.25,
    exactLabel: '1/4',
    sup: 0.5,
    pieces: [
      { from: 0, to: 0.5, trend: 'decreasing' },
      { from: 0.5, to: 1, trend: 'increasing' }
    ],
    measureAbove: t => (t < 0 ? 1 : t < 0.5 ? 1 - 2 * t : 0),
    note: 'Continuous, with a corner at x = ½.'
  },
  {
    id: 'invsqrt',
    label: '1/√x on (0, 1]',
    formula: 'f(x) = 1/√x',
    domain: '(0, 1]',
    a: 0,
    b: 1,
    f: x => 1 / Math.sqrt(x),        // f(0) = Infinity
    exact: 2,
    exactLabel: '2',
    sup: Infinity,
    pieces: [{ from: 0, to: 1, trend: 'decreasing' }],
    measureAbove: t => (t < 1 ? 1 : 1 / (t * t)),
    note: 'Unbounded near 0: not Riemann integrable in the proper sense.'
  },
  {
    id: 'step10',
    label: 'Step 1 → 0 on [0, 1]',
    formula: 'f(x) = 1 for x < ½, 0 for x ≥ ½',
    domain: '[0, 1]',
    a: 0,
    b: 1,
    f: x => (x < 0.5 ? 1 : 0),
    exact: 0.5,
    exactLabel: '1/2',
    sup: 1,
    breaks: [0.5],
    pieces: [
      { from: 0, to: 0.5, trend: 'constant' },
      { from: 0.5, to: 1, trend: 'constant' }
    ],
    measureAbove: t => (t < 0 ? 1 : t < 1 ? 0.5 : 0),
    note: 'An indicator function: the area is the measure of [0, ½).'
  },
  {
    id: 'sinc',
    label: 'sin(x)/x on [0, π]',
    formula: 'f(x) = sin(x)/x, f(0) = 1',
    domain: '[0, π]',
    a: 0,
    b: PI,
    f: x => (x === 0 ? 1 : Math.sin(x) / x),
    exact: SI_PI,
    exactLabel: 'Si(π) ≈ 1.8519371',
    sup: 1,
    pieces: [{ from: 0, to: PI, trend: 'decreasing' }],
    measureAbove: null,               // no closed form: inverse of sin(x)/x
    xTicks: [[0, '0'], [PI / 2, 'π/2'], [PI, 'π']],
    note: 'No elementary antiderivative: the exact value is the sine integral Si(π).'
  }
];

export const DEFAULT_FUNCTION = 'sin';

export function getFunction(id) {
  return FUNCTIONS.find(fn => fn.id === id) ?? FUNCTIONS[0];
}

/*
 * Highest level of the Lebesgue partition with M layers.
 * Bounded f: its supremum. Unbounded f (1/√x): the levels stop at
 * T = M^(2/3), i.e. we integrate the truncated function min(f, T)
 * (monotone convergence: ∫ min(f, T) → ∫ f as T → ∞). For 1/√x the
 * part lost above T is 1/T, and the layer error grows like (T/M)²:
 * T = M^(2/3) balances the two.
 */
export function topLevel(fn, M) {
  return Number.isFinite(fn.sup) ? fn.sup : Math.cbrt(M * M);
}
