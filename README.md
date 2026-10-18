
# Statistics Lab

An interactive web platform developed to collect and present
homework assignments for the **Statistics course — MSc in Cybersecurity**.

The project combines mathematical explanations, cryptographic
implementations, interactive simulations, statistical experiments,
and security analysis.

**Live Website:** [Statistics Lab](https://petrons01.github.io/statistics-lab/)

---

## Homeworks

| Assignment | Topic | Status |
|---|---|---|
| Homework 1.1 | Elliptic Curve Cryptography — Private to Public Key | Completed |
| Homework 1.2 | Ethereum Wallet — Key Derivation and Hashing | Completed |
| Homework 2 | Encryption, Decryption & Cryptanalysis | Completed |

### Homework 1.1 — Elliptic Curve Cryptography

**Route:** `#/hmw1`

An educational introduction to elliptic-curve cryptography
using the finite-field curve:

`y² = x³ + 7 (mod 17)`

The laboratory explores the relationship between private
scalars and public points using elliptic-curve arithmetic.

Features:

- Point addition and scalar multiplication.
- Interactive elliptic-curve simulator.
- Step-by-step public key derivation.
- Statistical analysis of generated coordinates.
- Bit distributions, entropy, correlation and Hamming distance.
- Mathematical explanations and cryptographic conclusions.

This module uses a small toy curve for educational purposes,
not the full secp256k1 curve.

### Homework 1.2 — Ethereum Wallet Pipeline

**Route:** `#/hmw2`

An interactive exploration of Ethereum wallet generation,
hierarchical key derivation, cryptographic hashing,
and statistical properties.

Features:

- BIP-39 mnemonic phrases.
- BIP-32 hierarchical deterministic key derivation.
- BIP-44 derivation paths.
- secp256k1 private and public keys.
- Keccak-256 and Ethereum address generation.
- EIP-55 checksum encoding.
- Interactive wallet derivation from public demonstration data.
- Statistical analysis of hashes and addresses.
- Avalanche effect and Hamming distance experiments.
- Comparison of SHA-512, Keccak-256 and SHA-3.
- Historical background and conclusions.

The examples use educational demonstration data and
must not be used to generate real cryptocurrency wallets.

### Homework 2 — Encryption, Decryption & Cryptanalysis

**Route:** `#/hmw3`

A comparative study of classical and elliptic-curve
cryptography, including encryption, decryption,
statistical cryptanalysis, and restricted key-space attacks.

The laboratory implements both the Caesar cipher and
an educational hybrid encryption scheme based on secp256k1.

#### 1. Caesar Cipher

The Caesar cipher shifts each English letter by a
secret integer key:

`k ∈ {0, 1, ..., 25}`

Encryption:

`E(k, x) = (x + k) mod 26`

Decryption:

`D(k, y) = (y - k) mod 26`

Features:

- Interactive plaintext encryption and ciphertext decryption.
- Adjustable Caesar key.
- Alphabet transformation visualization.
- Case preservation.
- Preservation of spaces, digits and punctuation.

The cipher is deterministic and does not provide
modern cryptographic security.

#### 2. Hybrid secp256k1 Encryption

The ECC laboratory implements an educational ECIES-like
hybrid encryption construction.

Cryptographic components:

- secp256k1 elliptic-curve key agreement.
- Ephemeral ECDH key generation.
- HKDF-SHA256 symmetric key derivation.
- AES-256-GCM authenticated encryption.

The recipient has a private scalar `d` and public key:

`Q = dG`

The sender generates an ephemeral private scalar `r`
and public point:

`R = rG`

Both parties calculate the same ECDH shared point:

`S = rQ = dR`

A symmetric key is derived from the shared secret
and used to encrypt the message with AES-256-GCM.

The encryption package includes:

- Recipient public key.
- Ephemeral public key.
- HKDF salt.
- AES-GCM initialization vector.
- Ciphertext.
- Authentication tag.

The ephemeral private key is never transmitted.

For the attack demonstration, the recipient's private
scalar is deliberately restricted to:

`d ∈ {1, ..., 256}`

This restriction makes the demonstration insecure
by design.

#### 3. Statistical Cryptanalysis of Caesar

The laboratory attempts to recover an unknown Caesar
key using statistical properties of English text.

The algorithm:

1. Estimates letter probabilities from a reference corpus.
2. Evaluates all 26 possible Caesar shifts.
3. Computes the chi-square score for each candidate.
4. Ranks candidate keys by increasing score.
5. Displays the most likely key and recovered plaintext.

The chi-square score measures the discrepancy between
observed and expected letter frequencies.

The lowest-scoring candidate is a statistical estimate,
not a guaranteed correct recovery.

The interface displays:

- Most likely key.
- Number of letters analyzed.
- Best chi-square score.
- Gap between the two best candidates.
- Complete ranking of all 26 keys.
- Reference and observed letter-frequency charts.

#### 4. Ciphertext Length Experiments

The project evaluates Caesar key recovery on messages
containing different numbers of English letters.

Tested lengths:

`10, 30, 100, 300, 1000`

For each length, the experiment samples plaintext
passages, selects Caesar keys, encrypts the messages,
and attempts statistical key recovery.

Measured statistics:

- Correct key recovery rate.
- Top-three candidate accuracy.
- Average rank of the correct key.
- Average chi-square score gap.
- Average key recovery execution time.

The experiments support configurable trial counts
and deterministic seeds for reproducibility.

Results are displayed using interactive charts,
summary tables and failed-recovery examples.

#### 5. Restricted ECC Key-Space Attack

The laboratory demonstrates an exhaustive private-key
recovery attack against the intentionally weakened
secp256k1 configuration.

The attacker knows the recipient public key and
the encrypted package but does not know the private key.

For every candidate scalar `d`, the attacker computes:

`Q_candidate = dG`

The candidate is compared with the public key
contained in the captured encryption package.

When a match is found, the recovered scalar is used
to decrypt the authenticated ciphertext.

The interface reports:

- Recovered private scalar.
- Number of candidates tested.
- Key search duration.
- Decryption duration.
- Recovered plaintext.

This experiment exploits weak key generation.
It does not demonstrate a practical break of
properly configured secp256k1.

#### 6. Cryptographic Comparison

The final section compares Caesar and hybrid ECC
encryption in terms of:

- Symmetric versus public-key cryptography.
- Encryption and decryption procedures.
- Key roles and key-space sizes.
- Deterministic versus randomized encryption.
- Statistical properties of ciphertexts.
- Message integrity.
- Statistical versus exhaustive-search attacks.
- Security assumptions and implementation limitations.

---

## Statistical Datasets

The Caesar cryptanalysis experiments use two
separate English-language text files:

| Dataset | File | Purpose |
|---|---|---|
| Reference corpus | `english-reference.txt` | Estimate expected English letter frequencies |
| Evaluation corpus | `english-evaluation.txt` | Test key recovery on sampled plaintext passages |

Both files are located in:

`data/corpus/`

The laboratory uses synthetic English texts prepared
for educational experimentation.

The files are separate, but they do not represent
a comprehensive sample of natural English.

Evaluation passages may overlap across trials.
Therefore, the experiments are demonstrations of
statistical behavior rather than independent,
population-wide estimates of attack accuracy.

For more rigorous studies, larger authentic corpora
from different genres should be used.

---

## Project Structure

```text
statistics-lab/
|
|-- index.html
|-- README.md
|-- .nojekyll
|
|-- css/
|   `-- styles.css
|
|-- assets/
|   `-- favicon.svg
|
|-- data/
|   `-- corpus/
|       |-- english-reference.txt
|       `-- english-evaluation.txt
|
`-- js/
    |-- app.js
    |
    |-- pages/
    |   |-- home.js
    |   |-- hmw1.js
    |   |-- hmw2.js
    |   `-- hmw3.js
    |
    `-- homeworks/
        |
        |-- hmw1/
        |   |-- ecc.js
        |   |-- simulator.js
        |   |-- statistics.js
        |   `-- statistics-ui.js
        |
        |-- hmw2/
        |   |-- wallet.js
        |   |-- wallet-ui.js
        |   |-- statistics.js
        |   |-- statistics-ui.js
        |   `-- conclusion.js
        |
        `-- hmw3/
            |-- caesar.js
            |-- caesar-attack.js
            |-- ecc-encryption.js
            |-- ecc-attack.js
            |-- ecc-attack-ui.js
            |-- experiments.js
            |-- experiments-ui.js
            |-- statistics-ui.js
            |-- simulator-ui.js
            `-- conclusion.js
```

**Note:** The internal folder `hmw3` corresponds to the
third interactive module, displayed as Homework 2.

---

## Architecture

The application follows a modular frontend architecture
using vanilla JavaScript and ES Modules.

- `js/pages/` contains the page-rendering functions.
- `js/homeworks/hmw1/` contains the toy ECC laboratory.
- `js/homeworks/hmw2/` contains the Ethereum wallet laboratory.
- `js/homeworks/hmw3/` contains encryption and cryptanalysis modules.
- `js/app.js` manages hash-based navigation and initialization.
- `css/styles.css` provides shared styling and responsive layouts.
- `data/corpus/` stores the statistical reference and evaluation texts.

Cryptographic operations, statistical calculations,
and user-interface rendering are implemented
in separate JavaScript modules.

The project does not require a backend server,
database or blockchain node.

---

## Technologies

- HTML5.
- CSS3.
- JavaScript with ES Modules.
- Web Crypto API.
- ethers.js v6.
- secp256k1 elliptic-curve cryptography.
- HKDF-SHA256.
- AES-256-GCM.
- SVG and CSS-based data visualizations.
- Git and GitHub.
- GitHub Pages.

ethers.js is loaded from a CDN when required
for elliptic-curve operations.

The Web Crypto API requires a secure context,
such as HTTPS or localhost.

---

## Local Development

1. Clone the repository:

   `git clone https://github.com/petrons01/statistics-lab.git`

2. Open the project folder in Visual Studio Code.

3. Start a local HTTP server, such as VS Code Live Server.

4. Open the application through the local server.

5. Navigate to a homework using the dashboard or sidebar.

No npm installation or frontend build process is required.

Opening `index.html` directly using a `file://` URL
is not recommended because ES Modules and corpus
loading require an HTTP environment.

---

## Deployment

The website is hosted on GitHub Pages and deployed
from the `main` branch.

Live application:

https://petrons01.github.io/statistics-lab/

All simulations run client-side in the browser.

---

## Security Disclaimer

All cryptographic implementations are intended
exclusively for educational purposes.

The toy ECC and restricted private-key demonstrations
are intentionally insecure.

The hybrid ECC implementation is not a production-ready
encryption protocol and does not authenticate the sender
or establish the authenticity of distributed public keys.

Do not use these implementations to protect real data,
manage cryptocurrency assets or generate production keys.

---

**Author:** Francesco Petrone
