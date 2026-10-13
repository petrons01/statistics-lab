# Statistics Lab

Un unico sito per raccogliere e pubblicare gli homework di crittografia.

## Struttura

```text
cryptography-lab/
├── index.html              # Pagina di ingresso (GitHub Pages)
├── css/
│   └── styles.css          # Stili e layout responsive
├── js/
│   ├── app.js              # Navigazione e routing
│   └── pages/
│       ├── home.js         # Dashboard
│       ├── hmw1.js         # Modulo 1 (base, da sviluppare)
│       ├── hmw2.js         # Modulo 2 (base, da sviluppare)
│       └── hmw3.js         # Sezione futura
├── assets/
│   └── favicon.svg
├── .nojekyll
└── README.md
```

## Anteprima in locale

Il sito usa i moduli ES di JavaScript. Non aprire `index.html` con doppio clic (`file://`): alcuni browser bloccano il caricamento dei moduli locali. Usa un piccolo server HTTP:

- In VS Code: estensione **Live Server**, poi clic destro su `index.html` → **Open with Live Server**.
- Alternativa con Python: da un terminale nella cartella del progetto esegui `py -m http.server 5500` (Windows) oppure `python3 -m http.server 5500`, poi apri `http://localhost:5500`.

## Pubblicazione con GitHub Pages

1. Crea un repository **pubblico** chiamato `cryptography-lab`.
2. Carica i **file e le cartelle contenuti** in questa directory nella radice del repository (non caricare solo lo ZIP).
3. Apri **Settings → Pages → Build and deployment**.
4. Imposta **Source: Deploy from a branch**, **Branch: main**, **Folder: /(root)**, quindi **Save**.
5. L'indirizzo sarà: `https://TUO-USERNAME.github.io/cryptography-lab/`.

Il sito non richiede dipendenze, npm, database o credenziali.

## Aggiungere un homework

1. Crea `js/pages/hmw4.js` esportando una funzione `renderHmw4()` che restituisce la pagina HTML.
2. Importala e aggiungi la rotta `'/hmw4'` in `js/app.js`.
3. Aggiungi il relativo link nel menu di `index.html`.
4. Salva e pubblica i file modificati.

## Note di sicurezza

Non inserire nel codice chiavi private reali, seed phrase personali, password o token API. Le future simulazioni saranno solo didattiche.
