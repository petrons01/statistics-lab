/*
 * Statistics-Lab — Homework 4.1 (internal folder: hmw5)
 * Section 08 — Conclusions
 *
 * Static text. The numbers quoted are those shown by sections
 * 06 and 07 with their default data.
 */

export function renderHmw5Conclusion() {
  return `
    <section
      class="panel hmw4-lab"
      id="hmw5-conclusion"
      aria-labelledby="hmw5-conclusion-title"
    >

      <div class="panel-label">
        08 / CONCLUSIONS
      </div>

      <h2 id="hmw5-conclusion-title">
        What Welford's Method Gives Us
      </h2>

      <h3>8.1 — The Recurrences</h3>

      <p>
        Knuth's recurrence updates the mean by a fraction 1/k of the
        deviation of the new value from the old mean. Applying the
        same idea to the sum of squared deviations, and using Knuth's
        recurrence twice, gives Welford's recurrence:
        SS<sub>k</sub> = SS<sub>k−1</sub> + (x<sub>k</sub> − M<sub>k−1</sub>)(x<sub>k</sub> − M<sub>k</sub>).
        Dividing by k − 1 or by k gives the sample and the population
        variance, either at the end or through their own recurrences.
      </p>

      <h3>8.2 — The Algorithm</h3>

      <p>
        The core is three lines: deviation from the old mean, new
        mean, new sum of squares. The state is three numbers, so
        memory does not grow with the data, and each value is used
        once. This makes the method suitable for data streams, for
        data too large to store, and for the situation of
        Homework 4.2, where every hacker's scores are summarized
        system after system.
      </p>

      <h3>8.3 — Verification</h3>

      <p>
        On the example {4, 7, 13, 16} the table of section 06
        reproduces the exact values M<sub>4</sub> = 10, SS<sub>4</sub> = 90
        and s² = 30, and the direct recurrence for the variance agrees
        with SS/(k − 1) at every step. On any data entered, Welford
        and the two-pass formula agree up to rounding errors of the
        order of 10<sup>−15</sup>.
      </p>

      <h3>8.4 — Numerical Stability</h3>

      <p>
        The naive one-pass formula Σx² − (Σx)²/n is algebraically
        equivalent but subtracts two huge, almost equal numbers. On
        the example shifted by c, it returns 29.33 instead of 30 at
        c = 10<sup>8</sup> and a negative variance, −170.67, at
        c = 10<sup>9</sup>, while Welford returns 30 for every offset
        up to 10<sup>15</sup>. On 1000 scores, the naive formula has
        fewer than 3 correct digits from c = 10<sup>7</sup>; Welford
        still has 3 at c = 10<sup>15</sup>. Its error grows like c/σ
        instead of (c/σ)², because it never squares the offset.
      </p>

      <div class="hmw2-key-idea">
        <span>IN ONE SENTENCE</span>
        <strong>
          One pass, three numbers, three lines, and no catastrophic cancellation.
        </strong>
        <small>
          Welford's recurrence computes the mean and the variance
          incrementally with the same cost as the naive formula, but
          works with deviations from the running mean, which keeps
          the result accurate when the data are large compared with
          their spread.
        </small>
      </div>

    </section>
  `;
}
