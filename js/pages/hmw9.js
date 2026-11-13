/*
 * Statistics-Lab
 * Homework 6 — Statistical Independence
 *
 * Public route: #/hmw9
 * (internal name hmw9: the course numbering is shown on the page)
 *
 * Overview 01, theory 02, from records to the table 03, expected
 * frequencies and chi-square 04, p-value 05, lab 06, association
 * and causation 07, conclusions 08.
 */

import { renderHmw9Analysis } from '../homeworks/hmw9/analysis-ui.js';
import { renderHmw9Lab } from '../homeworks/hmw9/lab-ui.js';
import { renderHmw9Simpson } from '../homeworks/hmw9/simpson-ui.js';
import { renderHmw9Conclusion } from '../homeworks/hmw9/conclusion.js';

/* Simplified from contingency.js: the same steps, fewer details */
const TABLE_CODE = `// 1. Count the pairs (x, f) into an r × c table
const counts = rows.map(() => new Array(cols.length).fill(0));
for (const record of records) {
  const i = rowIndex.get(record[xIndex]);   // category of X
  const j = colIndex.get(record[fIndex]);   // category of F
  counts[i][j]++;
}

// 2. Margins
const rowTotals = counts.map(row => row.reduce((s, v) => s + v, 0));        // n_i·
const colTotals = cols.map((_, j) => counts.reduce((s, row) => s + row[j], 0)); // n_·j
const n = rowTotals.reduce((s, v) => s + v, 0);

// 3. Expected counts under independence and Pearson's χ²
let chi2 = 0;
for (let i = 0; i < r; i++) {
  for (let j = 0; j < c; j++) {
    const E = rowTotals[i] * colTotals[j] / n;
    chi2 += (counts[i][j] - E) ** 2 / E;
  }
}
const df = (r - 1) * (c - 1);
const V = Math.sqrt(chi2 / (n * (Math.min(r, c) - 1)));  // Cramér's V`;

const escapeHtml = text => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export function renderHmw9() {
  return `
    <!-- ==========================================
         HOMEWORK HEADER
         ========================================== -->

    <section class="module-header">

      <div class="eyebrow">
        <span class="eyebrow-line"></span>
        HOMEWORK 6 · STATISTICAL INDEPENDENCE
      </div>

      <span class="module-status">
        CONTINGENCY TABLES · χ² TEST · INTERACTIVE LAB
      </span>

    </section>


    <!-- ==========================================
         INTRODUCTION
         ========================================== -->

    <section class="module-intro">

      <h1>
        Does Knowing X<br />
        <span>Tell Us Anything About F?</span>
      </h1>

      <p>
        Two variables are independent when the distribution of one is the
        same whatever the value of the other. We build contingency tables
        from raw records of network traffic and university admissions,
        compare them with what independence would predict, measure the gap
        with Pearson's χ², and ask what a dependence does, and does not,
        tell us about causes.
      </p>

    </section>


    <!-- ==========================================
         01 / HOMEWORK OVERVIEW
         ========================================== -->

    <div class="module-layout">

      <section class="panel panel-large" aria-labelledby="hmw9-overview-title">

        <div class="panel-label">01 / HOMEWORK OVERVIEW</div>

        <h2 id="hmw9-overview-title">From Records to a Verdict</h2>

        <p>
          The assignment asks, for a bivariate dataset (X, F), to build the
          contingency table programmatically, compute the marginal and
          conditional frequencies and the expected frequencies under
          independence, calculate the χ² statistic and its p-value, and
          decide whether the two variables are independent, distinguishing
          statistical association from causality.
        </p>

        <p>
          Two real datasets are included: 22,544 network connections of the
          NSL-KDD intrusion-detection benchmark, and the 4,526 applications to
          UC Berkeley in 1973 behind a famous case of Simpson's paradox. Any
          CSV file can be loaded as well. A simulator, where independence holds
          or fails by construction, shows how the test behaves.
        </p>

      </section>


      <aside class="panel panel-side" aria-labelledby="hmw9-objectives-title">

        <div class="panel-label">LEARNING OBJECTIVES</div>

        <h2 id="hmw9-objectives-title">What will we investigate?</h2>

        <p>Independence of events and of random variables.</p>

        <p>Joint, marginal and conditional frequencies.</p>

        <p>Expected counts, Pearson's χ² and its p-value.</p>

        <p>Evidence against strength: χ², p and Cramér's V.</p>

        <p>Why a dependence is not a cause.</p>

        <p class="panel-note">
          A test can only reject independence. Not rejecting it means the
          data are compatible with independence, not that it is proven.
        </p>

      </aside>

    </div>


    <!-- ==========================================
         02 / THEORY
         ========================================== -->

    <section class="panel" aria-labelledby="hmw9-theory-title">

      <div class="panel-label">02 / THE THEORY OF INDEPENDENCE</div>

      <h2 id="hmw9-theory-title">When One Variable Says Nothing About the Other</h2>


      <h3>2.1 — Independent Events</h3>

      <p>
        Two events A and B are independent when
      </p>

      <div class="math-display">P(A ∩ B) = P(A) · P(B)</div>

      <p>
        If P(B) &gt; 0 this is the same as P(A | B) = P(A): learning that B
        happened does not change the probability of A. Independence is not
        the same as being disjoint. Two disjoint events with positive
        probabilities are strongly dependent: if one happens, the other
        cannot.
      </p>


      <h3>2.2 — Independent Random Variables</h3>

      <p>
        Two discrete random variables X and F, with values x<sub>1</sub>, …,
        x<sub>r</sub> and f<sub>1</sub>, …, f<sub>c</sub>, are independent when
        every pair of events {X = x<sub>i</sub>} and {F = f<sub>j</sub>} is
        independent. The joint distribution is then the product of the
        marginals:
      </p>

      <div class="math-display">p<sub>ij</sub> = p<sub>i·</sub> · p<sub>·j</sub></div>

      <p>
        Equivalently, the conditional distribution of F given X = x<sub>i</sub>
        is the same for every i, and equals the marginal distribution of F; and
        symmetrically for X given F. For numerical variables, independence
        implies zero correlation, but not the other way round: correlation
        only sees linear relations. For categorical variables there is no
        correlation to compute, and independence must be checked on the whole
        table.
      </p>


      <h3>2.3 — Independence in a Sample</h3>

      <p>
        With n observations we count n<sub>ij</sub>, the records with
        X = x<sub>i</sub> and F = f<sub>j</sub>. The contingency table holds
        these counts, with row totals n<sub>i·</sub> and column totals
        n<sub>·j</sub>. Dividing by n gives the joint relative frequencies
        f<sub>ij</sub> and the marginal frequencies f<sub>i·</sub>,
        f<sub>·j</sub>; dividing a row by its total gives the conditional
        frequencies f(f<sub>j</sub> | x<sub>i</sub>) = n<sub>ij</sub> / n<sub>i·</sub>,
        the row profile. The sample analogue of independence is
        f<sub>ij</sub> = f<sub>i·</sub> f<sub>·j</sub>, that is
      </p>

      <div class="math-display">E<sub>ij</sub> = n<sub>i·</sub> · n<sub>·j</sub> / n</div>

      <p>
        the expected count of each cell if the two variables were
        independent, keeping the observed margins. A sample never matches
        this exactly, even when the population is independent: random
        sampling always leaves gaps. The question is whether the gaps are
        larger than chance would produce.
      </p>


      <h3>2.4 — Pearson's χ² Test</h3>

      <p>
        The null hypothesis H<sub>0</sub> is independence. Pearson (1900)
        measured the distance between observed and expected counts as
      </p>

      <div class="math-display">χ² = Σ (O<sub>ij</sub> − E<sub>ij</sub>)² / E<sub>ij</sub></div>

      <p>
        Each gap is divided by E<sub>ij</sub>, because a count with mean E has
        a variance close to E: the terms are squared standardized deviations.
        Under H<sub>0</sub> and for large n, χ² follows the χ² distribution
        with (r − 1)(c − 1) degrees of freedom: the table has rc − 1 free
        cells once n is fixed, and estimating the two margins uses
        (r − 1) + (c − 1) of them.
      </p>

      <ul class="hmw9-list">
        <li>
          <strong>Decision.</strong> At level α (usually 5%) independence is
          rejected when χ² exceeds the critical value χ²<sub>1−α</sub>, or
          equivalently when the p-value P(χ²<sub>df</sub> ≥ χ²<sub>obs</sub>)
          is below α. The p-value is computed assuming H<sub>0</sub>: it is
          not the probability that H<sub>0</sub> is true.
        </li>
        <li>
          <strong>Validity.</strong> The χ² distribution is a large-sample
          approximation. Cochran's rule asks for no expected count below 1 and
          at most 20% below 5. Otherwise categories can be merged, or the
          p-value obtained without approximation, by permutations or, for
          2 × 2 tables, Fisher's exact test. For 2 × 2 tables Yates' continuity
          correction is also common.
        </li>
        <li>
          <strong>Strength.</strong> χ² grows proportionally to n for a fixed
          dependence, so it measures evidence, not strength. Cramér's
          V = √(χ² / (n (min(r, c) − 1))) lies between 0 (independence in the
          sample) and 1 (perfect association: in a square table, each category
          of one variable determines the other).
          The adjusted residuals show which cells depart from independence.
        </li>
      </ul>


      <h3>2.5 — Association and Causation</h3>

      <p>
        A dependence between X and F is an <em>association</em>: the
        distribution of F changes with X. It does not say that X causes F. The
        same association arises if F causes X, if a third variable Z causes
        both (a <em>confounder</em>), if the way the data were collected links
        them (selection bias), or by chance. Section 07 shows a confounder at
        work.
      </p>


      <h3>2.6 — The Algorithm</h3>

      <p>
        The heart of sections 03 and 04, from <code class="hmw5-inline-code">contingency.js</code>:
      </p>

      <pre class="hmw5-code"><code>${escapeHtml(TABLE_CODE)}</code></pre>

      <p>
        The p-value is the upper tail of the χ² distribution, a regularized
        incomplete gamma function Q(df/2, χ²/2). It is computed in
        logarithms, by a power series or a continued fraction, as for Φ in
        Homework 5.2: with these datasets p-values reach 10⁻²⁵⁰ and beyond,
        where 1 − P(χ² ≤ x) would round to 0.
      </p>

    </section>


    <!-- ==========================================
         03 – 05 / DATA, TEST, P-VALUE
         ========================================== -->

    ${renderHmw9Analysis()}


    <!-- ==========================================
         06 / LAB
         ========================================== -->

    ${renderHmw9Lab()}


    <!-- ==========================================
         07 / ASSOCIATION IS NOT CAUSATION
         ========================================== -->

    ${renderHmw9Simpson()}


    <!-- ==========================================
         08 / CONCLUSIONS
         ========================================== -->

    ${renderHmw9Conclusion()}

  `;
}
