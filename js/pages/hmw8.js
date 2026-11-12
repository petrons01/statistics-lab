/*
 * Statistics-Lab
 * Homework 5.2 — Numerical Computation of the Normal CDF
 *
 * Public route: #/hmw8
 * (internal name hmw8: the course numbering is shown on the page)
 *
 * Overview 01, Liouville 02, erf 03, methods 04, calculator 05,
 * accuracy 06, efficiency 07, conclusions and sources 08.
 */

import {
  positiveSeriesCdf,
  tailContinuedFraction,
  hybridCdf,
  accurateDensity
} from '../homeworks/hmw8/normal-cdf.js';
import { renderHmw8Calculator } from '../homeworks/hmw8/calculator-ui.js';
import { renderHmw8Accuracy } from '../homeworks/hmw8/accuracy-ui.js';
import { renderHmw8Efficiency } from '../homeworks/hmw8/efficiency-ui.js';
import { renderHmw8Conclusion } from '../homeworks/hmw8/conclusion.js';

const escapeHtml = text => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/* The code shown is the code that runs: taken from the functions themselves */
const sourceOf = fn => escapeHtml(fn.toString());

const METHOD_ROWS = [
  ['Trapezoidal and Simpson rules', 'Integration', 'Φ(z) = ½ ± ∫₀^|z| φ(t) dt with N = 100 subintervals (the rules of Homework 5.1)', 'Absolute error O(h²), O(h⁴)'],
  ['Taylor series of erf', 'Series', 'Φ(z) = ½ + (1/√(2π)) Σ (−1)ᵏ z²ᵏ⁺¹ / (2ᵏ (2k+1) k!), the series of the course notes', 'Exact in theory; loses ≈ 0.22·z² digits'],
  ['Positive series (Marsaglia)', 'Series', 'Φ(z) = ½ + φ(z)·(z + z³/3 + z⁵/(3·5) + …)', 'No cancellation inside the sum'],
  ['Laplace continued fraction', 'Continued fraction', '1 − Φ(x) = φ(x) / (x + 1/(x + 2/(x + 3/(x + …)))), x &gt; 0', 'Fast and accurate for large x, slow near 0'],
  ['Abramowitz–Stegun 7.1.26', 'Approximation of erf', 'erfc(x) ≈ (a₁t + … + a₅t⁵)·e^(−x²), t = 1/(1 + 0.3275911·x)', '|error of erf| ≤ 1.5·10⁻⁷'],
  ['Numerical Recipes erfc', 'Approximation of erf', 'Chebyshev fit of erfc(x)·e^(x²); used by the charts of Homework 3', 'Relative error ≤ 1.2·10⁻⁷'],
  ['Hart 5666 / West', 'Rational approximation', 'Ratio of polynomials of degree 6 and 7 times e^(−z²/2); short continued fraction for |z| ≥ 7.07', 'Double precision, absolute'],
  ['Series + continued fraction (ours)', 'Hybrid', 'Positive series for |z| &lt; 2, continued fraction for the tail beyond', 'Close to double precision, relative']
];

export function renderHmw8() {
  return `
    <!-- ==========================================
         HOMEWORK HEADER
         ========================================== -->

    <section class="module-header">

      <div class="eyebrow">
        <span class="eyebrow-line"></span>
        HOMEWORK 5.2 · NUMERICAL COMPUTATION OF THE NORMAL CDF
      </div>

      <span class="module-status">
        NUMERICAL ANALYSIS · INTERACTIVE LAB
      </span>

    </section>


    <!-- ==========================================
         INTRODUCTION
         ========================================== -->

    <section class="module-intro">

      <h1>
        A Function with No Formula<br />
        <span>and a Value for Every z.</span>
      </h1>

      <p>
        Φ(z), the probability that a standard normal variable is at
        most z, appears in every z-test and confidence interval, yet it
        cannot be written with elementary functions. We see why, and
        then build, test and time the algorithms that compute it.
      </p>

    </section>


    <!-- ==========================================
         01 / HOMEWORK OVERVIEW
         ========================================== -->

    <div class="module-layout">

      <section class="panel panel-large" aria-labelledby="hmw8-overview-title">

        <div class="panel-label">01 / HOMEWORK OVERVIEW</div>

        <h2 id="hmw8-overview-title">Computing Φ Efficiently and Accurately</h2>

        <p>
          The assignment asks for an efficient method to compute the
          cumulative distribution function of the standard normal
          distribution, compared with a reliable numerical reference
          found on the web, and for an explanation of why Φ has no
          elementary expression and how the error function helps.
        </p>

        <p>
          We implement nine methods: numerical integration, two
          series, a continued fraction, three published approximations
          and our own combination of a series and a continued fraction.
          They are tested against two web tables (Wikipedia and NIST)
          and against values computed with 50-digit arithmetic, from
          z = −37 to 37: below −37.5, Φ(z) is too small for a normal double.
        </p>

      </section>


      <aside class="panel panel-side" aria-labelledby="hmw8-objectives-title">

        <div class="panel-label">LEARNING OBJECTIVES</div>

        <h2 id="hmw8-objectives-title">What will we investigate?</h2>

        <p>Why Φ is not an elementary function (Liouville).</p>

        <p>How erf represents Φ exactly, and what it does not solve.</p>

        <p>Integration, series, continued fractions, fitted formulas.</p>

        <p>Absolute against relative error, and the tails.</p>

        <p>The trade-off between speed and accuracy.</p>

        <p class="panel-note">
          JavaScript's Math library has exp, sin and log, but no erf:
          every method on this page is written from scratch.
        </p>

      </aside>

    </div>


    <!-- ==========================================
         02 / LIOUVILLE
         ========================================== -->

    <section class="panel" aria-labelledby="hmw8-liouville-title">

      <div class="panel-label">02 / WHY Φ HAS NO FORMULA</div>

      <h2 id="hmw8-liouville-title">Liouville's Theorem</h2>

      <div class="math-display">
        Φ(z) = ∫<sub>−∞</sub><sup>z</sup> e<sup>−t²/2</sup>/√(2π) dt
      </div>

      <p>
        Φ is a perfectly good function: φ is continuous, so Φ is
        differentiable with Φ′ = φ. The question is whether Φ can be
        written as an elementary function, that is, built from
        polynomials, exp, log, roots and trigonometric functions with
        finitely many arithmetic operations and compositions. The
        answer is no, and it was proved, not merely never found.
      </p>

      <h3>2.1 — The Theorem</h3>

      <p>
        In the form proved by Liouville (1835) and given an algebraic
        proof by Rosenlicht (1972), as quoted in the course notes: let
        f and g be rational functions with g not constant. Then
        ∫ f(x)·e<sup>g(x)</sup> dx is an elementary function if and only
        if there is a rational function R such that
      </p>

      <div class="math-display">
        R′(x) + g′(x)·R(x) = f(x)
      </div>

      <p>
        and in that case the antiderivative is R(x)·e<sup>g(x)</sup>.
      </p>

      <h3>2.2 — Applying It to e<sup>−x²/2</sup></h3>

      <p>
        Here f = 1 and g = −x²/2, so g′ = −x and we would need a rational
        R with R′ − x·R = 1.
      </p>

      <p>
        <strong>R cannot have a pole.</strong> If R had a pole of order
        m ≥ 1 at some point α, then R′ would have a pole of order m + 1
        there, while x·R has a pole of order at most m. The left side
        would have a pole at α, but the right side, 1, has none.
      </p>

      <p>
        <strong>R cannot be a polynomial.</strong> If R is a non-zero
        polynomial of degree d, then x·R has degree d + 1 and R′ degree
        d − 1, so R′ − x·R has degree d + 1 ≥ 1 and is not the constant 1.
        And R = 0 gives 0 ≠ 1.
      </p>

      <p>
        No rational R exists, so ∫ e<sup>−x²/2</sup> dx is not
        elementary, and neither is Φ, which differs from it by a
        constant factor and an additive constant.
      </p>

      <p class="panel-note">
        The definite integral over the whole line is another matter:
        ∫ e<sup>−x²/2</sup> dx = √(2π) follows from squaring it and
        switching to polar coordinates, as in the course notes. A number
        can be exact even when the function behind it has no formula.
      </p>

    </section>


    <!-- ==========================================
         03 / THE ERROR FUNCTION
         ========================================== -->

    <section class="panel" aria-labelledby="hmw8-erf-title">

      <div class="panel-label">03 / THE ERROR FUNCTION</div>

      <h2 id="hmw8-erf-title">An Exact Name Is Not a Number</h2>

      <div class="math-display">
        erf(x) = (2/√π) ∫<sub>0</sub><sup>x</sup> e<sup>−t²</sup> dt
      </div>

      <p>
        Substituting t = s/√2 in the integral of φ from 0 to z, and
        using Φ(0) = ½, gives an exact identity:
      </p>

      <div class="math-display">
        Φ(z) = ½ · [1 + erf(z/√2)]<br />
        <span>1 − Φ(z) = ½ · erfc(z/√2), &nbsp; erfc = 1 − erf</span>
      </div>

      <h3>3.1 — What erf Gives Us</h3>

      <p>
        The representation is exact: there is no approximation in it.
        erf is one of the special functions, with a standard name, a
        place in every handbook and known properties: it is odd, its
        Taylor series converges everywhere, erfc has a continued
        fraction and an asymptotic expansion, and many good
        approximations are published. Studying Φ through erf means
        reusing all of this.
      </p>

      <h3>3.2 — Why We Still Need Numerical Methods</h3>

      <p>
        But erf is defined by the very integral we could not do: giving
        it a name does not evaluate it. To print a digit of erf(1) we
        must still sum a series, evaluate a fraction or use a fitted
        formula. This is not special to erf: exp(1) and sin(1) are
        computed in exactly the same way, by algorithms inside the
        processor or the math library. Being elementary is a statement
        about formulas, not about how values are obtained. The only
        practical difference is that JavaScript ships an algorithm for
        exp and sin, and none for erf.
      </p>

      <h3>3.3 — The Series of the Course Notes</h3>

      <p>
        Expanding e<sup>−t²/2</sup> = Σ (−1)<sup>k</sup> t<sup>2k</sup>/(2<sup>k</sup> k!)
        and integrating term by term on [0, z], which the uniform
        convergence of the series allows:
      </p>

      <div class="math-display">
        Φ(z) = ½ + (1/√(2π)) ·<br />
        Σ<sub>k≥0</sub> (−1)<sup>k</sup> z<sup>2k+1</sup> / (2<sup>k</sup>(2k+1)·k!)
      </div>

      <p>
        The terms alternate in sign and, for a fixed z, eventually
        decrease in absolute value, so by the alternating series
        estimation theorem the error after a term is at most the next
        term. In exact arithmetic this converges for every z; in
        floating point the large early terms leave rounding errors
        that grow with |z|, as sections 06 and 07 show.
      </p>

    </section>


    <!-- ==========================================
         04 / METHODS
         ========================================== -->

    <section class="panel" aria-labelledby="hmw8-methods-title">

      <div class="panel-label">04 / THE METHODS</div>

      <h2 id="hmw8-methods-title">Nine Ways to Compute Φ</h2>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption>
            The nine methods compared in sections 05 to 07 (the two
            integration rules share a row). The tail methods
            compute 1 − Φ(|z|) directly and obtain Φ by symmetry, never
            as 1 minus a number close to 1 when Φ is small.
          </caption>
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col">Family</th>
              <th scope="col">Formula</th>
              <th scope="col">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            ${METHOD_ROWS.map(([name, family, formula, accuracy]) => `
              <tr>
                <th scope="row">${name}</th>
                <td>${family}</td>
                <td>${formula}</td>
                <td>${accuracy}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <h3>4.1 — Our Method</h3>

      <p>
        Each family is good somewhere and bad somewhere else. The
        positive series has no internal cancellation and converges in
        at most 25 terms for |z| &lt; 2. The continued fraction becomes
        faster as |z| grows and computes the small tail 1 − Φ directly.
        We join them at |z| = 2, where both are accurate and neither
        is slow:
      </p>

      <pre class="hmw5-code hmw5-code-core"><code>${sourceOf(hybridCdf)}</code></pre>

      <pre class="hmw5-code"><code>${sourceOf(positiveSeriesCdf)}</code></pre>

      <pre class="hmw5-code"><code>${sourceOf(tailContinuedFraction)}</code></pre>

      <p>
        Both use an accurate e<sup>−x²/2</sup>: x is split as s + r, with
        s rounded to sixteenths so that s² is exact, a trick of
        W. J. Cody. Computing x·x directly would add a relative error of
        about x²/2 · 10⁻¹⁶ to the result, 5·10⁻¹⁵ at x = 10.
      </p>

      <pre class="hmw5-code"><code>${sourceOf(accurateDensity)}</code></pre>

      <p class="panel-note">
        The code above is printed from the running functions, so it is
        exactly what the calculator executes.
      </p>

    </section>


    <!-- ==========================================
         05–08
         ========================================== -->

    ${renderHmw8Calculator()}

    ${renderHmw8Accuracy()}

    ${renderHmw8Efficiency()}

    ${renderHmw8Conclusion()}

  `;
}
