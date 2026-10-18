
/*
 * Statistics-Lab — Homework 2
 *
 * Restricted secp256k1 Private-Key Recovery
 *
 * Educational exhaustive-search attack against
 * deliberately weak ECC private keys.
 *
 * The search is strictly restricted to d = 1, ..., 256.
 *
 * For each candidate d:
 *
 *   1. Compute Q_candidate = d * G
 *   2. Compare Q_candidate with the receiver public key
 *   3. Stop when the correct private scalar is found
 *
 * Then decrypt the captured ECC ciphertext package
 * using the recovered private scalar.
 *
 * This does not break properly configured secp256k1.
 */

import {
  loadEthers
} from '../hmw2/wallet.js';

import {
  ECC_DEMO_MAX_KEY,
  ECC_DEMO_SCHEME,
  decryptEccMessage
} from './ecc-encryption.js';


/*
 * =====================================================
 * 1. ATTACK CONFIGURATION
 * =====================================================
 */

export const ECC_ATTACK_MIN_KEY = 1;

export const ECC_ATTACK_MAX_KEY = ECC_DEMO_MAX_KEY;


/*
 * =====================================================
 * 2. SEARCH RANGE VALIDATION
 * =====================================================
 *
 * The educational attacker may inspect a smaller
 * interval, but cannot exceed the demonstration
 * key space.
 */

function validateSearchRange(minKey, maxKey) {

  if (
    !Number.isInteger(minKey) ||
    !Number.isInteger(maxKey) ||
    minKey < ECC_ATTACK_MIN_KEY ||
    maxKey > ECC_ATTACK_MAX_KEY ||
    minKey > maxKey
  ) {

    throw new RangeError(
      `Search range must satisfy ` +
      `1 <= minKey <= maxKey <= ${ECC_ATTACK_MAX_KEY}.`
    );

  }

}


/*
 * =====================================================
 * 3. RESTRICTED KEY-SPACE ATTACK
 * =====================================================
 *
 * Given a captured encrypted package, attempt
 * to recover the recipient's private scalar.
 *
 * The attacker does NOT know the private key.
 * The only required cryptographic information
 * comes from the public ciphertext package.
 *
 * If a matching scalar is found, the function
 * also attempts authenticated decryption.
 */

/**
 * @param {object} packet
 *   Package produced by encryptEccMessage().
 *
 * @param {object} options
 *   Optional bounded search interval.
 *
 * @returns {Promise<object>}
 *   Recovery result, statistics and plaintext.
 */

export async function recoverEccRestrictedKey(

  packet,

  {
    minKey = ECC_ATTACK_MIN_KEY,
    maxKey = ECC_ATTACK_MAX_KEY
  } = {}

) {


  /*
   * STEP 1 — VALIDATE THE SEARCH RANGE
   */

  validateSearchRange(minKey, maxKey);


  /*
   * STEP 2 — VALIDATE THE CAPTURED PACKAGE
   */

  if (
    !packet ||
    typeof packet !== 'object' ||
    packet.scheme !== ECC_DEMO_SCHEME ||
    typeof packet.recipientPublicKey !== 'string' ||
    !/^0x04[0-9a-fA-F]{128}$/.test(
      packet.recipientPublicKey
    )
  ) {

    throw new TypeError(
      'Provide a valid ECC demo ciphertext package.'
    );

  }


  /*
   * STEP 3 — LOAD SECP256K1 SUPPORT
   */

  const ethers = await loadEthers();


  /*
   * Normalize and validate the receiver public key.
   *
   * The attacker knows Q, but does not know d.
   */

  let targetPublicKey;

  try {

    targetPublicKey =
      ethers.SigningKey.computePublicKey(
        packet.recipientPublicKey,
        false
      ).toLowerCase();

  } catch {

    throw new TypeError(
      'The recipient public key is not a valid secp256k1 point.'
    );

  }


  /*
   * STEP 4 — INITIALIZE ATTACK STATISTICS
   */

  let attempts = 0;

  let recoveredScalar = null;

  const searchStart = performance.now();


  /*
   * STEP 5 — EXHAUSTIVE SEARCH
   *
   * Test candidate private scalars one by one.
   *
   * Q_candidate = candidate * G
   *
   * A public-key match identifies the private
   * scalar inside the restricted demonstration range.
   */

  for (
    let scalar = minKey;
    scalar <= maxKey;
    scalar++
  ) {


    /*
     * Convert candidate scalar into a
     * 32-byte secp256k1 private-key representation.
     */

    const candidatePrivateKey = ethers.toBeHex(
      scalar,
      32
    );


    /*
     * Derive its public key.
     */

    const candidatePublicKey =
      ethers.SigningKey.computePublicKey(
        candidatePrivateKey,
        false
      ).toLowerCase();


    /*
     * Record the attempt.
     */

    attempts++;


    /*
     * Compare the generated point with Q.
     */

    if (candidatePublicKey === targetPublicKey) {

      recoveredScalar = scalar;

      break;

    }

  }


  /*
   * STEP 6 — MEASURE THE SEARCH DURATION
   */

  const searchTimeMs =
    performance.now() - searchStart;


  /*
   * STEP 7 — HANDLE AN UNSUCCESSFUL SEARCH
   *
   * This happens if the correct key is not
   * contained in the chosen search interval.
   */

  if (recoveredScalar === null) {

    return {

      found: false,

      recoveredScalar: null,

      recoveredPlaintext: null,

      attempts,

      minKey,

      maxKey,

      searchTimeMs,

      decryptionTimeMs: null

    };

  }


  /*
   * STEP 8 — DECRYPT WITH THE RECOVERED KEY
   *
   * This uses the existing hybrid ECC decryption
   * function, including the AES-GCM integrity check.
   */

  const decryptionStart = performance.now();

  const recoveredPlaintext = await decryptEccMessage(
    packet,
    recoveredScalar
  );

  const decryptionTimeMs =
    performance.now() - decryptionStart;


  /*
   * STEP 9 — RETURN THE ATTACK RESULTS
   */

  return {

    found: true,

    recoveredScalar,

    recoveredPlaintext,

    attempts,

    minKey,

    maxKey,

    searchTimeMs,

    decryptionTimeMs

  };

}
