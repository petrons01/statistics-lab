
/*
 * Statistics-Lab — Homework 2
 *
 * ECC Restricted Key-Space Attack UI
 *
 * Demonstrates exhaustive private-key recovery against
 * a deliberately weakened secp256k1 configuration.
 *
 * The attacker receives only the public ciphertext
 * package and tests candidate private scalars.
 *
 * This module contains presentation logic.
 * The attack itself is implemented in ecc-attack.js.
 */

import {
  ECC_ATTACK_MIN_KEY,
  ECC_ATTACK_MAX_KEY,
  recoverEccRestrictedKey
} from './ecc-attack.js';


/*
 * =====================================================
 * 1. RENDER THE ECC ATTACK LABORATORY
 * =====================================================
 */

export function renderHmw3EccAttack() {

  return `

    <section
      class="panel hmw3-ecc-attack-lab"
      id="hmw3-ecc-attack-lab"
      aria-labelledby="hmw3-ecc-attack-title"
    >

      <div class="panel-label">
        09 / ECC RESTRICTED KEY-SPACE ATTACK
      </div>

      <h2 id="hmw3-ecc-attack-title">
        Recover a Weak ECC Private Key
      </h2>

      <p>
        This experiment demonstrates a private-key recovery
        attack against a deliberately weakened secp256k1
        configuration.
      </p>

      <p>
        The attacker knows the recipient's public key and
        the encrypted message package, but does not know
        the private scalar.
      </p>

      <p class="panel-note">
        The private-key space is intentionally restricted
        to integers from 1 to 256. This is an educational
        vulnerability, not a weakness in secp256k1 itself.
      </p>


      <!-- CAPTURED CIPHERTEXT PACKAGE -->

      <div class="hmw3-caesar-block">

        <label
          for="hmw3-ecc-attack-packet"
          class="hmw3-caesar-label"
        >
          Captured ECC ciphertext package
        </label>

        <textarea
          id="hmw3-ecc-attack-packet"
          class="hmw3-caesar-textarea"
          rows="9"
          spellcheck="false"
          placeholder="Paste an encrypted ECC package as JSON..."
        ></textarea>

        <p class="hmw3-caesar-help">
          This package contains public information:
          the recipient public key, ephemeral public key,
          salt, IV, ciphertext and authentication tag.
        </p>

        <div class="hmw3-ecc-attack-copy-action">

          <button
            type="button"
            id="hmw3-ecc-attack-use-packet"
            class="hmw3-caesar-button"
          >
            Use ECC Ciphertext
          </button>

        </div>

        <p class="hmw3-caesar-help">
          Encrypt a message in the ECC simulator above,
          then use this button to copy its public package.
          You can also paste a package manually.
        </p>

      </div>


      <!-- SEARCH RANGE -->

      <div class="hmw3-caesar-block">

        <h3>
          Exhaustive Search Configuration
        </h3>

        <p class="hmw3-caesar-help">
          Select the interval of private scalars to test.
          The search is limited to the demonstration
          key space.
        </p>

        <div class="hmw3-ecc-attack-range">

          <div>

            <label
              class="hmw3-caesar-label"
              for="hmw3-ecc-attack-min"
            >
              Minimum scalar
            </label>

            <input
              type="number"
              id="hmw3-ecc-attack-min"
              class="hmw3-ecc-key-input"
              min="${ECC_ATTACK_MIN_KEY}"
              max="${ECC_ATTACK_MAX_KEY}"
              step="1"
              value="${ECC_ATTACK_MIN_KEY}"
            />

          </div>

          <div>

            <label
              class="hmw3-caesar-label"
              for="hmw3-ecc-attack-max"
            >
              Maximum scalar
            </label>

            <input
              type="number"
              id="hmw3-ecc-attack-max"
              class="hmw3-ecc-key-input"
              min="${ECC_ATTACK_MIN_KEY}"
              max="${ECC_ATTACK_MAX_KEY}"
              step="1"
              value="${ECC_ATTACK_MAX_KEY}"
            />

          </div>

        </div>

      </div>


      <!-- ATTACK ACTION -->

      <div class="hmw3-ecc-attack-actions">

        <button
          type="button"
          id="hmw3-ecc-attack-run"
          class="hmw3-caesar-button hmw3-caesar-primary"
        >
          Recover Private Key →
        </button>

      </div>


      <!-- ATTACK STATUS -->

      <p
        id="hmw3-ecc-attack-status"
        class="hmw3-caesar-status"
        role="status"
        aria-live="polite"
      >
        Capture an ECC ciphertext package to begin.
      </p>


      <!-- ATTACK RESULTS -->

      <div id="hmw3-ecc-attack-results" hidden>


        <!-- RECOVERY METRICS -->

        <div class="hmw3-ecc-attack-metrics">

          <div class="hmw3-attack-metric">

            <span>
              Recovered private scalar
            </span>

            <strong id="hmw3-ecc-attack-key">
              —
            </strong>

          </div>


          <div class="hmw3-attack-metric">

            <span>
              Keys tested
            </span>

            <strong id="hmw3-ecc-attack-attempts">
              —
            </strong>

          </div>


          <div class="hmw3-attack-metric">

            <span>
              Key search duration
            </span>

            <strong id="hmw3-ecc-attack-time">
              —
            </strong>

          </div>


          <div class="hmw3-attack-metric">

            <span>
              Decryption duration
            </span>

            <strong id="hmw3-ecc-attack-decryption-time">
              —
            </strong>

          </div>

        </div>


        <!-- RECOVERED PLAINTEXT -->

        <div
          id="hmw3-ecc-attack-plaintext-block"
          class="hmw3-caesar-block"
          hidden
        >

          <label
            for="hmw3-ecc-attack-plaintext"
            class="hmw3-caesar-label"
          >
            Recovered plaintext
          </label>

          <textarea
            id="hmw3-ecc-attack-plaintext"
            class="hmw3-caesar-textarea"
            rows="4"
            readonly
          ></textarea>

        </div>


        <!-- ATTACK INTERPRETATION -->

        <div class="hmw3-caesar-block">

          <h3>
            Attack Interpretation
          </h3>

          <p
            id="hmw3-ecc-attack-interpretation"
            class="hmw3-ecc-attack-interpretation"
          ></p>

        </div>

      </div>


      <!-- SECURITY EXPLANATION -->

      <div class="hmw3-ecc-attack-explanation">

        <h3>
          Why Does This Attack Work?
        </h3>

        <p>
          Each candidate private scalar d produces
          a public key Q = dG.
        </p>

        <p>
          The attacker computes candidate public keys
          until one matches the recipient's public key.
          The recovered scalar can then be used
          to decrypt the captured message.
        </p>

        <p class="panel-note">
          A correctly generated secp256k1 private scalar
          is selected from an enormous range.
          Exhaustively testing this full range is
          computationally infeasible.
        </p>

      </div>

    </section>

  `;

}


/*
 * =====================================================
 * 2. INITIALIZE THE ECC ATTACK LABORATORY
 * =====================================================
 */

export function initHmw3EccAttack() {

  const root = document.getElementById(
    'hmw3-ecc-attack-lab'
  );

  if (!root) {
    return () => {};
  }


  /*
   * Select elements inside the attack laboratory.
   */

  const get = id => root.querySelector(`#${id}`);


  const packetInput = get(
    'hmw3-ecc-attack-packet'
  );

  const minInput = get(
    'hmw3-ecc-attack-min'
  );

  const maxInput = get(
    'hmw3-ecc-attack-max'
  );

  const copyButton = get(
    'hmw3-ecc-attack-use-packet'
  );

  const runButton = get(
    'hmw3-ecc-attack-run'
  );

  const status = get(
    'hmw3-ecc-attack-status'
  );

  const results = get(
    'hmw3-ecc-attack-results'
  );

  const plaintextBlock = get(
    'hmw3-ecc-attack-plaintext-block'
  );

  const plaintextOutput = get(
    'hmw3-ecc-attack-plaintext'
  );

  const interpretation = get(
    'hmw3-ecc-attack-interpretation'
  );


  /*
   * Internal state and cleanup.
   */

  const controller = new AbortController();

  let active = true;

  let running = false;

  let revision = 0;


  /*
   * =====================================================
   * 3. STATUS AND RESULTS
   * =====================================================
   */

  function setStatus(message, state = 'info') {

    status.textContent = message;

    status.dataset.state = state;

  }


  function resetResults() {

    results.hidden = true;

    plaintextBlock.hidden = true;

    plaintextOutput.value = '';

    interpretation.textContent = '';

  }


  function setBusy(busy) {

    runButton.disabled = busy;

    copyButton.disabled = busy;

  }


  /*
   * =====================================================
   * 4. READ AND VALIDATE SEARCH INTERVAL
   * =====================================================
   */

  function readSearchRange() {

    const minRaw = minInput.value.trim();

    const maxRaw = maxInput.value.trim();


    if (
      !/^\d+$/.test(minRaw) ||
      !/^\d+$/.test(maxRaw)
    ) {

      throw new RangeError(
        'Search bounds must be whole numbers.'
      );

    }


    const minKey = Number(minRaw);

    const maxKey = Number(maxRaw);


    if (
      !Number.isInteger(minKey) ||
      !Number.isInteger(maxKey) ||
      minKey < ECC_ATTACK_MIN_KEY ||
      maxKey > ECC_ATTACK_MAX_KEY ||
      minKey > maxKey
    ) {

      throw new RangeError(
        `Search range must satisfy ` +
        `${ECC_ATTACK_MIN_KEY} <= min <= max <= ` +
        `${ECC_ATTACK_MAX_KEY}.`
      );

    }


    return {
      minKey,
      maxKey
    };

  }


  /*
   * =====================================================
   * 5. LOAD A PUBLIC PACKAGE FROM THE ECC SIMULATOR
   * =====================================================
   */

  function useEccCiphertext() {

    const source = document.getElementById(
      'hmw3-ecc-packet'
    );

    const sourceResults = document.getElementById(
      'hmw3-ecc-results'
    );


    /*
     * The source must contain the JSON package
     * generated by a successful ECC encryption.
     */

    if (
      !source ||
      !sourceResults ||
      sourceResults.hidden ||
      !source.textContent.trim()
    ) {

      setStatus(
        'Encrypt a message in the ECC simulator first.',
        'error'
      );

      return;
    }


    /*
     * Validate that the copied text is JSON.
     */

    try {

      JSON.parse(source.textContent);

    } catch {

      setStatus(
        'The ECC simulator package is not valid JSON.',
        'error'
      );

      return;
    }


    packetInput.value = source.textContent;

    revision++;

    resetResults();


    setStatus(
      'ECC ciphertext copied. Configure the search range ' +
      'and click Recover Private Key.'
    );

  }


  /*
   * =====================================================
   * 6. EXECUTE THE RESTRICTED KEY-SPACE ATTACK
   * =====================================================
   */

  async function runAttack() {

    if (running) {
      return;
    }


    let packet;
    let range;


    /*
     * Parse user input before starting the attack.
     */

    try {

      if (!packetInput.value.trim()) {

        throw new Error(
          'Provide an ECC ciphertext package first.'
        );

      }


      packet = JSON.parse(
        packetInput.value
      );


      if (
        !packet ||
        typeof packet !== 'object' ||
        Array.isArray(packet)
      ) {

        throw new TypeError(
          'The ECC ciphertext package must be a JSON object.'
        );

      }


      range = readSearchRange();

    } catch (error) {

      resetResults();

      setStatus(
        error instanceof SyntaxError
          ? 'The ciphertext package is not valid JSON.'
          : error.message,
        'error'
      );

      return;
    }


    /*
     * Run the attack.
     */

    running = true;

    const current = ++revision;

    setBusy(true);

    resetResults();


    setStatus(
      `Testing private scalars from ` +
      `${range.minKey} to ${range.maxKey}...`
    );


    try {

      /*
       * Recover the private scalar from the
       * public information in the captured package.
       */

      const attack = await recoverEccRestrictedKey(
        packet,
        range
      );


      /*
       * Ignore outdated results after input changes
       * or navigation to another page.
       */

      if (!active || current !== revision) {
        return;
      }


      /*
       * Populate attack statistics.
       */

      get('hmw3-ecc-attack-key').textContent =
        attack.found
          ? String(attack.recoveredScalar)
          : 'Not found';


      get('hmw3-ecc-attack-attempts').textContent =
        String(attack.attempts);


      get('hmw3-ecc-attack-time').textContent =
        `${attack.searchTimeMs.toFixed(3)} ms`;


      get(
        'hmw3-ecc-attack-decryption-time'
      ).textContent =
        attack.found
          ? `${attack.decryptionTimeMs.toFixed(3)} ms`
          : 'Not attempted';


      /*
       * Display different results depending
       * on whether the key was recovered.
       */

      if (attack.found) {

        plaintextBlock.hidden = false;

        plaintextOutput.value =
          attack.recoveredPlaintext;


        interpretation.textContent =
          `The attack recovered private scalar ` +
          `d = ${attack.recoveredScalar} after ` +
          `${attack.attempts} candidate checks. ` +
          `The recovered key was then used to ` +
          `decrypt the authenticated ECC ciphertext. ` +
          `This was possible because the private-key ` +
          `space was deliberately restricted.`;


        setStatus(
          `Private key recovered: ` +
          `d = ${attack.recoveredScalar}. ` +
          `Message successfully decrypted.`,
          'success'
        );

      } else {

        plaintextBlock.hidden = true;


        interpretation.textContent =
          `No matching private scalar was found ` +
          `between ${attack.minKey} and ` +
          `${attack.maxKey}. The attacker tested ` +
          `${attack.attempts} candidates. ` +
          `This does not prove that the ciphertext ` +
          `is secure: the correct key may simply ` +
          `be outside the selected interval.`;


        setStatus(
          `No private key found in the selected range.`,
          'info'
        );

      }


      /*
       * Reveal the result panel.
       */

      results.hidden = false;

    } catch (error) {

      if (!active || current !== revision) {
        return;
      }


      resetResults();

      setStatus(
        `ECC attack failed: ${error.message}`,
        'error'
      );


      console.error(
        'ECC restricted key-space attack failed:',
        error
      );

    } finally {

      running = false;

      if (active) {
        setBusy(false);
      }

    }

  }


  /*
   * =====================================================
   * 7. EVENT LISTENERS
   * =====================================================
   */

  copyButton.addEventListener(
    'click',
    useEccCiphertext,
    { signal: controller.signal }
  );


  runButton.addEventListener(
    'click',
    () => void runAttack(),
    { signal: controller.signal }
  );


  /*
   * Invalidate results when the user changes
   * the ciphertext or search interval.
   */

  const onConfigurationChanged = () => {

    revision++;

    resetResults();

    setStatus(
      'Input updated. Run the attack again.'
    );

  };


  packetInput.addEventListener(
    'input',
    onConfigurationChanged,
    { signal: controller.signal }
  );


  minInput.addEventListener(
    'input',
    onConfigurationChanged,
    { signal: controller.signal }
  );


  maxInput.addEventListener(
    'input',
    onConfigurationChanged,
    { signal: controller.signal }
  );


  /*
   * =====================================================
   * 8. CLEANUP
   * =====================================================
   */

  return () => {

    active = false;

    revision++;

    controller.abort();

  };

}
