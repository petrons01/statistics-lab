/*
 * Statistics-Lab
 * Homework 4.1 — Welford's Recurrence Formulas
 *
 * Public route: #/hmw5
 * (internal name hmw5: the course numbering is shown on the page)
 *
 * Theory and derivations 01–05, interactive sections 06–07,
 * conclusions 08.
 */

import { renderHmw5Lab } from '../homeworks/hmw5/welford-ui.js';
import { renderHmw5Stability } from '../homeworks/hmw5/stability-ui.js';
import { renderHmw5Conclusion } from '../homeworks/hmw5/conclusion.js';

/* The code shown on the page is the code that runs (welford.js). */
const CORE_CODE = `const delta = x - mean;      // x_k − M_(k−1)
mean += delta / k;           // Knuth: new mean M_k
ss += delta * (x - mean);    // Welford: new sum of squares SS_k`;

const FULL_CODE = `export function createAccumulator() {
  return { count: 0, mean: 0, ss: 0 };
}

export function addValue(acc, x) {
  acc.count += 1;

  const delta = x - acc.mean;          // x_k − M_{k−1}
  acc.mean += delta / acc.count;       // M_k  (Knuth)
  acc.ss += delta * (x - acc.mean);    // SS_k (Welford)

  return acc;
}

export function sampleVariance(acc) {
  return acc.count >= 2 ? acc.ss / (acc.count - 1) : null;
}

export function populationVariance(acc) {
  return acc.count >= 1 ? acc.ss / acc.count : null;
}`;

const escapeHtml = text => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export function renderHmw5() {
  return `
    <!-- ==========================================
         HOMEWORK HEADER
         ========================================== -->

    <section class="module-header">

      <div class="eyebrow">
        <span class="eyebrow-line"></span>
        HOMEWORK 4.1 · WELFORD'S RECURRENCE FORMULAS
      </div>

      <span class="module-status">
        ALGORITHMS · INTERACTIVE LAB
      </span>

    </section>


    <!-- ==========================================
         INTRODUCTION
         ========================================== -->

    <section class="module-intro">

      <h1>
        Mean and Variance<br />
        <span>in a Single Pass.</span>
      </h1>

      <p>
        Knuth's and Welford's recurrences update the mean, the sum
        of squares and the variance one value at a time, with
        constant memory and without the numerical cancellation of
        the textbook one-pass formula.
      </p>

    </section>


    <!-- ==========================================
         01 / HOMEWORK OVERVIEW
         ========================================== -->

    <div class="module-layout">

      <section
        class="panel panel-large"
        aria-labelledby="hmw5-overview-title"
      >

        <div class="panel-label">
          01 / HOMEWORK OVERVIEW
        </div>

        <h2 id="hmw5-overview-title">
          Updating Statistics One Value at a Time
        </h2>

        <p>
          Data often arrive as a stream: the scores of an attacker,
          system after system, or measurements that are too many to
          keep in memory. We want the mean and the variance after
          every new value, without storing the previous values and
          without going through them again.
        </p>

        <p>
          Knuth's recurrence does this for the mean. Following the
          same approach, we derive Welford's recurrence for the sum
          of squared deviations and, from it, two recurrences for
          the variance. The core of the resulting algorithm is
          three lines of code.
        </p>

        <p>
          Finally, we show experimentally why Welford's method is
          preferred to the formula Σx² − n·x̄², which is
          algebraically equivalent but numerically fragile.
        </p>

      </section>


      <aside
        class="panel panel-side"
        aria-labelledby="hmw5-objectives-title"
      >

        <div class="panel-label">
          LEARNING OBJECTIVES
        </div>

        <h2 id="hmw5-objectives-title">
          What will we investigate?
        </h2>

        <p>Knuth's recurrence for the running mean.</p>

        <p>
          Welford's recurrence for the sum of squares, derived
          step by step.
        </p>

        <p>
          Recurrences for the sample and population variance.
        </p>

        <p>A three-line implementation and its verification.</p>

        <p>
          Numerical stability compared with the naive one-pass
          formula.
        </p>

        <p class="panel-note">
          The same Welford code is used in Homework 4.2 to compute
          each hacker's sampling mean and variance.
        </p>

      </aside>

    </div>


    <!-- ==========================================
         02 / KNUTH'S RECURRENCE FOR THE MEAN
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw5-knuth-title"
    >

      <div class="panel-label">
        02 / KNUTH'S RECURRENCE FOR THE MEAN
      </div>

      <h2 id="hmw5-knuth-title">
        The Running Mean
      </h2>

      <p>
        Let M<sub>k</sub> be the mean of the first k values.
        By definition:
      </p>

      <div class="math-display">
        M<sub>k</sub> = (x<sub>1</sub> + … + x<sub>k</sub>) / k
      </div>

      <p>
        The sum of the first k − 1 values is
        (k − 1)·M<sub>k−1</sub>, so the new sum is that quantity
        plus x<sub>k</sub>:
      </p>

      <div class="math-display">
        k·M<sub>k</sub> = (k − 1)·M<sub>k−1</sub> + x<sub>k</sub>
      </div>

      <p>
        Dividing by k and writing (k − 1)/k = 1 − 1/k:
      </p>

      <div class="math-display">
        M<sub>k</sub> = M<sub>k−1</sub><br />
        + (x<sub>k</sub> − M<sub>k−1</sub>) / k
      </div>

      <p>
        The new mean is the old one, corrected by a fraction 1/k of
        the deviation of the new value from the old mean. Starting
        from M<sub>1</sub> = x<sub>1</sub>, only M and k need to be
        stored. Two consequences used below:
      </p>

      <div class="math-display">
        k·(M<sub>k</sub> − M<sub>k−1</sub>) = x<sub>k</sub> − M<sub>k−1</sub>
      </div>

      <div class="math-display">
        x<sub>k</sub> − M<sub>k</sub> = (k − 1)/k · (x<sub>k</sub> − M<sub>k−1</sub>)
      </div>

      <p class="panel-note">
        The second identity follows from the first:
        x<sub>k</sub> − M<sub>k</sub> = (x<sub>k</sub> − M<sub>k−1</sub>)
        − (M<sub>k</sub> − M<sub>k−1</sub>)
        = (x<sub>k</sub> − M<sub>k−1</sub>)(1 − 1/k).
      </p>

    </section>


    <!-- ==========================================
         03 / WELFORD'S RECURRENCE FOR THE SUM OF SQUARES
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw5-ss-title"
    >

      <div class="panel-label">
        03 / WELFORD'S RECURRENCE FOR THE SUM OF SQUARES
      </div>

      <h2 id="hmw5-ss-title">
        The Running Sum of Squares
      </h2>

      <p>
        The sum of squared deviations from the current mean is
      </p>

      <div class="math-display">
        SS<sub>k</sub> = Σ<sub>i≤k</sub> (x<sub>i</sub> − M<sub>k</sub>)²
      </div>

      <p>
        As for the mean, we look for SS<sub>k</sub> in terms of
        SS<sub>k−1</sub> and the new value. Expanding the square and
        using Σ x<sub>i</sub> = k·M<sub>k</sub> gives the equivalent
        form
      </p>

      <div class="math-display">
        SS<sub>k</sub> = Σ<sub>i≤k</sub> x<sub>i</sub>² − k·M<sub>k</sub>²
      </div>

      <h3>3.1 — Step 1: the difference between two steps</h3>

      <p>
        Subtracting the same expression at step k − 1, all the
        squares x<sub>1</sub>², …, x<sub>k−1</sub>² cancel:
      </p>

      <div class="math-display">
        SS<sub>k</sub> − SS<sub>k−1</sub><br />
        = x<sub>k</sub>² − k·M<sub>k</sub>² + (k − 1)·M<sub>k−1</sub>²
      </div>

      <h3>3.2 — Step 2: remove (k − 1)·M<sub>k−1</sub></h3>

      <p>
        From Knuth's recurrence, (k − 1)·M<sub>k−1</sub> =
        k·M<sub>k</sub> − x<sub>k</sub>. Multiplying by
        M<sub>k−1</sub>:
      </p>

      <div class="math-display">
        (k − 1)·M<sub>k−1</sub>²<br />
        = k·M<sub>k</sub>·M<sub>k−1</sub> − x<sub>k</sub>·M<sub>k−1</sub>
      </div>

      <p>Substituting and grouping:</p>

      <div class="math-display">
        SS<sub>k</sub> − SS<sub>k−1</sub><br />
        = x<sub>k</sub>(x<sub>k</sub> − M<sub>k−1</sub>)<br />
        − M<sub>k</sub> · k(M<sub>k</sub> − M<sub>k−1</sub>)
      </div>

      <h3>3.3 — Step 3: use Knuth again</h3>

      <p>
        Since k(M<sub>k</sub> − M<sub>k−1</sub>) =
        x<sub>k</sub> − M<sub>k−1</sub>, both terms contain the
        factor (x<sub>k</sub> − M<sub>k−1</sub>):
      </p>

      <div class="math-display">
        SS<sub>k</sub> − SS<sub>k−1</sub><br />
        = (x<sub>k</sub> − M<sub>k−1</sub>)(x<sub>k</sub> − M<sub>k</sub>)
      </div>

      <div class="hmw2-key-idea">
        <span>WELFORD'S RECURRENCE</span>
        <strong>
          SS<sub>k</sub> = SS<sub>k−1</sub> + (x<sub>k</sub> − M<sub>k−1</sub>)(x<sub>k</sub> − M<sub>k</sub>)
        </strong>
        <small>
          Starting from SS<sub>1</sub> = 0. The increment is the
          product of the deviation of the new value from the old
          mean and from the new mean. Using the second identity of
          section 02 it can also be written as
          (k − 1)/k · (x<sub>k</sub> − M<sub>k−1</sub>)², which shows
          that SS never decreases.
        </small>
      </div>

      <p class="panel-note">
        The form Σx² − k·M² is used only as an algebraic step.
        Computing SS with it directly is the naive method of
        section 07, which loses precision. The recurrence works
        with deviations from the mean, which stay small.
      </p>

    </section>


    <!-- ==========================================
         04 / RECURRENCES FOR THE VARIANCE
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw5-variance-title"
    >

      <div class="panel-label">
        04 / RECURRENCES FOR THE VARIANCE
      </div>

      <h2 id="hmw5-variance-title">
        From the Sum of Squares to the Variance
      </h2>

      <p>
        The variance is the sum of squares divided by the number of
        degrees of freedom. The sample variance, used to estimate
        the variance of the population the data come from, divides
        by k − 1 and is defined from k = 2:
      </p>

      <div class="math-display">
        s<sub>k</sub>² = SS<sub>k</sub> / (k − 1)
      </div>

      <p>
        Dividing Welford's recurrence (in the form with
        (k − 1)/k · δ², where δ = x<sub>k</sub> − M<sub>k−1</sub>)
        by k − 1 gives a recurrence for the variance itself:
      </p>

      <div class="math-display">
        s<sub>k</sub>² = (k − 2)/(k − 1) · s<sub>k−1</sub>²<br />
        + (x<sub>k</sub> − M<sub>k−1</sub>)² / k
      </div>

      <p>
        For the population variance σ̂<sub>k</sub>² = SS<sub>k</sub>/k,
        dividing by k instead:
      </p>

      <div class="math-display">
        σ̂<sub>k</sub>² = (k − 1)/k · σ̂<sub>k−1</sub>²<br />
        + (k − 1)/k² · (x<sub>k</sub> − M<sub>k−1</sub>)²
      </div>

      <p>
        In practice it is simpler to update SS and divide only
        when the variance is needed: the division never accumulates
        rounding errors. The direct recurrence is computed in the
        laboratory of section 06 to check that the two forms agree.
      </p>

      <p class="panel-note">
        Why k − 1? The deviations are measured from M<sub>k</sub>,
        which is itself computed from the same data and is closer to
        them than the true mean. This makes SS<sub>k</sub> too small
        on average: E[SS<sub>k</sub>] = (k − 1)σ². Dividing by k − 1
        removes the bias. Homework 4.2 verifies it by simulation.
      </p>

    </section>


    <!-- ==========================================
         05 / THE CODE
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw5-code-title"
    >

      <div class="panel-label">
        05 / THE CODE
      </div>

      <h2 id="hmw5-code-title">
        Three Lines
      </h2>

      <p>
        For each new value x, with k the number of values seen so
        far including x:
      </p>

      <pre class="hmw5-code hmw5-code-core"><code>${escapeHtml(CORE_CODE)}</code></pre>

      <p>
        The order matters: delta must be computed with the old
        mean, before the mean is updated, and the last line uses
        both the old deviation (delta) and the new one (x − mean).
        This is exactly (x<sub>k</sub> − M<sub>k−1</sub>)(x<sub>k</sub> − M<sub>k</sub>).
      </p>

      <h3>The complete module</h3>

      <p>
        The state is three numbers: count, mean and ss. The variance
        is read from them on request. This is the code of
        <code class="hmw5-inline-code">js/homeworks/hmw5/welford.js</code>
        that runs on this page and in Homework 4.2:
      </p>

      <pre class="hmw5-code"><code>${escapeHtml(FULL_CODE)}</code></pre>

      <p class="panel-note">
        Memory: O(1), three numbers whatever the number of values.
        Time: O(1) per value, one subtraction, one division, one
        multiplication and two additions.
      </p>

    </section>


    <!-- ==========================================
         06 / STEP-BY-STEP LABORATORY
         ========================================== -->

    ${renderHmw5Lab()}


    <!-- ==========================================
         07 / NUMERICAL STABILITY
         ========================================== -->

    ${renderHmw5Stability()}


    <!-- ==========================================
         08 / CONCLUSIONS
         ========================================== -->

    ${renderHmw5Conclusion()}

  `;
}
