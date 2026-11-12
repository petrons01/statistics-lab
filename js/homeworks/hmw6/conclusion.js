/*
 * Statistics-Lab — Homework 4.2 (internal folder: hmw6)
 * Section 06 — Conclusions
 *
 * Static text. The numbers quoted are those shown by sections
 * 04 and 05 with their default settings: difficulty profile,
 * m = 1000 hackers, seed 2026.
 */

export function renderHmw6Conclusion() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw6-conclusion"
      aria-labelledby="hmw6-conclusion-title"
    >

      <div class="panel-label">
        06 / CONCLUSIONS
      </div>

      <h2 id="hmw6-conclusion-title">
        What the Comparisons Show
      </h2>

      <p>
        All numbers below come from sections 04 and 05 with their
        default settings (difficulty profile, μ = 3.53, σ² = 6.7691,
        m = 1000 hackers, seed 2026) and can be reproduced on this page.
      </p>


      <h3>6.1 — Comparing the Averages with μ and σ²</h3>

      <p>
        For every n from 2 to 1000, the average of the hackers'
        sampling means is within 1.1 standard errors of μ (for
        instance 3.5257 at n = 10 and 3.5285 at n = 1000), and the
        average of their sampling variances is within 1.4 standard
        errors of σ² (6.8855 at n = 10, 6.7617 at n = 1000). The
        sampling mean and the sampling variance are unbiased: on
        average they give the true values, for any number of systems,
        even n = 2. Dividing by n instead of n − 1 is not: at n = 2
        the average of SS/n is 3.4115, about half of σ² as the factor
        (n − 1)/n predicts, more than 20 standard errors away.
      </p>


      <h3>6.2 — Why This Matters in Inferential Statistics</h3>

      <p>
        In practice μ and σ² are unknown: we observe one sample and
        must estimate them. These results justify doing so with x̄
        and s². They are unbiased, so they do not systematically
        over- or underestimate; they are consistent, because their
        spread shrinks to 0 as n grows; and their sampling
        distributions are known, with standard error σ/√n for x̄,
        estimated by s/√n. This is what turns a single sample into
        a statement about the population: confidence intervals such
        as x̄ ± 1.96·s/√n and hypothesis tests on μ are built on
        exactly these properties. The n − 1 in s² is not a
        convention but the correction that makes the estimate of σ²
        unbiased, because x̄ is computed from the same data.
      </p>


      <h3>6.3 — The Effect of More Systems per Hacker</h3>

      <p>
        As n grows from 10 to 1000, the standard deviation of the
        sampling means across hackers falls from 0.803 to 0.085
        (theory σ/√n: 0.823 and 0.082), and that of the sampling
        variances from 2.90 to 0.27 (theory 2.82 and 0.26). Both fall
        like 1/√n: a hundred times more systems make each hacker's
        estimates about ten times more precise. The variance is
        harder to pin down than the mean: at n = 1000 a single
        hacker's s² is uncertain by about 3.9% of σ², against 2.3%
        of μ for x̄, and the gap widens for heavy-tailed scores,
        because Var(s²) grows with the kurtosis. At small n the
        sampling distribution of s² is also strongly skewed.
      </p>


      <h3>6.4 — Hackers and Systems</h3>

      <p>
        Read in the penetration context: a hacker who has attempted
        few systems has an unreliable picture of both their average
        success and its variability, even though, across many
        hackers, these estimates are right on average. More attempts
        per hacker (larger n) make each individual assessment
        trustworthy; more hackers (larger m) make the collective
        averages precise, with standard errors that shrink like
        1/√m. The two effects are distinct, as in Homework 3.
      </p>


      <h3>6.5 — Limits of the Simulation</h3>

      <p>
        The score distributions are modelling choices, not measured
        data. Results for different n are read from the same score
        sequences, so they are not independent; each average carries
        a sampling error of order 1/√m, which the z-scores make
        explicit. Randomness comes from the seeded Mulberry32
        generator of Homework 3, adequate for simulation but not for
        security purposes.
      </p>


      <div class="hmw2-key-idea">
        <span>IN ONE SENTENCE</span>
        <strong>
          x̄ and s² are right on average for every n, and more precise as n grows.
        </strong>
        <small>
          Unbiasedness (with the n − 1 correction) and a spread that
          falls like 1/√n are what allow a single sample of n scores
          to tell us about the whole population of attempts.
        </small>
      </div>

    </section>
  `;
}
