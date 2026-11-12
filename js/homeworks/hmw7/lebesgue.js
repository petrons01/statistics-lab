/*
 * Statistics-Lab — Homework 5.1 (internal folder: hmw7)
 * Lebesgue-type sums: partition the RANGE
 *
 * The range [0, Y] is cut into M layers by the levels
 * y_k = k·Δ, Δ = Y/M (Y = sup f, or a cap T if f is unbounded). For each level we find the preimage
 * {x : f(x) > y_k} and its measure (total length). Then
 *
 *   upper sum  U = Δ·[μ(f > y_0) + … + μ(f > y_{M−1})]
 *   lower sum  L = Δ·[μ(f > y_1) + … + μ(f > y_M)]
 *   mean       (L + U)/2
 *
 * L and U are the integrals of the simple functions that take the
 * value y_{k−1} (resp. y_k) on E_k = {y_{k−1} < f ≤ y_k}, so
 * L ≤ ∫f ≤ U, and U − L = Δ·μ(f > 0) ≤ Δ·(b − a) for EVERY bounded
 * measurable f: the gap closes as M grows, whatever f looks like.
 *
 * The preimages are found from the monotone pieces of f
 * (functions.js): on an increasing piece {f > t} is an interval
 * (c, b], on a decreasing one [a, c), and c is found by bisection.
 */

/* Bisection stops when the bracket is 1e-15 of the piece:
   about 50 evaluations of f per crossing. */
const RELATIVE_TOLERANCE = 1e-15;

/**
 * Point c of a monotone piece where f crosses level t.
 * `inside` is an end where f > t, `outside` one where f ≤ t;
 * the bracket between them is halved until it is negligible.
 */
function bisect(f, inside, outside, t, counter) {
  const tolerance = RELATIVE_TOLERANCE * Math.abs(outside - inside);

  while (Math.abs(outside - inside) > tolerance) {
    const mid = (inside + outside) / 2;
    counter.evaluations++;

    if (f(mid) > t) inside = mid;
    else outside = mid;
  }

  return (inside + outside) / 2;
}

/*
 * Values of f at the ends of each piece, computed once.
 * A constant piece needs a single evaluation, at its midpoint.
 */
function pieceEnds(fn, counter) {
  return fn.pieces.map(piece => {
    if (piece.trend === 'constant') {
      counter.evaluations += 1;
      return { ...piece, value: fn.f((piece.from + piece.to) / 2) };
    }
    counter.evaluations += 2;
    return { ...piece, fFrom: fn.f(piece.from), fTo: fn.f(piece.to) };
  });
}

/**
 * The set {x : f(x) > t} as a list of intervals [from, to],
 * and its measure.
 */
function preimageAbove(fn, pieces, t, counter) {
  const intervals = [];

  for (const p of pieces) {
    if (p.trend === 'constant') {
      if (p.value > t) intervals.push([p.from, p.to]);
      continue;
    }

    if (p.trend === 'increasing') {
      if (p.fTo <= t) continue;                                // nowhere above t
      if (p.fFrom > t) { intervals.push([p.from, p.to]); continue; }
      intervals.push([bisect(fn.f, p.to, p.from, t, counter), p.to]);
    } else {
      if (p.fFrom <= t) continue;
      if (p.fTo > t) { intervals.push([p.from, p.to]); continue; }
      intervals.push([p.from, bisect(fn.f, p.from, p.to, t, counter)]);
    }
  }

  /* Merge touching intervals (e.g. the two halves of sin) */
  const merged = [];
  for (const [from, to] of intervals) {
    const last = merged[merged.length - 1];
    if (last && Math.abs(from - last[1]) < 1e-12) last[1] = to;
    else merged.push([from, to]);
  }

  const measure = merged.reduce((sum, [from, to]) => sum + (to - from), 0);
  return { intervals: merged, measure };
}

/** Exported for the tests and for drawing a single level. */
export function measureAbove(fn, t) {
  const counter = { evaluations: 0 };
  const pieces = pieceEnds(fn, counter);
  return { ...preimageAbove(fn, pieces, t, counter), evaluations: counter.evaluations };
}

/**
 * Lebesgue sums with M layers of equal height on [0, top].
 * With keepIntervals the preimages are returned for drawing.
 */
export function lebesgueSums(fn, M, top, { keepIntervals = false } = {}) {
  const counter = { evaluations: 0 };
  const pieces = pieceEnds(fn, counter);
  const delta = top / M;

  const measures = new Array(M + 1);
  const preimages = keepIntervals ? new Array(M + 1) : null;

  /* y_k = k·top/M, division last: levels such as 1 = 729·3/2187
     are then exact, which matters for step functions */
  for (let k = 0; k < M; k++) {
    const level = preimageAbove(fn, pieces, (k * top) / M, counter);
    measures[k] = level.measure;
    if (keepIntervals) preimages[k] = level.intervals;
  }

  /* Top level: nothing of f (or of min(f, T) when f is unbounded)
     lies above it */
  measures[M] = 0;
  if (keepIntervals) preimages[M] = [];

  let upper = 0;
  for (let k = 0; k < M; k++) upper += measures[k];
  upper *= delta;

  const lower = upper - delta * measures[0];

  return {
    lower,
    upper,
    mean: (lower + upper) / 2,
    top,
    delta,
    measures,
    preimages,
    evaluations: counter.evaluations
  };
}
