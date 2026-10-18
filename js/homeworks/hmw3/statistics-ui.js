
/*
 * Statistics-Lab — Homework 2
 * Caesar Cipher statistical cryptanalysis UI.
 *
 * Reads the English reference corpus and ranks all 26
 * Caesar keys with the chi-square method.
 */

import {
  buildCaesarLanguageModel,
  countLetterFrequencies,
  recoverCaesarKey
} from './caesar-attack.js';


/*
 * Resolve the corpus URL relative to this module.
 *
 * This works both on localhost and on GitHub Pages.
 */
const CORPUS_URL = new URL(
  '../../../data/corpus/english-reference.txt',
  import.meta.url
);

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';


/*
 * =====================================================
 * 1. RENDER THE STATISTICAL CRYPTANALYSIS LAB
 * =====================================================
 */

export function renderHmw3Statistics() {

  return `

    <section
      class="panel hmw3-attack-lab"
      id="hmw3-caesar-attack"
      aria-labelledby="hmw3-attack-title"
    >

      <div class="panel-label">
        07 / STATISTICAL CRYPTANALYSIS
      </div>

      <h2 id="hmw3-attack-title">
        Recover the Caesar Key
      </h2>

      <p>
        Recover a Caesar shift without knowing the secret key.
        The algorithm compares letter frequencies against an English
        reference corpus using the chi-square statistic.
      </p>

      <p class="panel-note">
        All 26 keys are evaluated. A lower score indicates a closer
        match to the reference language model; it does not guarantee
        that the candidate is correct.
      </p>


      <!-- REFERENCE CORPUS -->

      <div class="hmw3-caesar-block">

        <span class="hmw3-caesar-label">
          Reference corpus
        </span>

        <p
          id="hmw3-attack-corpus"
          class="hmw3-caesar-help"
          aria-live="polite"
        >
          Loading English reference corpus…
        </p>

      </div>


      <!-- INPUT CIPHERTEXT -->

      <div class="hmw3-caesar-block">

        <label
          class="hmw3-caesar-label"
          for="hmw3-attack-ciphertext"
        >
          Ciphertext to analyze
        </label>

        <textarea
          id="hmw3-attack-ciphertext"
          class="hmw3-caesar-textarea"
          rows="5"
          maxlength="10000"
          spellcheck="false"
          placeholder="Paste a Caesar-encrypted English text..."
        ></textarea>

        <p class="hmw3-caesar-help">
          You can paste an independent ciphertext or copy
          the current output of the Caesar simulator above.
        </p>

      </div>


      <!-- ACTION BUTTONS -->

      <div class="hmw3-attack-actions">

        <button
          type="button"
          id="hmw3-attack-use-caesar"
          class="hmw3-caesar-button"
        >
          Use Caesar Ciphertext
        </button>

        <button
          type="button"
          id="hmw3-attack-run"
          class="hmw3-caesar-button hmw3-caesar-primary"
          disabled
        >
          Recover Key
        </button>

      </div>


      <!-- STATUS -->

      <p
        id="hmw3-attack-status"
        class="hmw3-caesar-status"
        role="status"
        aria-live="polite"
      >
        Waiting for the reference corpus.
      </p>


      <!-- ANALYSIS RESULTS -->

      <div id="hmw3-attack-results" hidden>


        <!-- STATISTICAL METRICS -->

        <div class="hmw3-attack-metrics">

          <div class="hmw3-attack-metric">
            <span>Most likely key</span>
            <strong id="hmw3-attack-key">—</strong>
          </div>

          <div class="hmw3-attack-metric">
            <span>Letters analyzed</span>
            <strong id="hmw3-attack-letters">—</strong>
          </div>

          <div class="hmw3-attack-metric">
            <span>Best χ² score</span>
            <strong id="hmw3-attack-score">—</strong>
          </div>

          <div class="hmw3-attack-metric">
            <span>Gap to runner-up</span>
            <strong id="hmw3-attack-gap">—</strong>
          </div>

        </div>


        <!-- RECOVERED PLAINTEXT -->

        <div class="hmw3-caesar-block">

          <label
            class="hmw3-caesar-label"
            for="hmw3-attack-plaintext"
          >
            Recovered plaintext candidate
          </label>

          <textarea
            id="hmw3-attack-plaintext"
            class="hmw3-caesar-textarea"
            rows="5"
            readonly
          ></textarea>

        </div>


        <!-- RANKING OF CANDIDATE KEYS -->

        <div class="hmw3-caesar-block">

          <h3>
            All 26 Key Candidates
          </h3>

          <p class="hmw3-caesar-help">
            Sorted by chi-square score, from best to worst.
            The first row is a statistical guess, not a certainty.
          </p>

          <div class="hmw3-attack-table-wrap">

            <table class="hmw3-attack-table">

              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Key</th>
                  <th>χ² score</th>
                  <th>Plaintext preview</th>
                </tr>
              </thead>

              <tbody id="hmw3-attack-candidates"></tbody>

            </table>

          </div>

        </div>


        <!-- LETTER FREQUENCY CHART -->

        <div class="hmw3-caesar-block">

          <h3>
            Letter Frequency Comparison
          </h3>

          <p class="hmw3-caesar-help">
            Reference corpus probabilities versus the observed
            frequencies in the highest-ranked plaintext candidate.
          </p>

          <div class="hmw3-attack-legend">

            <span>
              <i class="hmw3-attack-swatch is-reference"></i>
              Reference
            </span>

            <span>
              <i class="hmw3-attack-swatch is-observed"></i>
              Recovered
            </span>

          </div>

          <div
            id="hmw3-attack-frequencies"
            class="hmw3-attack-frequency-list"
          ></div>

        </div>


        <!-- INTERPRETATION -->

        <p class="hmw3-caesar-help">
          Important: short ciphertexts and unusual vocabulary
          may yield an incorrect key. The score gap is not
          a success probability.
        </p>

      </div>

    </section>

  `;

}


/*
 * =====================================================
 * 2. INITIALIZE STATISTICAL CRYPTANALYSIS
 * =====================================================
 */

export function initHmw3Statistics() {

  const root = document.getElementById(
    'hmw3-caesar-attack'
  );

  if (!root) {
    return () => {};
  }


  /*
   * Select elements inside the laboratory.
   */
  const get = id => root.querySelector(`#${id}`);


  const input = get('hmw3-attack-ciphertext');

  const sourceButton = get('hmw3-attack-use-caesar');
  const runButton = get('hmw3-attack-run');

  const corpusLabel = get('hmw3-attack-corpus');
  const status = get('hmw3-attack-status');

  const results = get('hmw3-attack-results');

  const candidatesBody = get('hmw3-attack-candidates');
  const frequencyList = get('hmw3-attack-frequencies');


  /*
   * State and cleanup.
   */
  const controller = new AbortController();

  let active = true;
  let model = null;


  /*
   * Update status.
   */
  function setStatus(message, state = 'info') {

    status.textContent = message;
    status.dataset.state = state;

  }


  /*
   * Clear the results whenever the input changes.
   */
  function resetResults() {

    results.hidden = true;

    candidatesBody.replaceChildren();
    frequencyList.replaceChildren();

  }


  /*
   * Copy the ciphertext generated by the Caesar
   * simulator into the cryptanalysis input.
   */
  function syncCaesarCiphertext() {

    const source = document.getElementById(
      'hmw3-caesar-ciphertext'
    );

    if (!source) {

      setStatus(
        'The Caesar simulator ciphertext field was not found.',
        'error'
      );

      return;
    }

    input.value = source.value;

    resetResults();

    setStatus(
      'Ciphertext copied. Click Recover Key to analyze it.'
    );

  }


  /*
   * =====================================================
   * 3. DISPLAY THE 26 CANDIDATE KEYS
   * =====================================================
   */

  function populateCandidates(candidates) {

    const rows = candidates.map(
      (candidate, index) => {

        const tr = document.createElement('tr');

        if (index === 0) {
          tr.classList.add('is-best');
        }

        const values = [

          String(index + 1),

          String(candidate.key),

          candidate.score.toFixed(2),

          candidate.plaintext
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 100)

        ];


        for (const value of values) {

          const td = document.createElement('td');

          td.textContent = value;

          tr.append(td);

        }

        return tr;

      }
    );

    candidatesBody.replaceChildren(...rows);

  }


  /*
   * =====================================================
   * 4. LETTER FREQUENCY VISUALIZATION
   * =====================================================
   *
   * Compare:
   *
   * - Expected English probabilities from the corpus.
   * - Observed probabilities in the recovered plaintext.
   *
   * Each letter is represented by two horizontal bars.
   */

  function populateFrequencies(plaintext) {

    const distribution = countLetterFrequencies(
      plaintext
    );


    /*
     * Determine a shared scale for all frequency bars.
     */
    const maximum = Math.max(

      0.01,

      ...model.probabilities,

      ...distribution.frequencies

    );


    const rows = [...ALPHABET].map(
      (letter, index) => {

        const row = document.createElement('div');

        row.className = 'hmw3-attack-frequency-row';


        // Letter label: A-Z
        const letterLabel = document.createElement('span');

        letterLabel.className = 'hmw3-attack-letter';

        letterLabel.textContent = letter;


        // Container for the two frequency bars.
        const bars = document.createElement('div');

        bars.className = 'hmw3-attack-bars';


        // Expected frequency.
        const referenceBar = document.createElement('div');

        referenceBar.className =
          'hmw3-attack-bar is-reference';

        referenceBar.style.width =
          `${(
            100 * model.probabilities[index] / maximum
          ).toFixed(2)}%`;


        // Observed frequency.
        const observedBar = document.createElement('div');

        observedBar.className =
          'hmw3-attack-bar is-observed';

        observedBar.style.width =
          `${(
            100 * distribution.frequencies[index] / maximum
          ).toFixed(2)}%`;


        bars.append(
          referenceBar,
          observedBar
        );


        // Numeric frequency comparison.
        const percentages = document.createElement('span');

        percentages.className =
          'hmw3-attack-percentages';

        percentages.textContent =
          `${(
            100 * model.probabilities[index]
          ).toFixed(1)}% / ` +
          `${(
            100 * distribution.frequencies[index]
          ).toFixed(1)}%`;


        row.append(
          letterLabel,
          bars,
          percentages
        );

        return row;

      }
    );


    frequencyList.replaceChildren(...rows);

  }


  /*
   * =====================================================
   * 5. EXECUTE THE STATISTICAL ATTACK
   * =====================================================
   */

  function runAttack() {

    if (!model) {

      setStatus(
        'Wait for the reference corpus to finish loading.',
        'error'
      );

      return;
    }


    try {

      /*
       * Evaluate all 26 Caesar keys.
       */
      const analysis = recoverCaesarKey(
        input.value,
        model
      );


      /*
       * Show statistical metrics.
       */
      get('hmw3-attack-key').textContent =
        String(analysis.best.key);

      get('hmw3-attack-letters').textContent =
        analysis.totalLetters.toLocaleString('en-US');

      get('hmw3-attack-score').textContent =
        analysis.best.score.toFixed(2);

      get('hmw3-attack-gap').textContent =
        analysis.scoreGap.toFixed(2);


      /*
       * Show the recovered plaintext candidate.
       */
      get('hmw3-attack-plaintext').value =
        analysis.best.plaintext;


      /*
       * Build the candidate ranking and frequency chart.
       */
      populateCandidates(
        analysis.candidates
      );

      populateFrequencies(
        analysis.best.plaintext
      );


      /*
       * Reveal the results.
       */
      results.hidden = false;


      setStatus(
        `Most likely key: ${analysis.best.key}. ` +
        `Evaluated all 26 shifts using ` +
        `${analysis.totalLetters} letters.`,
        'success'
      );

    } catch (error) {

      resetResults();

      setStatus(
        error.message,
        'error'
      );

    }

  }


  /*
   * =====================================================
   * 6. EVENT LISTENERS
   * =====================================================
   */

  sourceButton.addEventListener(
    'click',
    syncCaesarCiphertext,
    { signal: controller.signal }
  );


  runButton.addEventListener(
    'click',
    runAttack,
    { signal: controller.signal }
  );


  input.addEventListener(
    'input',
    () => {

      resetResults();

      setStatus(
        'Ciphertext updated. Click Recover Key to analyze it.'
      );

    },
    { signal: controller.signal }
  );


  /*
   * =====================================================
   * 7. LOAD THE ENGLISH REFERENCE CORPUS
   * =====================================================
   */

  async function loadCorpus() {

    try {

      const response = await fetch(
        CORPUS_URL,
        { signal: controller.signal }
      );

      if (!response.ok) {

        throw new Error(
          `Cannot load corpus (HTTP ${response.status}).`
        );

      }


      const corpus = await response.text();

      if (!active) {
        return;
      }


      /*
       * Build the statistical language model.
       */
      model = buildCaesarLanguageModel(
        corpus
      );


      /*
       * Display corpus information.
       */
      corpusLabel.textContent =
        `English reference corpus: ` +
        `${model.totalLetters.toLocaleString('en-US')} letters` +
        (
          model.smallCorpus
            ? ' (small corpus warning).'
            : ' (ready).'
        );


      /*
       * Enable the cryptanalysis button.
       */
      runButton.disabled = false;

      setStatus(
        'Reference model ready. Enter a ciphertext and recover the key.'
      );

    } catch (error) {

      if (!active || error.name === 'AbortError') {
        return;
      }

      corpusLabel.textContent =
        'Reference corpus unavailable.';

      runButton.disabled = true;

      setStatus(
        `Corpus loading failed: ${error.message}`,
        'error'
      );

    }

  }


  /*
   * Initialize with the current Caesar ciphertext,
   * if the simulator is present on the page.
   */
  const initialSource = document.getElementById(
    'hmw3-caesar-ciphertext'
  );

  if (initialSource) {

    input.value = initialSource.value;

  }


  /*
   * Load the reference corpus.
   */
  void loadCorpus();


  /*
   * Cleanup when navigating to another page.
   */
  return () => {

    active = false;

    controller.abort();

  };

}
