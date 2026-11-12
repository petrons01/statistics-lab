/*
 * Statistics-Lab — Homework 5.1 (internal folder: hmw7)
 * Riemann-type rules: partition the DOMAIN
 *
 * [a, b] is cut into N subintervals of width h = (b − a)/N.
 * On each one, f is evaluated at a tag point and the rectangle
 * (or trapezoid) areas are added up.
 *
 * Every rule returns { value, evaluations }: the number of
 * evaluations of f is the cost used in the efficiency comparison.
 *
 * Homework 5.2 imports trapezoid() and simpson() to integrate the
 * normal density.
 */

/* Position of the tag inside each subinterval */
const TAG_OFFSET = { left: 0, midpoint: 0.5, right: 1 };

export const RIEMANN_RULES = [
  { id: 'left', label: 'Left endpoint' },
  { id: 'midpoint', label: 'Midpoint' },
  { id: 'right', label: 'Right endpoint' }
];

/*
 * Tag point x_i* = a + (i + offset)·h, computed as
 * a + (i + offset)·(b − a)/N with the division last, so that
 * points such as 1/2 come out exactly when they are on the grid.
 */
const tag = (a, b, N, i, offset) => a + ((i + offset) * (b - a)) / N;

/** Tag points for i = 0 … N − 1 (used for drawing). */
export function riemannTags(a, b, N, rule = 'midpoint') {
  const offset = TAG_OFFSET[rule];
  return Array.from({ length: N }, (_, i) => tag(a, b, N, i, offset));
}

/** Riemann sum Σ f(x_i*)·h with left, midpoint or right tags. */
export function riemannSum(f, a, b, N, rule = 'midpoint') {
  const h = (b - a) / N;
  const offset = TAG_OFFSET[rule];
  let sum = 0;

  for (let i = 0; i < N; i++) {
    sum += f(tag(a, b, N, i, offset));
  }

  return { value: sum * h, evaluations: N };
}

/** Composite trapezoidal rule: h·[f(x₀)/2 + f(x₁) + … + f(x_N)/2]. */
export function trapezoid(f, a, b, N) {
  const h = (b - a) / N;
  let sum = (f(a) + f(b)) / 2;

  for (let i = 1; i < N; i++) {
    sum += f(tag(a, b, N, i, 0));
  }

  return { value: sum * h, evaluations: N + 1 };
}

/**
 * Composite Simpson rule (N even; an odd N is raised by one):
 * (h/3)·[f(x₀) + 4f(x₁) + 2f(x₂) + 4f(x₃) + … + f(x_N)].
 */
export function simpson(f, a, b, N) {
  const n = N % 2 === 0 ? N : N + 1;
  const h = (b - a) / n;
  let sum = f(a) + f(b);

  for (let i = 1; i < n; i++) {
    sum += (i % 2 === 1 ? 4 : 2) * f(tag(a, b, n, i, 0));
  }

  return { value: (sum * h) / 3, evaluations: n + 1 };
}
