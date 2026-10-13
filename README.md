# Statistics Lab

An interactive web platform developed to collect and present homework assignments for the **Statistics course — MSc in Cybersecurity**.

The project combines mathematical explanations, JavaScript implementations, interactive simulations, and statistical analysis.

**Live Website:** [Statistics Lab](https://petrons01.github.io/statistics-lab/)

## Homeworks

| Homework | Topic | Status |
|---|---|---|
| HMW 01 | Elliptic Curve Cryptography — Private to Public Key | ✅ Completed |
| HMW 02 | Ethereum Wallet — Key Derivation and Hashing | Planned |

### HMW 01 — Elliptic Curve Cryptography

An interactive implementation of elliptic-curve scalar multiplication using the toy curve \(y^2 = x^3 + 7 \pmod{17}\).

Features:

- Point addition and scalar multiplication.
- Interactive ECC simulator with step-by-step visualization.
- Statistical analysis of public key coordinates and bit distributions.
- Correlation, entropy and Hamming distance analysis.
- Cryptographic discussion and conclusions.

### HMW 02 — Ethereum Wallet Pipeline

An exploration of Ethereum wallet address generation, including BIP-39, BIP-32, BIP-44, secp256k1, Keccak-256 and EIP-55.

*Implementation pending.*

## Project Structure

- `index.html` — Main application entry point.
- `css/`
  - `styles.css` — Styling and responsive layout.
- `js/`
  - `app.js` — Application routing and navigation.
  - `pages/`
    - `home.js` — Homepage and homework dashboard.
    - `hmw1.js` — HMW 01 interface.
    - `hmw2.js` — HMW 02 interface.
  - `homeworks/hmw1/`
    - `ecc.js` — Elliptic-curve arithmetic.
    - `simulator.js` — Interactive ECC simulation.
    - `statistics.js` — Statistical computations.
    - `statistics-ui.js` — Statistical visualizations.
- `assets/` — Static resources and icons.
- `.nojekyll` — GitHub Pages configuration.
- `README.md` — Project documentation.

## Technologies

- HTML5
- CSS3
- JavaScript (ES Modules)
- SVG for interactive visualizations
- GitHub Pages for deployment

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

**Course:** Statistics — MSc in Cybersecurity
