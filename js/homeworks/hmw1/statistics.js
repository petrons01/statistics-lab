
// HMW 1 — Statistical exploration of the toy elliptic curve.
// Uses the ECC implementation from Step 2; no external libraries.

import {
  BASE_POINT,
  CURVE,
  isOnCurve,
  pointAdd,
  scalarMultiply
} from './ecc.js';

export const STAT_BASE_POINTS = Object.freeze([
  { label: 'G = (1, 5)', point: { x: 1, y: 5 } },
  { label: "G′ = (2, 10) = 2G", point: { x: 2, y: 10 } }
]);

// Values 0..16 need five bits.
export const COORDINATE_BITS = Math.ceil(Math.log2(CURVE.p));

const pointId = point =>
  point === null ? 'O' : `${point.x},${point.y}`;

const popcount = value =>
  value.toString(2).replace(/0/g, '').length;


// Computes the order of a base point.
function pointOrder(basePoint) {
  let result = null;

  for (let i = 1; i <= CURVE.p * 4; i++) {
    result = pointAdd(result, basePoint);

    if (result === null) return i;
  }

  throw new Error('Could not determine point order');
}


// Computes Pearson's correlation coefficient.
// Returns null when correlation is undefined.
function pearson(pairs) {
  if (pairs.length < 2) return null;

  const meanX = pairs.reduce(
    (sum, pair) => sum + pair[0], 0
  ) / pairs.length;

  const meanY = pairs.reduce(
    (sum, pair) => sum + pair[1], 0
  ) / pairs.length;

  const numerator = pairs.reduce(
    (sum, [x, y]) =>
      sum + (x - meanX) * (y - meanY), 0
  );

  const dx = Math.sqrt(pairs.reduce(
    (sum, [x]) => sum + (x - meanX) ** 2, 0
  ));

  const dy = Math.sqrt(pairs.reduce(
    (sum, [, y]) => sum + (y - meanY) ** 2, 0
  ));

  return dx === 0 || dy === 0
    ? null
    : numerator / (dx * dy);
}


// Main statistical analysis.
export function analyzeMultiples(
  count = 8,
  basePoint = BASE_POINT
) {
  if (
    !Number.isSafeInteger(count) ||
    count < 1 ||
    count > 36
  ) {
    throw new RangeError(
      'Sample count must be between 1 and 36'
    );
  }

  if (basePoint === null || !isOnCurve(basePoint)) {
    throw new RangeError(
      'Base point must be a finite point on the curve'
    );
  }

  const order = pointOrder(basePoint);

  // Generate kG for k = 1,...,count.
  const sample = Array.from(
    { length: count },
    (_, i) => ({
      k: i + 1,
      point: scalarMultiply(i + 1, basePoint)
    })
  );

  // Only finite points have affine x,y coordinates.
  const finite = sample.filter(
    item => item.point !== null
  );

  // Include all subgroup points, even if not observed.
  const rows = Array.from(
    { length: order },
    (_, k) => ({
      point: scalarMultiply(k, basePoint),
      count: 0
    })
  );

  const frequencies = new Map(
    rows.map(row => [pointId(row.point), row])
  );

  sample.forEach(({ point }) => {
    frequencies.get(pointId(point)).count++;
  });

  // Coordinate frequencies for values 0,...,16.
  const xFrequency = Array(CURVE.p).fill(0);
  const yFrequency = Array(CURVE.p).fill(0);

  // Number of ones at each position, MSB first.
  const xOnes = Array(COORDINATE_BITS).fill(0);
  const yOnes = Array(COORDINATE_BITS).fill(0);

  for (const { point } of finite) {
    xFrequency[point.x]++;
    yFrequency[point.y]++;

    for (let bit = 0; bit < COORDINATE_BITS; bit++) {
      const shift = COORDINATE_BITS - 1 - bit;

      xOnes[bit] += (point.x >> shift) & 1;
      yOnes[bit] += (point.y >> shift) & 1;
    }
  }

  // Hamming distance between kG and (k+1)G.
  const comparisons = [];

  for (let i = 1; i < sample.length; i++) {
    const previous = sample[i - 1];
    const current = sample[i];

    // The point at infinity has no coordinate bits.
    if (
      previous.point === null ||
      current.point === null
    ) {
      continue;
    }

    comparisons.push({
      from: previous.k,
      to: current.k,
      bitsChanged:
        popcount(previous.point.x ^ current.point.x) +
        popcount(previous.point.y ^ current.point.y)
    });
  }

  const averageHamming = comparisons.length
    ? comparisons.reduce(
        (sum, item) => sum + item.bitsChanged, 0
      ) / comparisons.length
    : null;

  // Empirical Shannon entropy of point frequencies.
  const entropy = rows.reduce((sum, row) => {
    if (!row.count) return sum;

    const probability = row.count / count;

    return sum -
      probability * Math.log2(probability);
  }, 0);

  return {
    order,
    count,
    sample,
    finiteCount: finite.length,
    infinityCount: count - finite.length,
    distinctCount: rows.filter(
      row => row.count > 0
    ).length,

    pointFrequencies: rows,
    xFrequency,
    yFrequency,
    xOnes,
    yOnes,

    entropy,
    maximumEntropy: Math.log2(order),

    correlationX: pearson(
      finite.map(({ k, point }) => [k, point.x])
    ),

    correlationY: pearson(
      finite.map(({ k, point }) => [k, point.y])
    ),

    comparisons,
    averageHamming
  };
}
