# Statistics Lab

Website collecting the statistics course assignments.

## Structure

```text
statistics-lab/
├── index.html              # Entry 
├── css/
│   └── styles.css          # Style and responsive layout
├── js/
│   ├── app.js              # Routing
│   └── pages/
│       ├── home.js         # Dashboard
│       ├── hmw1.js         # Module 1 (toDo)
│       └── hmw2.js         # Module 2 (toDo)
├── assets/
│   └── favicon.svg
├── .nojekyll
└── README.md
```

## Adding another homework

Create `js/pages/hmw3.js` exporting `renderHmw3()`; add its import and route in
`js/app.js`, the corresponding sidebar link in `index.html`, and a card in
`js/pages/home.js`. The card grid automatically adapts to additional modules.
