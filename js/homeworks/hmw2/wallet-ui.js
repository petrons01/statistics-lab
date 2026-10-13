
// HMW 2 - UI controller for the demonstration wallet pipeline.

// Returns only the HMW 2 lab section; the main theory page stays untouched.
export function renderHmw2WalletLab() {
  return `
    <section class="panel hmw2-section" id="hmw2-wallet-lab"
             aria-labelledby="hmw2-lab-title">
      <div class="panel-label">08 / INTERACTIVE WALLET PIPELINE</div>
      <h2 id="hmw2-lab-title">Derive a demonstration Ethereum address</h2>
      <p>
        Choose one of two PUBLIC test mnemonics and an address index.
        All cryptographic computations run locally in your browser.
        No blockchain connection or wallet extension is required.
      </p>
      <p class="hmw2-demo-warning">
        DEMONSTRATION ONLY — These recovery phrases and private keys are
        publicly known. Never transfer funds to the generated addresses,
        and never enter a real recovery phrase into this page.
      </p>

      <div class="hmw2-demo-controls">
        <label for="hmw2-demo-preset">Public test mnemonic
          <select id="hmw2-demo-preset"></select>
        </label>
        <label for="hmw2-demo-index">Address index
          <select id="hmw2-demo-index">
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </label>
        <button type="button" id="hmw2-demo-run">Derive address</button>
      </div>
      <p class="hmw2-demo-status" id="hmw2-demo-status"
         role="status" aria-live="polite">Preparing demo…</p>

      <div class="hmw2-demo-results" id="hmw2-demo-results" hidden>
        <article class="hmw2-demo-stage">
          <h3>01 · BIP-39 — Mnemonic and 512-bit seed</h3>
          <p>PBKDF2-HMAC-SHA512 (2,048 iterations, empty optional passphrase).</p>
          <span class="hmw2-demo-field">Mnemonic (public test phrase)</span>
          <div class="hmw2-demo-data" id="hmw2-demo-mnemonic"></div>
          <span class="hmw2-demo-field">Seed (64 bytes)</span>
          <div class="hmw2-demo-data" id="hmw2-demo-seed"></div>
        </article>

        <article class="hmw2-demo-stage">
          <h3>02 · BIP-32 — Master HD node</h3>
          <p>HMAC-SHA512 derives a master private key and chain code from the seed.</p>
          <details>
            <summary>Show demonstration master key and chain code</summary>
            <span class="hmw2-demo-field">Master private key</span>
            <div class="hmw2-demo-data" id="hmw2-demo-master-key"></div>
            <span class="hmw2-demo-field">Master chain code</span>
            <div class="hmw2-demo-data" id="hmw2-demo-chain-code"></div>
          </details>
        </article>

        <article class="hmw2-demo-stage">
          <h3>03 · BIP-44 — Derived private key</h3>
          <span class="hmw2-demo-field">Ethereum derivation path</span>
          <div class="hmw2-demo-data" id="hmw2-demo-path"></div>
          <details>
            <summary>Show demonstration derived private key</summary>
            <span class="hmw2-demo-field">Private key (32 bytes)</span>
            <div class="hmw2-demo-data" id="hmw2-demo-private-key"></div>
          </details>
        </article>

        <article class="hmw2-demo-stage">
          <h3>04 · secp256k1 — Public key</h3>
          <p>Q = kG, encoded as 0x04 || x || y (65 bytes).</p>
          <div class="hmw2-demo-data" id="hmw2-demo-public-key"></div>
        </article>

        <article class="hmw2-demo-stage">
          <h3>05 · Keccak-256 — Public-key hash</h3>
          <span class="hmw2-demo-field">Hash input: x || y (64 bytes, no 0x04 prefix)</span>
          <div class="hmw2-demo-data" id="hmw2-demo-hash-input"></div>
          <span class="hmw2-demo-field">Keccak-256 hash (32 bytes)</span>
          <div class="hmw2-demo-data" id="hmw2-demo-hash"></div>
        </article>

        <article class="hmw2-demo-stage">
          <h3>06 · Ethereum address — Last 20 hash bytes</h3>
          <div class="hmw2-demo-data" id="hmw2-demo-address"></div>
        </article>

        <article class="hmw2-demo-stage hmw2-demo-final">
          <h3>07 · EIP-55 — Checksummed address</h3>
          <div class="hmw2-demo-data" id="hmw2-demo-checksummed"></div>
          <p>Validated against ethers.js's independently computed wallet address.</p>
        </article>
      </div>
    </section>
  `;
}

import { DEMO_MNEMONICS, deriveDemoWallet } from './wallet.js';

export function initHmw2Wallet() {
  const root = document.getElementById('hmw2-wallet-lab');
  if (!root) return () => {};

  const find = id => root.querySelector(`#${id}`);
  const presetSelect = find('hmw2-demo-preset');
  const indexSelect = find('hmw2-demo-index');
  const runButton = find('hmw2-demo-run');
  const status = find('hmw2-demo-status');
  const resultPanel = find('hmw2-demo-results');
  const controllers = new AbortController();
  let revision = 0;
  let active = true;

  // The allowed labels and IDs are fixed by the application, not user input.
  presetSelect.replaceChildren(
    ...DEMO_MNEMONICS.map(preset => {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = preset.label;
      return option;
    })
  );

  function show(id, value) {
    find(id).textContent = value;
  }

  async function run() {
    const thisRun = ++revision;
    runButton.disabled = true;
    status.textContent = 'Deriving locally in your browser…';
    resultPanel.hidden = true;

    try {
      const data = await deriveDemoWallet(
        presetSelect.value, Number(indexSelect.value)
      );
      if (!active || revision !== thisRun) return;

      show('hmw2-demo-mnemonic', data.mnemonic);
      show('hmw2-demo-seed', data.seed);
      show('hmw2-demo-master-key', data.masterPrivateKey);
      show('hmw2-demo-chain-code', data.masterChainCode);
      show('hmw2-demo-path', data.path);
      show('hmw2-demo-private-key', data.derivedPrivateKey);
      show('hmw2-demo-public-key', data.publicKey);
      show('hmw2-demo-hash-input', data.publicKeyXY);
      show('hmw2-demo-hash', data.publicKeyHash);
      show('hmw2-demo-address', data.lowercaseAddress);
      show('hmw2-demo-checksummed', data.checksummedAddress);

      status.textContent = 'Address verified against ethers.js.';
      resultPanel.hidden = false;
    } catch (error) {
      if (!active || revision !== thisRun) return;
      status.textContent =
        'Unable to derive the test wallet. Check your connection and browser console.';
      console.error('HMW 2 demo derivation failed:', error);
    } finally {
      if (active && revision === thisRun) runButton.disabled = false;
    }
  }

  runButton.addEventListener('click', run, { signal: controllers.signal });
  presetSelect.addEventListener('change', run, { signal: controllers.signal });
  indexSelect.addEventListener('change', run, { signal: controllers.signal });
  void run();

  return () => {
    active = false;
    revision++;
    controllers.abort();
  };
}
