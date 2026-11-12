/*
 * Statistics-Lab
 * Homework 3 — Stochastic Processes, LLN & CLT
 *
 * Public route: #/hmw4
 * (internal name hmw4: the folder hmw3 already hosts Homework 2)
 *
 * Theoretical sections 01–06.
 * Interactive sections from 07 onwards.
 */

import { renderHmw4Trajectories } from '../homeworks/hmw4/trajectories-ui.js';
import { renderHmw4Distributions } from '../homeworks/hmw4/distributions-ui.js';
import { renderHmw4Lln } from '../homeworks/hmw4/lln-ui.js';
import { renderHmw4Clt } from '../homeworks/hmw4/clt-ui.js';
import { renderHmw4Aggregate } from '../homeworks/hmw4/aggregate-ui.js';
import { renderHmw4Conclusion } from '../homeworks/hmw4/conclusion.js';

export function renderHmw4() {
  return `
    <!-- ==========================================
         HOMEWORK HEADER
         ========================================== -->

    <section class="module-header">

      <div class="eyebrow">
        <span class="eyebrow-line"></span>
        HOMEWORK 3 · STOCHASTIC PROCESSES, LLN & CLT
      </div>

      <span class="module-status">
        PROBABILITY · INTERACTIVE LAB
      </span>

    </section>


    <!-- ==========================================
         INTRODUCTION
         ========================================== -->

    <section class="module-intro">

      <h1>
        Stochastic Penetration<br />
        <span>Processes.</span>
      </h1>

      <p>
        A simulation study of n systems and m attackers,
        modelled as random walks with independent and
        identically distributed increments, used to observe
        the Law of Large Numbers and the Central Limit Theorem
        at work.
      </p>

    </section>


    <!-- ==========================================
         01 / HOMEWORK OVERVIEW
         ========================================== -->

    <div class="module-layout">

      <section
        class="panel panel-large"
        aria-labelledby="hmw4-overview-title"
      >

        <div class="panel-label">
          01 / HOMEWORK OVERVIEW
        </div>

        <h2 id="hmw4-overview-title">
          From Single Attacks to Limit Theorems
        </h2>

        <p>
          Each attacker tries to penetrate a sequence of
          systems and receives a random score on each of
          them. Accumulating these scores produces a
          stochastic process: a random walk whose shape
          depends on the score model.
        </p>

        <p>
          We compare two models, Bernoulli and Rademacher,
          and study three quantities built from the total
          score: the total itself, the average per system
          and the total rescaled by the square root of the
          number of systems.
        </p>

        <p>
          By simulating many independent attackers we
          observe how the distributions of these quantities
          change as the number of systems grows, and we
          compare what we see with the predictions of the
          Law of Large Numbers and of the Central Limit
          Theorem.
        </p>

      </section>


      <aside
        class="panel panel-side"
        aria-labelledby="hmw4-objectives-title"
      >

        <div class="panel-label">
          LEARNING OBJECTIVES
        </div>

        <h2 id="hmw4-objectives-title">
          What will we investigate?
        </h2>

        <p>
          Random walks with i.i.d. increments.
        </p>

        <p>
          How the variance changes under different
          normalizations of the total score.
        </p>

        <p>
          Convergence in probability of the average score
          (Law of Large Numbers).
        </p>

        <p>
          Convergence in distribution of the normalized
          score to N(0, 1) (Central Limit Theorem).
        </p>

        <p>
          The different roles of the number of systems n
          and of the number of attackers m.
        </p>

        <p class="panel-note">
          All results come from reproducible simulations
          driven by a seeded pseudo-random generator.
        </p>

      </aside>

    </div>


    <!-- ==========================================
         02 / THE PENETRATION MODEL
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw4-model-title"
    >

      <div class="panel-label">
        02 / THE PENETRATION MODEL
      </div>

      <h2 id="hmw4-model-title">
        Systems, Attackers and Scores
      </h2>


      <!-- SYSTEMS AND ATTACKERS -->

      <h3>
        2.1 — Modelling Assumption
      </h3>

      <p>
        We consider n systems and m attackers. Each
        attacker attacks the n systems one after the other
        and obtains a score X<sub>i</sub> on the i-th system.
        The m attackers act independently of each other.
      </p>

      <p>
        The scores X<sub>1</sub>, X<sub>2</sub>, …,
        X<sub>n</sub> of one attacker are independent and
        identically distributed (i.i.d.). Their partial sums
        form the penetration process of that attacker:
      </p>

      <div class="math-display">
        S<sub>k</sub> = X<sub>1</sub> + X<sub>2</sub> + … + X<sub>k</sub>
      </div>

      <p>
        Starting from S<sub>0</sub> = 0, the process moves
        by one random increment at every system:
        S<sub>k</sub> = S<sub>k−1</sub> + X<sub>k</sub>.
        This is a random walk.
      </p>

      <div class="hmw2-key-idea">
        <span>ROLES OF n AND m</span>
        <strong>
          n = length of each walk · m = number of walks
        </strong>
        <small>
          n determines the theoretical behaviour of a single
          attacker's score. m is the size of the sample we
          observe: it determines how accurately the simulated
          distributions reflect the theory.
        </small>
      </div>


      <!-- BERNOULLI -->

      <h3>
        2.2 — Bernoulli Model
      </h3>

      <p>
        Each attack either succeeds (score 1) or fails
        (score 0), with success probability p.
      </p>

      <div class="math-display">
        P(X = 1) = p<br />
        P(X = 0) = 1 − p
      </div>

      <p>
        Since X takes only the values 0 and 1, we have
        X<sup>2</sup> = X, so E[X<sup>2</sup>] = E[X] = p.
      </p>

      <div class="math-display">
        μ = E[X] = p<br />
        σ² = Var(X) = p(1 − p)
      </div>

      <p>
        The total score S<sub>n</sub> counts the successful
        penetrations and follows a Binomial(n, p)
        distribution. The walk never decreases.
      </p>


      <!-- RADEMACHER -->

      <h3>
        2.3 — Rademacher Model
      </h3>

      <p>
        Each attack moves the score up or down by one unit
        with equal probability. This is the symmetric,
        zero-mean case.
      </p>

      <div class="math-display">
        P(X = +1) = P(X = −1) = 1/2
      </div>

      <p>
        The mean is (+1)·½ + (−1)·½ = 0, and since
        X<sup>2</sup> = 1 always, the variance equals 1.
      </p>

      <div class="math-display">
        μ = 0<br />
        σ² = 1
      </div>

      <p>
        The walk oscillates around zero. After n steps,
        S<sub>n</sub> can only take values with the same
        parity as n: −n, −n + 2, …, n − 2, n.
      </p>


      <!-- MOMENTS OF THE TOTAL SCORE -->

      <h3>
        2.4 — Mean and Variance of the Total Score
      </h3>

      <p>
        Expectation is linear, so the mean of the sum is the
        sum of the means. Because the increments are
        independent, all covariances vanish and the
        variances add up as well.
      </p>

      <div class="math-display">
        E[S<sub>n</sub>] = nμ<br />
        Var(S<sub>n</sub>) = nσ²
      </div>

      <p>
        These two formulas, together with the rules
        E[aY + b] = aE[Y] + b and Var(aY + b) = a²Var(Y),
        give the mean and the variance of every quantity
        studied in this homework.
      </p>

      <p class="panel-note">
        The Rademacher model should not be read as plain
        success/failure: a score of −1 can be interpreted
        as a step back, for instance a detected and
        repelled intrusion attempt.
      </p>

    </section>


    <!-- ==========================================
         03 / THREE NORMALIZATIONS
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw4-normalizations-title"
    >

      <div class="panel-label">
        03 / THREE NORMALIZATIONS
      </div>

      <h2 id="hmw4-normalizations-title">
        Total, Average and Normalized Score
      </h2>

      <p>
        The assignment asks us to study S<sub>n</sub>
        divided by 1, by n and by √n. The only difference
        between them is the scaling factor, but it changes
        their behaviour completely as n grows.
      </p>


      <h3>
        3.1 — Total Score
      </h3>

      <div class="math-display">
        Var(S<sub>n</sub>) = nσ² &nbsp;→&nbsp; ∞
      </div>

      <p>
        The spread of the total score grows without limit:
        its standard deviation grows like √n.
      </p>


      <h3>
        3.2 — Average Score
      </h3>

      <div class="math-display">
        E[S<sub>n</sub>/n] = μ<br />
        Var(S<sub>n</sub>/n) = σ²/n → 0
      </div>

      <p>
        Dividing by n reduces the variance by a factor n²,
        more than it grows. The average score concentrates
        around μ: this is the Law of Large Numbers.
      </p>


      <h3>
        3.3 — Normalized Total Score
      </h3>

      <div class="math-display">
        E[S<sub>n</sub>/√n] = √n·μ<br />
        Var(S<sub>n</sub>/√n) = σ²
      </div>

      <p>
        Dividing by √n exactly balances the growth of the
        variance, which stays constant. This is the scale
        at which the shape of the distribution can be
        observed: the scale of the Central Limit Theorem.
      </p>

      <div class="hmw2-key-idea">
        <span>VARIANCE UNDER THE THREE NORMALIZATIONS</span>
        <strong>
          nσ² &nbsp;·&nbsp; σ²/n &nbsp;·&nbsp; σ²
        </strong>
        <small>
          Dividing by n is too strong: the distribution
          collapses to a point. Not dividing is too weak:
          it spreads out indefinitely. Dividing by √n is
          the only choice that keeps the spread fixed.
        </small>
      </div>


      <h3>
        3.4 — A Warning for the Bernoulli Model
      </h3>

      <p>
        In the Rademacher case μ = 0 and σ² = 1, so
        S<sub>n</sub>/√n has mean 0 and variance 1 for
        every n.
      </p>

      <p>
        In the Bernoulli case, instead, the mean of
        S<sub>n</sub>/√n is √n·p, which grows without limit:
        the distribution keeps its width but drifts to the
        right. S<sub>n</sub>/√n therefore does not converge
        to N(0, 1). The quantity that does is the centered
        and standardized score:
      </p>

      <div class="math-display">
        (S<sub>n</sub> − np) / √(np(1 − p))
      </div>

      <p class="panel-note">
        Sections 07, 08 and 10 show both quantities for the
        Bernoulli model, to make the role of centering visible.
      </p>

    </section>


    <!-- ==========================================
         04 / LIMIT THEOREMS
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw4-limits-title"
    >

      <div class="panel-label">
        04 / LIMIT THEOREMS
      </div>

      <h2 id="hmw4-limits-title">
        Two Different Kinds of Convergence
      </h2>


      <h3>
        4.1 — Law of Large Numbers
      </h3>

      <p>
        The average score converges in probability to μ:
        for every tolerance ε &gt; 0, the probability of
        deviating from μ by more than ε tends to zero.
      </p>

      <div class="math-display">
        P(|S<sub>n</sub>/n − μ| &gt; ε) &nbsp;→&nbsp; 0
      </div>

      <p>
        A direct proof follows from Chebyshev's inequality
        applied to S<sub>n</sub>/n, whose variance is σ²/n:
      </p>

      <div class="math-display">
        P(|S<sub>n</sub>/n − μ| &gt; ε)<br />
        ≤ σ²/(nε²)
      </div>

      <p>
        In the simulation, this probability is estimated as
        the fraction of the m attackers whose average score
        lies farther than ε from μ.
      </p>


      <h3>
        4.2 — Central Limit Theorem
      </h3>

      <p>
        The standardized total score converges in
        distribution to the standard normal law: its
        cumulative distribution function approaches Φ at
        every point.
      </p>

      <div class="math-display">
        P((S<sub>n</sub> − nμ)/(σ√n) ≤ x)<br />
        → Φ(x)
      </div>

      <p>
        For the Rademacher model this quantity is exactly
        S<sub>n</sub>/√n. Section 10 compares its histogram with
        the N(0, 1) density and measures the largest gap
        between the two CDFs (Kolmogorov–Smirnov distance).
      </p>


      <h3>
        4.3 — Why the Two Are Different
      </h3>

      <p>
        The Law of Large Numbers says where the average
        goes: to a single number. The Central Limit Theorem
        says how the fluctuations around that number are
        distributed, once magnified by √n.
      </p>

      <p>
        Convergence in probability concerns the values of
        the random variables. Convergence in distribution
        concerns only their laws: it says nothing about
        individual trajectories getting close to each other.
      </p>

      <p class="panel-note">
        S<sub>n</sub> is discrete for every finite n, so its
        histogram can never be exactly normal. The gap
        between possible values of S<sub>n</sub>/√n is
        2/√n for Rademacher and shrinks as n grows.
      </p>

    </section>


    <!-- ==========================================
         05 / AGGREGATE SCORE
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw4-aggregate-title"
    >

      <div class="panel-label">
        05 / AGGREGATE PENETRATION SCORE
      </div>

      <h2 id="hmw4-aggregate-title">
        All Attackers Together
      </h2>

      <p>
        Summing the total scores of the m attackers gives
        the aggregate penetration score on the n systems:
      </p>

      <div class="math-display">
        T = S<sub>n</sub><sup>(1)</sup> + … + S<sub>n</sub><sup>(m)</sup>
      </div>

      <p>
        T is a sum of n·m i.i.d. increments, therefore:
      </p>

      <div class="math-display">
        E[T] = mnμ<br />
        Var(T) = mnσ²
      </div>

      <p>
        The expected aggregate grows proportionally to mn,
        while its standard deviation grows only like √(mn).
        The relative uncertainty decreases: the overall
        rate T/(mn) becomes more and more predictable as
        systems and attackers are added.
      </p>

      <p class="panel-note">
        Each simulation produces a single value of T.
        Section 11 therefore compares it with its expectation
        through its z-score, rather than through a
        histogram.
      </p>

    </section>


    <!-- ==========================================
         06 / INTERACTIVE EXPERIMENTS
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw4-roadmap-title"
    >

      <div class="panel-label">
        06 / INTERACTIVE EXPERIMENTS
      </div>

      <h2 id="hmw4-roadmap-title">
        From Theory to Simulation
      </h2>

      <p>
        The following sections test the theory above on
        simulated attackers. Every experiment is reproducible:
        the same seed always gives the same results.
      </p>

      <ol class="roadmap">

        <li>
          <span>07</span>
          <div>
            <strong>Sample Trajectories</strong>
            <small>
              Paths of a few attackers under the four
              normalizations, with mean and ±2 SD band.
            </small>
          </div>
        </li>

        <li>
          <span>08</span>
          <div>
            <strong>Distributions of the Three Quantities</strong>
            <small>
              Histograms for n = 10 to 1000 on a common scale,
              and empirical against theoretical variances.
            </small>
          </div>
        </li>

        <li>
          <span>09</span>
          <div>
            <strong>Law of Large Numbers</strong>
            <small>
              Probability that the average score misses μ by
              more than ε, against Chebyshev and the normal
              approximation.
            </small>
          </div>
        </li>

        <li>
          <span>10</span>
          <div>
            <strong>Central Limit Theorem</strong>
            <small>
              Histogram, empirical CDF and Kolmogorov–Smirnov
              distance from N(0, 1) as n grows.
            </small>
          </div>
        </li>

        <li>
          <span>11</span>
          <div>
            <strong>System Size, Attackers and Aggregate Score</strong>
            <small>
              The aggregate score for nine combinations of n
              and m, and the different roles of the two.
            </small>
          </div>
        </li>

        <li>
          <span>12</span>
          <div>
            <strong>Conclusions</strong>
            <small>
              What the simulations show, with the numbers
              obtained on this page and the limits of the method.
            </small>
          </div>
        </li>

      </ol>

    </section>


    <!-- ==========================================
         07 / SAMPLE TRAJECTORIES
         ========================================== -->

    ${renderHmw4Trajectories()}


    <!-- ==========================================
         08 / DISTRIBUTIONS OF THE THREE QUANTITIES
         ========================================== -->

    ${renderHmw4Distributions()}


    <!-- ==========================================
         09 / LAW OF LARGE NUMBERS
         ========================================== -->

    ${renderHmw4Lln()}


    <!-- ==========================================
         10 / CENTRAL LIMIT THEOREM
         ========================================== -->

    ${renderHmw4Clt()}


    <!-- ==========================================
         11 / SYSTEM SIZE, ATTACKERS AND AGGREGATE SCORE
         ========================================== -->

    ${renderHmw4Aggregate()}


    <!-- ==========================================
         12 / CONCLUSIONS
         ========================================== -->

    ${renderHmw4Conclusion()}

  `;
}
