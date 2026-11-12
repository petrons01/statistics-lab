/*
 * Statistics-Lab
 * Homework 5.1 — Riemann and Lebesgue Integration
 *
 * Public route: #/hmw7
 * (internal name hmw7: the course numbering is shown on the page)
 *
 * Overview 01, theory 02, functions and code 03, lab 04,
 * convergence and efficiency 05, pathological functions 06,
 * conclusions 07.
 */

import { FUNCTIONS } from '../homeworks/hmw7/functions.js';
import { renderHmw7Lab } from '../homeworks/hmw7/lab-ui.js';
import { renderHmw7Convergence } from '../homeworks/hmw7/convergence-ui.js';
import { renderHmw7Pathological } from '../homeworks/hmw7/pathological-ui.js';
import { renderHmw7Conclusion } from '../homeworks/hmw7/conclusion.js';

/* Measure of {f > t} for 0 ≤ t < sup f, as listed in section 03 */
const MEASURES = {
  sin: 'π − 2·arcsin t',
  square: '1 − √t',
  step13: '1 for t &lt; 1, ½ for 1 ≤ t &lt; 3',
  abs: '1 − 2t',
  invsqrt: '1 for t &lt; 1, 1/t² for t ≥ 1',
  step10: '½ for t &lt; 1',
  sinc: 'x(t), the solution of sin(x)/x = t (no closed form)'
};

/* Simplified from riemann.js and lebesgue.js: same steps, fewer details */
const RIEMANN_CODE = `// Riemann: partition the domain [a, b] into N pieces
const h = (b - a) / N;
let sum = 0;
for (let i = 0; i < N; i++) {
  const tag = a + ((i + offset) * (b - a)) / N;  // offset 0, ½ or 1
  sum += f(tag);                                 // one evaluation
}
return sum * h;`;

const LEBESGUE_CODE = `// Lebesgue: partition the range [0, top] into M layers
const delta = top / M;
for (let k = 0; k < M; k++) {
  const level = (k * top) / M;
  measures[k] = measureAbove(f, level);  // length of {f > level}
}
measures[M] = 0;                         // nothing above the top
const upper = delta * sum(measures[0 … M−1]);
const lower = upper - delta * measures[0];
return (lower + upper) / 2;`;

const BISECTION_CODE = `// One crossing of a monotone piece: f(inside) > t ≥ f(outside)
while (Math.abs(outside - inside) > 1e-15 * pieceLength) {
  const mid = (inside + outside) / 2;
  if (f(mid) > t) inside = mid;
  else outside = mid;
}
return (inside + outside) / 2;            // about 50 evaluations`;

const escapeHtml = text => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export function renderHmw7() {
  return `
    <!-- ==========================================
         HOMEWORK HEADER
         ========================================== -->

    <section class="module-header">

      <div class="eyebrow">
        <span class="eyebrow-line"></span>
        HOMEWORK 5.1 · RIEMANN AND LEBESGUE INTEGRATION
      </div>

      <span class="module-status">
        INTEGRATION · INTERACTIVE LAB
      </span>

    </section>


    <!-- ==========================================
         INTRODUCTION
         ========================================== -->

    <section class="module-intro">

      <h1>
        Slicing the Area<br />
        <span>Vertically or Horizontally.</span>
      </h1>

      <p>
        Riemann cuts the x-axis into pieces and asks how high f is on
        each. Lebesgue cuts the y-axis into levels and asks how much of
        the x-axis lies above each level. We implement both, compare
        their accuracy, convergence and cost, and look for the
        functions on which they disagree.
      </p>

    </section>


    <!-- ==========================================
         01 / HOMEWORK OVERVIEW
         ========================================== -->

    <div class="module-layout">

      <section class="panel panel-large" aria-labelledby="hmw7-overview-title">

        <div class="panel-label">01 / HOMEWORK OVERVIEW</div>

        <h2 id="hmw7-overview-title">Two Ways to Add Up an Area</h2>

        <p>
          The assignment asks for two numerical integration methods
          inspired by the two definitions of the integral: a
          Riemann-type method, which partitions the domain, and a
          Lebesgue-type method, which partitions the range and measures
          the preimages of each part.
        </p>

        <p>
          Both are applied to seven functions with known integrals:
          smooth ones (sin x, x², sin(x)/x), one with a corner
          (|x − ½|), two step functions and the unbounded 1/√x. We
          measure how fast each method converges and how many
          evaluations of f it needs. Finally, Dirichlet's and Thomae's
          functions show where the two integrals really differ.
        </p>

      </section>


      <aside class="panel panel-side" aria-labelledby="hmw7-objectives-title">

        <div class="panel-label">LEARNING OBJECTIVES</div>

        <h2 id="hmw7-objectives-title">What will we investigate?</h2>

        <p>Riemann and Darboux sums, and when they converge.</p>

        <p>Measure, simple functions and the layer-cake formula.</p>

        <p>Turning both definitions into algorithms.</p>

        <p>Order of convergence and cost of each method.</p>

        <p>Functions integrable only in Lebesgue's sense.</p>

        <p class="panel-note">
          Lebesgue's own comparison: Riemann counts the coins in the
          order they come out of the pocket; Lebesgue first sorts them
          by value, then counts how many of each.
        </p>

      </aside>

    </div>


    <!-- ==========================================
         02 / THEORY
         ========================================== -->

    <section class="panel" aria-labelledby="hmw7-theory-title">

      <div class="panel-label">02 / THE TWO DEFINITIONS</div>

      <h2 id="hmw7-theory-title">Slicing the Domain, Slicing the Range</h2>


      <h3>2.1 — The Riemann Integral</h3>

      <p>
        Partition [a, b] with points a = x<sub>0</sub> &lt; x<sub>1</sub>
        &lt; … &lt; x<sub>N</sub> = b, choose a tag x<sub>i</sub>* in each
        subinterval and form the Riemann sum
      </p>

      <div class="math-display">
        S = Σ f(x<sub>i</sub>*) · (x<sub>i+1</sub> − x<sub>i</sub>)
      </div>

      <p>
        Taking the supremum or the infimum of f on each subinterval
        instead of f(x<sub>i</sub>*) gives the upper and lower Darboux
        sums U and L, and every Riemann sum lies between them. A
        bounded f is Riemann integrable when U − L can be made as small
        as we like by refining the partition; then all Riemann sums
        converge to the same number, whatever the tags. An unbounded f
        is never Riemann integrable in this sense: at best it has an
        improper integral, a limit of proper ones.
      </p>


      <h3>2.2 — The Lebesgue Integral</h3>

      <p>
        Lebesgue starts from the measure μ of a set: the length for an
        interval, extended to far more general sets. A countable set,
        such as the rationals, has measure 0. A simple function takes
        finitely many values c<sub>k</sub> on sets E<sub>k</sub>, and its
        integral is Σ c<sub>k</sub> · μ(E<sub>k</sub>). The integral of
        f ≥ 0 is the supremum of the integrals of the simple functions
        below f. Cutting the range at levels y<sub>k</sub> = k·Δ gives
        such simple functions directly, and in the limit the
        layer-cake formula:
      </p>

      <div class="math-display">
        ∫ f dμ = ∫<sub>0</sub><sup>∞</sup> μ({x : f(x) &gt; t}) dt
      </div>

      <p>
        The integral is an integral over the range of the measure of
        the set where f exceeds each level. Lower and upper Lebesgue
        sums differ by at most Δ·(b − a), for any bounded measurable f:
        no condition on the continuity of f is needed.
      </p>


      <h3>2.3 — When the Two Agree</h3>

      <p>
        If a bounded function is Riemann integrable on [a, b], it is
        also Lebesgue integrable and the two integrals are equal. The
        exact condition is Lebesgue's criterion: a bounded f is Riemann
        integrable if and only if the set of its points of
        discontinuity has measure 0. The converse fails: Dirichlet's
        function (section 06) is Lebesgue integrable but not Riemann
        integrable.
      </p>


      <h3>2.4 — Unbounded Functions</h3>

      <p>
        For f ≥ 0 the Lebesgue integral is defined directly, even when
        f is unbounded: by the monotone convergence theorem,
        ∫ min(f, T) dμ increases to ∫ f dμ as T → ∞. For 1/√x on (0, 1]
        this gives ∫ min(f, T) = 2 − 1/T → 2: the function is Lebesgue
        integrable, with no limit over ε → 0 to be taken separately.
      </p>

    </section>


    <!-- ==========================================
         03 / FUNCTIONS AND CODE
         ========================================== -->

    <section class="panel" aria-labelledby="hmw7-methods-title">

      <div class="panel-label">03 / FUNCTIONS AND METHODS</div>

      <h2 id="hmw7-methods-title">From the Definitions to Code</h2>

      <p>
        The seven functions of the assignment, with the exact integral
        used to measure errors and the measure of the set
        {f &gt; t}, which is what the Lebesgue method has to find.
      </p>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption>
            Test functions. The closed forms of μ(f &gt; t) are used only to
            test the program: the method itself finds the preimages by
            bisection, as it would for a function without a closed form,
            such as sin(x)/x.
          </caption>
          <thead>
            <tr>
              <th scope="col">Function</th>
              <th scope="col">Domain</th>
              <th scope="col">Exact integral</th>
              <th scope="col">μ(f &gt; t), 0 ≤ t &lt; sup f</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            ${FUNCTIONS.map(fn => `
              <tr>
                <th scope="row">${fn.formula}</th>
                <td>${fn.domain}</td>
                <td>${fn.exactLabel}</td>
                <td>${MEASURES[fn.id]}</td>
                <td>${fn.note}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>


      <h3>3.1 — The Riemann-Type Method</h3>

      <p>
        N equal subintervals, tags at the left end, the midpoint or the
        right end; the trapezoidal rule averages the two ends. Cost: one
        evaluation of f per subinterval.
      </p>

      <pre class="hmw5-code"><code>${escapeHtml(RIEMANN_CODE)}</code></pre>


      <h3>3.2 — The Lebesgue-Type Method</h3>

      <p>
        M equal layers of the range, from 0 to sup f. The unbounded 1/√x
        has no top, so its levels stop at a cap T = M<sup>2/3</sup>: the
        method integrates min(f, T), which tends to ∫ f by monotone
        convergence (section 2.4). The part above T is lost (1/T), the
        layers make an error of order (T/M)², and T = M<sup>2/3</sup>
        balances the two. For each level y<sub>k</sub>
        the program finds {f &gt; y<sub>k</sub>} and its length. The upper
        sum gives each layer the width of {f &gt; y<sub>k</sub>}, the lower
        sum the width of {f &gt; y<sub>k+1</sub>}; their mean is the
        estimate. Equivalently: the layer-cake integral
        ∫ μ(f &gt; t) dt computed by left-endpoint, right-endpoint or
        trapezoidal sums in t.
      </p>

      <pre class="hmw5-code"><code>${escapeHtml(LEBESGUE_CODE)}</code></pre>

      <p>
        Finding a preimage is the hard part. Each function is split into
        monotone pieces (sin x increases on [0, π/2] and decreases on
        [π/2, π]); on an increasing piece {f &gt; t} is an interval
        (c, b], on a decreasing one [a, c), and the crossing point c is
        found by bisection:
      </p>

      <pre class="hmw5-code"><code>${escapeHtml(BISECTION_CODE)}</code></pre>

      <p class="panel-note">
        A constant piece costs a single evaluation. Newton's method
        would find c in fewer steps, but needs f′ and can fail;
        bisection only needs f to be monotone on the piece, and its
        cost, about 50 evaluations per crossing, is predictable.
      </p>

    </section>


    <!-- ==========================================
         04 / LAB
         ========================================== -->

    ${renderHmw7Lab()}


    <!-- ==========================================
         05 / CONVERGENCE AND EFFICIENCY
         ========================================== -->

    ${renderHmw7Convergence()}


    <!-- ==========================================
         06 / PATHOLOGICAL FUNCTIONS
         ========================================== -->

    ${renderHmw7Pathological()}


    <!-- ==========================================
         07 / CONCLUSIONS
         ========================================== -->

    ${renderHmw7Conclusion()}

  `;
}
