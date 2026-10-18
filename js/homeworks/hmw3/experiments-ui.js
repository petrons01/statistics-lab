
/*
 * Statistics-Lab — Homework 2
 *
 * Caesar Cipher Length Experiments UI
 *
 * Runs statistical key recovery experiments on
 * ciphertexts of different lengths.
 *
 * Reference and evaluation corpora are kept separate.
 */

import {
  buildCaesarLanguageModel
} from './caesar-attack.js';

import {
  runCaesarLengthExperiments,
  CAESAR_EXPERIMENT_LENGTHS,
  CAESAR_EXPERIMENT_DEFAULT_TRIALS,
  CAESAR_EXPERIMENT_DEFAULT_SEED
} from './experiments.js';


/*
 * Corpus URLs are resolved relative to this module.
 * This supports localhost and GitHub Pages.
 */

const REFERENCE_URL = new URL(
  '../../../data/corpus/english-reference.txt',
  import.meta.url
);

const EVALUATION_URL = new URL(
  '../../../data/corpus/english-evaluation.txt',
  import.meta.url
);


/*
 * =====================================================
 * 1. RENDER THE EXPERIMENTS LABORATORY
 * =====================================================
 */

export function renderHmw3Experiments() {

  return `

    <section
      class="panel hmw3-experiment-lab"
      id="hmw3-experiment-lab"
      aria-labelledby="hmw3-experiment-title"
    >

      <div class="panel-label">
        08 / CIPHERTEXT LENGTH EXPERIMENTS
      </div>

      <h2 id="hmw3-experiment-title">
        Measuring Caesar Key Recovery
      </h2>

      <p>
        Investigate how ciphertext length influences the
        effectiveness of statistical Caesar cryptanalysis.
        Each trial encrypts a sampled English passage with
        a selected key and attempts to recover that key
        using chi-square frequency analysis.
      </p>

      <p class="panel-note">
        The language model is built from a reference corpus.
        All test passages are sampled from a separate
        evaluation corpus. Sampled passages may overlap,
        so trials are not fully statistically independent.
      </p>


      <!-- CORPUS INFORMATION -->

      <div class="hmw3-experiment-corpora">

        <div class="hmw3-experiment-corpus">

          <span class="hmw3-caesar-label">
            Reference corpus
          </span>

          <p id="hmw3-experiment-reference">
            Loading...
          </p>

        </div>

        <div class="hmw3-experiment-corpus">

          <span class="hmw3-caesar-label">
            Evaluation corpus
          </span>

          <p id="hmw3-experiment-evaluation">
            Loading...
          </p>

        </div>

      </div>


      <!-- EXPERIMENT CONFIGURATION -->

      <div class="hmw3-caesar-block">

        <h3>
          Experiment Configuration
        </h3>

        <p class="hmw3-caesar-help">
          The same configuration is applied to ciphertext
          lengths of 10, 30, 100, 300 and 1000 letters.
        </p>

        <div class="hmw3-experiment-settings">

          <div>

            <label
              class="hmw3-caesar-label"
              for="hmw3-experiment-trials"
            >
              Trials per length
            </label>

            <input
              type="number"
              id="hmw3-experiment-trials"
              class="hmw3-ecc-key-input"
              min="1"
              max="100"
              step="1"
              value="${CAESAR_EXPERIMENT_DEFAULT_TRIALS}"
            />

          </div>

          <div>

            <label
              class="hmw3-caesar-label"
              for="hmw3-experiment-seed"
            >
              Random seed
            </label>

            <input
              type="number"
              id="hmw3-experiment-seed"
              class="hmw3-ecc-key-input"
              min="0"
              max="4294967295"
              step="1"
              value="${CAESAR_EXPERIMENT_DEFAULT_SEED}"
            />

          </div>

        </div>

        <p class="hmw3-caesar-help">
          The seed controls reproducible sampling and key
          selection. It is not used to generate secure
          cryptographic randomness.
        </p>

      </div>


      <!-- ACTIONS -->

      <div class="hmw3-experiment-actions">

        <button
          type="button"
          id="hmw3-experiment-run"
          class="hmw3-caesar-button hmw3-caesar-primary"
          disabled
        >
          Run Length Experiments →
        </button>

      </div>


      <!-- STATUS -->

      <p
        id="hmw3-experiment-status"
        class="hmw3-caesar-status"
        role="status"
        aria-live="polite"
      >
        Loading reference and evaluation corpora...
      </p>


      <!-- RESULTS -->

      <div id="hmw3-experiment-results" hidden>


        <!-- OVERVIEW METRICS -->

        <div class="hmw3-experiment-metrics">

          <div class="hmw3-attack-metric">
            <span>Total trials</span>
            <strong id="hmw3-experiment-total">—</strong>
          </div>

          <div class="hmw3-attack-metric">
            <span>Shortest-text accuracy</span>
            <strong id="hmw3-experiment-short">—</strong>
          </div>

          <div class="hmw3-attack-metric">
            <span>Longest-text accuracy</span>
            <strong id="hmw3-experiment-long">—</strong>
          </div>

        </div>


        <!-- ACCURACY CHART -->

        <div class="hmw3-caesar-block">

          <h3>
            Recovery Accuracy by Ciphertext Length
          </h3>

          <p class="hmw3-caesar-help">
            Each bar represents the percentage of trials
            in which the highest-ranked Caesar key matches
            the original encryption key.
          </p>

          <div
            id="hmw3-experiment-chart"
            class="hmw3-experiment-chart"
            role="group"
            aria-label="Caesar key recovery accuracy by ciphertext length"
          ></div>

        </div>


        <!-- SUMMARY TABLE -->

        <div class="hmw3-caesar-block">

          <h3>
            Experiment Summary
          </h3>

          <p class="hmw3-caesar-help">
            Top-3 accuracy measures how often the correct
            key appears among the three best candidates.
          </p>

          <div class="hmw3-experiment-table-wrap">

            <table class="hmw3-attack-table">

              <thead>

                <tr>
                  <th>Letters</th>
                  <th>Trials</th>
                  <th>Correct</th>
                  <th>Accuracy</th>
                  <th>Top-3</th>
                  <th>Avg. rank</th>
                  <th>Avg. time (ms)</th>
                </tr>

              </thead>

              <tbody id="hmw3-experiment-table"></tbody>

            </table>

          </div>

        </div>


        <!-- EXPERIMENT INTERPRETATION -->

        <div class="hmw3-caesar-block">

          <h3>
            Interpretation
          </h3>

          <p
            id="hmw3-experiment-interpretation"
            class="hmw3-experiment-interpretation"
          ></p>

        </div>


        <!-- FAILED RECOVERY EXAMPLES -->

        <div class="hmw3-caesar-block">

          <h3>
            Incorrect Key Recovery Examples
          </h3>

          <p class="hmw3-caesar-help">
            Some trials may rank a wrong key first.
            These examples help identify the limitations
            of frequency-based cryptanalysis.
          </p>

          <p
            id="hmw3-experiment-failures-note"
            class="hmw3-caesar-help"
          ></p>

          <div
            id="hmw3-experiment-failures-wrap"
            class="hmw3-experiment-table-wrap"
            hidden
          >

            <table class="hmw3-attack-table">

              <thead>

                <tr>
                  <th>Letters</th>
                  <th>True key</th>
                  <th>Recovered key</th>
                  <th>True-key rank</th>
                </tr>

              </thead>

              <tbody id="hmw3-experiment-failures"></tbody>

            </table>

          </div>

        </div>


        <!-- LIMITATIONS -->

        <p class="panel-note">
          These are illustrative experiments, not a
          general security benchmark. The corpora in
          this lab are synthetic, and sampled evaluation
          passages may overlap. The results may differ
          when using natural texts from other genres.
          Average execution times also depend on the
          browser and computer.
        </p>

      </div>

    </section>

  `;

}


/*
 * =====================================================
 * 2. INITIALIZE THE EXPERIMENTS LABORATORY
 * =====================================================
 */

export function initHmw3Experiments() {

  const root = document.getElementById(
    'hmw3-experiment-lab'
  );

  if (!root) {
    return () => {};
  }


  /*
   * Select elements only inside this laboratory.
   */

  const get = id => root.querySelector(`#${id}`);


  const referenceInfo = get(
    'hmw3-experiment-reference'
  );

  const evaluationInfo = get(
    'hmw3-experiment-evaluation'
  );

  const trialsInput = get(
    'hmw3-experiment-trials'
  );

  const seedInput = get(
    'hmw3-experiment-seed'
  );

  const runButton = get(
    'hmw3-experiment-run'
  );

  const status = get(
    'hmw3-experiment-status'
  );

  const resultsContainer = get(
    'hmw3-experiment-results'
  );

  const chartContainer = get(
    'hmw3-experiment-chart'
  );

  const summaryTable = get(
    'hmw3-experiment-table'
  );

  const interpretation = get(
    'hmw3-experiment-interpretation'
  );

  const failuresBody = get(
    'hmw3-experiment-failures'
  );

  const failuresWrap = get(
    'hmw3-experiment-failures-wrap'
  );

  const failuresNote = get(
    'hmw3-experiment-failures-note'
  );


  /*
   * Internal state.
   */

  const controller = new AbortController();

  let active = true;
  let model = null;
  let evaluationText = '';
  let ready = false;
  let running = false;


  /*
   * Status updates.
   */

  function setStatus(message, state = 'info') {
    status.textContent = message;
    status.dataset.state = state;
  }


  /*
   * Clear results after a configuration change.
   */

  function clearResults() {
    resultsContainer.hidden = true;
    chartContainer.replaceChildren();
    summaryTable.replaceChildren();
    failuresBody.replaceChildren();
    failuresWrap.hidden = true;
    failuresNote.textContent = '';
  }


  /*
   * Format a percentage.
   */

  function formatPercent(value) {
    return `${value.toFixed(1)}%`;
  }


  /*
   * =====================================================
   * 3. RENDER EXPERIMENT SUMMARY
   * =====================================================
   */

  function renderSummary(data) {

    const first = data.summaries[0];

    const last = data.summaries[
      data.summaries.length - 1
    ];


    get('hmw3-experiment-total').textContent =
      String(data.settings.totalTrials);

    get('hmw3-experiment-short').textContent =
      formatPercent(first.accuracyPercent);

    get('hmw3-experiment-long').textContent =
      formatPercent(last.accuracyPercent);


    /*
     * Describe the observed result without assuming
     * that accuracy necessarily increases.
     */

    const difference =
      last.accuracyPercent - first.accuracyPercent;

    const direction =
      difference > 0
        ? 'higher'
        : difference < 0
          ? 'lower'
          : 'equal';


    interpretation.textContent =
      `In this experiment, recovery accuracy was ` +
      `${formatPercent(first.accuracyPercent)} for ` +
      `${first.length}-letter ciphertexts and ` +
      `${formatPercent(last.accuracyPercent)} for ` +
      `${last.length}-letter ciphertexts. ` +
      `The longest-text accuracy was ${direction} ` +
      `by ${Math.abs(difference).toFixed(1)} percentage ` +
      `points. These measurements depend on the ` +
      `selected passages, the reference model, and ` +
      `the random seed. They do not establish a ` +
      `guaranteed success rate for arbitrary texts.`;

  }


  /*
   * =====================================================
   * 4. RENDER THE ACCURACY CHART
   * =====================================================
   *
   * Each bar represents recovery accuracy [0, 100].
   *
   * CSS styling will be added separately.
   */

  function renderChart(summaries) {

    const rows = summaries.map(summary => {

      const row = document.createElement('div');

      row.className = 'hmw3-experiment-chart-row';


      /*
       * Ciphertext length label.
       */

      const label = document.createElement('span');

      label.className = 'hmw3-experiment-chart-label';

      label.textContent = String(summary.length);


      /*
       * Bar track.
       */

      const track = document.createElement('div');

      track.className = 'hmw3-experiment-track';

      track.setAttribute('role', 'progressbar');

      track.setAttribute(
        'aria-label',
        `${summary.length} letters: key recovery accuracy`
      );

      track.setAttribute('aria-valuemin', '0');

      track.setAttribute('aria-valuemax', '100');

      track.setAttribute(
        'aria-valuenow',
        String(summary.accuracyPercent)
      );


      /*
       * Filled portion of the bar.
       */

      const fill = document.createElement('div');

      fill.className = 'hmw3-experiment-bar-fill';

      fill.style.width =
        `${summary.accuracyPercent}%`;

      track.append(fill);


      /*
       * Accuracy percentage label.
       */

      const value = document.createElement('span');

      value.className = 'hmw3-experiment-chart-value';

      value.textContent = formatPercent(
        summary.accuracyPercent
      );


      row.append(
        label,
        track,
        value
      );

      return row;

    });


    chartContainer.replaceChildren(...rows);

  }


  /*
   * =====================================================
   * 5. RENDER SUMMARY TABLE
   * =====================================================
   */

  function renderTable(summaries) {

    const rows = summaries.map(summary => {

      const row = document.createElement('tr');


      const cells = [

        String(summary.length),

        String(summary.trials),

        String(summary.successful),

        formatPercent(summary.accuracyPercent),

        formatPercent(
          summary.topThreeAccuracyPercent
        ),

        summary.averageTrueKeyRank.toFixed(2),

        summary.averageRecoveryTimeMs.toFixed(3)

      ];


      for (const value of cells) {

        const cell = document.createElement('td');

        cell.textContent = value;

        row.append(cell);

      }


      return row;

    });


    summaryTable.replaceChildren(...rows);

  }


  /*
   * =====================================================
   * 6. DISPLAY INCORRECT RECOVERY EXAMPLES
   * =====================================================
   *
   * Show up to two failed attempts per ciphertext
   * length to illustrate when chi-square ranking fails.
   */

  function renderFailures(data) {

    const failedTrials = data.trials.filter(
      trial => !trial.success
    );


    failuresNote.textContent =
      `${failedTrials.length} incorrect recoveries ` +
      `out of ${data.settings.totalTrials} trials.`;


    if (failedTrials.length === 0) {

      failuresWrap.hidden = true;

      failuresBody.replaceChildren();

      return;

    }


    const selected = [];


    for (const length of data.settings.lengths) {

      const examples = failedTrials
        .filter(trial => trial.length === length)
        .slice(0, 2);

      selected.push(...examples);

    }


    const rows = selected.map(trial => {

      const row = document.createElement('tr');


      const cells = [

        String(trial.length),

        String(trial.secretKey),

        String(trial.recoveredKey),

        String(trial.trueKeyRank)

      ];


      for (const value of cells) {

        const cell = document.createElement('td');

        cell.textContent = value;

        row.append(cell);

      }


      return row;

    });


    failuresBody.replaceChildren(...rows);

    failuresWrap.hidden = false;

  }


  /*
   * =====================================================
   * 7. VALIDATE USER CONFIGURATION
   * =====================================================
   */

  function readConfiguration() {

    const trialsRaw = trialsInput.value.trim();

    const seedRaw = seedInput.value.trim();


    if (!/^\d+$/.test(trialsRaw)) {

      throw new RangeError(
        'Trials per length must be a whole number.'
      );

    }


    const trialsPerLength = Number(trialsRaw);


    if (
      !Number.isInteger(trialsPerLength) ||
      trialsPerLength < 1 ||
      trialsPerLength > 100
    ) {

      throw new RangeError(
        'Trials per length must be between 1 and 100.'
      );

    }


    if (!/^\d+$/.test(seedRaw)) {

      throw new RangeError(
        'Random seed must be a non-negative integer.'
      );

    }


    const seed = Number(seedRaw);


    if (
      !Number.isInteger(seed) ||
      seed < 0 ||
      seed > 4294967295
    ) {

      throw new RangeError(
        'Random seed must be between 0 and 4294967295.'
      );

    }


    return {
      trialsPerLength,
      seed
    };

  }


  /*
   * =====================================================
   * 8. EXECUTE LENGTH EXPERIMENTS
   * =====================================================
   */

  function runExperiments() {

    if (!ready || running) {
      return;
    }


    try {

      const configuration = readConfiguration();


      running = true;

      runButton.disabled = true;

      clearResults();


      setStatus(
        'Running Caesar key recovery experiments...'
      );


      /*
       * Execute the experimental engine.
       */

      const data = runCaesarLengthExperiments({

        evaluationText,

        languageModel: model,

        lengths: CAESAR_EXPERIMENT_LENGTHS,

        trialsPerLength:
          configuration.trialsPerLength,

        seed: configuration.seed

      });


      /*
       * Render all result components.
       */

      renderSummary(data);

      renderChart(data.summaries);

      renderTable(data.summaries);

      renderFailures(data);


      /*
       * Reveal results.
       */

      resultsContainer.hidden = false;


      setStatus(
        `Completed ${data.settings.totalTrials} trials ` +
        `across ${data.summaries.length} ciphertext lengths.`,
        'success'
      );

    } catch (error) {

      clearResults();

      setStatus(error.message, 'error');

      console.error(
        'Caesar length experiments failed:',
        error
      );

    } finally {

      running = false;

      if (active) {
        runButton.disabled = !ready;
      }

    }

  }


  /*
   * =====================================================
   * 9. LOAD REFERENCE AND EVALUATION CORPORA
   * =====================================================
   */

  async function loadCorpora() {

    try {

      const [referenceResponse, evaluationResponse] =
        await Promise.all([

          fetch(
            REFERENCE_URL,
            { signal: controller.signal }
          ),

          fetch(
            EVALUATION_URL,
            { signal: controller.signal }
          )

        ]);


      if (!referenceResponse.ok) {

        throw new Error(
          `Reference corpus unavailable ` +
          `(HTTP ${referenceResponse.status}).`
        );

      }


      if (!evaluationResponse.ok) {

        throw new Error(
          `Evaluation corpus unavailable ` +
          `(HTTP ${evaluationResponse.status}).`
        );

      }


      const [referenceText, loadedEvaluationText] =
        await Promise.all([

          referenceResponse.text(),

          evaluationResponse.text()

        ]);


      if (!active) {
        return;
      }


      /*
       * Build the model using ONLY reference data.
       */

      model = buildCaesarLanguageModel(
        referenceText
      );


      /*
       * Store the separate evaluation text.
       */

      evaluationText = loadedEvaluationText;


      const evaluationLetters =
        (evaluationText.match(/[A-Za-z]/g) || []).length;


      const requiredLetters = Math.max(
        ...CAESAR_EXPERIMENT_LENGTHS
      );


      if (evaluationLetters < requiredLetters) {

        throw new RangeError(
          `Evaluation corpus contains only ` +
          `${evaluationLetters} English letters. ` +
          `At least ${requiredLetters} are required.`
        );

      }


      /*
       * Update corpus descriptions.
       */

      referenceInfo.textContent =
        `${model.totalLetters.toLocaleString('en-US')} ` +
        `English letters (training model).`;


      evaluationInfo.textContent =
        `${evaluationLetters.toLocaleString('en-US')} ` +
        `English letters (independent evaluation text).`;


      /*
       * Enable experiments.
       */

      ready = true;

      runButton.disabled = false;


      setStatus(
        'Both corpora loaded. Configure and run the experiments.'
      );

    } catch (error) {

      if (!active || error.name === 'AbortError') {
        return;
      }


      ready = false;

      runButton.disabled = true;


      setStatus(
        `Corpus loading failed: ${error.message}`,
        'error'
      );

    }

  }


  /*
   * =====================================================
   * 10. EVENT LISTENERS
   * =====================================================
   */

  runButton.addEventListener(
    'click',
    runExperiments,
    { signal: controller.signal }
  );


  trialsInput.addEventListener(
    'input',
    () => {

      clearResults();

      setStatus(
        'Configuration updated. Run experiments to obtain new results.'
      );

    },
    { signal: controller.signal }
  );


  seedInput.addEventListener(
    'input',
    () => {

      clearResults();

      setStatus(
        'Seed updated. Run experiments to obtain new results.'
      );

    },
    { signal: controller.signal }
  );


  /*
   * Start loading both corpora.
   */

  void loadCorpora();


  /*
   * =====================================================
   * 11. CLEANUP
   * =====================================================
   */

  return () => {

    active = false;

    controller.abort();

  };

}
