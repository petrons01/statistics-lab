/*
 * Statistics-Lab — Homework 5.2 (internal folder: hmw8)
 * Section 08 — Conclusions and sources
 *
 * Static text. Accuracy figures come from section 06 and are
 * deterministic; times depend on the device and are quoted only
 * as ratios.
 */

export const SOURCES = [
  {
    label: 'R. V. Hogg, J. W. McKean, A. T. Craig, Introduction to Mathematical Statistics, section 3.4 (course notes by R. Gardner)',
    url: 'https://faculty.etsu.edu/gardnerr/4047/notes-Hogg-McKean-Craig/Hogg-McKean-Craig-3-4.pdf'
  },
  {
    label: 'Wikipedia, 68–95–99.7 rule (table of P(|Z| < k) to 15 decimals)',
    url: 'https://en.wikipedia.org/wiki/68%E2%80%9395%E2%80%9399.7_rule'
  },
  {
    label: 'NIST/SEMATECH e-Handbook of Statistical Methods, 1.3.6.7.1 Cumulative Distribution Function of the Standard Normal Distribution',
    url: 'https://itl.nist.gov/div898/handbook/eda/section3/eda3671.htm'
  },
  {
    label: 'M. Abramowitz, I. A. Stegun, Handbook of Mathematical Functions, formula 7.1.26 (DLMF chapter 7 is its successor)',
    url: 'https://dlmf.nist.gov/7'
  },
  {
    label: 'G. Marsaglia, Evaluating the Normal Distribution, Journal of Statistical Software 11(4), 2004',
    url: 'https://www.jstatsoft.org/article/view/v011i04'
  },
  {
    label: 'G. West, Better approximations to cumulative normal functions, Wilmott Magazine, 2005 (Hart\'s algorithm 5666)',
    url: null
  },
  {
    label: 'M. Rosenlicht, Integration in finite terms, American Mathematical Monthly 79(9), 1972',
    url: null
  }
];

export function renderHmw8Conclusion() {
  return `
    <section class="panel hmw4-lab" id="hmw8-conclusion" aria-labelledby="hmw8-conclusion-title">

      <div class="panel-label">08 / CONCLUSIONS</div>

      <h2 id="hmw8-conclusion-title">What We Learned About Φ</h2>

      <h3>8.1 — No Formula, but Many Algorithms</h3>

      <p>
        Liouville's theorem proves that no combination of elementary
        functions has derivative e<sup>−x²/2</sup>: Φ has no closed form.
        Writing Φ(z) = ½[1 + erf(z/√2)] is exact, but it only gives the
        integral a name; a number still requires an algorithm. So do
        exp and sin, for that matter: being elementary does not make a
        function computable without one, their algorithms are simply
        built into every math library. The
        definition of erf also suggests the algorithms: its Taylor
        series, its continued fraction, fitted rational formulas.
      </p>

      <h3>8.2 — Accuracy</h3>

      <p>
        Our method, the positive series for |z| &lt; 2 and Laplace's
        continued fraction beyond, reproduces all 16 Wikipedia values
        to 15 decimals and 409 of the 410 NIST entries; the one it
        misses, z = 1.36, is a rounding slip of the table. Against the
        high-precision grid its relative error stays below 9·10⁻¹⁵
        for 0 ≥ z ≥ −10, with the worst case just inside the switch at
        z = −2, and below 3·10⁻¹⁵ from z = −2 down to z = −37, where Φ is
        10⁻³⁰⁰. The decisive choices were to compute the small tail
        directly instead of as ½ − something, and to evaluate
        e<sup>−z²/2</sup> without the rounding error of z².
      </p>

      <h3>8.3 — Efficiency</h3>

      <p>
        Numerical integration is the most general and the slowest
        method, and with N = 100 Simpson's rule reaches only 10⁻¹⁰ in
        absolute error. The Taylor series of the course notes is cheap
        but loses about 0.22·z² digits to cancellation. Fixed formulas
        are the fastest: Hart's rational approximation is several times
        faster than our method and exact to double precision in
        absolute terms, but its relative error in the far tail is about
        10⁻⁸. Which method is "best" depends on the question: for
        p-values of 10⁻²⁰ the tail must be right in relative terms; for
        drawing a curve, the 10⁻⁷ approximation of Homework 3 is plenty.
      </p>

      <h3>8.4 — Two Lessons on Measuring Accuracy</h3>

      <p>
        Absolute error is the wrong yardstick in the tail: Φ(−8) ≈
        6·10⁻¹⁶, so an absolute error of 10⁻¹⁵ is a relative error above
        100%. And a reference can only test what it contains: the NIST
        table cannot tell a 10⁻⁷ method from a 10⁻¹⁵ one, and its own
        entry for z = 1.36 is matched only by a method with error 10⁻⁷.
        Testing a method needs a reference several digits more precise
        than the method itself.
      </p>

      <div class="hmw2-key-idea">
        <span>IN ONE SENTENCE</span>
        <strong>
          Φ has no elementary formula, so every value of it is computed:
          a series near the centre and a continued fraction in the tail
          give nearly every digit a double can hold.
        </strong>
        <small>
          erf turns the integral into a named function with known
          series and fractions; choosing among them, and measuring the
          error in relative terms, is what makes the result reliable.
        </small>
      </div>

      <h3>Sources</h3>

      <ul class="hmw8-sources">
        ${SOURCES.map(s => `
          <li>${s.url
            ? `<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`
            : s.label}</li>`).join('')}
      </ul>

    </section>
  `;
}
