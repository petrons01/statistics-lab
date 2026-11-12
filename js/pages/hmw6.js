/*
 * Statistics-Lab
 * Homework 4.2 — Sampling Mean and Variance
 *
 * Public route: #/hmw6
 * (internal name hmw6: the course numbering is shown on the page)
 *
 * Overview 01, score distribution 02, theory 03, experiment 04,
 * variability 05, conclusions 06.
 */

import { renderHmw6Distribution } from '../homeworks/hmw6/distribution-ui.js';
import { renderHmw6Sampling } from '../homeworks/hmw6/sampling-ui.js';
import { renderHmw6Variability } from '../homeworks/hmw6/variability-ui.js';
import { renderHmw6Conclusion } from '../homeworks/hmw6/conclusion.js';

export function renderHmw6() {
  return `
    <!-- ==========================================
         HOMEWORK HEADER
         ========================================== -->

    <section class="module-header">

      <div class="eyebrow">
        <span class="eyebrow-line"></span>
        HOMEWORK 4.2 · SAMPLING MEAN AND VARIANCE
      </div>

      <span class="module-status">
        INFERENCE · INTERACTIVE LAB
      </span>

    </section>


    <!-- ==========================================
         INTRODUCTION
         ========================================== -->

    <section class="module-intro">

      <h1>
        From One Hacker's Scores<br />
        <span>to the Whole Population.</span>
      </h1>

      <p>
        Each of m hackers attempts n systems and summarizes the n
        scores with Welford's recurrence. Do their sampling means
        and variances recover the true μ and σ², and how much do
        they vary from hacker to hacker as n grows?
      </p>

    </section>


    <!-- ==========================================
         01 / HOMEWORK OVERVIEW
         ========================================== -->

    <div class="module-layout">

      <section
        class="panel panel-large"
        aria-labelledby="hmw6-overview-title"
      >

        <div class="panel-label">
          01 / HOMEWORK OVERVIEW
        </div>

        <h2 id="hmw6-overview-title">
          Extending the Penetration Model
        </h2>

        <p>
          In Homework 3 every attempt scored 0 or 1 (Bernoulli) or
          ±1 (Rademacher). Here each attempt receives a score between
          0 and 10, drawn from a fixed distribution with mean μ and
          variance σ². As before, m hackers each attempt n systems,
          and each hacker produces a trajectory of n scores.
        </p>

        <p>
          For every hacker we compute the sampling mean and the
          sampling variance of the n scores with Welford's recurrence
          from Homework 4.1. Across the m hackers we average these
          estimates and compare the averages with μ and σ². Repeating
          the experiment for n from 2 to 1000, we measure how the
          spread of the individual estimates shrinks.
        </p>

      </section>


      <aside
        class="panel panel-side"
        aria-labelledby="hmw6-objectives-title"
      >

        <div class="panel-label">
          LEARNING OBJECTIVES
        </div>

        <h2 id="hmw6-objectives-title">
          What will we investigate?
        </h2>

        <p>The sampling mean and variance as estimators.</p>

        <p>Unbiasedness: E[x̄] = μ and E[s²] = σ².</p>

        <p>Why the variance divides by n − 1.</p>

        <p>
          How the spread of the estimates decreases with n, and
          why the variance is harder to estimate than the mean.
        </p>

        <p>Why these results are the basis of inference.</p>

        <p class="panel-note">
          Every hacker uses the same three-line Welford code of
          Homework 4.1, imported from the same module.
        </p>

      </aside>

    </div>


    <!-- ==========================================
         02 / THE SCORE DISTRIBUTION
         ========================================== -->

    ${renderHmw6Distribution()}


    <!-- ==========================================
         03 / SAMPLING THEORY
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw6-theory-title"
    >

      <div class="panel-label">
        03 / SAMPLING THEORY
      </div>

      <h2 id="hmw6-theory-title">
        What to Expect from x̄ and s²
      </h2>

      <p>
        A hacker's scores X<sub>1</sub>, …, X<sub>n</sub> are
        independent, with mean μ and variance σ². The hacker
        computes two statistics, obtained from Welford's state
        (M<sub>n</sub>, SS<sub>n</sub>) after the n-th system:
      </p>

      <div class="math-display">
        x̄ = M<sub>n</sub><br />
        s² = SS<sub>n</sub> / (n − 1)
      </div>

      <p>
        They are random variables: another hacker, with other
        scores, obtains other values. Their distributions are called
        sampling distributions.
      </p>


      <h3>3.1 — The Sampling Mean</h3>

      <p>
        By linearity of expectation, and because the variances of
        independent variables add up:
      </p>

      <div class="math-display">
        E[x̄] = μ<br />
        Var(x̄) = σ² / n
      </div>

      <p>
        x̄ is an unbiased estimator of μ, and its standard deviation
        σ/√n, called the standard error, shrinks as n grows.
      </p>


      <h3>3.2 — The Sampling Variance and the n − 1</h3>

      <p>
        Writing X<sub>i</sub> − x̄ = (X<sub>i</sub> − μ) − (x̄ − μ)
        and expanding, the cross terms give
      </p>

      <div class="math-display">
        SS<sub>n</sub> = Σ (X<sub>i</sub> − μ)²<br />
        − n·(x̄ − μ)²
      </div>

      <p>Taking expectations, E[(X<sub>i</sub> − μ)²] = σ² and E[(x̄ − μ)²] = σ²/n:</p>

      <div class="math-display">
        E[SS<sub>n</sub>] = nσ² − σ² = (n − 1)σ²
      </div>

      <p>
        Hence E[s²] = σ²: dividing by n − 1 gives an unbiased
        estimator, while SS/n underestimates σ² by the factor
        (n − 1)/n. One degree of freedom is spent on estimating μ
        with x̄.
      </p>


      <h3>3.3 — How Much s² Varies</h3>

      <p>
        The variance of s² involves the fourth moment of the scores,
        through the excess kurtosis κ = μ<sub>4</sub>/σ⁴ − 3:
      </p>

      <div class="math-display">
        Var(s²) = σ⁴ · (2/(n − 1) + κ/n)
      </div>

      <p>
        For normal data κ = 0 and Var(s²) = 2σ⁴/(n − 1). Heavy tails
        (κ &gt; 0) make s² less stable, light tails (κ &lt; 0) more
        stable. In every case Var(s²) decreases like 1/n.
      </p>


      <h3>3.4 — Averaging over the m Hackers</h3>

      <p>
        The averages of the m estimates are themselves estimators,
        with the same expectations and m times smaller variances:
      </p>

      <div class="math-display">
        E[avg x̄] = μ, &nbsp; SE = σ/√(nm)<br />
        E[avg s²] = σ², &nbsp; SE = √(Var(s²)/m)
      </div>

      <p class="panel-note">
        As in Homework 3, the two parameters play different roles:
        n determines how reliable each hacker's own estimates are;
        m determines how precisely the simulation measures the
        averages and spreads of those estimates.
      </p>

    </section>


    <!-- ==========================================
         04 / THE EXPERIMENT
         ========================================== -->

    ${renderHmw6Sampling()}


    <!-- ==========================================
         05 / VARIABILITY AS n GROWS
         ========================================== -->

    ${renderHmw6Variability()}


    <!-- ==========================================
         06 / CONCLUSIONS
         ========================================== -->

    ${renderHmw6Conclusion()}

  `;
}
