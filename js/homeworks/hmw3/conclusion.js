
/*
 * Statistics-Lab — Homework 2
 *
 * Cryptographic Comparison & Conclusions
 *
 * Educational comparison between:
 *
 * 1. Classical Caesar Cipher
 * 2. Hybrid secp256k1 encryption
 * 3. Statistical Caesar cryptanalysis
 * 4. Restricted ECC private-key recovery
 *
 * This module renders static educational content.
 * It does not execute cryptographic operations.
 */

export function renderHmw3Conclusion() {

  return `

    <section
      class="panel hmw3-conclusion"
      id="hmw3-conclusion"
      aria-labelledby="hmw3-conclusion-title"
    >

      <div class="panel-label">
        10 / CRYPTOGRAPHIC COMPARISON & CONCLUSIONS
      </div>

      <h2 id="hmw3-conclusion-title">
        From Classical Ciphers to Elliptic-Curve Cryptography
      </h2>

      <p>
        The experiments in this homework demonstrate
        two very different approaches to encryption
        and two different ways in which cryptographic
        security can fail.
      </p>

      <p>
        The Caesar cipher is inherently insecure because
        its key space is extremely small and it preserves
        important statistical properties of natural language.
      </p>

      <p>
        In contrast, elliptic-curve cryptography provides
        a foundation for strong cryptographic constructions.
        However, even a mathematically sound primitive
        becomes vulnerable when its keys are generated
        from an inadequately small search space.
      </p>


      <!-- ==========================================
           10.1 / ENCRYPTION AND DECRYPTION
           ========================================== -->

      <div class="hmw3-conclusion-section">

        <h3>
          10.1 — Encryption and Decryption
        </h3>

        <h4>
          Caesar Cipher
        </h4>

        <p>
          Caesar is a symmetric substitution cipher.
          A single secret integer k determines how far
          each letter is shifted within the alphabet.
        </p>

        <div class="math-display">
          E(k, x) = (x + k) mod 26
        </div>

        <div class="math-display">
          D(k, y) = (y - k) mod 26
        </div>

        <p>
          Encryption and decryption use the same key.
          The transformation is deterministic: encrypting
          the same plaintext with the same key always
          produces the same ciphertext.
        </p>


        <h4>
          Hybrid secp256k1 Encryption
        </h4>

        <p>
          Our ECC demonstration uses an ECIES-like
          hybrid construction rather than directly
          encrypting message bytes with elliptic-curve
          point multiplication.
        </p>

        <p>
          The recipient has a private scalar d and
          a corresponding public point Q = dG.
          The sender knows Q and generates a fresh
          ephemeral private scalar r and public
          point R = rG.
        </p>

        <div class="math-display">
          Sender: S = rQ
        </div>

        <div class="math-display">
          Receiver: S = dR
        </div>

        <div class="math-display">
          rQ = r(dG) = d(rG) = dR
        </div>

        <p>
          Both parties therefore obtain the same ECDH
          shared point without transmitting either
          private scalar.
        </p>

        <p>
          The x-coordinate of this point is used
          as input to HKDF-SHA256, together with
          a random salt and contextual information.
          HKDF derives a 256-bit symmetric key.
        </p>

        <p>
          AES-256-GCM then encrypts the actual message
          and produces an authentication tag.
          During decryption, an invalid tag causes
          the operation to fail.
        </p>

        <p>
          Fresh ephemeral keys, salts and IVs make
          repeated encryptions of the same plaintext
          produce different encrypted packages.
        </p>

      </div>


      <!-- ==========================================
           10.2 / COMPARISON TABLE
           ========================================== -->

      <div class="hmw3-conclusion-section">

        <h3>
          10.2 — Comparison of the Two Schemes
        </h3>

        <div class="hmw3-conclusion-table-wrap">

          <table class="hmw3-conclusion-table">

            <caption>
              Cryptographic properties of Caesar and
              the educational secp256k1 hybrid scheme.
            </caption>

            <thead>
              <tr>
                <th>Property</th>
                <th>Caesar Cipher</th>
                <th>Hybrid secp256k1 Scheme</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <th scope="row">Cryptographic design</th>
                <td>Symmetric substitution cipher</td>
                <td>Elliptic-curve key agreement and authenticated symmetric encryption</td>
              </tr>

              <tr>
                <th scope="row">Key roles</th>
                <td>One shared secret shift k</td>
                <td>Recipient private/public keys, ephemeral sender key and derived AES key</td>
              </tr>

              <tr>
                <th scope="row">Encryption</th>
                <td>Alphabetic shift modulo 26</td>
                <td>ECDH, HKDF-SHA256 and AES-256-GCM</td>
              </tr>

              <tr>
                <th scope="row">Decryption</th>
                <td>Reverse shift using the same key</td>
                <td>Reconstruct the shared secret and perform authenticated AES-GCM decryption</td>
              </tr>

              <tr>
                <th scope="row">Encryption randomness</th>
                <td>Deterministic</td>
                <td>Randomized through ephemeral keys, salt and IV</td>
              </tr>

              <tr>
                <th scope="row">Key space in this lab</th>
                <td>26 possible shifts</td>
                <td>256 possible recipient private scalars</td>
              </tr>

              <tr>
                <th scope="row">Normal key space</th>
                <td>Always 26 shifts</td>
                <td>Approximately 2^256 valid secp256k1 private scalars</td>
              </tr>

              <tr>
                <th scope="row">Letter frequencies</th>
                <td>Preserved under a relabeling of letters</td>
                <td>No directly usable plaintext letter-frequency pattern in encrypted bytes</td>
              </tr>

              <tr>
                <th scope="row">Message integrity</th>
                <td>Not provided</td>
                <td>AES-GCM authentication tag detects modification of authenticated data</td>
              </tr>

              <tr>
                <th scope="row">Attack demonstrated</th>
                <td>Statistical frequency analysis</td>
                <td>Exhaustive search over weak private scalars</td>
              </tr>

              <tr>
                <th scope="row">Security conclusion</th>
                <td>Fundamentally insecure</td>
                <td>Weak in this demonstration due to intentionally restricted private keys</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <!-- ==========================================
           10.3 / KEY SPACE AND SECURITY
           ========================================== -->

      <div class="hmw3-conclusion-section">

        <h3>
          10.3 — Key Space and Effective Security
        </h3>

        <div class="hmw3-conclusion-keyspaces">

          <div class="hmw3-conclusion-keyspace">

            <span>Caesar Cipher</span>

            <strong>26 keys</strong>

            <p>
              Approximately 4.7 bits of maximum
              key uncertainty.
            </p>

          </div>

          <div class="hmw3-conclusion-keyspace">

            <span>Weak ECC Demonstration</span>

            <strong>256 keys</strong>

            <p>
              At most 8 bits of private-key entropy,
              assuming uniform selection.
            </p>

          </div>

          <div class="hmw3-conclusion-keyspace">

            <span>Proper secp256k1</span>

            <strong>Approximately 2^256</strong>

            <p>
              An enormous private-key space when
              scalars are generated securely.
            </p>

          </div>

        </div>

        <p>
          Key-space size is crucial, but the meaning
          depends on the cryptographic construction.
        </p>

        <p>
          Caesar offers only 26 possible keys, so
          an attacker can enumerate the entire
          space even without statistical analysis.
        </p>

        <p>
          Our ECC demonstration intentionally selects
          the recipient private key from just 256 values.
          This makes exhaustive enumeration practical
          even though the underlying curve is secp256k1.
        </p>

        <p>
          With correctly generated secp256k1 private
          keys, exhaustive search over the full scalar
          range is computationally impractical.
          Generic algorithms for the elliptic-curve
          discrete logarithm problem still require
          roughly 2^128 group operations.
        </p>

        <div class="hmw2-key-idea">

          <strong>Key observation</strong>

          <p>
            A strong mathematical primitive does not
            compensate for a predictably small key space.
            Secure key generation is a fundamental
            part of cryptographic security.
          </p>

        </div>

      </div>


      <!-- ==========================================
           10.4 / STATISTICAL PROPERTIES
           ========================================== -->

      <div class="hmw3-conclusion-section">

        <h3>
          10.4 — Statistical Properties of Ciphertexts
        </h3>

        <h4>
          Caesar Cipher
        </h4>

        <p>
          Caesar changes the labels of letters, but
          it does not change the number of times each
          letter appears in a message.
        </p>

        <p>
          If a plaintext contains many occurrences
          of E, its ciphertext will contain the same
          number of occurrences of the corresponding
          shifted letter.
        </p>

        <p>
          Spaces, punctuation and message length
          are also preserved by our implementation.
          These properties leak information about
          the structure of the plaintext.
        </p>

        <p>
          A language model can exploit the shifted
          letter-frequency distribution to estimate
          the original key.
        </p>


        <h4>
          Hybrid ECC and AES-GCM
        </h4>

        <p>
          In the hybrid scheme, the plaintext is encrypted
          as bytes with AES-GCM under a derived symmetric
          key. Its ciphertext does not expose a simple
          shifted distribution of English letters.
        </p>

        <p>
          Consequently, the Caesar frequency-recovery
          method does not transfer directly to the
          hybrid encryption scheme.
        </p>

        <p>
          This does not mean that the encrypted package
          reveals nothing. It still contains public
          metadata, including the ephemeral public key,
          salt and IV, and it reveals the approximate
          plaintext length through ciphertext size.
        </p>

      </div>


      <!-- ==========================================
           10.5 / CRYPTANALYSIS
           ========================================== -->

      <div class="hmw3-conclusion-section">

        <h3>
          10.5 — Comparison of Cryptanalytic Attacks
        </h3>

        <h4>
          Statistical Attack Against Caesar
        </h4>

        <p>
          The Caesar attack uses a statistical model
          estimated from an English reference corpus.
          For each possible shift, it compares
          candidate plaintext frequencies against
          expected language frequencies.
        </p>

        <div class="math-display">
          Best key = arg min chi-square(k)
        </div>

        <p>
          A smaller chi-square score indicates a
          closer fit to the reference distribution.
          The algorithm ranks all 26 keys and
          selects the best candidate.
        </p>

        <p>
          This method is language-dependent.
          It may fail on short messages, highly
          repetitive text or vocabulary that differs
          substantially from the training corpus.
        </p>

        <p>
          A complete exhaustive search is also trivial
          for Caesar. Statistical scoring is useful
          because it automatically ranks the resulting
          plaintext candidates.
        </p>


        <h4>
          Exhaustive Attack Against Weak ECC Keys
        </h4>

        <p>
          The ECC attack does not depend on the language,
          letter frequencies or statistical structure
          of the plaintext.
        </p>

        <p>
          Instead, for each candidate scalar d, the
          attacker calculates its public point dG
          and compares it with the recipient public
          key available in the captured package.
        </p>

        <div class="math-display">
          Test candidate d: does dG = Q?
        </div>

        <p>
          Once the matching private scalar is found,
          the attacker reconstructs the ECDH shared
          secret and decrypts the ciphertext using
          the existing AES-GCM decryption procedure.
        </p>

        <p>
          This is an attack against the restricted
          key-generation policy of the demonstration,
          not a practical break of properly configured
          secp256k1.
        </p>

      </div>


      <!-- ==========================================
           10.6 / EXPERIMENTAL FINDINGS
           ========================================== -->

      <div class="hmw3-conclusion-section">

        <h3>
          10.6 — Experimental Findings and Limitations
        </h3>

        <p>
          The Caesar experiments evaluate ciphertexts
          containing 10, 30, 100, 300 and 1000
          English letters.
        </p>

        <p>
          For each length, the laboratory records
          the fraction of correctly recovered keys,
          the correct key's average rank and
          the average recovery time.
        </p>

        <p>
          In general, longer texts offer more stable
          estimates of letter frequencies, making
          statistical recovery more reliable.
          However, success is not guaranteed for
          every sample, and the measured accuracy
          should be interpreted from the actual
          experiment results.
        </p>

        <p>
          The reference and evaluation texts in
          this implementation are synthetic corpora.
          Although they are stored separately,
          they cannot represent the full diversity
          of natural English.
        </p>

        <p>
          Evaluation passages may also overlap
          across trials. The resulting observations
          are useful for demonstrating the method
          but should not be treated as independent,
          population-wide estimates of attack success.
        </p>

        <p>
          Execution times are measured in the browser
          and depend on device performance, JavaScript
          runtime behavior and background activity.
        </p>

        <p>
          The ECC attack results demonstrate that
          the number of tested candidates depends
          on the selected interval and the position
          of the correct scalar within that interval.
        </p>

      </div>


      <!-- ==========================================
           10.7 / IMPLEMENTATION SECURITY NOTES
           ========================================== -->

      <div class="hmw3-conclusion-section">

        <h3>
          10.7 — Security Scope of This Implementation
        </h3>

        <p>
          The hybrid encryption module is designed
          for education. Although it uses established
          cryptographic primitives, it should not
          be considered a production-ready protocol.
        </p>

        <p>
          In particular, the demonstration does not
          establish the authenticity of the sender
          or provide an authenticated mechanism
          for distributing the recipient public key.
        </p>

        <p>
          Public-key substitution by an active attacker
          is therefore outside the protection provided
          by this laboratory.
        </p>

        <p>
          AES-GCM authenticates the encrypted package
          under the derived symmetric key, but this
          is not equivalent to a digital signature
          or sender identity verification.
        </p>

        <p>
          A production system also needs careful
          protocol design, key validation, secure
          key storage, lifecycle management and
          appropriate security review.
        </p>

      </div>


      <!-- ==========================================
           10.8 / FINAL CONCLUSION
           ========================================== -->

      <div class="hmw3-conclusion-section hmw3-conclusion-final">

        <h3>
          10.8 — Final Conclusion
        </h3>

        <p>
          The two schemes illustrate how cryptographic
          confidentiality depends on both mathematical
          design and implementation choices.
        </p>

        <p>
          Caesar is insecure by construction:
          it offers too few keys and exposes the
          statistical structure of natural language.
        </p>

        <p>
          Properly configured elliptic-curve cryptography,
          when combined with suitable symmetric
          encryption and secure key management,
          can provide strong confidentiality.
        </p>

        <p>
          However, restricting a secp256k1 private
          key to only 256 possibilities makes recovery
          straightforward, despite the strength
          of the elliptic-curve primitive itself.
        </p>

        <div class="hmw2-key-idea">

          <strong>Overall lesson</strong>

          <p>
            Cryptographic security requires more
            than choosing a strong algorithm.
            The key space, randomness, protocol
            design and implementation must also
            support the intended security guarantees.
          </p>

        </div>

      </div>

    </section>

  `;

}
