/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * Theoretical and empirical statistics
 *
 * Every quantity studied in this homework is an affine
 * transformation of the total score S_n:
 *
 *   Q = (S_n - shift) * scale
 *
 *   total         S_n                 shift = 0,     scale = 1
 *   average       S_n / n             shift = 0,     scale = 1/n
 *   normalized    S_n / sqrt(n)       shift = 0,     scale = 1/sqrt(n)
 *   standardized  (S_n - n mu) /      shift = n mu,  scale = 1/(sigma sqrt(n))
 *                 (sigma sqrt(n))
 *
 * Since E[S_n] = n mu and Var(S_n) = n sigma^2 (i.i.d. increments),
 *
 *   E[Q]   = (n mu - shift) * scale
 *   Var(Q) = n sigma^2 * scale^2
 *
 * so one formula gives the theory for all four quantities.
 * "standardized" is not one of the three required quantities:
 * it is the version that converges to N(0,1) in the Bernoulli case.
 */

/* =====================================================
 * 1. QUANTITIES AND THEORETICAL MOMENTS
 * ===================================================== */

export const QUANTITIES = Object.freeze({
  total: Object.freeze({
    label: 'Total score S_n',
    shift: () => 0,
    scale: () => 1
  }),
  average: Object.freeze({
    label: 'Average score S_n / n',
    shift: () => 0,
    scale: n => 1 / n
  }),
  normalized: Object.freeze({
    label: 'Normalized score S_n / √n',
    shift: () => 0,
    scale: n => 1 / Math.sqrt(n)
  }),
  standardized: Object.freeze({
    label: 'Standardized score (S_n − nμ) / (σ√n)',
    shift: (n, model) => n * model.mean,
    scale: (n, model) => 1 / Math.sqrt(n * model.variance)
  })
});

function getQuantity(name) {
  const quantity = QUANTITIES[name];
  if (!quantity) {
    throw new RangeError(
      `Unknown quantity "${name}". ` +
      `Use one of: ${Object.keys(QUANTITIES).join(', ')}.`
    );
  }
  return quantity;
}

/**
 * Theoretical mean and variance of a quantity at a given n.
 * Returns null for "standardized" when sigma = 0 (p = 0 or 1),
 * because the quantity is not defined.
 */
export function theoreticalMoments(model, n, quantityName) {
  const q = getQuantity(quantityName);
  const scale = q.scale(n, model);

  if (!Number.isFinite(scale)) return null;

  return {
    mean: (n * model.mean - q.shift(n, model)) * scale,
    variance: n * model.variance * scale * scale
  };
}

/**
 * Applies the transformation to every total score S_n.
 * Returns null when the quantity is not defined (sigma = 0).
 */
export function transformTotals(totals, model, n, quantityName) {
  const q = getQuantity(quantityName);
  const shift = q.shift(n, model);
  const scale = q.scale(n, model);

  if (!Number.isFinite(scale)) return null;

  return Float64Array.from(totals, s => (s - shift) * scale);
}

/* =====================================================
 * 2. EMPIRICAL SUMMARY
 * =====================================================
 *
 * Two different variance estimators, never to be mixed:
 *
 *   empirical variance (1/m) Σ (x_j − x̄)²
 *     the variance of the observed sample itself; this is
 *     the one we put next to the theoretical variance.
 *
 *   sample variance (1/(m−1)) Σ (x_j − x̄)²
 *     the unbiased estimator of the population variance.
 *
 * For m = 500 they differ by a factor 500/499 ≈ 1.002.
 */

export function empiricalSummary(values) {
  const m = values.length;

  if (m < 2) {
    throw new RangeError('At least two values are required.');
  }

  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const x of values) {
    sum += x;
    if (x < min) min = x;
    if (x > max) max = x;
  }

  const mean = sum / m;

  // Second pass on deviations: numerically safer than E[X²] − x̄².
  let squares = 0;
  for (const x of values) squares += (x - mean) ** 2;

  return {
    count: m,
    mean,
    empiricalVariance: squares / m,
    sampleVariance: squares / (m - 1),
    standardDeviation: Math.sqrt(squares / m),
    min,
    max
  };
}

/**
 * Theory next to data for one quantity at one n.
 */
export function compareWithTheory(snapshot, model, quantityName) {
  const values = transformTotals(
    snapshot.totals, model, snapshot.n, quantityName
  );

  if (values === null) return null;

  return {
    n: snapshot.n,
    quantity: quantityName,
    theory: theoreticalMoments(model, snapshot.n, quantityName),
    empirical: empiricalSummary(values),
    values
  };
}

/* =====================================================
 * 3. AGGREGATE PENETRATION SCORE
 * =====================================================
 *
 *   T(n, m) = Σ_j S_n^(j)   (sum over the m attackers)
 *
 * T is a sum of n·m i.i.d. increments, therefore
 *
 *   E[T] = m n mu,   Var(T) = m n sigma^2.
 *
 * One simulation gives ONE value of T, so we report how many
 * standard deviations it lies from its expectation (z-score),
 * and the overall rate T / (m n), which by the LLN is close
 * to mu when m n is large.
 */

export function aggregateScore(snapshot, model) {
  const m = snapshot.totals.length;
  const n = snapshot.n;

  let total = 0;
  for (const s of snapshot.totals) total += s;

  const expected = m * n * model.mean;
  const variance = m * n * model.variance;
  const sd = Math.sqrt(variance);

  return {
    n,
    m,
    total,
    expected,
    variance,
    standardDeviation: sd,
    zScore: sd > 0 ? (total - expected) / sd : null,
    ratePerSystem: total / (m * n)
  };
}

/* =====================================================
 * 4. LAW OF LARGE NUMBERS
 * =====================================================
 *
 * For each n we estimate
 *
 *   P( |S_n / n − mu| > eps )
 *
 * as the fraction of attackers whose average score is
 * farther than eps from mu. The LLN says it tends to 0.
 *
 * Two references for the same probability:
 *   - Chebyshev bound   sigma² / (n eps²)   (always valid, loose)
 *   - normal approx.    2 (1 − Φ(eps √n / sigma))   (from the CLT,
 *     an approximation, not a bound)
 */

export function llnExceedance(snapshot, model, epsilon) {
  if (!(epsilon > 0) || !Number.isFinite(epsilon)) {
    throw new RangeError('epsilon must be a positive number.');
  }

  const n = snapshot.n;
  const mu = model.mean;
  const sigma = Math.sqrt(model.variance);

  let outside = 0;
  for (const s of snapshot.totals) {
    if (Math.abs(s / n - mu) > epsilon) outside++;
  }

  return {
    n,
    epsilon,
    outside,
    empiricalProbability: outside / snapshot.totals.length,
    chebyshevBound: Math.min(
      1, model.variance / (n * epsilon * epsilon)
    ),
    normalApproximation: sigma > 0
      ? 2 * (1 - normalCdf(epsilon * Math.sqrt(n) / sigma))
      : 0
  };
}

/* =====================================================
 * 5. STANDARD NORMAL DISTRIBUTION
 * ===================================================== */

/** Density of N(0,1). */
export function normalPdf(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/*
 * Complementary error function, Chebyshev approximation
 * (Numerical Recipes, erfcc). Fractional error < 1.2e-7,
 * far below what a histogram of a few thousand values shows.
 */
function erfc(x) {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);

  const r = t * Math.exp(
    -z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 +
    t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 +
    t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 +
    t * 0.17087277))))))))
  );

  return x >= 0 ? r : 2 - r;
}

/** Cumulative distribution function Φ of N(0,1). */
export function normalCdf(x) {
  return 0.5 * erfc(-x / Math.SQRT2);
}

/* =====================================================
 * 6. KOLMOGOROV–SMIRNOV DISTANCE FROM N(0,1)
 * =====================================================
 *
 *   D = sup_x | F_m(x) − Φ(x) |
 *
 * where F_m is the empirical CDF of the m values.
 * The sup is reached at a data point, either just before
 * or just after the jump of F_m, so we check both sides.
 * Tied values (frequent: our data are discrete) are
 * handled as a single jump.
 *
 * Used as a DESCRIPTIVE distance, not as a formal test:
 * the data are discrete, so D cannot reach 0 for finite n,
 * and it also contains sampling noise of order 1/√m.
 */

export function ksDistanceFromNormal(values) {
  const sorted = Float64Array.from(values).sort();
  const m = sorted.length;

  let distance = 0;
  let location = sorted[0];
  let i = 0;

  while (i < m) {
    const x = sorted[i];
    const before = i / m;

    while (i < m && sorted[i] === x) i++;

    const after = i / m;
    const phi = normalCdf(x);
    const gap = Math.max(Math.abs(after - phi), Math.abs(phi - before));

    if (gap > distance) {
      distance = gap;
      location = x;
    }
  }

  return { distance, location };
}

/* =====================================================
 * 7. HISTOGRAMS ON THE LATTICE
 * =====================================================
 *
 * S_n is discrete: its possible values are
 *
 *   n * a + k * step,   k = 0, 1, ..., n
 *
 * where a is the smallest increment and step the gap between
 * the two increments (Bernoulli: a = 0, step = 1;
 * Rademacher: a = −1, step = 2, so S_n has the parity of n).
 *
 * After a transformation the lattice is rescaled. If bin edges
 * were chosen blindly, some bins would contain one lattice
 * point and others two, producing fake "comb" patterns.
 * We therefore use a bin width that is a multiple of the
 * lattice step and place the edges halfway between lattice
 * points: every bin contains exactly the same number of
 * possible values, and no value can fall on an edge.
 *
 * Bars are reported as density = count / (m · width), so that
 * their total area is 1 and they can be compared with the
 * N(0,1) density.
 */

export function latticeOf(model, n, quantityName) {
  const q = getQuantity(quantityName);
  const scale = q.scale(n, model);

  if (!Number.isFinite(scale)) return null;

  const [low, high] = model.values;
  const rawStep = high - low;
  const firstValue = n * low;

  return {
    step: rawStep * scale,
    firstPoint: (firstValue - q.shift(n, model)) * scale
  };
}

/**
 * Bin width: Freedman–Diaconis rule h = 2 · IQR · m^(−1/3),
 * rounded up to a whole number of lattice steps.
 */
export function suggestBinWidth(values, latticeStep) {
  const sorted = Float64Array.from(values).sort();
  const m = sorted.length;
  const quantile = q => sorted[Math.floor(q * (m - 1))];
  const iqr = quantile(0.75) - quantile(0.25);

  const fd = 2 * iqr * Math.cbrt(1 / m);
  const multiple = Math.max(1, Math.ceil(fd / latticeStep - 1e-9));

  return multiple * latticeStep;
}

/**
 * @param {ArrayLike<number>} values
 * @param {{ step: number, firstPoint: number }} lattice
 * @param {number} [binWidth] Multiple of lattice.step.
 * @returns {{ from, to, center, count, frequency, density }[]}
 */
export function latticeHistogram(values, lattice, binWidth) {
  const step = lattice.step;
  const width = binWidth ?? suggestBinWidth(values, step);
  const multiple = Math.round(width / step);

  if (multiple < 1 || Math.abs(multiple * step - width) > 1e-9 * width) {
    throw new RangeError('binWidth must be a multiple of the lattice step.');
  }

  // Edge origin: halfway below the first lattice point.
  const origin = lattice.firstPoint - step / 2;
  const indexOf = x => Math.floor((x - origin) / width);

  let minIndex = Infinity;
  let maxIndex = -Infinity;
  for (const x of values) {
    const k = indexOf(x);
    if (k < minIndex) minIndex = k;
    if (k > maxIndex) maxIndex = k;
  }

  const counts = new Array(maxIndex - minIndex + 1).fill(0);
  for (const x of values) counts[indexOf(x) - minIndex]++;

  const m = values.length;

  return counts.map((count, i) => {
    const from = origin + (minIndex + i) * width;
    return {
      from,
      to: from + width,
      center: from + width / 2,
      count,
      frequency: count / m,
      density: count / (m * width)
    };
  });
}
