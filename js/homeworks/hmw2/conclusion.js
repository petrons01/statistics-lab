
/*
 * HMW 2 — Step 4
 * Historical Context, Comparison and Conclusions
 *
 * Static educational content.
 * No additional libraries or initialization required.
 */

export function renderHmw2Conclusion() {
  return `

    <!-- ================================================
         10 / HISTORICAL CONTEXT
         ================================================ -->

    <section class="panel hmw2-section"
             aria-labelledby="hmw2-history-title">

      <div class="panel-label">10 / HISTORICAL CONTEXT</div>

      <h2 id="hmw2-history-title">
        From public-key cryptography to HD wallets
      </h2>

      <p>
        The Ethereum wallet pipeline combines technologies developed
        over several decades. The dates below describe the introduction
        or formal standardization of each technique, rather than the
        date it was first used by Ethereum.
      </p>

      <div class="hmw2-table-scroll">
        <table class="hmw2-table">
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Technology</th>
              <th scope="col">Historical role</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1977</td>
              <td>RSA</td>
              <td>
                Introduced a practical public-key cryptosystem and
                digital signatures; the technical report appeared in
                1977 and the journal paper in 1978.
              </td>
            </tr>

            <tr>
              <td>2002</td>
              <td>SHA-2 / SHA-512</td>
              <td>
                NIST FIPS 180-2 standardized SHA-256, SHA-384 and SHA-512.
                SHA-512 later became important in wallet seed and key
                derivation through HMAC and PBKDF2.
              </td>
            </tr>

            <tr>
              <td>2012</td>
              <td>BIP-32</td>
              <td>
                Specified hierarchical deterministic wallets and
                reproducible parent-to-child key derivation.
              </td>
            </tr>

            <tr>
              <td>2013</td>
              <td>BIP-39</td>
              <td>
                Introduced mnemonic sentences and deterministic seed
                generation from mnemonic words and an optional passphrase.
              </td>
            </tr>

            <tr>
              <td>2014</td>
              <td>BIP-44</td>
              <td>
                Standardized a five-level account and address hierarchy
                over BIP-32.
              </td>
            </tr>

            <tr>
              <td>2015</td>
              <td>SHA-3 (FIPS 202)</td>
              <td>
                NIST standardized the Keccak-based SHA-3 family,
                with domain separation distinct from Ethereum's
                Keccak-256.
              </td>
            </tr>

            <tr>
              <td>2016</td>
              <td>EIP-55</td>
              <td>
                Proposed mixed-case checksum encoding for Ethereum
                addresses to help detect transcription mistakes.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="panel-note">
        RSA is historical background, not an algorithm used to derive
        Ethereum addresses. Ethereum EOAs use secp256k1 instead.
        The original homework dates SHA-2 approximately to 2001;
        the FIPS 180-2 standard specifying SHA-512 was published
        in 2002.
      </p>
    </section>


    <!-- ================================================
         11 / HASH FUNCTION COMPARISON
         ================================================ -->

    <section class="panel hmw2-section"
             aria-labelledby="hmw2-hash-comparison-title">

      <div class="panel-label">11 / HASH-FUNCTION COMPARISON</div>

      <h2 id="hmw2-hash-comparison-title">
        SHA-512 vs Keccak-256 vs SHA3-256
      </h2>

      <p>
        All three are cryptographic hash functions, but they do not
        use the same construction or necessarily produce the same
        digest. SHA-512 belongs to SHA-2. Keccak underlies SHA-3,
        while Ethereum uses the pre-standardization Keccak-256
        convention.
      </p>

      <div class="hmw2-table-scroll">
        <table class="hmw2-table">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">SHA-512</th>
              <th scope="col">Keccak-256</th>
              <th scope="col">SHA3-256</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Family</td>
              <td>SHA-2</td>
              <td>Keccak</td>
              <td>SHA-3 (Keccak-based)</td>
            </tr>

            <tr>
              <td>Digest length</td>
              <td>512 bits</td>
              <td>256 bits</td>
              <td>256 bits</td>
            </tr>

            <tr>
              <td>Construction</td>
              <td>Iterated compression-function design</td>
              <td>Sponge construction</td>
              <td>Sponge construction</td>
            </tr>

            <tr>
              <td>Padding / domain convention</td>
              <td>SHA-2-specific padding</td>
              <td>Legacy Keccak convention</td>
              <td>NIST SHA-3 domain-separation convention</td>
            </tr>

            <tr>
              <td>Wallet-related role</td>
              <td>Used inside HMAC/PBKDF2 for BIP-39 and BIP-32</td>
              <td>Used to derive Ethereum EOAs and EIP-55 checksums</td>
              <td>Not a drop-in replacement for Ethereum Keccak-256</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="hmw2-key-idea">
        <span>IMPORTANT DISTINCTION</span>

        <strong>
          Keccak-256(message) ≠ SHA3-256(message) in general
        </strong>

        <small>
          Even though both have a 256-bit output and share the
          underlying Keccak permutation, their domain-separation
          and padding conventions differ. Substituting SHA3-256
          would generate incorrect Ethereum address hashes
          and EIP-55 checksums.
        </small>
      </div>

      <p class="panel-note">
        A 512-bit digest is longer than a 256-bit digest, but digest
        length by itself does not establish overall wallet security.
        The intended security property and the way the algorithm
        is used both matter.
      </p>
    </section>


    <!-- ================================================
         12 / STATISTICAL INTERPRETATION
         ================================================ -->

    <section class="panel hmw2-section"
             aria-labelledby="hmw2-interpretation-title">

      <div class="panel-label">12 / STATISTICAL INTERPRETATION</div>

      <h2 id="hmw2-interpretation-title">
        What can the experiments tell us?
      </h2>

      <div class="hmw2-primitive-grid">

        <article class="hmw2-primitive">
          <div class="hmw2-primitive-heading">
            <span>01</span>
            <h3>Hash avalanche</h3>
          </div>

          <p>
            When one input bit is flipped, a good cryptographic hash
            should change roughly half of its output bits on average.
            The expected benchmark is around 128 of 256 bits for
            Keccak-256 and 256 of 512 bits for SHA-512;
            individual trials fluctuate.
          </p>

          <span class="hmw2-primitive-type">
            Diffusion, not a security proof
          </span>
        </article>

        <article class="hmw2-primitive">
          <div class="hmw2-primitive-heading">
            <span>02</span>
            <h3>Output-bit frequencies</h3>
          </div>

          <p>
            The bit-frequency charts pool bit positions across
            output bytes. Fractions near 50% are compatible with
            balanced samples, but this does not establish independence,
            preimage resistance or collision resistance.
          </p>

          <span class="hmw2-primitive-type">
            Descriptive statistics
          </span>
        </article>

        <article class="hmw2-primitive">
          <div class="hmw2-primitive-heading">
            <span>03</span>
            <h3>Derived addresses</h3>
          </div>

          <p>
            Changing the final BIP-44 index selects another derived key
            and typically another 160-bit address. Frequencies of
            hexadecimal digits and Hamming distances describe the
            sample, not a formal avalanche experiment on BIP-32.
          </p>

          <span class="hmw2-primitive-type">
            Deterministic key hierarchy
          </span>
        </article>

        <article class="hmw2-primitive">
          <div class="hmw2-primitive-heading">
            <span>04</span>
            <h3>Sample limitations</h3>
          </div>

          <p>
            The experiments use a few fixed test wallets, 3–5 derived
            addresses and a limited number of flipped input bits.
            These small, non-random samples cannot establish
            cryptographic security or general statistical uniformity.
          </p>

          <span class="hmw2-primitive-type">
            Educational demonstration
          </span>
        </article>

      </div>

      <p class="panel-note">
        Compare changed-bit percentages when contrasting SHA-512 with
        Keccak-256: their output lengths differ. All displayed
        measurements are empirical and may vary with the selected
        demonstration settings.
      </p>
    </section>


    <!-- ================================================
         13 / FINAL CONCLUSION
         ================================================ -->

    <section class="panel hmw2-section"
             aria-labelledby="hmw2-conclusion-title">

      <div class="panel-label">13 / FINAL CONCLUSION</div>

      <h2 id="hmw2-conclusion-title">
        Why does an Ethereum wallet use multiple primitives?
      </h2>

      <p>
        The wallet pipeline is not a single cryptographic operation.
        It is a sequence of complementary mechanisms that solve
        different problems: managing recoverable secrets, deriving
        accounts, establishing public/private key relationships,
        deriving an address identifier and checking its textual
        representation.
      </p>

      <div class="hmw2-table-scroll">
        <table class="hmw2-table">
          <thead>
            <tr>
              <th scope="col">Primitive or standard</th>
              <th scope="col">Purpose in the wallet</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>BIP-39</td>
              <td>
                Encode initial entropy as a mnemonic, then
                deterministically derive a seed.
              </td>
            </tr>

            <tr>
              <td>BIP-32 / BIP-44</td>
              <td>
                Derive and organize many wallet keys from one seed,
                using reproducible paths.
              </td>
            </tr>

            <tr>
              <td>secp256k1</td>
              <td>
                Compute public keys from private scalars
                and support digital signatures.
              </td>
            </tr>

            <tr>
              <td>Keccak-256</td>
              <td>
                Hash public-key coordinates and contribute to
                address checksum encoding.
              </td>
            </tr>

            <tr>
              <td>EIP-55</td>
              <td>
                Encode address letters with a checksum to detect
                many accidental typing errors.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        The interactive demonstration connects these concepts in practice.
        A documented test mnemonic reproduces a seed and a deterministic
        hierarchy of private keys. secp256k1 converts a selected private
        key to a public key; Keccak-256 and truncation yield a 160-bit
        Ethereum address; EIP-55 supplies its mixed-case representation.
        The resulting address can be checked against an address
        separately computed by ethers.js.
      </p>

      <p>
        The statistical experiments illustrate diffusion and apparent
        balance in hash outputs and show how changing the derivation
        index changes the derived address. However, neither
        approximately balanced bits nor a Hamming distance close to
        half the output length proves that a primitive is secure.
        Security also depends on entropy quality, secret handling,
        correct implementation and the hardness assumptions associated
        with each primitive.
      </p>

      <div class="hmw2-key-idea">
        <span>FINAL TAKEAWAY</span>

        <strong>
          Different security goals require different cryptographic tools.
        </strong>

        <small>
          Key derivation organizes secrets; elliptic-curve cryptography
          establishes public/private key relationships; hashing
          creates fixed-length digests; checksum encoding detects
          many accidental transcription mistakes. None is an
          interchangeable replacement for all the others.
        </small>
      </div>

      <p class="panel-note">
        References:
        <a href="https://dspace.mit.edu/entities/publication/a2e09fea-6f05-48a5-9ce9-5073dfcde567"
           target="_blank" rel="noopener noreferrer">
          RSA technical report (1977)
        </a>,
        <a href="https://csrc.nist.gov/pubs/fips/180-2/final"
           target="_blank" rel="noopener noreferrer">
          NIST FIPS 180-2 (SHA-2)
        </a>,
        <a href="https://csrc.nist.gov/pubs/fips/202/final"
           target="_blank" rel="noopener noreferrer">
          NIST FIPS 202 (SHA-3)
        </a>,
        and the BIP/EIP specifications listed earlier in this homework.
      </p>

      <p class="panel-note">
        The demonstrations use public test phrases whose derived keys
        must be considered compromised. Never use them to store assets,
        and never enter a real wallet recovery phrase into this website.
        EIP-55 does not authenticate an address or prevent an attacker
        from deliberately substituting a different valid address.
      </p>
    </section>
  `;
}
