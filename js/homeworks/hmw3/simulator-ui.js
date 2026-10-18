
/*
 * Statistics-Lab
 * Homework 2 — Caesar Cipher Simulator
 *
 * This module contains the user interface for
 * Caesar encryption and decryption.
 *
 * Cryptographic operations are implemented
 * separately in caesar.js.
 */

import {
  caesarEncrypt,
  caesarDecrypt
} from './caesar.js';


const DEFAULT_MESSAGE = 'ATTACK AT DAWN';
const DEFAULT_KEY = 3;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';


/*
 * Render the Caesar Cipher interactive laboratory.
 *
 * The HTML is returned as a template string
 * and inserted into the Homework 2 page.
 */
export function renderHmw3Simulator() {
  return `

    <!-- ==========================================
         05 / CAESAR CIPHER LABORATORY
         ========================================== -->

    <section
      class="panel hmw3-caesar-lab"
      id="hmw3-caesar-lab"
      aria-labelledby="hmw3-caesar-title"
    >

      <div class="panel-label">
        05 / INTERACTIVE CAESAR CIPHER
      </div>

      <h2 id="hmw3-caesar-title">
        Caesar Encryption & Decryption
      </h2>

      <p>
        Experiment with the Caesar cipher by selecting
        a shift key, encrypting a plaintext message,
        and recovering the original message through
        decryption.
      </p>

      <p>
        The cipher operates on the English alphabet
        using modular arithmetic. Uppercase and
        lowercase letters are preserved, while
        spaces, punctuation, and numbers remain
        unchanged.
      </p>


      <!-- ==========================================
           INPUT MESSAGE
           ========================================== -->

      <div class="hmw3-caesar-block">

        <label
          for="hmw3-caesar-plaintext"
          class="hmw3-caesar-label"
        >
          Plaintext message
        </label>

        <textarea
          id="hmw3-caesar-plaintext"
          class="hmw3-caesar-textarea"
          rows="4"
          maxlength="2000"
          spellcheck="false"
        >ATTACK AT DAWN</textarea>

        <p class="hmw3-caesar-help">
          Enter a message to encrypt.
          This plaintext will also be used in the
          future ECC encryption experiment.
        </p>

      </div>


      <!-- ==========================================
           KEY SELECTION
           ========================================== -->

      <div class="hmw3-caesar-block">

        <div class="hmw3-caesar-key-header">

          <label
            for="hmw3-caesar-key"
            class="hmw3-caesar-label"
          >
            Encryption key (alphabet shift)
          </label>

          <output
            id="hmw3-caesar-key-value"
            for="hmw3-caesar-key"
          >
            3
          </output>

        </div>

        <input
          type="range"
          id="hmw3-caesar-key"
          class="hmw3-caesar-slider"
          min="0"
          max="25"
          step="1"
          value="3"
        />

        <div class="hmw3-caesar-range-labels">
          <span>0</span>
          <span>25</span>
        </div>

        <p class="hmw3-caesar-help">
          The key is an integer in the range
          K = {0, 1, ..., 25}.
          A shift of 0 leaves the message unchanged.
        </p>

      </div>


      <!-- ==========================================
           ALPHABET VISUALIZATION
           ========================================== -->

      <div class="hmw3-caesar-block">

        <h3>
          Alphabet Transformation
        </h3>

        <p>
          Observe how the selected key shifts
          every letter of the alphabet.
        </p>

        <div class="hmw3-caesar-alphabet">

          <div class="hmw3-caesar-alphabet-row">

            <span class="hmw3-caesar-alphabet-name">
              Original
            </span>

            <code id="hmw3-caesar-original-alphabet">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </code>

          </div>

          <div class="hmw3-caesar-alphabet-row">

            <span class="hmw3-caesar-alphabet-name">
              Shifted
            </span>

            <code id="hmw3-caesar-shifted-alphabet">
              DEFGHIJKLMNOPQRSTUVWXYZABC
            </code>

          </div>

        </div>

      </div>


      <!-- ==========================================
           ENCRYPTION AND DECRYPTION CONTROLS
           ========================================== -->

      <div class="hmw3-caesar-actions">

        <button
          type="button"
          id="hmw3-caesar-encrypt"
          class="hmw3-caesar-button hmw3-caesar-primary"
        >
          Encrypt Message →
        </button>

        <button
          type="button"
          id="hmw3-caesar-decrypt"
          class="hmw3-caesar-button"
        >
          ← Decrypt Ciphertext
        </button>

        <button
          type="button"
          id="hmw3-caesar-reset"
          class="hmw3-caesar-button hmw3-caesar-reset"
        >
          Reset
        </button>

      </div>


      <!-- ==========================================
           CIPHERTEXT
           ========================================== -->

      <div class="hmw3-caesar-block">

        <label
          for="hmw3-caesar-ciphertext"
          class="hmw3-caesar-label"
        >
          Ciphertext
        </label>

        <textarea
          id="hmw3-caesar-ciphertext"
          class="hmw3-caesar-textarea"
          rows="4"
          maxlength="2000"
          spellcheck="false"
          placeholder="Encrypted message will appear here..."
        ></textarea>

        <p class="hmw3-caesar-help">
          The ciphertext can also be edited manually.
          Enter an encrypted message and click
          Decrypt Ciphertext to recover its plaintext
          using the selected key.
        </p>

      </div>


      <!-- ==========================================
           DECRYPTION RESULT
           ========================================== -->

      <div class="hmw3-caesar-block">

        <label
          for="hmw3-caesar-decrypted"
          class="hmw3-caesar-label"
        >
          Decrypted message
        </label>

        <textarea
          id="hmw3-caesar-decrypted"
          class="hmw3-caesar-textarea"
          rows="4"
          readonly
          placeholder="Decrypted message will appear here..."
        ></textarea>

      </div>


      <!-- ==========================================
           STATUS
           ========================================== -->

      <p
        id="hmw3-caesar-status"
        class="hmw3-caesar-status"
        role="status"
        aria-live="polite"
      >
        Select a key and encrypt the message.
      </p>


      <!-- ==========================================
           MATHEMATICAL EXPLANATION
           ========================================== -->

      <div class="hmw3-caesar-explanation">

        <h3>
          Mathematical Interpretation
        </h3>

        <p>
          Every letter is represented by an
          integer between 0 and 25.
        </p>

        <div class="math-display">
          E(k, x) = (x + k) mod 26
        </div>

        <div class="math-display">
          D(k, y) = (y - k) mod 26
        </div>

        <p>
          Encryption adds the key modulo 26.
          Decryption subtracts the same key,
          reversing the transformation.
        </p>

        <p class="panel-note">
          The Caesar cipher is not secure for
          modern applications. Its small key
          space makes exhaustive search easy,
          and the relative frequencies of
          letters remain unchanged.
        </p>

      </div>

    </section>

  `;
}


/*
 * Initialize the Caesar Cipher simulator.
 *
 * This function must be called after the
 * HTML has been inserted into the page.
 *
 * Returns a cleanup function for the SPA router.
 */
export function initHmw3Simulator() {

  const root = document.getElementById(
    'hmw3-caesar-lab'
  );

  if (!root) {
    return () => {};
  }


  /*
   * Helper for selecting elements inside
   * the Caesar simulator.
   */
  const getElement = id =>
    root.querySelector(`#${id}`);


  // Inputs
  const plaintextInput = getElement(
    'hmw3-caesar-plaintext'
  );

  const ciphertextInput = getElement(
    'hmw3-caesar-ciphertext'
  );

  const decryptedOutput = getElement(
    'hmw3-caesar-decrypted'
  );

  const keyInput = getElement(
    'hmw3-caesar-key'
  );


  // Display elements
  const keyValue = getElement(
    'hmw3-caesar-key-value'
  );

  const shiftedAlphabet = getElement(
    'hmw3-caesar-shifted-alphabet'
  );

  const status = getElement(
    'hmw3-caesar-status'
  );


  // Buttons
  const encryptButton = getElement(
    'hmw3-caesar-encrypt'
  );

  const decryptButton = getElement(
    'hmw3-caesar-decrypt'
  );

  const resetButton = getElement(
    'hmw3-caesar-reset'
  );


  /*
   * AbortController removes registered
   * event listeners when the user navigates
   * to another page.
   */
  const controller = new AbortController();


  /*
   * Read the current selected Caesar key.
   */
  function getKey() {
    return Number(keyInput.value);
  }


  /*
   * Update the status message.
   */
  function setStatus(message, state = 'info') {
    status.textContent = message;
    status.dataset.state = state;
  }


  /*
   * Update the alphabet transformation
   * whenever the key changes.
   */
  function updateAlphabet() {

    const key = getKey();

    keyValue.value = String(key);
    keyValue.textContent = String(key);

    shiftedAlphabet.textContent = caesarEncrypt(
      ALPHABET,
      key
    );

  }


  /*
   * Encrypt plaintext using the selected key.
   */
  function encryptMessage() {

    const plaintext = plaintextInput.value;
    const key = getKey();

    if (plaintext.length === 0) {

      ciphertextInput.value = '';
      decryptedOutput.value = '';

      setStatus(
        'Enter a plaintext message before encrypting.',
        'error'
      );

      return;
    }

    try {

      const ciphertext = caesarEncrypt(
        plaintext,
        key
      );

      ciphertextInput.value = ciphertext;

      // Clear any previous decryption result.
      decryptedOutput.value = '';

      setStatus(
        `Message encrypted successfully with key k = ${key}.`,
        'success'
      );

    } catch (error) {

      setStatus(
        error.message,
        'error'
      );

    }

  }


  /*
   * Decrypt the ciphertext using the
   * currently selected key.
   */
  function decryptMessage() {

    const ciphertext = ciphertextInput.value;
    const key = getKey();

    if (ciphertext.length === 0) {

      decryptedOutput.value = '';

      setStatus(
        'Enter or generate a ciphertext before decrypting.',
        'error'
      );

      return;
    }

    try {

      const plaintext = caesarDecrypt(
        ciphertext,
        key
      );

      decryptedOutput.value = plaintext;

      setStatus(
        `Ciphertext decrypted with key k = ${key}.`,
        'success'
      );

    } catch (error) {

      setStatus(
        error.message,
        'error'
      );

    }

  }


  /*
   * Reset the simulator to its default values.
   */
  function resetSimulator() {

    plaintextInput.value = DEFAULT_MESSAGE;

    keyInput.value = String(DEFAULT_KEY);

    ciphertextInput.value = '';
    decryptedOutput.value = '';

    updateAlphabet();

    setStatus(
      'Simulator reset. Select a key and encrypt the message.'
    );

  }


  /*
   * Event listeners
   */

  keyInput.addEventListener(
    'input',
    () => {

      updateAlphabet();

      decryptedOutput.value = '';

      setStatus(
        'Key updated. Encrypt again or decrypt using the selected key.'
      );

    },
    { signal: controller.signal }
  );


  plaintextInput.addEventListener(
    'input',
    () => {

      ciphertextInput.value = '';
      decryptedOutput.value = '';

      setStatus(
        'Plaintext updated. Click Encrypt Message.'
      );

    },
    { signal: controller.signal }
  );


  ciphertextInput.addEventListener(
    'input',
    () => {

      decryptedOutput.value = '';

      setStatus(
        'Ciphertext updated. Click Decrypt Ciphertext.'
      );

    },
    { signal: controller.signal }
  );


  encryptButton.addEventListener(
    'click',
    encryptMessage,
    { signal: controller.signal }
  );


  decryptButton.addEventListener(
    'click',
    decryptMessage,
    { signal: controller.signal }
  );


  resetButton.addEventListener(
    'click',
    resetSimulator,
    { signal: controller.signal }
  );


  /*
   * Initial state.
   */
  updateAlphabet();

  // Show the initial example ciphertext.
  encryptMessage();


  /*
   * Cleanup when leaving Homework 2.
   */
  return () => {
    controller.abort();
  };

}
