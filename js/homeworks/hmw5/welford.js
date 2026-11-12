/*
 * Statistics-Lab — Homework 4.1 (internal folder: hmw5)
 * Knuth's and Welford's recurrence formulas
 *
 * For data x_1, x_2, ..., x_k we keep, after every new value,
 *
 *   M_k  = mean of the first k values
 *   SS_k = sum of squared deviations from M_k
 *        = Σ_{i ≤ k} (x_i − M_k)²
 *
 * and update them with one pass and constant memory:
 *
 *   Knuth:    M_k  = M_{k−1} + (x_k − M_{k−1}) / k
 *   Welford:  SS_k = SS_{k−1} + (x_k − M_{k−1}) (x_k − M_k)
 *
 * Sample variance s²_k = SS_k / (k − 1)   (k ≥ 2, unbiased)
 * Population variance  = SS_k / k
 *
 * The two-pass and the naive one-pass formulas are included only
 * as references, to verify Welford's result and to show why it is
 * preferred in floating-point arithmetic.
 */

/* =====================================================
 * 1. WELFORD ACCUMULATOR
 * ===================================================== */

/**
 * Creates an empty accumulator.
 * @returns {{ count: number, mean: number, ss: number }}
 */
export function createAccumulator() {
  return { count: 0, mean: 0, ss: 0 };
}

/**
 * Adds one value. The core of the algorithm is three lines:
 * the deviation from the OLD mean, the new mean (Knuth), and
 * the new sum of squares (Welford), which multiplies the
 * deviation from the old mean by the deviation from the new one.
 *
 * @param {{ count: number, mean: number, ss: number }} acc
 * @param {number} x
 * @returns {object} The same accumulator, updated.
 */
export function addValue(acc, x) {
  acc.count += 1;

  const delta = x - acc.mean;          // x_k − M_{k−1}
  acc.mean += delta / acc.count;       // M_k  (Knuth)
  acc.ss += delta * (x - acc.mean);    // SS_k (Welford)

  return acc;
}

/** Sample variance s² = SS / (k − 1); null when k < 2. */
export function sampleVariance(acc) {
  return acc.count >= 2 ? acc.ss / (acc.count - 1) : null;
}

/** Population variance SS / k; null when k = 0. */
export function populationVariance(acc) {
  return acc.count >= 1 ? acc.ss / acc.count : null;
}

/**
 * Runs Welford on a whole array.
 * @param {ArrayLike<number>} values
 * @returns {{ count, mean, ss, sampleVariance, populationVariance }}
 */
export function welfordSummary(values) {
  const acc = createAccumulator();
  for (const x of values) addValue(acc, x);
  return {
    count: acc.count,
    mean: acc.mean,
    ss: acc.ss,
    sampleVariance: sampleVariance(acc),
    populationVariance: populationVariance(acc)
  };
}

/**
 * Every intermediate state, for the step-by-step table.
 * Also reports the direct recurrence for the sample variance,
 *
 *   s²_k = (k − 2)/(k − 1) · s²_{k−1} + (x_k − M_{k−1})² / k,
 *
 * computed independently from SS, so the two forms can be compared.
 */
export function welfordSteps(values) {
  const acc = createAccumulator();
  const steps = [];
  let directVariance = null;

  for (const x of values) {
    const previousMean = acc.mean;
    addValue(acc, x);

    const k = acc.count;
    const delta = x - previousMean;

    if (k === 2) {
      directVariance = delta * delta / 2;
    } else if (k > 2) {
      directVariance = (k - 2) / (k - 1) * directVariance + delta * delta / k;
    }

    steps.push({
      k,
      x,
      previousMean: k === 1 ? null : previousMean,
      delta: k === 1 ? null : delta,
      mean: acc.mean,
      ss: acc.ss,
      sampleVariance: sampleVariance(acc),
      directVariance: k >= 2 ? directVariance : null
    });
  }

  return steps;
}

/* =====================================================
 * 2. REFERENCE METHODS
 * ===================================================== */

/** Two passes: first the mean, then Σ (x − mean)². Exact but stores all data. */
export function twoPassSummary(values) {
  const n = values.length;
  let sum = 0;
  for (const x of values) sum += x;
  const mean = sum / n;

  let ss = 0;
  for (const x of values) ss += (x - mean) ** 2;

  return {
    count: n,
    mean,
    ss,
    sampleVariance: n >= 2 ? ss / (n - 1) : null
  };
}

/**
 * Naive one pass: SS = Σx² − (Σx)² / n. Algebraically correct,
 * numerically fragile: when the values share a large offset, Σx²
 * and (Σx)²/n are huge, nearly equal numbers, and subtracting
 * them cancels most of the significant digits.
 */
export function naiveSummary(values) {
  const n = values.length;
  let sum = 0;
  let sumSquares = 0;
  for (const x of values) {
    sum += x;
    sumSquares += x * x;
  }
  const ss = sumSquares - sum * sum / n;

  return {
    count: n,
    mean: sum / n,
    ss,
    sampleVariance: n >= 2 ? ss / (n - 1) : null
  };
}
