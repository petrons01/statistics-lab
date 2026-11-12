/*
 * Statistics-Lab — Homework 5.1 (internal folder: hmw7)
 * Section 07 — Conclusions
 *
 * Static text. The numbers quoted are those of section 05
 * (N = M = 3, 9, …, 19683) and section 06, which are deterministic:
 * no random numbers are involved in this homework.
 */

export function renderHmw7Conclusion() {
  return `
    <section class="panel hmw4-lab" id="hmw7-conclusion" aria-labelledby="hmw7-conclusion-title">

      <div class="panel-label">07 / CONCLUSIONS</div>

      <h2 id="hmw7-conclusion-title">What the Comparison Shows</h2>

      <h3>7.1 — Same Value Whenever Both Exist</h3>

      <p>
        For the six bounded functions, the Riemann midpoint sum and the
        mean Lebesgue sum approach the same exact value. At
        N = M = 19683 they differ by less than 2.2·10⁻⁷ for sin x, x²,
        |x − ½| and sin(x)/x, and by 1.3·10⁻⁴ and 1.3·10⁻⁵ for the two
        step functions, where both sums still carry an error of order
        1/N that keeps shrinking (the upper Lebesgue sum is exact
        there). For 1/√x, which
        is unbounded, both still approach 2 (errors of 4·10⁻³ and
        1·10⁻³), but only the Lebesgue integral exists in the proper
        sense; the Riemann one is an improper limit, and every rule
        that evaluates f(0) gives ∞. This is the theorem of section
        2.3 seen in numbers: where the Riemann integral exists, the
        Lebesgue integral exists too and has the same value.
      </p>

      <h3>7.2 — Accuracy and Convergence</h3>

      <p>
        For smooth functions, left-endpoint Riemann sums converge with
        order 1 (order 2 for sin x and |x − ½|, but only because
        f(a) = f(b) makes them equal to the trapezoidal rule), midpoint
        and trapezoidal sums with order 2. The upper and lower Lebesgue
        sums converge with order 1, their mean with order 1.5: the flat point of
        sin x, x² or sin(x)/x turns into a square-root singularity of
        μ(f &gt; t). Each approach has its own weak spot. Riemann is
        hurt by features in x: a jump leaves an error of order 1/N. Lebesgue
        is hurt by flat spots of f, and does not care about jumps or
        corners: it is exact for the two step functions as soon as the
        levels contain their values, and its mean sum is exact for
        |x − ½| at every M.
      </p>

      <h3>7.3 — Efficiency</h3>

      <p>
        Measured in evaluations of f, Riemann is far cheaper for smooth
        functions: one evaluation per subinterval, against about 50 per
        level and crossing for the bisection that locates the
        preimages. For sin x the midpoint sum reaches an error of 10⁻⁶
        with 2187 evaluations, the mean Lebesgue sum needs 19683 levels
        and about two million evaluations. The balance reverses when
        the structure of f is known: for a step function two
        evaluations and three levels give the exact value. In practice
        Lebesgue's construction is a tool of theory more than of
        computation: its strength is which functions it can integrate,
        not how fast.
      </p>

      <h3>7.4 — Where Only Lebesgue Works</h3>

      <p>
        Dirichlet's function has upper Darboux sums 1 and lower sums 0
        for every partition: Riemann sums give 1 or 0 depending on the
        tags, so there is no Riemann integral. Its Lebesgue integral is
        0, because the rationals have measure 0. Thomae's function is
        Riemann integrable, but its upper sums fall slowly (0.457 at
        N = 10, 0.011 at N = 10000), while Lebesgue gives 0 at once.
        Neither function can even be evaluated on floating-point
        numbers, which are all rational: they need exact
        representations, as in section 6.
      </p>

      <div class="hmw2-key-idea">
        <span>IN ONE SENTENCE</span>
        <strong>
          Riemann slices the domain, Lebesgue slices the range: they
          agree whenever Riemann works, and Lebesgue keeps working
          when it does not.
        </strong>
        <small>
          For computing integrals of ordinary functions, slicing the
          domain is cheaper; for defining the integral of wild,
          unbounded or limit functions, slicing the range is what
          makes the theory of probability possible.
        </small>
      </div>

    </section>
  `;
}
