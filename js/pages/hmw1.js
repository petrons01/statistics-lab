
// HMW 1 - Step 1: Introduction & Theory
// Questa funzione restituisce l'HTML della pagina HMW 1.
// Il routing e il menu laterale sono gestiti da js/app.js.

export function renderHmw1() {
  return `
    <section class="module-header">
      <div class="eyebrow">
        <span class="eyebrow-line"></span> HOMEWORK 01 · ELLIPTIC CURVE CRYPTOGRAPHY
      </div>
      <span class="module-status">ECC · INTERACTIVE LAB</span>
    </section>

    <section class="module-intro">
      <h1>From Private Key<br /><span>to Public Key.</span></h1>
      <p>
        An educational introduction to elliptic-curve scalar multiplication.
        We will build a toy implementation of the mathematical operation used
        to derive public keys in Ethereum, then explore its statistical properties.
      </p>
    </section>

    <div class="module-layout">
      <section class="panel panel-large" aria-labelledby="ecc-intro-title">
        <div class="panel-label">01 / THE CORE IDEA</div>
        <h2 id="ecc-intro-title">What is scalar multiplication?</h2>
        <p>
          Elliptic-curve cryptography works with points on a curve. A private key
          is an integer <strong>k</strong>, while the public key is a point
          <strong>Q</strong> obtained from a publicly known base point <strong>G</strong>.
        </p>
        <div class="math-display">Q = kG</div>
        <p>
          Here, multiplication does not mean multiplying the coordinates of G by k.
          It means adding G to itself k times, using the curve's point-addition rule.
          For instance, 3G = G + G + G.
        </p>
        <p class="panel-note">
          Computing Q from k is efficient; recovering k from Q is believed to be
          computationally difficult for suitable real-world curve parameters.
          This is related to the Elliptic Curve Discrete Logarithm Problem (ECDLP).
        </p>
      </section>

      <aside class="panel panel-side" aria-labelledby="ecc-parameters-title">
        <div class="panel-label">TOY CURVE / PARAMETERS</div>
        <h2 id="ecc-parameters-title">Our example</h2>
        <div class="math-display">y² ≡ x³ + 7 <span>(mod 17)</span></div>
        <div class="hmw1-facts">
          <div><span>FIELD</span><strong>F₁₇</strong></div>
          <div><span>BASE POINT</span><strong>G = (1, 5)</strong></div>
          <div><span>PRIVATE KEY</span><strong>k = 6</strong></div>
          <div><span>EXPECTED PUBLIC KEY</span><strong>Q = (5, 8)</strong></div>
        </div>
        <p class="panel-note">
          All calculations use integer coordinates modulo 17. This tiny curve is
          suitable for learning, not for securing real transactions.
        </p>
      </aside>
    </div>

    <section class="panel hmw1-section" aria-labelledby="point-addition-title">
      <div class="panel-label">02 / THE MATHEMATICS</div>
      <h2 id="point-addition-title">How do we add two points?</h2>
      <p>
        Let P = (x₁, y₁) and R = (x₂, y₂). Their sum is another point
        S = P + R = (x₃, y₃). First we compute a slope λ using modular arithmetic.
      </p>

      <div class="hmw1-formula-grid">
        <div class="hmw1-formula-card">
          <span>DIFFERENT POINTS (P ≠ R)</span>
          <div class="hmw1-formula">λ = (y₂ − y₁) · (x₂ − x₁)⁻¹ mod 17</div>
        </div>
        <div class="hmw1-formula-card">
          <span>POINT DOUBLING (P = R)</span>
          <div class="hmw1-formula">λ = (3x₁²) · (2y₁)⁻¹ mod 17</div>
        </div>
      </div>

      <p>Once λ is known, we compute the coordinates of the resulting point:</p>
      <div class="hmw1-equations">
        <div>x₃ = (λ² − x₁ − x₂) mod 17</div>
        <div>y₃ = [λ(x₁ − x₃) − y₁] mod 17</div>
      </div>
      <p class="panel-note">
        The exponent ⁻¹ means <strong>modular multiplicative inverse</strong>,
        not ordinary division. For example, 10⁻¹ ≡ 12 (mod 17), because
        10 · 12 ≡ 1 (mod 17). We also need a special point called the
        <em>point at infinity</em> (𝒪), which acts as the identity of point addition.
        Opposite points add to 𝒪, and doubling a point with y = 0 gives 𝒪.
      </p>
    </section>

    <section class="panel hmw1-section" aria-labelledby="worked-example-title">
      <div class="panel-label">03 / WORKED EXAMPLE</div>
      <h2 id="worked-example-title">From G to 6G</h2>
      <p>
        Start with G = (1, 5). To obtain 2G, add G to itself using the doubling formula:
      </p>
      <div class="hmw1-calculation">
        <div>λ = 3 · 1² · (2 · 5)⁻¹ mod 17</div>
        <div>λ = 3 · 12 mod 17 = 2</div>
        <div>x₃ = (2² − 1 − 1) mod 17 = 2</div>
        <div>y₃ = [2(1 − 2) − 5] mod 17 = 10</div>
        <strong>Therefore, 2G = (2, 10).</strong>
      </div>
      <p>Repeating point addition gives the following sequence:</p>
      <div class="hmw1-table-wrap">
        <table class="hmw1-table">
          <thead>
            <tr><th scope="col">Step</th><th scope="col">Operation</th><th scope="col">Resulting point</th></tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>G</td><td>(1, 5)</td></tr>
            <tr><td>2</td><td>2G = G + G</td><td>(2, 10)</td></tr>
            <tr><td>3</td><td>3G = 2G + G</td><td>(5, 9)</td></tr>
            <tr><td>4</td><td>4G = 3G + G</td><td>(12, 1)</td></tr>
            <tr><td>5</td><td>5G = 4G + G</td><td>(12, 16)</td></tr>
            <tr class="hmw1-result"><td>6</td><td>6G = 5G + G</td><td><strong>(5, 8)</strong></td></tr>
          </tbody>
        </table>
      </div>
      <div class="hmw1-result-box">
        <span>TOY PUBLIC KEY</span>
        <strong>Q = 6G = (5, 8)</strong>
      </div>
      <p class="panel-note">
        The point G has order 9: 9G = 𝒪. This means the outputs repeat on our
        small toy curve. Real Ethereum uses secp256k1, with vastly larger parameters.
      </p>
    </section>
    
    <section id="hmw1-simulator" class="panel hmw1-section"
            aria-labelledby="hmw1-sim-title">

      <div class="panel-label">04 / INTERACTIVE SIMULATOR</div>
      <h2 id="hmw1-sim-title">Explore scalar multiplication</h2>

      <p>
        Select a scalar and add the base point G step by step.
        This simulation uses a toy curve, not a real Ethereum private key.
      </p>

      <div class="hmw1-sim-layout">

        <!-- Controls -->
        <div class="hmw1-sim-controls">

          <label class="hmw1-sim-label" for="hmw1-key">
            Scalar k
          </label>

          <div class="hmw1-sim-keyrow">
            <input
              id="hmw1-key-range"
              type="range"
              min="1"
              max="18"
              value="6"
              aria-label="Scalar k slider"
            />

            <input
              id="hmw1-key"
              type="number"
              min="1"
              max="18"
              step="1"
              value="6"
              inputmode="numeric"
            />
          </div>

          <p class="hmw1-sim-help">
            Values 1–8 are valid nonzero keys for this subgroup.
            Values 9–18 illustrate the repeating cycle.
          </p>

          <div class="hmw1-sim-results">
            <div>
              <span>BASE POINT</span>
              <strong>G = (1, 5)</strong>
            </div>

            <div>
              <span>FINAL TOY PUBLIC KEY (kG)</span>
              <strong id="hmw1-target">(5, 8)</strong>
            </div>

            <div>
              <span>CURRENT STEP</span>
              <strong id="hmw1-current">𝒪</strong>
            </div>
          </div>

          <div class="hmw1-sim-actions">
            <button type="button" id="hmw1-next">
              Next step →
            </button>

            <button type="button" id="hmw1-play">
              ▶ Play
            </button>

            <button type="button" id="hmw1-reset">
              Reset
            </button>
          </div>

          <div class="hmw1-sim-progress">
            <label for="hmw1-progress" id="hmw1-progress-label">
              Step 0 of 6
            </label>

            <progress id="hmw1-progress" value="0" max="6">
            </progress>
          </div>

          <p id="hmw1-operation" class="hmw1-sim-operation"
            aria-live="polite">
            Start at the identity point 𝒪.
          </p>
        </div>

        <!-- Curve graph -->
        <div class="hmw1-sim-plot">
          <div id="hmw1-graph"></div>

          <div class="hmw1-sim-legend">
            <span>
              <i class="hmw1-dot hmw1-dot-point"></i>
              Curve points
            </span>

            <span>
              <i class="hmw1-dot hmw1-dot-base"></i>
              Base point G
            </span>

            <span>
              <i class="hmw1-dot hmw1-dot-active"></i>
              Current
            </span>
          </div>

          <p>
            Points are discrete elements of F₁₇.
            Lines connecting them would not represent
            elliptic-curve addition.
          </p>
        </div>

      </div>

      <!-- Operations history -->
      <div class="hmw1-sim-history">
        <h3>Completed operations</h3>

        <div class="hmw1-table-wrap">
          <table class="hmw1-table">
            <thead>
              <tr>
                <th scope="col">Step</th>
                <th scope="col">Addition</th>
                <th scope="col">Result</th>
              </tr>
            </thead>

            <tbody id="hmw1-steps"></tbody>
          </table>
        </div>
      </div>

    </section>
    

    <!-- ====================================================
        05 / STATISTICAL EXPLORATION
        ==================================================== -->

    <section id="hmw1-statistics"
            class="panel hmw1-section"
            aria-labelledby="hmw1-stat-title">

      <div class="panel-label">05 / STATISTICAL EXPLORATION</div>

      <h2 id="hmw1-stat-title">
        Statistical properties of scalar multiplication
      </h2>

      <p>
        Explore how the output points Q = kG are distributed when
        the private scalar k changes. Compare coordinate frequencies,
        bit patterns, correlations and Hamming distances.
      </p>

      <!-- Experiment settings -->
      <div class="hmw1-stat-settings">

        <div>
          <label for="hmw1-stat-base">Base point</label>
          <select id="hmw1-stat-base">
            <option value="0">G = (1, 5)</option>
            <option value="1">G′ = (2, 10) = 2G</option>
          </select>
        </div>

        <div>
          <label for="hmw1-stat-count">Sample: k from 1 to</label>
          <select id="hmw1-stat-count">
            <option value="8">8 — nonzero subgroup</option>
            <option value="9">9 — one complete cycle</option>
            <option value="18">18 — two complete cycles</option>
            <option value="36">36 — four complete cycles</option>
          </select>
        </div>

      </div>

      <!-- Statistics summary -->
      <div id="hmw1-stat-summary"
          class="hmw1-stat-summary"
          aria-live="polite"></div>

      <!-- 1. Point frequencies -->
      <div class="hmw1-stat-block">
        <h3>1. Distribution of public points</h3>

        <p>
          Each bar represents the frequency of one point in
          the subgroup generated by the selected base point,
          including the point at infinity (𝒪).
        </p>

        <div id="hmw1-stat-points"></div>

        <p id="hmw1-stat-note"
          class="hmw1-stat-insight"></p>

        <p class="panel-note">
          Shannon entropy is calculated from the observed point
          frequencies. The theoretical maximum over nine subgroup
          points is log₂(9) ≈ 3.170 bits.
          This measurement is not a proof of cryptographic security.
        </p>
      </div>

      <!-- 2. Coordinate distributions -->
      <div class="hmw1-stat-block">
        <h3>2. Coordinate frequency distributions</h3>

        <p>
          Count how often each integer from 0 to 16 occurs
          as an x or y coordinate.
        </p>

        <div class="hmw1-stat-grid">

          <div class="hmw1-stat-chart-card">
            <h4>X coordinate</h4>
            <div id="hmw1-stat-x"></div>
          </div>

          <div class="hmw1-stat-chart-card">
            <h4>Y coordinate</h4>
            <div id="hmw1-stat-y"></div>
          </div>

        </div>

        <p class="panel-note">
          Uniformly distributed points do not necessarily have
          uniformly distributed coordinates. The point at infinity
          has no affine coordinates and is excluded from these charts.
        </p>
      </div>

      <!-- 3. Bit distributions -->
      <div class="hmw1-stat-block">
        <h3>3. Binary representation and bit frequencies</h3>

        <p>
          Coordinates from 0 to 16 are represented using five
          bits each. For example, x = 5 becomes 00101.
          We count how many times each bit position contains 1.
        </p>

        <div class="hmw1-stat-grid">

          <div class="hmw1-stat-chart-card">
            <h4>X bits — number of 1s</h4>
            <div id="hmw1-stat-bits-x"></div>
          </div>

          <div class="hmw1-stat-chart-card">
            <h4>Y bits — number of 1s</h4>
            <div id="hmw1-stat-bits-y"></div>
          </div>

        </div>

        <p class="panel-note">
          The five positions are b4 (most significant) through b0.
          Each chart counts 1s; the number of 0s equals the number
          of finite points minus the displayed count.
          Uniformity of coordinate bits is not required by ECC.
        </p>
      </div>

      <!-- 4. Correlation -->
      <div class="hmw1-stat-block">
        <h3>4. Correlation between input and output</h3>

        <p>
          Pearson's correlation coefficient measures linear
          association between the scalar k and each numerical
          coordinate of Q = kG.
        </p>

        <div id="hmw1-stat-correlation"
            class="hmw1-stat-correlation"></div>

        <p class="panel-note">
          These coefficients are descriptive only. Coordinates
          are elements of a finite field, and interpreting them
          as ordinary real-valued measurements is arbitrary.
          Low linear correlation does not establish one-wayness.
        </p>
      </div>

      <!-- 5. Avalanche-like behaviour -->
      <div class="hmw1-stat-block">

        <h3>5. Bit differences between consecutive scalars</h3>

        <p>
          Compare the public points produced by consecutive
          scalars k and k + 1. Concatenate their two five-bit
          coordinate representations, then calculate the
          Hamming distance between the resulting ten-bit strings.
        </p>

        <div class="hmw1-stat-avalanche-result">
          <span>AVERAGE NUMBER OF CHANGED BITS</span>
          <strong id="hmw1-stat-avalanche"></strong>
        </div>

        <div class="hmw1-stat-pair-table">
          <table class="hmw1-table">
            <thead>
              <tr>
                <th scope="col">Scalar transition</th>
                <th scope="col">Changed bits</th>
              </tr>
            </thead>
            <tbody id="hmw1-stat-pairs"></tbody>
          </table>
        </div>

        <p class="panel-note">
          Transitions involving 𝒪 are excluded, because 𝒪
          has no affine coordinates. This uses an educational
          ten-bit encoding, not Ethereum's public-key encoding.
        </p>
      </div>

    </section>


    <!-- ====================================================
        06 / CRYPTOGRAPHIC INTERPRETATION
        ==================================================== -->

    <section class="panel hmw1-section">

      <div class="panel-label">06 / CRYPTOGRAPHIC DISCUSSION</div>

      <h2>Scalar multiplication vs cryptographic hashing</h2>

      <p>
        Elliptic-curve scalar multiplication is a deterministic
        operation used in public-key cryptography. Given k and G,
        computing Q = kG is efficient. For suitable large curves,
        recovering k from Q and G is computationally difficult
        because of the Elliptic Curve Discrete Logarithm Problem.
      </p>

      <div class="hmw1-stat-discussion-grid">

        <div>
          <h3>Elliptic-curve scalar multiplication</h3>
          <p>
            Its main security property is the difficulty of
            reversing the scalar multiplication operation on a
            cryptographically secure curve.
          </p>
          <p>
            If k is uniform modulo the order of G, then kG
            is uniform over the subgroup generated by G.
            This does not imply uniform coordinate bits.
          </p>
        </div>

        <div>
          <h3>Cryptographic hash functions</h3>
          <p>
            Hash functions such as SHA-256 aim to provide
            preimage resistance, second-preimage resistance
            and collision resistance.
          </p>
          <p>
            Good diffusion and avalanche-like behaviour are
            desirable hash design characteristics, but their
            observation alone does not prove security.
          </p>
        </div>

      </div>

      <p class="hmw1-stat-insight">
        Key observation: neither a balanced bit distribution
        nor a low input/output correlation proves that a
        function is cryptographically one-way.
      </p>

      <p class="panel-note">
        Our toy curve has only nine points in the subgroup
        generated by G, including 𝒪. Recovering k by exhaustive
        search is trivial. Real Ethereum uses secp256k1, which
        operates over much larger parameters.
      </p>

    </section>
    
    <!-- ====================================================
        07 / FINAL CONCLUSION
        ==================================================== -->

    <section class="panel hmw1-section"
            id="hmw1-conclusion"
            aria-labelledby="hmw1-conclusion-title">

      <div class="panel-label">07 / FINAL CONCLUSION</div>

      <h2 id="hmw1-conclusion-title">
        Conclusions and limitations
      </h2>

      <p>
        This experiment demonstrates the mathematical relationship
        between a private scalar k and its corresponding public
        point Q = kG on an elliptic curve over a finite field.
        Point addition and scalar multiplication allow us to
        compute Q deterministically from k and a public base point G.
      </p>

      <p>
        Using the toy curve y² = x³ + 7 (mod 17), the selected
        base point G = (1, 5), and k = 6, we obtained
        Q = (5, 8), confirming the expected result.
        The step-by-step simulator illustrates the operations
        behind this transformation.
      </p>

      <h3>Statistical findings</h3>

      <p>
        The statistical experiments reveal several important
        characteristics of elliptic-curve scalar multiplication.
        The following results refer to G = (1, 5).
      </p>

      <div class="hmw1-table-wrap">
        <table class="hmw1-table">
          <thead>
            <tr>
              <th scope="col">Experiment</th>
              <th scope="col">Observation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Group and subgroup sizes</td>
              <td>
                17 finite curve points plus the identity
                point O; G generates a subgroup of order 9.
              </td>
            </tr>

            <tr>
              <td>Point distribution, k = 1…9</td>
              <td>
                All nine subgroup points appear exactly once,
                including O.
              </td>
            </tr>

            <tr>
              <td>Empirical point entropy, k = 1…9</td>
              <td>
                H = log₂(9) ≈ 3.170 bits.
              </td>
            </tr>

            <tr>
              <td>Coordinate distribution</td>
              <td>
                Individual x and y coordinates are not
                uniformly distributed.
              </td>
            </tr>

            <tr>
              <td>Bit distribution</td>
              <td>
                The five-bit coordinate representations
                contain imbalanced bit frequencies.
              </td>
            </tr>

            <tr>
              <td>Hamming distance, k = 1…8</td>
              <td>
                Average of approximately 4.57 changed bits
                out of 10 between consecutive finite outputs.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Cryptographic interpretation</h3>

      <div class="hmw1-stat-discussion-grid">

        <div>
          <h3>What the experiment demonstrates</h3>

          <p>
            Scalar multiplication maps integers to points of
            an elliptic-curve subgroup. If the scalar is sampled
            uniformly modulo the order of G, the resulting
            points are uniformly distributed over that subgroup.
          </p>

          <p>
            Changing the base point from G to 2G preserves
            the same subgroup in this experiment, but changes
            the order in which its points are visited.
          </p>
        </div>

        <div>
          <h3>What the experiment does not prove</h3>

          <p>
            Uniform point frequencies, balanced bits and
            low statistical correlation do not establish
            cryptographic one-wayness or security.
          </p>

          <p>
            Hamming distances between consecutive outputs
            are descriptive measurements, not a rigorous
            avalanche test, because consecutive scalars
            may differ in more than one input bit.
          </p>
        </div>

      </div>

      <h3>Security limitations</h3>

      <p>
        The chosen base point has order 9, so its multiples
        repeat after only nine operations. An attacker can
        recover the scalar by exhaustive search with very
        little computational effort. The point at infinity
        is also not a valid public key for a nonzero private
        scalar in this subgroup.
      </p>

      <p>
        In contrast, Ethereum uses the secp256k1 curve,
        whose large prime-order subgroup makes solving
        the Elliptic Curve Discrete Logarithm Problem
        computationally infeasible with currently known
        practical classical attacks.
      </p>

      <p class="hmw1-stat-insight">
        Final takeaway: elliptic-curve scalar multiplication
        is an efficient forward operation whose security
        depends on the difficulty of the discrete logarithm
        problem and on suitable curve parameters, not on
        satisfying the same statistical properties as a
        cryptographic hash function.
      </p>

      <p class="panel-note">
        This implementation is strictly educational.
        It does not generate secure Ethereum keys,
        perform digital signatures, or create real
        Ethereum wallet addresses.
      </p>

    </section>
  `;
}
