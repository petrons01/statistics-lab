# Statistics Lab

An interactive web platform developed to collect and present homework assignments for the **Statistics course — MSc in Cybersecurity**.

The project combines mathematical explanations, JavaScript implementations, interactive simulations, and statistical analysis.

**Live Website:** [Statistics Lab](https://petrons01.github.io/statistics-lab/)


## Homeworks

### Homework 1

| Exercise | Topic | Status |
|---|---|---|
| Homework 1.1 | Elliptic Curve Cryptography — Private to Public Key | ✅ Completed |
| Homework 1.2 | Ethereum Wallet — Key Derivation and Hashing | ✅ Completed |


#### Homework 1.1 — Elliptic Curve Cryptography

An interactive implementation of elliptic-curve scalar multiplication using the toy curve \(y^2 = x^3 + 7 \pmod{17}\).

Features:

- Point addition and scalar multiplication.
- Interactive ECC simulator with step-by-step visualization.
- Statistical analysis of public key coordinates and bit distributions.
- Correlation, entropy and Hamming distance analysis.
- Cryptographic discussion and conclusions.


#### Homework 1.2 — Ethereum Wallet Pipeline

An interactive exploration of Ethereum wallet generation, key derivation, cryptographic hashing, and statistical properties.

Features:

- Explanation of BIP-39, BIP-32, BIP-44, secp256k1, Keccak-256 and EIP-55.
- Interactive wallet derivation from public demonstration mnemonics.
- Hierarchical private key derivation using BIP-32 and BIP-44.
- Public key generation using secp256k1.
- Ethereum address generation using Keccak-256 and EIP-55.
- Statistical analysis of hash outputs and derived Ethereum addresses.
- Avalanche effect comparison between Keccak-256 and SHA-512.
- Bit frequency distributions and Hamming distance analysis.
- Historical context and comparison between SHA-2, Keccak-256 and SHA-3.
- Cryptographic discussion and final conclusions.

All experiments run locally in the browser using public test data.


## Project Structure

```text
statistics-lab/
│
├── index.html                  # Application entry point
│
├── css/
│   └── styles.css              # Global styling and responsive layout
│
├── js/
│   ├── app.js                  # SPA routing and navigation
│   │
│   ├── pages/
│   │   ├── home.js             # Homepage and homework dashboard
│   │   ├── hmw1.js             # HMW 1.1 page
│   │   └── hmw2.js             # HMW 1.2 page
│   │
│   └── homeworks/
│       │
│       ├── hmw1/
│       │   ├── ecc.js          # Elliptic curve arithmetic
│       │   ├── simulator.js    # Interactive ECC simulator
│       │   ├── statistics.js   # ECC statistical computations
│       │   └── statistics-ui.js# ECC statistical visualizations
│       │
│       └── hmw2/
│           ├── wallet.js       # Ethereum wallet cryptographic operations
│           ├── wallet-ui.js    # Interactive wallet pipeline interface
│           ├── statistics.js   # Hash and address statistical analysis
│           ├── statistics-ui.js# Statistical charts and experiments
│           └── conclusion.js   # Historical context and conclusions
│
└── README.md                   # Project documentation
```

### Architecture

The application follows a modular frontend architecture using
vanilla JavaScript and ES Modules.

- **pages/** contains the HTML rendering functions for each homework.
- **homeworks/hmw1/** contains the elliptic curve simulator and its statistical analysis.
- **homeworks/hmw2/** contains Ethereum wallet derivation, statistical experiments, and conclusions.
- **app.js** manages client-side navigation and initializes the interactive components.
- **styles.css** provides consistent styling across all homework pages.

Each homework is implemented independently, allowing new assignments
to be added without modifying existing cryptographic modules.


### Homework Organization

Homework 1 contains two independent exercises:

- **Homework 1.1:** Elliptic Curve Cryptography, implemented in `js/homeworks/hmw1/`.
- **Homework 1.2:** Ethereum Wallet Pipeline, implemented in `js/homeworks/hmw2/`.

Each exercise has its own page and JavaScript modules.

The logical homework numbering is independent of the physical
directory names and application routes. This allows the project
to grow with additional homework groups and exercises.


## Technologies

- HTML5
- CSS3
- JavaScript (ES Modules)
- SVG and CSS-based interactive visualizations
- ethers.js v6 for Ethereum cryptographic operations
- Git and GitHub for version control
- GitHub Pages for deployment

The application runs entirely in the browser and does not require
a backend or a blockchain node.

The Ethereum wallet experiments use public demonstration keys
and are intended exclusively for educational purposes.


## Local Development

1. Clone the repository.
2. Open the project folder in Visual Studio Code.
3. Start a local HTTP server (e.g. VS Code Live Server).
4. Open `index.html` through the local server.

No backend or build process is required.

## Deployment

The website is hosted on **GitHub Pages** and automatically deployed from the `main` branch.

New assignments can be integrated by adding independent modules and updating the application navigation.

## Disclaimer

All cryptographic implementations are intended for educational purposes only and must not be used to protect real assets or generate production cryptographic keys.

---

**Author:** Francesco Petrone
