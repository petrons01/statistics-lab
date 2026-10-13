import { renderHmw2WalletLab } from '../homeworks/hmw2/wallet-ui.js';
import { renderHmw2StatisticsLab } from '../homeworks/hmw2/statistics-ui.js';

/*
 * HMW 2 — Step 1: Introduction & Theory
 *
 * From Wallet Seed to Ethereum Address
 *
 * Static educational content.
 * Interactive wallet derivation will be added later.
 */

export function renderHmw2() {
  return `
    <section class="module-header">
      <div class="eyebrow">
        <span class="eyebrow-line"></span>
        HOMEWORK 02 · ETHEREUM WALLET CRYPTOGRAPHY
      </div>
      <span class="module-status">ETHEREUM · INTERACTIVE LAB</span>
    </section>

    <section class="module-intro">
      <h1>From Wallet Seed<br /><span>to Ethereum Address.</span></h1>
      <p>
        A guided exploration of how mnemonic phrases, hierarchical key
        derivation, elliptic-curve cryptography, hashing, and checksums
        combine to produce an Ethereum account address.
      </p>
    </section>

    <!-- ===================================================
         01 / THE BIG PICTURE
         =================================================== -->

    <div class="module-layout">
      <section class="panel panel-large" aria-labelledby="hmw2-intro-title">
        <div class="panel-label">01 / THE BIG PICTURE</div>

        <h2 id="hmw2-intro-title">
          Why does a wallet use several algorithms?
        </h2>

        <p>
          A wallet is a tool for managing cryptographic keys and interacting
          with accounts. A recovery phrase is not an Ethereum address, and
          an Ethereum address is not a public key. Each transformation has
          a different purpose and different security properties.
        </p>

        <p>
          In a common hierarchical deterministic (HD) wallet, one mnemonic
          can reproduce many private keys. A selected private key determines
          a public key, from which an Ethereum address is calculated.
        </p>

        <div class="hmw2-key-idea">
          <span>KEY RELATIONSHIP</span>

          <strong>
            Private key k → Public key Q = kG → Ethereum address
          </strong>

          <small>
            The first transformation uses secp256k1; the second uses
            Keccak-256 and a 20-byte truncation.
          </small>
        </div>
      </section>

      <aside class="panel panel-side" aria-labelledby="hmw2-safety-title">
        <div class="panel-label">SECURITY FIRST</div>

        <h2 id="hmw2-safety-title">
          Use demonstration data only
        </h2>

        <p>
          Recovery phrases and private keys can grant control over funds.
          Never paste a real mnemonic, passphrase, or private key into
          an educational website, including this one.
        </p>

        <p class="panel-note">
          The future simulator will use publicly documented test vectors.
          No real wallet credentials are needed.
        </p>
      </aside>
    </div>

    <!-- ===================================================
         02 / CRYPTOGRAPHIC PIPELINE
         =================================================== -->

    <section class="panel hmw2-section"
             aria-labelledby="hmw2-pipeline-title">

      <div class="panel-label">02 / CRYPTOGRAPHIC PIPELINE</div>

      <h2 id="hmw2-pipeline-title">
        From randomness to a checksummed address
      </h2>

      <p>
        This is the standard conceptual path for an Ethereum externally
        owned account (EOA) derived from a BIP-39 mnemonic. BIP-44 specifies
        the path within the BIP-32 key tree; it is not a separate hash function.
      </p>

      <ol class="hmw2-flow">
        <li>
          <span class="hmw2-flow-number">01</span>
          <div>
            <strong>Random entropy → Mnemonic phrase</strong>
            <small>
              BIP-39 · human-readable encoding with a checksum
            </small>
          </div>
        </li>

        <li>
          <span class="hmw2-flow-number">02</span>
          <div>
            <strong>
              Mnemonic (+ optional passphrase) → 512-bit seed
            </strong>
            <small>
              BIP-39 · PBKDF2-HMAC-SHA512, 2,048 iterations
            </small>
          </div>
        </li>

        <li>
          <span class="hmw2-flow-number">03</span>
          <div>
            <strong>
              Seed → Master key and derived private key
            </strong>
            <small>
              BIP-32 · HMAC-SHA512 and hierarchical child-key derivation
            </small>
          </div>
        </li>

        <li>
          <span class="hmw2-flow-number">04</span>
          <div>
            <strong>Select the derivation path</strong>
            <small>
              BIP-44 · for example, m/44'/60'/0'/0/0
            </small>
          </div>
        </li>

        <li>
          <span class="hmw2-flow-number">05</span>
          <div>
            <strong>Private key → Public key</strong>
            <small>
              secp256k1 · elliptic-curve scalar multiplication, Q = kG
            </small>
          </div>
        </li>

        <li>
          <span class="hmw2-flow-number">06</span>
          <div>
            <strong>Public key → 20-byte Ethereum address</strong>
            <small>
              Keccak-256 · hash the 64-byte x || y public key;
              keep the last 20 bytes
            </small>
          </div>
        </li>

        <li>
          <span class="hmw2-flow-number">07</span>
          <div>
            <strong>Address → Mixed-case address</strong>
            <small>
              EIP-55 · checksum capitalization of hexadecimal letters
            </small>
          </div>
        </li>
      </ol>

      <p class="panel-note">
        The address shown by a wallet typically begins with 0x and has
        40 hexadecimal digits after that prefix. EIP-55 changes only the
        capitalization of letters, not the underlying 160-bit address.
      </p>
    </section>

    <!-- ===================================================
         03 / SIX STANDARDS AND PRIMITIVES
         =================================================== -->

    <section class="panel hmw2-section"
             aria-labelledby="hmw2-primitives-title">

      <div class="panel-label">03 / SIX STANDARDS AND PRIMITIVES</div>

      <h2 id="hmw2-primitives-title">
        A different role at each stage
      </h2>

      <div class="hmw2-primitive-grid">

        <!-- BIP-39 -->
        <article class="hmw2-primitive">
          <div class="hmw2-primitive-heading">
            <span>01</span>
            <h3>BIP-39</h3>
          </div>

          <p>
            Encodes 128–256 bits of entropy and a short checksum as a
            mnemonic sentence (commonly 12 or 24 words). It also specifies
            how PBKDF2-HMAC-SHA512 converts the mnemonic and optional
            passphrase into a 512-bit seed.
          </p>

          <span class="hmw2-primitive-type">
            Encoding + seed derivation
          </span>
        </article>

        <!-- BIP-32 -->
        <article class="hmw2-primitive">
          <div class="hmw2-primitive-heading">
            <span>02</span>
            <h3>BIP-32</h3>
          </div>

          <p>
            Builds a hierarchical deterministic tree of extended keys.
            Each extended private key includes a private key and a chain
            code. Child keys can be derived without generating fresh
            randomness for each address.
          </p>

          <span class="hmw2-primitive-type">
            Hierarchical key derivation
          </span>
        </article>

        <!-- BIP-44 -->
        <article class="hmw2-primitive">
          <div class="hmw2-primitive-heading">
            <span>03</span>
            <h3>BIP-44</h3>
          </div>

          <p>
            Defines a consistent five-level path convention for HD wallets:
            purpose, coin type, account, change, and address index.
            Ethereum's registered coin type is 60.
          </p>

          <span class="hmw2-primitive-type">
            Derivation path convention
          </span>
        </article>

        <!-- secp256k1 -->
        <article class="hmw2-primitive">
          <div class="hmw2-primitive-heading">
            <span>04</span>
            <h3>secp256k1</h3>
          </div>

          <p>
            Defines the elliptic curve used for Ethereum EOA key pairs.
            The private scalar k determines the public point Q = kG.
            The same key relationship supports ECDSA digital signatures.
          </p>

          <span class="hmw2-primitive-type">
            Public-key cryptography
          </span>
        </article>

        <!-- Keccak-256 -->
        <article class="hmw2-primitive">
          <div class="hmw2-primitive-heading">
            <span>05</span>
            <h3>Keccak-256</h3>
          </div>

          <p>
            Produces a 256-bit cryptographic digest. To derive an EOA
            address, Ethereum hashes the uncompressed public key's x and y
            coordinates without its 0x04 prefix, then takes the last 20 bytes.
          </p>

          <span class="hmw2-primitive-type">
            Cryptographic hashing
          </span>
        </article>

        <!-- EIP-55 -->
        <article class="hmw2-primitive">
          <div class="hmw2-primitive-heading">
            <span>06</span>
            <h3>EIP-55</h3>
          </div>

          <p>
            Uses Keccak-256 of the lowercase hexadecimal address text
            to decide which hexadecimal letters are capitalized.
            This helps detect accidental address transcription errors.
          </p>

          <span class="hmw2-primitive-type">
            Checksum encoding
          </span>
        </article>

      </div>
    </section>

    <!-- ===================================================
         04 / ETHEREUM DERIVATION PATH
         =================================================== -->

    <section class="panel hmw2-section"
             aria-labelledby="hmw2-path-title">

      <div class="panel-label">04 / AN ETHEREUM DERIVATION PATH</div>

      <h2 id="hmw2-path-title">
        Reading m/44'/60'/0'/0/0
      </h2>

      <div class="hmw2-path">
        m / 44' / 60' / 0' / 0 / 0
      </div>

      <div class="hmw2-path-grid">
        <div>
          <strong>m</strong>
          <span>Master node</span>
        </div>

        <div>
          <strong>44'</strong>
          <span>BIP-44 purpose</span>
        </div>

        <div>
          <strong>60'</strong>
          <span>Ethereum coin type</span>
        </div>

        <div>
          <strong>0'</strong>
          <span>Account 0</span>
        </div>

        <div>
          <strong>0</strong>
          <span>External chain</span>
        </div>

        <div>
          <strong>0</strong>
          <span>Address index 0</span>
        </div>
      </div>

      <p class="panel-note">
        The apostrophe marks hardened derivation. Incrementing the last
        index (for example, from 0 to 1) selects another child key and
        normally produces a different Ethereum address from the same seed.
      </p>
    </section>

    <!-- ===================================================
         05 / IMPORTANT DISTINCTIONS
         =================================================== -->

    <section class="panel hmw2-section"
             aria-labelledby="hmw2-differences-title">

      <div class="panel-label">05 / IMPORTANT DISTINCTIONS</div>

      <h2 id="hmw2-differences-title">
        Similar words, different operations
      </h2>

      <div class="hmw2-table-scroll">
        <table class="hmw2-table">
          <thead>
            <tr>
              <th scope="col">Concept</th>
              <th scope="col">Purpose</th>
              <th scope="col">Wallet example</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Key generation</td>
              <td>Create new secret material from secure randomness.</td>
              <td>Random entropy used for a new mnemonic.</td>
            </tr>

            <tr>
              <td>Key derivation</td>
              <td>
                Deterministically derive keys from existing material.
              </td>
              <td>BIP-32 child keys from a master seed.</td>
            </tr>

            <tr>
              <td>Public-key cryptography</td>
              <td>
                Relate a private key and public key; enable signatures.
              </td>
              <td>Q = kG on secp256k1.</td>
            </tr>

            <tr>
              <td>Hashing</td>
              <td>Map input bytes to a fixed-size digest.</td>
              <td>Keccak-256 during address derivation.</td>
            </tr>

            <tr>
              <td>Checksum</td>
              <td>Help detect accidental errors.</td>
              <td>BIP-39 mnemonic bits and EIP-55 casing.</td>
            </tr>

            <tr>
              <td>Encoding</td>
              <td>
                Represent the same information in another form.
              </td>
              <td>Mnemonic words or hexadecimal address text.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="panel-note">
        A checksum does not encrypt an address or authenticate the sender.
        Also, Ethereum uses Keccak-256, not the identical-looking but
        different NIST SHA3-256 function.
      </p>
    </section>

    <!-- ===================================================
         06 / CONNECTION WITH HMW 1
         =================================================== -->

    <section class="panel hmw2-section"
             aria-labelledby="hmw2-connection-title">

      <div class="panel-label">06 / CONNECTION WITH HMW 1</div>

      <h2 id="hmw2-connection-title">
        Where does elliptic-curve multiplication fit?
      </h2>

      <div class="hmw2-equation">
        Q = kG
      </div>

      <p>
        In HMW 1, we implemented this operation using a tiny curve over
        a finite field. In an actual Ethereum wallet, the principle is the
        same, but secp256k1 uses vastly larger parameters. The public key
        then becomes the input to Keccak-256 for address derivation.
      </p>

      <p class="panel-note">
        Scalar multiplication is not a cryptographic hash function.
        Its security relies on the difficulty of the elliptic-curve discrete
        logarithm problem for suitable parameters.
      </p>
    </section>

    <!-- ===================================================
         07 / PRIMARY REFERENCES
         =================================================== -->

    <section class="panel hmw2-section"
             aria-labelledby="hmw2-refs-title">

      <div class="panel-label">07 / PRIMARY REFERENCES</div>

      <h2 id="hmw2-refs-title">
        Official specifications
      </h2>

      <ul class="hmw2-references">
        <li>
          <a
            href="https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki"
            target="_blank"
            rel="noopener noreferrer"
          >
            BIP-39 — Mnemonic code
          </a>
        </li>

        <li>
          <a
            href="https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki"
            target="_blank"
            rel="noopener noreferrer"
          >
            BIP-32 — Hierarchical deterministic wallets
          </a>
        </li>

        <li>
          <a
            href="https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki"
            target="_blank"
            rel="noopener noreferrer"
          >
            BIP-44 — Multi-account hierarchy
          </a>
        </li>

        <li>
          <a
            href="https://ethereum.org/en/developers/docs/accounts/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ethereum documentation — Accounts
          </a>
        </li>

        <li>
          <a
            href="https://eips.ethereum.org/EIPS/eip-55"
            target="_blank"
            rel="noopener noreferrer"
          >
            EIP-55 — Mixed-case checksum addresses
          </a>
        </li>
      </ul>
    </section>

    ${renderHmw2WalletLab()}

    ${renderHmw2StatisticsLab()}

    <!-- ===================================================
         NEXT STEP
     =================================================== -->

    
    <section class="next-step">
      <span class="next-icon" aria-hidden="true">↗</span>

      <div>
        <strong>
          Next step: Historical Context & Final Discussion
        </strong>

        <p>
          We will compare the historical development of RSA,
          SHA-2, BIP-32, BIP-39, BIP-44, SHA-3 and EIP-55,
          then discuss the purpose of each cryptographic
          primitive and present our final conclusions.
        </p>
      </div>
    </section>

  `;
}
