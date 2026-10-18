
/*
 * Statistics-Lab — Homework 2
 * Public route: #/hmw3
 *
 * Statistical Cryptanalysis of the Caesar Cipher
 *
 * The algorithm estimates letter frequencies from a
 * reference corpus and evaluates all 26 possible
 * Caesar keys using a chi-square statistic.
 *
 * Lower scores indicate a closer match to the
 * expected language distribution.
 *
 * Educational implementation using English letters A-Z.
 */

import {
  CAESAR_ALPHABET,
  CAESAR_KEY_SPACE,
  caesarDecrypt
} from './caesar.js';


/*
 * Recommended number of alphabetic characters
 * in the reference corpus.
 *
 * This is a practical recommendation, not a
 * mathematical guarantee of statistical accuracy.
 */
export const RECOMMENDED_CORPUS_LETTERS = 10000;


/*
 * =====================================================
 * 1. LETTER FREQUENCY ANALYSIS
 * =====================================================
 *
 * Count occurrences of letters A-Z in a text.
 *
 * Spaces, punctuation, digits and other characters
 * are ignored, consistently with our Caesar cipher.
 *
 * Returns:
 * - totalLetters: number of alphabetic characters
 * - counts: absolute occurrences of each letter
 * - frequencies: relative frequencies in [0, 1]
 */

export function countLetterFrequencies(text) {

  if (typeof text !== 'string') {
    throw new TypeError(
      'Text must be a string.'
    );
  }

  const counts = Array(CAESAR_KEY_SPACE).fill(0);

  let totalLetters = 0;

  for (const character of text) {

    const code = character.charCodeAt(0);

    let letterIndex = -1;

    // Uppercase letters: A-Z
    if (code >= 65 && code <= 90) {
      letterIndex = code - 65;
    }

    // Lowercase letters: a-z
    else if (code >= 97 && code <= 122) {
      letterIndex = code - 97;
    }

    if (letterIndex !== -1) {

      counts[letterIndex]++;

      totalLetters++;

    }

  }

  const frequencies = counts.map(count => {

    if (totalLetters === 0) {
      return 0;
    }

    return count / totalLetters;

  });

  return {
    totalLetters,
    counts,
    frequencies
  };

}


/*
 * =====================================================
 * 2. LANGUAGE MODEL FROM A REFERENCE CORPUS
 * =====================================================
 *
 * Estimate the expected letter probabilities
 * of a known language from a reference corpus.
 *
 * Laplace smoothing prevents estimated
 * probabilities from being exactly zero.
 *
 * The reference corpus should be sufficiently
 * large and independent of the test ciphertexts.
 */

export function buildCaesarLanguageModel(
  corpus,
  {
    language = 'English',
    smoothing = 1
  } = {}
) {

  if (
    typeof language !== 'string' ||
    !language.trim()
  ) {
    throw new TypeError(
      'Language must be a non-empty string.'
    );
  }

  if (
    !Number.isFinite(smoothing) ||
    smoothing <= 0
  ) {
    throw new RangeError(
      'Smoothing must be a positive number.'
    );
  }


  // Extract corpus letter frequencies.
  const distribution = countLetterFrequencies(
    corpus
  );


  // Reject an almost empty reference corpus.
  if (
    distribution.totalLetters < CAESAR_KEY_SPACE
  ) {
    throw new RangeError(
      'The reference corpus must contain ' +
      'at least 26 English letters.'
    );
  }


  /*
   * Laplace smoothing:
   *
   * p_i = (count_i + alpha) / (N + 26 * alpha)
   *
   * alpha = smoothing
   */
  const denominator =
    distribution.totalLetters +
    CAESAR_KEY_SPACE * smoothing;


  const probabilities = distribution.counts.map(
    count => {

      return (count + smoothing) / denominator;

    }
  );


  return {

    language,

    alphabet: CAESAR_ALPHABET,

    totalLetters: distribution.totalLetters,

    counts: distribution.counts,

    // Empirical frequencies from the corpus.
    frequencies: distribution.frequencies,

    // Smoothed probabilities used for scoring.
    probabilities,

    // Indicates whether a larger corpus is recommended.
    smallCorpus:
      distribution.totalLetters <
      RECOMMENDED_CORPUS_LETTERS

  };

}


/*
 * =====================================================
 * 3. LANGUAGE MODEL VALIDATION
 * =====================================================
 */

function validateModel(model) {

  if (
    !model ||
    !Array.isArray(model.probabilities) ||
    model.probabilities.length !== CAESAR_KEY_SPACE ||
    model.probabilities.some(
      p => !Number.isFinite(p) || p <= 0
    )
  ) {

    throw new TypeError(
      'Provide a valid Caesar language model.'
    );

  }

}


/*
 * =====================================================
 * 4. CAESAR KEY RECOVERY
 * =====================================================
 *
 * Given a ciphertext and a language model,
 * evaluate every possible key k in {0, ..., 25}.
 *
 * For a candidate key k, plaintext letter i
 * corresponds to ciphertext letter (i + k) mod 26.
 *
 * The chi-square score is:
 *
 * chi2(k) = SUM_i [
 *   (observed_i(k) - expected_i)^2 / expected_i
 * ]
 *
 * Expected counts:
 *
 * expected_i = N * p_i
 *
 * The key with the minimum chi-square score
 * is selected as the most likely key.
 */

export function recoverCaesarKey(
  ciphertext,
  model
) {

  validateModel(model);


  /*
   * Analyze the observed ciphertext.
   */
  const ciphertextDistribution =
    countLetterFrequencies(ciphertext);


  const {
    totalLetters,
    counts
  } = ciphertextDistribution;


  if (totalLetters === 0) {

    throw new RangeError(
      'Ciphertext must contain at least one English letter.'
    );

  }


  /*
   * Candidate key results.
   */
  const candidates = [];


  /*
   * Evaluate all 26 possible Caesar shifts.
   */
  for (
    let key = 0;
    key < CAESAR_KEY_SPACE;
    key++
  ) {

    let score = 0;


    /*
     * Compare observed and expected frequencies.
     */
    for (
      let i = 0;
      i < CAESAR_KEY_SPACE;
      i++
    ) {

      /*
       * If ciphertext was encrypted using key k,
       * plaintext letter i corresponds to
       * ciphertext letter (i + k) mod 26.
       */
      const observed =
        counts[(i + key) % CAESAR_KEY_SPACE];


      /*
       * Expected number of occurrences of letter i.
       */
      const expected =
        totalLetters * model.probabilities[i];


      /*
       * Add the letter's chi-square contribution.
       */
      score +=
        ((observed - expected) ** 2) / expected;

    }


    /*
     * Generate the corresponding plaintext candidate.
     */
    const plaintext = caesarDecrypt(
      ciphertext,
      key
    );


    candidates.push({

      key,

      score,

      plaintext

    });

  }


  /*
   * Rank the candidates by ascending chi-square score.
   *
   * In case of equal scores, use the smaller key first.
   */
  candidates.sort(
    (a, b) => a.score - b.score || a.key - b.key
  );


  /*
   * The best candidate has the smallest score.
   */
  const best = candidates[0];


  return {

    best,

    candidates,

    totalLetters,

    ciphertextDistribution,

    /*
     * Score difference between the best and second-best
     * candidates. This is not a calibrated probability
     * that the recovered key is correct.
     */
    scoreGap:
      candidates[1].score - candidates[0].score

  };

}
