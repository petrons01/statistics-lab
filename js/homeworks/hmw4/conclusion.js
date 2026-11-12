/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * Section 12 — Conclusions
 *
 * Static text. Every number quoted here is the value shown by
 * sections 08–11 with their default settings and seed 2026,
 * so the reader can reproduce each one on the page.
 */

export function renderHmw4Conclusion() {
  return `
    <section
      class="panel hmw4-lab hmw4-conclusion"
      id="hmw4-conclusion"
      aria-labelledby="hmw4-conclusion-title"
    >

      <div class="panel-label">
        12 / CONCLUSIONS
      </div>

      <h2 id="hmw4-conclusion-title">
        What the Simulations Show
      </h2>

      <p>
        All numbers below are those displayed by sections 08–11
        with their default settings and seed 2026, and can be
        reproduced on this page. They are single simulations:
        a different seed changes the digits, not the conclusions.
      </p>


      <!-- 12.1 -->

      <h3>12.1 — Variance under the Three Normalizations</h3>

      <p>
        The theory of section 03 predicts that, as n grows, the
        variance of S<sub>n</sub> grows like n, that of
        S<sub>n</sub>/n shrinks like 1/n, and that of
        S<sub>n</sub>/√n stays constant. With m = 1000 attackers
        the simulation reproduces all three behaviours, with
        deviations within the expected sampling error √(2/m) ≈ 4.5%.
      </p>

      <p>
        Over a hundredfold increase of n, the variance of the total
        score is multiplied by about 100, that of the average score
        is divided by about 100, and that of the normalized score is
        unchanged. Dividing by n is too strong, not dividing is too
        weak: √n is the only scale at which the fluctuations keep a
        fixed size.
      </p>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption>
            Theoretical and empirical variance (denominator m),
            m = 1000, section 08.
          </caption>
          <thead>
            <tr>
              <th scope="col">Quantity</th>
              <th scope="col">Theory</th>
              <th scope="col">Bernoulli n = 10</th>
              <th scope="col">Bernoulli n = 1000</th>
              <th scope="col">Rademacher n = 10</th>
              <th scope="col">Rademacher n = 1000</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Var(S<sub>n</sub>)</th>
              <td>nσ²</td>
              <td>2.176 (2.275)</td>
              <td>226.9 (227.5)</td>
              <td>9.386 (10)</td>
              <td>1034.3 (1000)</td>
            </tr>
            <tr>
              <th scope="row">Var(S<sub>n</sub>/n)</th>
              <td>σ²/n</td>
              <td>0.02176 (0.02275)</td>
              <td>2.27e-4 (2.27e-4)</td>
              <td>0.09386 (0.1)</td>
              <td>0.001034 (0.001)</td>
            </tr>
            <tr>
              <th scope="row">Var(S<sub>n</sub>/√n)</th>
              <td>σ²</td>
              <td>0.2176 (0.2275)</td>
              <td>0.2269 (0.2275)</td>
              <td>0.9386 (1)</td>
              <td>1.034 (1)</td>
            </tr>
          </tbody>
        </table>
      </div>


      <!-- 12.2 -->

      <h3>12.2 — Law of Large Numbers</h3>

      <p>
        The average score S<sub>n</sub>/n converges in probability
        to μ. With ε = 0.05 and m = 200 attackers (section 09), the
        fraction of attackers farther than ε from μ falls below 5%
        from n = 430 for Bernoulli (p = 0.35) and from n = 2800 for
        Rademacher. The normal approximation predicts the 5% level
        at n ≈ 350 and n ≈ 1537. Chebyshev's inequality, which
        proves the law, only guarantees it from n ≈ 1820 and
        n ≈ 8000: a valid but very conservative bound.
      </p>

      <p>
        The number of systems needed scales like σ²/ε². The
        Rademacher score, with about 4.4 times the variance (1
        versus 0.2275), needs about 4.4 times as many systems
        according to the normal approximation, and halving
        ε would quadruple both. The convergence is not monotone at
        every n: for the Rademacher model at n = 19, all 200
        attackers miss the corridor, because an odd S<sub>n</sub>
        can never be 0 and |S<sub>n</sub>/n| ≥ 1/19 &gt; 0.05.
        The law is a statement about the limit.
      </p>


      <!-- 12.3 -->

      <h3>12.3 — Central Limit Theorem</h3>

      <p>
        In the Rademacher case S<sub>n</sub>/√n converges in
        distribution to N(0, 1). With m = 1000 attackers
        (section 10), the Kolmogorov–Smirnov distance from Φ falls
        from 0.133 at n = 10 to 0.030 at n = 2000, and the share of
        attackers within ±1.96 settles near 95% (94.7% at n = 2000).
      </p>

      <p>
        Two effects limit how small the observed distance can be.
        At small n it is dominated by the discreteness of
        S<sub>n</sub>: the predicted floor 1/√(2πn) is 0.126 at
        n = 10, against an observed 0.133. At large n it reaches the
        sampling noise of m attackers, about 0.87/√m = 0.0275: from
        there, only more attackers, not more systems, would show a
        smaller distance. The theorem concerns n; the simulation
        is also limited by m.
      </p>


      <!-- 12.4 -->

      <h3>12.4 — Bernoulli and Rademacher</h3>

      <p>
        The two models differ only in μ and σ², but the difference
        in μ changes which limit theorems apply to which quantity.
        For Rademacher (μ = 0, σ² = 1), S<sub>n</sub>/√n is already
        centered and standardized, so it converges to N(0, 1).
        For Bernoulli (μ = p), S<sub>n</sub>/√n has the right spread,
        with variance p(1 − p), but its mean √n·p grows without
        limit: its distance from N(0, 1) rises from 0.655 at n = 10
        to 1.000 from n = 290 on, the largest possible value. Only
        after centering, (S<sub>n</sub> − np)/√(np(1 − p)), does the
        Bernoulli score converge, with distance 0.019 at n = 2000.
      </p>

      <p>
        Bernoulli paths never decrease and drift along the line kp;
        Rademacher paths wander around 0 with no preferred
        direction. In both cases the absolute spread of the paths
        grows like √n while their average per system settles.
      </p>


      <!-- 12.5 -->

      <h3>12.5 — Systems, Attackers and the Aggregate Score</h3>

      <p>
        The aggregate penetration score T of m attackers on n
        systems is a sum of mn independent increments, so its
        distribution depends only on the product mn: ten attackers
        on 1000 systems and 1000 attackers on 10 systems are
        equivalent. As mn grows from 100 to 1,000,000 (section 11),
        the standard deviation of T grows from 4.77 to 477 for
        Bernoulli: the aggregate becomes less predictable in
        absolute terms. Its rate T/(mn) moves from 0.42 to 0.3498,
        with a relative error falling from 13.6% to 0.14%: in
        relative terms it becomes almost deterministic.
      </p>

      <p>
        Read as a security scenario, a larger infrastructure and a
        larger attacker population make the expected number of
        successful penetrations, mnp, a reliable planning figure,
        while the exact count still fluctuates by about
        σ√(mn). In the symmetric Rademacher case the expected
        aggregate is 0 for every n and m, yet its spread grows
        like √(mn): even without any average advantage, long
        campaigns and many attackers produce some attackers who
        end far ahead, simply by chance.
      </p>

      <p>
        For individual attackers the two parameters play different
        roles. The number of systems n governs each process: how
        close one attacker's average gets to μ (law of large
        numbers) and how normal its fluctuations look (central
        limit theorem). The number of attackers m governs how well
        we observe those processes: it does not make any single
        attacker more predictable, it makes the estimated
        distributions, variances and probabilities more accurate.
      </p>


      <!-- 12.6 -->

      <h3>12.6 — Limits of the Simulation</h3>

      <p>
        Every empirical value carries a sampling error that depends
        on m: about √(2/m) relative error on variances,
        at most 0.5/√m absolute error on probabilities, and about
        0.87/√m on the Kolmogorov–Smirnov distance. S<sub>n</sub> is
        discrete for every finite n, so its histogram can never be
        exactly normal. The distributions shown for different n are
        snapshots of the same random walks, and the cells of the
        aggregate grid share attackers: they illustrate evolution,
        not independent experiments. Finally, all randomness comes
        from Mulberry32, a seeded pseudo-random generator chosen for
        reproducibility; it is adequate for simulation but not
        cryptographically secure.
      </p>


      <div class="hmw2-key-idea">
        <span>IN ONE SENTENCE</span>
        <strong>
          n decides what each process does; m decides how well we see it.
        </strong>
        <small>
          As the number of systems grows, the average score of every
          attacker settles on μ (Law of Large Numbers), its
          fluctuations magnified by √n become normal (Central Limit
          Theorem), and the aggregate of all attackers becomes
          predictable in relative terms while its absolute spread
          keeps growing like √(mn).
        </small>
      </div>

    </section>
  `;
}
