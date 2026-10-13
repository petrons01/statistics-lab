
// HMW 1 - Step 1: Introduction & Theory
// Questa funzione restituisce l'HTML della pagina HMW 1.
// Il routing e il menu laterale sono gestiti da js/app.js.

export function renderHmw1() {
  return `
    <section class="module-header">
      <div class="eyebrow">
        <span class="eyebrow-line"></span> HOMEWORK 01 · ELLIPTIC CURVE CRYPTOGRAPHY
      </div>
      <span class="module-status">STEP 1 · THEORY</span>
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
    
    <section class="next-step">
      <span class="next-icon" aria-hidden="true">↗</span>
      <div>
        <strong>Next step: implementing point addition in JavaScript</strong>
        <p>
          We will turn the mathematical formulas into tested functions for modular
          arithmetic, point addition and scalar multiplication. The interactive
          visualizer and statistical exploration will follow.
        </p>
      </div>
    </section>
  `;
}
