export function renderHome() {
  return `
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="hero-inner">
        <div class="eyebrow"><span class="eyebrow-line"></span> PERSONAL WORKSPACE</div>
        <h1 id="hero-heading">Learn and Explore.<br /><span>Statistics and cryptography concepts.</span></h1>
        <p>Digital lab: collection of all statistics homework assignments done by Francesco Petrone.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#/hmw1">Explore Homework 1.1 <span aria-hidden="true">↗</span></a>
          <a class="button button-ghost" href="#homeworks">See all homeworks <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="orbital orbit-outer"></div><div class="orbital orbit-inner"></div>
        <div class="orbital-center">Q = kG</div>
        <span class="orbit-point point-a"></span><span class="orbit-point point-b"></span><span class="orbit-point point-c"></span>
        <span class="orbit-coordinate coord-a">(1, 5)</span><span class="orbit-coordinate coord-b">(5, 8)</span>
      </div>
    </section>

    <section class="section" id="homeworks" aria-labelledby="hw-title">
      <!-- Main collection heading -->
      <div class="section-heading">
        <div>
          <div class="eyebrow small">YOUR LABORATORIES</div>
          <h2 id="hw-title">Homework collection</h2>
        </div>

        <span class="section-counter">02 UNITS · 03 EXERCISES</span>
      </div>

      <!-- HOMEWORK 1 -->
      <section class="homework-unit" aria-labelledby="homework-1-title">

        
        <div class="section-heading">
          <h3 id="homework-1-title">Homework 1</h3>

          <span class="section-counter">2/2 COMPLETED</span>
        </div>

        <!-- Homework 1.1 and Homework 1.2 -->
        <div class="homework-grid">

          <!-- HOMEWORK 1.1 -->
          <a class="homework-card" href="#/hmw1">

            <div class="card-top">
              <span class="card-code">HMW / 1.1</span>
              <span class="card-arrow" aria-hidden="true">↗</span>
            </div>

            <div class="card-illustration ecc-illustration"
                aria-hidden="true">
              <span>G</span>
              <span>2G</span>
              <span>3G</span>
              <span>Q</span>
            </div>

            <h3>Elliptic Curve<br />Cryptography</h3>

            <p>
              From secret number to public key: modular arithmetic,
              points on the curve, and statistical analysis.
            </p>

            <div class="card-bottom">
              <span class="tag">SECP256K1 · TOY CURVE</span>

              <span class="homework-status homework-status--done">
                <span aria-hidden="true">✓</span>
                Done
              </span>
            </div>

          </a>

          <!-- HOMEWORK 1.2 -->
          <a class="homework-card" href="#/hmw2">

            <div class="card-top">
              <span class="card-code">HMW / 1.2</span>
              <span class="card-arrow" aria-hidden="true">↗</span>
            </div>

            <div class="card-illustration wallet-illustration"
                aria-hidden="true">
              <span>SEED</span>
              <i>→</i>
              <span>KEY</span>
              <i>→</i>
              <span>0x…</span>
            </div>

            <h3>Ethereum Wallet<br />Pipeline</h3>

            <p>
              From mnemonic phrases to Ethereum addresses:
              BIP-39, BIP-32, BIP-44, Keccak-256 and EIP-55.
            </p>

            <div class="card-bottom">
              <span class="tag">BIP · ETHEREUM</span>

              <span class="homework-status homework-status--done">
                <span aria-hidden="true">✓</span>
                Done
              </span>
            </div>
          </a>
        </div>
      </section>

      <!-- ==========================================
          HOMEWORK 2
          ========================================== -->

      <section class="homework-unit" aria-labelledby="homework-2-title">

        <div class="section-heading">

          <h3 id="homework-2-title">
            Homework 2
          </h3>

          <span class="section-counter">
            1/1 COMPLETED
          </span>

        </div>


        <div class="homework-grid">

          <!-- Homework 2: Encryption & Cryptanalysis -->
          <a class="homework-card" href="#/hmw3">

            <div class="card-top">

              <span class="card-code">
                HMW / 02
              </span>

              <span class="card-arrow" aria-hidden="true">
                ↗
              </span>

            </div>


            <!-- Cryptography illustration -->
            <div class="card-illustration wallet-illustration"
                aria-hidden="true">

              <span>ECC</span>
              <i>→</i>
              <span>CAESAR</span>
              <i>→</i>
              <span>ATTACK</span>

            </div>


            <h3>
              Encryption, Decryption<br />
              &amp; Cryptanalysis
            </h3>

            <p>
              Compare Caesar and elliptic-curve-based encryption,
              explore statistical cryptanalysis, and recover weak
              cryptographic keys through experimental attacks.
            </p>


            <div class="card-bottom">

              <span class="tag">
                ECC · CAESAR · CRYPTANALYSIS
              </span>
              
              <span class="homework-status homework-status--done">
                <span aria-hidden="true">✓</span>
                Done
              </span>

            </div>

          </a>

        </div>

      </section>

    </section>


    <section class="section approach-section" aria-labelledby="approach-title">
      <div class="section-heading"><div><div class="eyebrow small">HOW IT WORKS</div><h2 id="approach-title">How the Lab is organized</h2><p>Each Homeworks unit is structured like this:</p></div></div>
      <div class="approach-grid">
        <div class="approach-item"><span class="approach-num">01 /</span><h3>Backgrounds</h3><p>Understand mathematical concepts, definitions, and formulas.</p></div>
        <div class="approach-item"><span class="approach-num">02 /</span><h3>Dynamic experiment</h3><p>Interact with algorithms, examples, and simulations..</p></div>
        <div class="approach-item"><span class="approach-num">03 /</span><h3>Analysis & Conclusion</h3><p>Examine results, distributions, and statistical properties.</p></div>
      </div>
    </section>`;
}
