export function renderHome() {
  return `
    <section class="hero" aria-labelledby="hero-heading">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="hero-inner">
        <div class="eyebrow"><span class="eyebrow-line"></span> PERSONAL WORKSPACE</div>
        <h1 id="hero-heading">Learn the math.<br /><span>Explore the cryptography.</span></h1>
        <p>Digital lab: collection of all statistics homework assignments.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#/hmw1">EXplore HMW 01 <span aria-hidden="true">↗</span></a>
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
      <div class="section-heading">
        <div><div class="eyebrow small">YOUR LABORATORIES</div><h2 id="hw-title">Homework collection</h2><p>Ogni homework avrà un'area indipendente, con teoria, codice e visualizzazioni.</p></div>
        <span class="section-counter">01 — 02</span>
      </div>
      <div class="homework-grid">
        <a class="homework-card" href="#/hmw1">
          <div class="card-top"><span class="card-code">HMW / 01</span><span class="card-arrow" aria-hidden="true">↗</span></div>
          <div class="card-illustration ecc-illustration" aria-hidden="true"><span>G</span><span>2G</span><span>3G</span><span>Q</span></div>
          <h3>Elliptic Curve<br />Cryptography</h3>
          <p>Dal numero segreto alla chiave pubblica: aritmetica modulare, punti sulla curva e analisi statistica.</p>          
          <div class="card-bottom">
            <span class="tag">SECP256K1 · TOY CURVE</span>

            <span class="homework-status homework-status--done">
              <span aria-hidden="true">✓</span>
              Done
            </span>
          </div>
        </a>
        <a class="homework-card" href="#/hmw2">
          <div class="card-top"><span class="card-code">HMW / 02</span><span class="card-arrow" aria-hidden="true">↗</span></div>
          <div class="card-illustration wallet-illustration" aria-hidden="true"><span>SEED</span><i>→</i><span>KEY</span><i>→</i><span>0x…</span></div>
          <h3>Ethereum Wallet<br />Pipeline</h3>
          <p>Dal mnemonic all'indirizzo Ethereum: BIP-39, BIP-32, BIP-44, hashing Keccak ed EIP-55.</p>          
          <div class="card-bottom">
            <span class="tag">BIP · ETHEREUM</span>

            <span class="homework-status homework-status--planned">
              Planned
            </span>
          </div>
        </a>
      </div>
    </section>

    <section class="section approach-section" aria-labelledby="approach-title">
      <div class="section-heading"><div><div class="eyebrow small">HOW IT WORKS</div><h2 id="approach-title">One place, many homweworks.</h2><p>Each Homeworks unit is structured to allow for:</p></div></div>
      <div class="approach-grid">
        <div class="approach-item"><span class="approach-num">01 /</span><h3>Backgrounds</h3><p>Understand mathematical concepts, definitions, and formulas.</p></div>
        <div class="approach-item"><span class="approach-num">02 /</span><h3>Experiment</h3><p>Interact with algorithms, examples, and simulations..</p></div>
        <div class="approach-item"><span class="approach-num">03 /</span><h3>Analysis</h3><p>Examine results, distributions, and statistical properties.</p></div>
      </div>
    </section>`;
}
