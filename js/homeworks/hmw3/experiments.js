
/*
 * Statistics-Lab — Homework 2
 * Caesar Cipher: ciphertext-length experiments.
 *
 * This module does not load data or render HTML.
 * It receives a pre-built language model and an independent
 * evaluation text from its caller.
 *
 * Sampling is reproducible; the seeded pseudo-random generator
 * must NOT be used for cryptographic key generation.
 */

import { caesarEncrypt } from './caesar.js';
import { recoverCaesarKey } from './caesar-attack.js';


/*
 * =====================================================
 * 1. EXPERIMENT CONFIGURATION
 * =====================================================
 */

export const CAESAR_EXPERIMENT_LENGTHS = Object.freeze([
  10, 30, 100, 300, 1000
]);

export const CAESAR_EXPERIMENT_DEFAULT_TRIALS = 30;

export const CAESAR_EXPERIMENT_DEFAULT_SEED = 2026;


/*
 * =====================================================
 * 2. REPRODUCIBLE RANDOM SAMPLING
 * =====================================================
 *
 * Mulberry32 is a deterministic pseudo-random generator.
 *
 * Using the same seed produces the same selected passages
 * and Caesar keys, making experiments reproducible.
 *
 * It is NOT suitable for generating cryptographic secrets.
 */

function makeSeededRandom(seed) {

  let state = seed >>> 0;

  return () => {

    state = (state + 0x6D2B79F5) >>> 0;

    let value = state;

    value = Math.imul(
      value ^ (value >>> 15),
      value | 1
    );

    value ^= value + Math.imul(
      value ^ (value >>> 7),
      value | 61
    );

    return (
      (value ^ (value >>> 14)) >>> 0
    ) / 4294967296;

  };

}


/*
 * =====================================================
 * 3. INPUT VALIDATION
 * =====================================================
 */

function validateOptions(options) {

  if (!options || typeof options !== 'object') {
    throw new TypeError(
      'Provide an experiments configuration object.'
    );
  }

  const {
    evaluationText,
    languageModel,
    lengths,
    trialsPerLength,
    seed
  } = options;


  if (typeof evaluationText !== 'string') {
    throw new TypeError(
      'Evaluation text must be a string.'
    );
  }


  if (
    !languageModel ||
    !Array.isArray(languageModel.probabilities)
  ) {
    throw new TypeError(
      'Provide a trained Caesar language model.'
    );
  }


  if (
    !Array.isArray(lengths) ||
    lengths.length === 0 ||
    lengths.length > 20 ||
    lengths.some(
      length =>
        !Number.isInteger(length) ||
        length < 1 ||
        length > 10000
    ) ||
    new Set(lengths).size !== lengths.length
  ) {
    throw new RangeError(
      'Lengths must be 1–20 distinct integers from 1 to 10000.'
    );
  }


  if (
    !Number.isInteger(trialsPerLength) ||
    trialsPerLength < 1 ||
    trialsPerLength > 100
  ) {
    throw new RangeError(
      'Trials per length must be an integer from 1 to 100.'
    );
  }


  if (
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 0xFFFFFFFF
  ) {
    throw new RangeError(
      'Seed must be an integer from 0 to 4294967295.'
    );
  }

}


/*
 * =====================================================
 * 4. CAESAR LENGTH EXPERIMENTS
 * =====================================================
 *
 * Evaluate the performance of chi-square key recovery
 * on ciphertexts containing different numbers of
 * English letters.
 *
 * For each sample length:
 *
 * 1. Select a passage from the independent evaluation text.
 * 2. Generate a Caesar key in {0, ..., 25}.
 * 3. Encrypt the sampled plaintext.
 * 4. Attempt statistical key recovery.
 * 5. Compare the recovered key with the true key.
 * 6. Record accuracy and other statistics.
 *
 * Passages may overlap between different trials.
 *
 * Seeded sampling provides reproducibility, but
 * overlapping passages are not statistically independent.
 */

/**
 * @param {object} options
 * @param {string} options.evaluationText
 *   English evaluation text, separate from training.
 * @param {object} options.languageModel
 *   Result of buildCaesarLanguageModel().
 * @param {number[]} [options.lengths]
 *   Number of A-Z letters in each ciphertext.
 * @param {number} [options.trialsPerLength]
 *   Number of trials for every sample length.
 * @param {number} [options.seed]
 *   Reproducibility seed.
 *
 * @returns {object}
 *   Experiment summaries and individual trial records.
 */

export function runCaesarLengthExperiments({

  evaluationText,

  languageModel,

  lengths = CAESAR_EXPERIMENT_LENGTHS,

  trialsPerLength = CAESAR_EXPERIMENT_DEFAULT_TRIALS,

  seed = CAESAR_EXPERIMENT_DEFAULT_SEED

} = {}) {


  /*
   * Validate all input parameters.
   */

  validateOptions({
    evaluationText,
    languageModel,
    lengths,
    trialsPerLength,
    seed
  });


  /*
   * Find all ASCII alphabetic characters.
   *
   * We store their positions so we can select
   * passages containing exactly N English letters,
   * while preserving spaces and punctuation.
   */

  const letterOffsets = Array.from(

    evaluationText.matchAll(/[A-Za-z]/g),

    match => match.index

  );


  const totalLetters = letterOffsets.length;

  const requiredLetters = Math.max(...lengths);


  if (totalLetters < requiredLetters) {

    throw new RangeError(
      `Evaluation text has ${totalLetters} English letters; ` +
      `at least ${requiredLetters} are required.`
    );

  }


  /*
   * Initialize the deterministic random generator.
   */

  const random = makeSeededRandom(seed);


  /*
   * Store summary results and individual trial data.
   */

  const summaries = [];

  const trials = [];


  /*
   * =====================================================
   * 5. EVALUATE EVERY CIPHERTEXT LENGTH
   * =====================================================
   */

  for (const length of lengths) {


    /*
     * Accumulators for this ciphertext length.
     */

    let successful = 0;

    let topThreeSuccessful = 0;

    let rankSum = 0;

    let gapSum = 0;

    let durationSum = 0;


    /*
     * Repeat the experiment.
     */

    for (
      let trialNumber = 1;
      trialNumber <= trialsPerLength;
      trialNumber++
    ) {


      /*
       * STEP 1: SAMPLE AN INDEPENDENT TEST PASSAGE
       *
       * Select a contiguous passage containing exactly
       * the requested number of English letters.
       */

      const possibleStarts =
        totalLetters - length + 1;

      const startLetterIndex = Math.floor(
        random() * possibleStarts
      );

      const firstChar =
        letterOffsets[startLetterIndex];

      const lastChar =
        letterOffsets[
          startLetterIndex + length - 1
        ] + 1;

      const plaintext = evaluationText.slice(
        firstChar,
        lastChar
      );


      /*
       * STEP 2: CHOOSE A CAESAR KEY
       *
       * The key is sampled from {0, ..., 25}.
       *
       * This is intentionally reproducible
       * experimental sampling, not secure randomness.
       */

      const secretKey = Math.floor(
        random() * 26
      );


      /*
       * STEP 3: ENCRYPT THE PLAINTEXT
       */

      const ciphertext = caesarEncrypt(
        plaintext,
        secretKey
      );


      /*
       * STEP 4: ATTEMPT KEY RECOVERY
       *
       * Measure only the statistical recovery time,
       * excluding sampling and encryption.
       */

      const startTime = performance.now();

      const analysis = recoverCaesarKey(
        ciphertext,
        languageModel
      );

      const recoveryTimeMs =
        performance.now() - startTime;


      /*
       * STEP 5: EVALUATE RECOVERY SUCCESS
       */

      const rank = analysis.candidates.findIndex(
        candidate => candidate.key === secretKey
      ) + 1;


      const success =
        analysis.best.key === secretKey;


      /*
       * Update the experiment's accumulators.
       */

      if (success) {
        successful++;
      }

      if (rank <= 3) {
        topThreeSuccessful++;
      }

      rankSum += rank;

      gapSum += analysis.scoreGap;

      durationSum += recoveryTimeMs;


      /*
       * STEP 6: SAVE INDIVIDUAL TRIAL DATA
       */

      trials.push({

        length,

        trialNumber,

        startLetterIndex,

        secretKey,

        recoveredKey: analysis.best.key,

        success,

        trueKeyRank: rank,

        bestChiSquare: analysis.best.score,

        scoreGap: analysis.scoreGap,

        recoveryTimeMs,

        plaintextPreview: plaintext.slice(0, 120),

        ciphertextPreview: ciphertext.slice(0, 120)

      });

    }


    /*
     * =====================================================
     * 6. COMPUTE STATISTICS FOR THE CURRENT LENGTH
     * =====================================================
     */

    summaries.push({

      length,

      trials: trialsPerLength,

      successful,

      /*
       * Percentage of correctly recovered keys.
       */
      accuracyPercent:
        (successful / trialsPerLength) * 100,


      /*
       * Percentage of trials in which the correct
       * key appears among the top three candidates.
       */
      topThreeSuccessful,

      topThreeAccuracyPercent:
        (topThreeSuccessful / trialsPerLength) * 100,


      /*
       * Average rank of the true key.
       *
       * Best possible average rank: 1.
       */
      averageTrueKeyRank:
        rankSum / trialsPerLength,


      /*
       * Average chi-square difference between
       * the best and second-best candidates.
       *
       * This is NOT a success probability.
       */
      averageScoreGap:
        gapSum / trialsPerLength,


      /*
       * Average statistical recovery duration.
       */
      averageRecoveryTimeMs:
        durationSum / trialsPerLength

    });

  }


  /*
   * =====================================================
   * 7. RETURN ALL EXPERIMENT RESULTS
   * =====================================================
   */

  return {

    settings: {

      lengths: [...lengths],

      trialsPerLength,

      seed,

      evaluationLetters: totalLetters,

      totalTrials:
        lengths.length * trialsPerLength

    },

    summaries,

    trials

  };

}
