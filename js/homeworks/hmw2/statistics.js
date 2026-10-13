
// HMW 2 - Statistical experiments with public demonstration data.
import { deriveDemoWallet, loadEthers } from './wallet.js';

const POPCOUNT4 = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
const BASE_INPUT = 'Statistics-Lab / HMW2 / avalanche demo';

export function hammingHex(a, b) {
  if (!/^0x(?:[\da-f]{2})+$/i.test(a) || a.length !== b.length ||
      !/^0x(?:[\da-f]{2})+$/i.test(b)) {
    throw new TypeError('Expected two equal-length hexadecimal byte strings');
  }

  let changed = 0;

  for (let i = 2; i < a.length; i++) {
    changed += POPCOUNT4[parseInt(a[i], 16) ^ parseInt(b[i], 16)];
  }

  return changed;
}

// Count 1s at bit positions b7 through b0, pooled across bytes.
function bitPositions(hexStrings) {
  const ones = Array(8).fill(0);
  let totalBytes = 0;

  for (const hex of hexStrings) {
    for (let i = 2; i < hex.length; i += 2) {
      const byte = parseInt(hex.slice(i, i + 2), 16);

      for (let bit = 0; bit < 8; bit++) {
        ones[bit] += (byte >> (7 - bit)) & 1;
      }

      totalBytes++;
    }
  }

  return { ones, totalBytes };
}

function summarizeDistances(values, totalBits) {
  const mean = values.reduce((sum, n) => sum + n, 0) / values.length;

  return {
    values,
    totalBits,
    mean,
    percentage: (mean / totalBits) * 100,
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

// Flip precisely one input bit at a time.
// Compare the resulting hashes against the original hash.
export async function analyzeHashAvalanche(flipCount = 16) {
  if (![8, 16, 32].includes(flipCount)) {
    throw new RangeError('Select 8, 16, or 32 bit flips');
  }

  const { keccak256, sha512 } = await loadEthers();
  const input = new TextEncoder().encode(BASE_INPUT);

  const algorithms = [
    {
      id: 'keccak',
      name: 'Keccak-256',
      hash: keccak256,
      bits: 256
    },
    {
      id: 'sha512',
      name: 'SHA-512 (SHA-2)',
      hash: sha512,
      bits: 512
    }
  ];

  return {
    input: BASE_INPUT,
    flipCount,

    algorithms: algorithms.map(algorithm => {
      const baseline = algorithm.hash(input);
      const samples = [];
      const distances = [];

      for (let bit = 0; bit < flipCount; bit++) {
        const changed = input.slice();

        // Flip exactly one input bit.
        changed[Math.floor(bit / 8)] ^= 1 << (bit % 8);

        const digest = algorithm.hash(changed);

        samples.push(digest);
        distances.push(hammingHex(baseline, digest));
      }

      return {
        id: algorithm.id,
        name: algorithm.name,
        baseline,
        ...summarizeDistances(distances, algorithm.bits),
        ...bitPositions(samples)
      };
    })
  };
}

// Derive only fixed public test accounts.
// Real user mnemonics are not accepted.
export async function analyzeAddresses(
  presetId = 'bip39',
  count = 3
) {
  if (![3, 5].includes(count)) {
    throw new RangeError('Select 3 or 5 derived addresses');
  }

  const rows = [];

  for (let index = 0; index < count; index++) {
    const wallet = await deriveDemoWallet(presetId, index);

    rows.push({
      index,
      path: wallet.path,
      address: wallet.checksummedAddress,
      lowercase: wallet.lowercaseAddress
    });
  }

  const hexStrings = rows.map(row => row.lowercase);

  // Frequency of the hexadecimal digits 0...f.
  const nibbleCounts = Array(16).fill(0);

  for (const hex of hexStrings) {
    for (const char of hex.slice(2)) {
      nibbleCounts[parseInt(char, 16)]++;
    }
  }

  // Compare the 160-bit addresses at adjacent indices.
  const comparisons = [];

  for (let i = 1; i < rows.length; i++) {
    comparisons.push({
      from: i - 1,
      to: i,
      changedBits: hammingHex(
        rows[i - 1].lowercase,
        rows[i].lowercase
      )
    });
  }

  return {
    count,
    rows,
    nibbleCounts,
    ...bitPositions(hexStrings),
    comparisons,

    averageHamming:
      comparisons.reduce(
        (sum, comparison) => sum + comparison.changedBits,
        0
      ) / comparisons.length
  };
}
