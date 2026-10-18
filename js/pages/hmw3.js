
/*
 * Statistics-Lab
 * Homework 2 — Encryption, Decryption & Cryptanalysis
 *
 * Public route: #/hmw3
 *
 * Initial page structure.
 * Interactive simulations will be implemented in later steps.
 */

import { renderHmw3Simulator } from '../homeworks/hmw3/simulator-ui.js';

export function renderHmw3() {
  return `
    <!-- ==========================================
         HOMEWORK HEADER
         ========================================== -->

    <section class="module-header">

      <div class="eyebrow">
        <span class="eyebrow-line"></span>
        HOMEWORK 2 · ENCRYPTION & CRYPTANALYSIS
      </div>

      <span class="module-status">
        CRYPTOGRAPHY · INTERACTIVE LAB
      </span>

    </section>


    <!-- ==========================================
         INTRODUCTION
         ========================================== -->

    <section class="module-intro">

      <h1>
        Encryption, Decryption<br />
        <span>& Cryptanalysis.</span>
      </h1>

      <p>
        An interactive exploration of classical and
        elliptic-curve-based encryption, with a focus on
        cryptanalysis, restricted key spaces, statistical
        properties, and key-recovery attacks.
      </p>

    </section>


    <!-- ==========================================
         01 / HOMEWORK OVERVIEW
         ========================================== -->

    <div class="module-layout">

      <section
        class="panel panel-large"
        aria-labelledby="hmw3-overview-title"
      >

        <div class="panel-label">
          01 / HOMEWORK OVERVIEW
        </div>

        <h2 id="hmw3-overview-title">
          From Encryption to Cryptanalysis
        </h2>

        <p>
          In this homework, we will implement and compare
          two encryption schemes: the classical Caesar cipher
          and an educational scheme based on elliptic-curve
          cryptography (ECC).
        </p>

        <p>
          Both schemes will encrypt and decrypt the same
          plaintext message, allowing us to investigate
          how their encryption procedures, key spaces,
          and security assumptions differ.
        </p>

        <p>
          We will then study two attacks: statistical
          cryptanalysis against Caesar and exhaustive
          private-key recovery against an ECC configuration
          with an intentionally restricted key space.
        </p>

      </section>


      <aside
        class="panel panel-side"
        aria-labelledby="hmw3-objectives-title"
      >

        <div class="panel-label">
          LEARNING OBJECTIVES
        </div>

        <h2 id="hmw3-objectives-title">
          What will we investigate?
        </h2>

        <p>
          Encryption and decryption procedures.
        </p>

        <p>
          Public and private keys, symmetric keys,
          and their respective roles.
        </p>

        <p>
          Statistical properties of ciphertexts
          and language-based cryptanalysis.
        </p>

        <p>
          Brute-force attacks against deliberately
          restricted key spaces.
        </p>

        <p class="panel-note">
          All implementations and attacks will use
          educational examples and demonstration keys.
        </p>

      </aside>

    </div>


    <!-- ==========================================
         02 / THE TWO ENCRYPTION SCHEMES
         ========================================== -->


    <section
      class="panel"
      aria-labelledby="hmw3-schemes-title"
    >

      <div class="panel-label">
          02 / CRYPTOGRAPHIC FOUNDATIONS
      </div>
  
      <h2 id="hmw3-schemes-title">
          Understanding Encryption and Keys
      </h2>
  
      <p>
          Encryption transforms a readable message, called
          plaintext, into an unreadable representation,
          called ciphertext.
      </p>
  
      <p>
          Decryption reverses this transformation using
          the appropriate cryptographic key.
      </p>
  
      <p>
          In this homework, we compare two fundamentally
          different approaches: the classical Caesar cipher
          and an educational encryption scheme based on
          elliptic-curve cryptography.
      </p>
  
  
      <!-- SYMMETRIC ENCRYPTION -->
  
      <h3>
          2.1 — Symmetric-Key Encryption
      </h3>
  
      <p>
          In symmetric-key encryption, the sender and the
          receiver use the same secret key, or equivalent
          secret information, to encrypt and decrypt data.
      </p>
  
      <p>
          The Caesar cipher is a simple historical example:
          its secret key is an integer indicating how many
          positions each letter must be shifted in the alphabet.
      </p>
  
      <p>
          For an alphabet of 26 letters, we associate
          A with 0, B with 1, and so on up to Z with 25.
      </p>
  
      <div class="math-display">
          E(k, x) = (x + k) mod 26
      </div>
  
      <p>
          The encryption function E shifts the numerical
          representation x of a plaintext letter by k
          positions.
      </p>
  
      <div class="math-display">
          D(k, y) = (y - k) mod 26
      </div>
  
      <p>
          The decryption function D performs the inverse
          operation, subtracting the same key k.
      </p>
  
      <p>
          For example, with k = 3, the plaintext letter
          A becomes D, while the ciphertext letter D
          becomes A during decryption.
      </p>
  
      <div class="hmw2-key-idea">
          <span>CAESAR KEY SPACE</span>
  
          <strong>
          K = {0, 1, 2, ..., 25}
          </strong>
  
          <small>
          The Caesar cipher has only 26 possible shifts,
          including the identity transformation k = 0.
          Its small key space allows exhaustive search,
          and its letter frequencies remain recognizable
          after encryption.
          </small>
      </div>
  
  
      <!-- PUBLIC-KEY CRYPTOGRAPHY -->
  
      <h3>
          2.2 — Public-Key Cryptography
      </h3>
  
      <p>
          Public-key cryptography uses a mathematically
          related pair of keys: a private key that must
          remain secret and a public key that can be shared.
      </p>
  
      <p>
          In elliptic-curve cryptography, the public key
          is obtained by multiplying a public generator
          point G by a private scalar d.
      </p>
  
      <div class="math-display">
          Q = dG
      </div>
  
      <p>
          Here, d is the private key and Q is the
          corresponding public key.
      </p>
  
      <p>
          The multiplication is efficient to compute,
          while recovering a properly generated private
          scalar from its public point is believed to
          be computationally infeasible on secp256k1.
      </p>
  
      <p>
          Unlike the small educational curve examined
          in Homework 1.1, our new experiment will use
          the actual secp256k1 curve, but deliberately
          restrict the receiver's private-key range.
      </p>
  
      <div class="hmw2-key-idea">
          <span>RESTRICTED PRIVATE-KEY SPACE</span>
  
          <strong>
          d in {1, 2, ..., 256}
          </strong>
  
          <small>
          This restriction is introduced only for
          experimental purposes. A properly generated
          secp256k1 private key is selected from a much
          larger set of valid scalars.
          </small>
      </div>
  
  
      <!-- ECC-BASED HYBRID ENCRYPTION -->
  
      <h3>
          2.3 — ECC-Based Hybrid Encryption
      </h3>
  
      <p>
          Elliptic-curve scalar multiplication alone
          does not encrypt arbitrary text messages.
          Instead, ECC can be used to establish shared
          secret material between two participants.
      </p>
  
      <p>
          We will implement an educational hybrid
          encryption scheme inspired by ECIES.
          It combines ephemeral ECDH key agreement,
          HKDF-SHA256 key derivation and AES-256-GCM
          authenticated encryption.
      </p>
  
      <p>
          First, the receiver generates a private key d
          and publishes the corresponding public key Q.
      </p>
  
      <div class="math-display">
          Q = dG
      </div>
  
      <p>
          The sender generates a fresh ephemeral private
          scalar r and its corresponding public point R.
      </p>
  
      <div class="math-display">
          R = rG
      </div>
  
      <p>
          The sender then computes a shared elliptic-curve
          point using the receiver's public key.
      </p>
  
      <div class="math-display">
          S = rQ
      </div>
  
      <p>
          The receiver can independently calculate
          exactly the same point using their private
          key and the sender's ephemeral public key.
      </p>
  
      <div class="math-display">
          S = dR
      </div>
  
      <p>
          These values are equal because elliptic-curve
          scalar multiplication satisfies:
      </p>
  
      <div class="math-display">
          rQ = r(dG) = d(rG) = dR
      </div>
  
      <p>
          Both participants can therefore derive the
          same symmetric encryption key from the shared
          point using HKDF-SHA256.
      </p>
  
      <p>
          The sender uses this derived key and AES-256-GCM
          to encrypt the message. The receiver reconstructs
          the key and uses it to decrypt and authenticate
          the ciphertext.
      </p>
  
      <div class="hmw2-key-idea">
          <span>ENCRYPTED MESSAGE PACKAGE</span>
  
          <strong>
          R + Salt + IV + Ciphertext + Authentication Tag
          </strong>
  
          <small>
          The sender transmits the ephemeral public key,
          key-derivation salt, encryption IV and encrypted
          message with its authentication tag.
          The receiver's private key is never transmitted.
          </small>
      </div>
  
      <p class="panel-note">
          This is a teaching-oriented ECIES-like construction,
          not a claim of compliance with a particular
          standardized ECIES profile. The implementation
          will use secure library primitives and fresh
          randomness for each encryption operation.
      </p>
  
  
      <!-- SECURITY COMPARISON -->
  
      <h3>
          2.4 — Why Are These Schemes Different?
      </h3>
  
      <p>
          Caesar uses a single numerical shift for both
          encryption and decryption. Its key space is
          extremely small, and encryption preserves
          the relative frequencies of plaintext letters.
      </p>
  
      <p>
          Our ECC-based hybrid scheme uses a public/private
          key pair, fresh ephemeral key material, a
          key-derivation function and authenticated
          symmetric encryption.
      </p>
  
      <p>
          Its security depends on the underlying
          cryptographic assumptions and on correct key
          generation and implementation.
      </p>
  
      <p>
          In our experiment, deliberately choosing the
          receiver's private key from a tiny interval
          introduces a weakness that can be exploited
          through exhaustive key search.
      </p>
  
      <p class="panel-note">
          The two attacks studied later will exploit
          different information: linguistic statistics
          for Caesar and a restricted private-key space
          for ECC. An encryption algorithm should not
          depend on its design being secret.
      </p>

    </section>


    <!-- ==========================================
         03 / CRYPTANALYSIS
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw3-attacks-title"
    >

      <div class="panel-label">
        03 / CRYPTANALYSIS
      </div>

      <h2 id="hmw3-attacks-title">
        Attacking Weak Encryption Schemes
      </h2>

      <p>
        The Caesar cipher preserves the statistical
        structure of the original language.
        This makes frequency-based cryptanalysis
        possible even when the secret shift is unknown.
      </p>

      <p>
        For ECC, we will deliberately restrict the
        receiver's private key to a small interval.
        An attacker will attempt to recover that key
        by testing candidate private keys against
        the known public key.
      </p>

      <p>
        These attacks exploit different weaknesses:
        predictable linguistic statistics in Caesar
        and insufficient private-key entropy in
        the restricted ECC experiment.
      </p>

      <p class="panel-note">
        Recovering a deliberately weak ECC private key
        does not imply that secp256k1 is insecure
        when private keys are generated correctly.
      </p>

    </section>


    <!-- ==========================================
         04 / IMPLEMENTATION ROADMAP
         ========================================== -->

    <section
      class="panel"
      aria-labelledby="hmw3-roadmap-title"
    >

      <div class="panel-label">
        04 / IMPLEMENTATION ROADMAP
      </div>

      <h2 id="hmw3-roadmap-title">
        Planned Interactive Experiments
      </h2>

      <p>
        This laboratory will progressively introduce
        the following interactive components.
      </p>

      <ol class="roadmap">

        <li>
          <span>01</span>
          <div>
            <strong>Caesar Encryption & Decryption</strong>
            <small>
              Encrypt and decrypt a message using
              a configurable alphabet shift.
            </small>
          </div>
        </li>

        <li>
          <span>02</span>
          <div>
            <strong>ECC Encryption & Decryption</strong>
            <small>
              Encrypt the same message using an
              educational secp256k1-based hybrid scheme.
            </small>
          </div>
        </li>

        <li>
          <span>03</span>
          <div>
            <strong>Statistical Cryptanalysis of Caesar</strong>
            <small>
              Recover the encryption key using
              letter frequencies and language statistics.
            </small>
          </div>
        </li>

        <li>
          <span>04</span>
          <div>
            <strong>ECC Private-Key Recovery</strong>
            <small>
              Demonstrate exhaustive key search
              against a deliberately restricted
              private-key space.
            </small>
          </div>
        </li>

        <li>
          <span>05</span>
          <div>
            <strong>Statistical Experiments</strong>
            <small>
              Evaluate attack success rates,
              ciphertext lengths, key spaces,
              and computational costs.
            </small>
          </div>
        </li>

        <li>
          <span>06</span>
          <div>
            <strong>Comparative Analysis & Conclusion</strong>
            <small>
              Compare the schemes, interpret the
              experimental findings, and discuss
              their security limitations.
            </small>
          </div>
        </li>

      </ol>


    </section>


    <!-- ==========================================
         05 / INTERACTIVE CAESAR CIPHER
         ========================================== -->

    ${renderHmw3Simulator()}

  `;
}
