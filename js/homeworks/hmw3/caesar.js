
/*
 * Statistics-Lab
 * Homework 2 — Caesar Cipher
 *
 * Educational implementation of Caesar encryption
 * and decryption using the English alphabet.
 *
 * Key space: K = {0, 1, 2, ..., 25}
 *
 * Letters are shifted modulo 26.
 * Spaces, punctuation, digits, and other characters
 * remain unchanged.
 */

export const CAESAR_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const CAESAR_KEY_SPACE = 26;


/*
 * Validate a Caesar shift key.
 *
 * The key must be an integer between 0 and 25.
 */
function validateKey(key) {
  if (!Number.isInteger(key) || key < 0 || key >= CAESAR_KEY_SPACE) {
    throw new RangeError(
      'Caesar key must be an integer between 0 and 25.'
    );
  }
}


/*
 * Shift a single character.
 *
 * Uppercase and lowercase English letters are
 * processed separately to preserve their case.
 *
 * Non-alphabetic characters remain unchanged.
 */
function shiftCharacter(char, shift) {
  const code = char.charCodeAt(0);

  // Uppercase letters: A-Z
  if (code >= 65 && code <= 90) {
    const position = code - 65;

    const newPosition =
      ((position + shift) % 26 + 26) % 26;

    return String.fromCharCode(65 + newPosition);
  }

  // Lowercase letters: a-z
  if (code >= 97 && code <= 122) {
    const position = code - 97;

    const newPosition =
      ((position + shift) % 26 + 26) % 26;

    return String.fromCharCode(97 + newPosition);
  }

  // Spaces, digits, punctuation, Unicode, etc.
  return char;
}


/*
 * Apply a shift to an entire message.
 *
 * This is the common internal transformation used
 * by both encryption and decryption.
 */
function transformCaesar(text, shift) {
  if (typeof text !== 'string') {
    throw new TypeError('The message must be a string.');
  }

  let result = '';

  for (const char of text) {
    result += shiftCharacter(char, shift);
  }

  return result;
}


/*
 * Caesar encryption.
 *
 * Mathematical definition:
 *
 * E(k, x) = (x + k) mod 26
 *
 * @param {string} plaintext
 * @param {number} key
 * @returns {string}
 */
export function caesarEncrypt(plaintext, key) {
  validateKey(key);

  return transformCaesar(plaintext, key);
}


/*
 * Caesar decryption.
 *
 * Mathematical definition:
 *
 * D(k, y) = (y - k) mod 26
 *
 * @param {string} ciphertext
 * @param {number} key
 * @returns {string}
 */
export function caesarDecrypt(ciphertext, key) {
  validateKey(key);

  return transformCaesar(ciphertext, -key);
}
