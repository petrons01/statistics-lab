
// HMW 2 - Statistical exploration user interface.

import { DEMO_MNEMONICS } from './wallet.js';
import {
  analyzeHashAvalanche,
  analyzeAddresses
} from './statistics.js';

export function renderHmw2StatisticsLab() {
  return `
    <section class="panel hmw2-section"
             id="hmw2-stat-lab"
             aria-labelledby="hmw2-stat-title">

      <div class="panel-label">
        09 / STATISTICAL EXPLORATION
      </div>

      <h2 id="hmw2-stat-title">
        Hash diffusion and address distributions
      </h2>

      <p>
        These experiments use only fixed public test inputs
        and test wallet keys. They illustrate statistical
        behaviour; they do not prove cryptographic security.
      </p>

      <div class="hmw2-stat-settings">

        <label>
          One-bit input variations
          <select id="hmw2-stat-flips">
            <option value="8">8 input bits</option>
            <option value="16" selected>16 input bits</option>
            <option value="32">32 input bits</option>
          </select>
        </label>

        <label>
          Public test mnemonic
          <select id="hmw2-stat-preset"></select>
        </label>

        <label>
          Derived addresses
          <select id="hmw2-stat-count">
            <option value="3">3 addresses</option>
            <option value="5">5 addresses</option>
          </select>
        </label>

        <button id="hmw2-stat-run" type="button">
          Run experiments
        </button>

      </div>

      <p id="hmw2-stat-status"
         class="hmw2-stat-status"
         role="status"
         aria-live="polite">
        Choose settings and click Run experiments.
      </p>

      <div id="hmw2-stat-results" hidden>

        <!-- EXPERIMENT 1: AVALANCHE -->

        <div class="hmw2-stat-block">

          <h3>1. One-bit avalanche experiment</h3>

          <p>
            We change exactly one input bit at a time,
            independently, and compare each digest with the
            unchanged baseline. SHA-512 and Keccak-256 have
            different output lengths, so percentages are
            comparable, while raw changed-bit counts are not.
          </p>

          <p class="hmw2-stat-note"
             id="hmw2-stat-input"></p>

          <div class="hmw2-stat-grid"
               id="hmw2-stat-hash-summary"></div>

          <div class="hmw2-stat-grid"
               id="hmw2-stat-hash-charts"></div>

          <p class="hmw2-stat-note">
            An ideal-looking average near 50% is compatible
            with diffusion, but is not a security proof.
            The chart shows the proportion of changed
            output bits per trial.
          </p>

        </div>

        <!-- EXPERIMENT 2: OUTPUT BITS -->

        <div class="hmw2-stat-block">

          <h3>2. Hash output-bit frequencies</h3>

          <p>
            For each output, bit positions b7…b0 are pooled
            across its bytes and all modified-input digests.
            Values near 50% indicate an approximately balanced
            sample of zeros and ones.
          </p>

          <div class="hmw2-stat-grid"
               id="hmw2-stat-hash-bits"></div>

        </div>

        <!-- EXPERIMENT 3: ETHEREUM ADDRESSES -->

        <div class="hmw2-stat-block">

          <h3>3. BIP-44 address index experiment</h3>

          <p>
            We hold the public test mnemonic fixed and derive
            address indices 0, 1, 2, ... along
            m/44'/60'/0'/0/i. These indices are not one-bit
            changes in a cryptographic input.
          </p>

          <div class="hmw2-stat-tablewrap">

            <table class="hmw2-stat-table">
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Path</th>
                  <th>EIP-55 address</th>
                </tr>
              </thead>

              <tbody id="hmw2-stat-address-rows"></tbody>

            </table>

          </div>

          <div id="hmw2-stat-address-summary"
               class="hmw2-stat-summary"></div>

          <div class="hmw2-stat-grid">

            <div class="hmw2-stat-card">
              <h4>Hexadecimal digit frequency (0–f)</h4>
              <div id="hmw2-stat-nibbles"></div>
            </div>

            <div class="hmw2-stat-card">
              <h4>Fraction of 1s by bit position</h4>
              <div id="hmw2-stat-address-bits"></div>
            </div>

          </div>

          <p class="hmw2-stat-note">
            The address is 160 bits (20 bytes). Samples of
            3–5 addresses are too small for reliable statistical
            inference. Hamming distance measures differences
            between address encodings, not a formal avalanche
            property of BIP-32.
          </p>

        </div>

      </div>
    </section>
  `;
}

const percent = value => `${value.toFixed(1)}%`;

// Draws horizontal bars using numeric statistics.
function meters(data, max) {
  return `
    <div class="hmw2-stat-meters">

      ${data.map(row => `
        <div class="hmw2-stat-meter">

          <span>${row.label}</span>

          <div class="hmw2-stat-track">
            <div style="width:${
              Math.min(100, 100 * row.value / max)
            }%"></div>
          </div>

          <strong>${row.text}</strong>

        </div>
      `).join('')}

    </div>
  `;
}

export function initHmw2Statistics() {
  const root = document.getElementById('hmw2-stat-lab');

  if (!root) return () => {};

  const el = id => root.querySelector(`#${id}`);

  const preset = el('hmw2-stat-preset');
  const runButton = el('hmw2-stat-run');
  const status = el('hmw2-stat-status');
  const results = el('hmw2-stat-results');

  const controller = new AbortController();

  let active = true;
  let revision = 0;

  // Fill the menu with fixed public demonstration phrases.
  preset.replaceChildren(
    ...DEMO_MNEMONICS.map(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.label;
      return option;
    })
  );

  async function run() {
    const current = ++revision;

    runButton.disabled = true;
    results.hidden = true;
    status.textContent = 'Running local experiments…';

    try {
      const hashStats = await analyzeHashAvalanche(
        Number(el('hmw2-stat-flips').value)
      );

      const addressStats = await analyzeAddresses(
        preset.value,
        Number(el('hmw2-stat-count').value)
      );

      if (!active || current !== revision) return;

      // HASH AVALANCHE SUMMARY
      el('hmw2-stat-input').textContent =
        `Baseline input: "${hashStats.input}" ` +
        `(${hashStats.flipCount} individual one-bit flips)`;

      el('hmw2-stat-hash-summary').innerHTML =
        hashStats.algorithms.map(algorithm => `
          <div class="hmw2-stat-card">

            <h4>${algorithm.name}</h4>

            <strong class="hmw2-stat-big">
              ${algorithm.mean.toFixed(2)} /
              ${algorithm.totalBits} bits
            </strong>

            <p>
              Average changed:
              ${percent(algorithm.percentage)}
            </p>

            <p>
              Observed range:
              ${algorithm.min}–${algorithm.max} bits
            </p>

          </div>
        `).join('');

      // INDIVIDUAL AVALANCHE EXPERIMENTS
      el('hmw2-stat-hash-charts').innerHTML =
        hashStats.algorithms.map(algorithm => `
          <div class="hmw2-stat-card">

            <h4>
              ${algorithm.name}:
              changed bits per input flip
            </h4>

            ${meters(
              algorithm.values.map((n, i) => ({
                label: `#${i + 1}`,
                value: 100 * n / algorithm.totalBits,
                text: percent(
                  100 * n / algorithm.totalBits
                )
              })),
              100
            )}

          </div>
        `).join('');

      // BIT FREQUENCIES
      el('hmw2-stat-hash-bits').innerHTML =
        hashStats.algorithms.map(algorithm => `
          <div class="hmw2-stat-card">

            <h4>${algorithm.name}</h4>

            ${meters(
              algorithm.ones.map((n, i) => ({
                label: `b${7 - i}`,
                value: 100 * n / algorithm.totalBytes,
                text: percent(
                  100 * n / algorithm.totalBytes
                )
              })),
              100
            )}

          </div>
        `).join('');

      // DERIVED ADDRESS TABLE
      el('hmw2-stat-address-rows').innerHTML =
        addressStats.rows.map(row => `
          <tr>
            <td>${row.index}</td>
            <td>${row.path}</td>
            <td class="hmw2-stat-hex">
              ${row.address}
            </td>
          </tr>
        `).join('');

      // ADDRESS HAMMING DISTANCE
      el('hmw2-stat-address-summary').textContent =
        'Average Hamming distance between adjacent addresses: ' +
        `${addressStats.averageHamming.toFixed(2)} / ` +
        '160 bits (' +
        percent(addressStats.averageHamming / 160 * 100) +
        ').';

      // HEXADECIMAL DIGIT FREQUENCIES
      el('hmw2-stat-nibbles').innerHTML = meters(
        addressStats.nibbleCounts.map((n, i) => ({
          label: i.toString(16),
          value: n,
          text: String(n)
        })),
        Math.max(...addressStats.nibbleCounts)
      );

      // ADDRESS BIT FREQUENCIES
      el('hmw2-stat-address-bits').innerHTML = meters(
        addressStats.ones.map((n, i) => ({
          label: `b${7 - i}`,
          value: 100 * n / addressStats.totalBytes,
          text: percent(
            100 * n / addressStats.totalBytes
          )
        })),
        100
      );

      results.hidden = false;

      status.textContent =
        'Experiments completed using public test data.';

    } catch (error) {
      if (!active || current !== revision) return;

      status.textContent =
        'Experiment failed. Check the browser console ' +
        'and network connection.';

      console.error(
        'HMW 2 statistical experiment failed:',
        error
      );

    } finally {
      if (active && current === revision) {
        runButton.disabled = false;
      }
    }
  }

  runButton.addEventListener(
    'click',
    () => void run(),
    { signal: controller.signal }
  );

  // Cleanup when switching pages.
  return () => {
    active = false;
    revision++;
    controller.abort();
  };
}
