
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
| Homework 3 | Stochastic Processes, LLN & CLT | Completed |
| Homework 4.1 | Welford's Recurrence Formulas | Completed |
| Homework 4.2 | Sampling Mean and Variance | Completed |
| Homework 5.1 | Riemann and Lebesgue Integration | Completed |
| Homework 5.2 | Numerical Computation of the Normal CDF | Completed |

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

### Homework 3 — Stochastic Processes, LLN & CLT

**Route:** `#/hmw4`

A simulation study of n systems and m attackers. Each attacker
attacks the n systems in sequence and accumulates a penetration
score with independent and identically distributed increments,
producing a random walk:

`S_n = X_1 + X_2 + ... + X_n`

Two score models are compared:

- **Bernoulli:** `X ∈ {0, 1}`, `P(X = 1) = p`, mean `p`, variance `p(1 − p)`.
- **Rademacher:** `X ∈ {−1, +1}` with probability 1/2 each,
  the symmetric zero-mean case, mean `0`, variance `1`.

The laboratory studies three quantities as n grows — the total
score `S_n`, the average score `S_n / n` and the normalized score
`S_n / √n` — and verifies the Law of Large Numbers and the
Central Limit Theorem against the theory.

#### 1. Theory

Sections 01–06 introduce the model, derive `E[S_n] = nμ` and
`Var(S_n) = nσ²`, compare the three normalizations, state the two
limit theorems and define the aggregate penetration score.
They also explain why, for the Bernoulli model, `S_n / √n` does not
converge to N(0, 1) and only the centered and standardized score does.

#### 2. Sample Trajectories

Paths of a few attackers under four normalizations, with the
theoretical mean and the mean ± 2 standard deviations band.

#### 3. Distributions of the Three Quantities

Histograms of the three quantities for n = 10, 30, 100, 300, 1000
over m independent attackers, on a common or individual scale,
with the normal approximation and a table comparing empirical
variance (denominator m), sample variance (denominator m − 1)
and theoretical variance.

#### 4. Law of Large Numbers

Empirical probability `P(|S_n / n − μ| > ε)` for n up to 10,000
on a logarithmic axis, compared with Chebyshev's bound and the
normal approximation, together with the empirical quantiles
of the average score.

#### 5. Central Limit Theorem

Histogram and empirical CDF of the normalized score against
N(0, 1), and the Kolmogorov–Smirnov distance as a function of n,
with reference levels for the discreteness of `S_n` and for the
sampling noise of m attackers.

#### 6. System Size, Attackers and Aggregate Score

The aggregate score `T = S_n^(1) + ... + S_n^(m)` for nine
combinations of n and m, showing that T depends only on the
product mn and that n and m play different roles for single
attackers: n governs each process, m governs how accurately
the simulation reveals it.

#### 7. Conclusions

A summary of the results obtained on the page with the default
settings, and the limits of the simulation: sampling error,
discreteness, dependent snapshots and the pseudo-random generator.

All simulations use Mulberry32, a seeded pseudo-random generator
chosen for reproducibility. It is suitable for simulation but
is not cryptographically secure.

### Homework 4.1 — Welford's Recurrence Formulas

**Route:** `#/hmw5`

Derivation and implementation of the one-pass recurrences for
the mean, the sum of squared deviations and the variance:

- Knuth: `M_k = M_(k−1) + (x_k − M_(k−1)) / k`
- Welford: `SS_k = SS_(k−1) + (x_k − M_(k−1)) (x_k − M_k)`
- Sample variance: `s²_k = SS_k / (k − 1)`, also in the direct form
  `s²_k = (k − 2)/(k − 1) · s²_(k−1) + (x_k − M_(k−1))² / k`

The core of the implementation is three lines:

```javascript
const delta = x - mean;
mean += delta / k;
ss += delta * (x - mean);
```

The page contains the step-by-step derivation, the code, a
laboratory that shows every step of the recurrences on user data
and checks the result against the two-pass formula, and a
numerical-stability experiment: on data shifted by a large offset
the naive formula `Σx² − (Σx)²/n` loses all its digits and can
return a negative variance, while Welford's recurrence stays
accurate.

### Homework 4.2 — Sampling Mean and Variance

**Route:** `#/hmw6`

An extension of Homework 3 in which every penetration attempt
receives a score from 0 to 10, drawn from a fixed discrete
distribution (default: a skewed difficulty profile; binomial,
uniform and heavy-tailed alternatives are available). Each of m
hackers attempts n systems and computes the sampling mean and the
sampling variance of the n scores with the Welford code of
Homework 4.1.

#### 1. Score Distribution

Probabilities, exact mean, variance, skewness and excess kurtosis
of each distribution, and inverse-CDF sampling.

#### 2. Sampling Theory

`E[x̄] = μ`, `Var(x̄) = σ²/n`, `E[s²] = σ²` (with the derivation of
the n − 1), `Var(s²) = σ⁴ (2/(n − 1) + κ/n)`, and the standard
errors of averages over m hackers.

#### 3. Experiment

Averages of the sampling means and variances over the m hackers,
compared with μ and σ² for n from 2 to 1000, with z-scores and the
biased estimator `SS/n` for comparison.

#### 4. Variability as n Grows

Standard deviation of the sampling means and variances across
hackers against n on log-log axes, compared with the theory, and
histograms of the two sampling distributions.

#### 5. Conclusions

Unbiasedness, the 1/√n decrease of the variability, why the
variance is harder to estimate than the mean, and why these
results are the basis of inferential statistics.

### Homework 5.1 — Riemann and Lebesgue Integration

**Route:** `#/hmw7`

Two numerical integration methods inspired by the two definitions
of the integral, applied to sin x on [0, π], x² and |x − ½| on
[0, 1], two step functions, 1/√x on (0, 1] and sin(x)/x on [0, π]:

- Riemann-type: left, midpoint and right sums and the trapezoidal
  rule on N equal subintervals of the domain.
- Lebesgue-type: M equal layers of the range; for each level the
  preimage `{f > y_k}` is found by bisection on the monotone pieces
  of f, and lower, upper and mean Lebesgue sums are formed (the
  layer-cake formula `∫ f = ∫ μ(f > t) dt`). For the unbounded 1/√x
  the levels stop at `T = M^(2/3)`.

The page contains the theory (Darboux sums, measure, simple
functions, Lebesgue's criterion, monotone convergence), a lab that
draws the two partitions side by side, a convergence and efficiency
study (error against N on log-log axes, observed orders, evaluations
of f needed for 10⁻⁶), and the pathological functions of Dirichlet
and Thomae, with tags stored exactly as `r + s·√2` and a demonstration
that every double is a rational number.

### Homework 5.2 — Numerical Computation of the Normal CDF

**Route:** `#/hmw8`

Why Φ is not an elementary function (Liouville's theorem in
Rosenlicht's form, with the proof for `e^(−x²/2)`), how
`Φ(z) = ½[1 + erf(z/√2)]` represents it exactly, and why numerical
methods are still needed. Nine methods are compared: trapezoidal
and Simpson rules, the Taylor series of erf from the course notes,
Marsaglia's positive series, Laplace's continued fraction,
Abramowitz–Stegun 7.1.26, the Numerical Recipes erfc of Homework 3,
Hart's algorithm 5666 (as published by West) and our method, the
positive series for |z| < 2 and the continued fraction beyond.

References: the 15-decimal table of the Wikipedia article on the
68–95–99.7 rule, the NIST/SEMATECH e-Handbook table (5 decimals,
410 entries, one of which is off by one in the last digit), and a
grid of values computed with mpmath at 50 digits. Our method agrees
with all 16 Wikipedia values and keeps a relative error below
10⁻¹⁴ from z = 0 to z = −37.

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
    |   |-- hmw3.js
    |   |-- hmw4.js
    |   |-- hmw5.js
    |   |-- hmw6.js
    |   |-- hmw7.js
    |   `-- hmw8.js
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
        |-- hmw3/
        |   |-- caesar.js
        |   |-- caesar-attack.js
        |   |-- ecc-encryption.js
        |   |-- ecc-attack.js
        |   |-- ecc-attack-ui.js
        |   |-- experiments.js
        |   |-- experiments-ui.js
        |   |-- statistics-ui.js
        |   |-- simulator-ui.js
        |   `-- conclusion.js
        |
        |-- hmw4/
        |   |-- random.js
        |   |-- models.js
        |   |-- simulation.js
        |   |-- statistics.js
        |   |-- chart.js
        |   |-- trajectories-ui.js
        |   |-- distributions-ui.js
        |   |-- lln-ui.js
        |   |-- clt-ui.js
        |   |-- aggregate-ui.js
        |   `-- conclusion.js
        |
        |-- hmw5/
        |   |-- welford.js
        |   |-- welford-ui.js
        |   |-- stability-ui.js
        |   `-- conclusion.js
        |
        |-- hmw6/
        |   |-- score-distributions.js
        |   |-- experiment.js
        |   |-- distribution-ui.js
        |   |-- sampling-ui.js
        |   |-- variability-ui.js
        |   `-- conclusion.js
        |
        |-- hmw7/
        |   |-- functions.js
        |   |-- riemann.js
        |   |-- lebesgue.js
        |   |-- convergence.js
        |   |-- pathological.js
        |   |-- slices-chart.js
        |   |-- lab-ui.js
        |   |-- convergence-ui.js
        |   |-- pathological-ui.js
        |   `-- conclusion.js
        |
        `-- hmw8/
            |-- normal-cdf.js
            |-- reference.js
            |-- calculator-ui.js
            |-- accuracy-ui.js
            |-- efficiency-ui.js
            `-- conclusion.js
```

**Note:** Internal folder names follow the order in which the
interactive modules were created, not the course numbering:
`hmw3` is displayed as Homework 2, `hmw4` as Homework 3, and
`hmw5` and `hmw6` as Homework 4.1 and 4.2, `hmw7` and `hmw8` as
Homework 5.1 and 5.2. Homework 4.1 and 4.2 reuse the random
generator and the SVG charts of `hmw4`, and Homework 4.2 uses the
Welford module of `hmw5`. Homework 5.1 and 5.2 reuse the SVG charts
of `hmw4`; Homework 5.2 uses the trapezoidal and Simpson rules of
`hmw7`.
---

## Architecture

The application follows a modular frontend architecture
using vanilla JavaScript and ES Modules.

- `js/pages/` contains the page-rendering functions.
- `js/homeworks/hmw1/` contains the toy ECC laboratory.
- `js/homeworks/hmw2/` contains the Ethereum wallet laboratory.
- `js/homeworks/hmw3/` contains encryption and cryptanalysis modules.
- `js/homeworks/hmw4/` contains the stochastic-process simulations, statistics and SVG charts.
- `js/homeworks/hmw5/` contains Welford's recurrence and the numerical-stability experiment.
- `js/homeworks/hmw6/` contains the score distributions and the sampling experiment.
- `js/homeworks/hmw7/` contains the Riemann and Lebesgue integration methods and the pathological functions.
- `js/homeworks/hmw8/` contains the methods for the normal CDF and their reference values.
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
