
// ======================================================
// HMW 1 - Elliptic Curve Cryptography
// Toy curve: y² = x³ + 7 (mod 17)
//
// Educational implementation only.
// NOT suitable for real cryptographic applications.
// ======================================================

// 1. CURVE PARAMETERS

export const CURVE = Object.freeze({
  p: 17,
  a: 0,
  b: 7
});

export const BASE_POINT = Object.freeze({
  x: 1,
  y: 5
});


// 2. MODULAR ARITHMETIC

// Returns a value between 0 and p-1,
// including when the input is negative.
export function mod(n, p = CURVE.p) {
  if (
    !Number.isSafeInteger(n) ||
    !Number.isSafeInteger(p) ||
    p < 2
  ) {
    throw new TypeError("Invalid modular arithmetic input");
  }

  return ((n % p) + p) % p;
}


// 3. MODULAR MULTIPLICATIVE INVERSE

// Uses the Extended Euclidean Algorithm.
// Finds x such that (a * x) mod p = 1.
export function modInverse(a, p = CURVE.p) {
  let r0 = p;
  let r1 = mod(a, p);

  let t0 = 0;
  let t1 = 1;

  while (r1 !== 0) {
    const q = Math.floor(r0 / r1);

    [r0, r1] = [r1, r0 - q * r1];
    [t0, t1] = [t1, t0 - q * t1];
  }

  if (r0 !== 1) {
    throw new RangeError(
      `${a} has no inverse modulo ${p}`
    );
  }

  return mod(t0, p);
}


// 4. POINT VALIDATION

// null represents the point at infinity (O).
// The point at infinity is the identity element
// of the elliptic-curve group.
export function isOnCurve(point) {
  if (point === null) {
    return true;
  }

  if (
    typeof point !== "object" ||
    !Number.isSafeInteger(point.x) ||
    !Number.isSafeInteger(point.y) ||
    point.x < 0 ||
    point.x >= CURVE.p ||
    point.y < 0 ||
    point.y >= CURVE.p
  ) {
    return false;
  }

  const { x, y } = point;

  const left = mod(y * y);

  const right = mod(
    x * x * x + CURVE.a * x + CURVE.b
  );

  return left === right;
}


// 5. ELLIPTIC-CURVE POINT ADDITION

// Computes P + Q on the toy curve.
export function pointAdd(P, Q) {
  if (!isOnCurve(P) || !isOnCurve(Q)) {
    throw new RangeError(
      "Both points must belong to the curve"
    );
  }

  // Identity element: P + O = P
  if (P === null) return Q;
  if (Q === null) return P;

  // Opposite points: P + (-P) = O
  // Also handles doubling when y = 0.
  if (
    P.x === Q.x &&
    mod(P.y + Q.y) === 0
  ) {
    return null;
  }

  let slope;

  if (P.x === Q.x && P.y === Q.y) {
    // Point doubling: P + P
    // slope = (3*x² + a) / (2*y) mod p

    const numerator =
      3 * P.x * P.x + CURVE.a;

    const denominator =
      modInverse(2 * P.y);

    slope = mod(numerator * denominator);

  } else {
    // Addition of two different points
    // slope = (y2-y1) / (x2-x1) mod p

    const numerator = Q.y - P.y;

    const denominator =
      modInverse(Q.x - P.x);

    slope = mod(numerator * denominator);
  }

  // Result coordinates
  const x3 = mod(
    slope * slope - P.x - Q.x
  );

  const y3 = mod(
    slope * (P.x - x3) - P.y
  );

  return {
    x: x3,
    y: y3
  };
}


// 6. SCALAR MULTIPLICATION

// Computes kG using the double-and-add algorithm.
// More efficient than performing k-1 additions.
export function scalarMultiply(k, G = BASE_POINT) {
  if (!Number.isSafeInteger(k) || k < 0) {
    throw new RangeError(
      "Private key must be a non-negative integer"
    );
  }

  if (!isOnCurve(G)) {
    throw new RangeError("Invalid base point");
  }

  let result = null; // Point at infinity
  let addend = G;
  let n = k;

  while (n > 0) {
    // If the current binary digit is 1,
    // add the corresponding point.
    if (n % 2 === 1) {
      result = pointAdd(result, addend);
    }

    // Double the point.
    addend = pointAdd(addend, addend);

    // Move to the next binary digit.
    n = Math.floor(n / 2);
  }

  return result;
}


// 7. STEP-BY-STEP MULTIPLICATION

// Generates G, 2G, 3G, ..., count*G.
// Useful for the future visualization.
export function generateMultiples(
  count,
  G = BASE_POINT
) {
  if (
    !Number.isSafeInteger(count) ||
    count < 0
  ) {
    throw new RangeError(
      "Count must be a non-negative integer"
    );
  }

  if (!isOnCurve(G)) {
    throw new RangeError("Invalid base point");
  }

  const steps = [];
  let current = null;

  for (let k = 1; k <= count; k++) {
    current = pointAdd(current, G);

    steps.push({
      k: k,
      point: current
    });
  }

  return steps;
}
