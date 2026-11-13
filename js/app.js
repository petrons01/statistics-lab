import { renderHome } from './pages/home.js';
import { renderHmw1 } from './pages/hmw1.js';
import { renderHmw2 } from './pages/hmw2.js';
import { renderHmw3 } from './pages/hmw3.js';
import { renderHmw4 } from './pages/hmw4.js';
import { renderHmw5 } from './pages/hmw5.js';
import { renderHmw6 } from './pages/hmw6.js';
import { renderHmw7 } from './pages/hmw7.js';
import { renderHmw8 } from './pages/hmw8.js';
import { renderHmw9 } from './pages/hmw9.js';
import { initHmw1Simulator } from './homeworks/hmw1/simulator.js';
import { initHmw1Statistics } from './homeworks/hmw1/statistics-ui.js';
import { initHmw2Wallet } from './homeworks/hmw2/wallet-ui.js';
import { initHmw2Statistics } from './homeworks/hmw2/statistics-ui.js';
import { initHmw3Simulator } from './homeworks/hmw3/simulator-ui.js';
import { initHmw4Trajectories } from './homeworks/hmw4/trajectories-ui.js';
import { initHmw4Distributions } from './homeworks/hmw4/distributions-ui.js';
import { initHmw4Lln } from './homeworks/hmw4/lln-ui.js';
import { initHmw4Clt } from './homeworks/hmw4/clt-ui.js';
import { initHmw4Aggregate } from './homeworks/hmw4/aggregate-ui.js';
import { initHmw5Lab } from './homeworks/hmw5/welford-ui.js';
import { initHmw5Stability } from './homeworks/hmw5/stability-ui.js';
import { initHmw6Distribution } from './homeworks/hmw6/distribution-ui.js';
import { initHmw6Sampling } from './homeworks/hmw6/sampling-ui.js';
import { initHmw6Variability } from './homeworks/hmw6/variability-ui.js';
import { initHmw7Lab } from './homeworks/hmw7/lab-ui.js';
import { initHmw7Convergence } from './homeworks/hmw7/convergence-ui.js';
import { initHmw7Pathological } from './homeworks/hmw7/pathological-ui.js';
import { initHmw8Calculator } from './homeworks/hmw8/calculator-ui.js';
import { initHmw8Accuracy } from './homeworks/hmw8/accuracy-ui.js';
import { initHmw8Efficiency } from './homeworks/hmw8/efficiency-ui.js';
import { initHmw9Analysis } from './homeworks/hmw9/analysis-ui.js';
import { initHmw9Lab } from './homeworks/hmw9/lab-ui.js';
import { initHmw9Simpson } from './homeworks/hmw9/simpson-ui.js';

// Per aggiungere un nuovo homework, crea il suo modulo e registralo qui.
// Aggiungi anche il link alla sidebar (index.html) e una card alla dashboard (home.js).
const routes = {
  '/': {
    label: 'Overview',
    title: 'Dashboard',
    render: renderHome
  },

  '/hmw1': {
    label: 'Homework 1.1',
    title: 'Homework 1.1 — Elliptic Curve Cryptography',
    render: renderHmw1
  },

  '/hmw2': {
    label: 'Homework 1.2',
    title: 'Homework 1.2 — Ethereum Wallet Pipeline',
    render: renderHmw2
  },
  
  '/hmw3': {
    label: 'Homework 2',
    title: 'Homework 2 — Encryption & Cryptanalysis',
    render: renderHmw3
  },
    // Homework 3 uses the internal name hmw4 (hmw3 hosts Homework 2).
  '/hmw4': {
    label: 'Homework 3',
    title: 'Homework 3 — Stochastic Processes, LLN & CLT',
    render: renderHmw4
  },

  // Homework 4 has two exercises, like Homework 1:
  // 4.1 uses the internal name hmw5, 4.2 uses hmw6.
  '/hmw5': {
    label: 'Homework 4.1',
    title: "Homework 4.1 — Welford's Recurrence Formulas",
    render: renderHmw5
  },

  '/hmw6': {
    label: 'Homework 4.2',
    title: 'Homework 4.2 — Sampling Mean and Variance',
    render: renderHmw6
  },

  // Homework 5 has two exercises as well:
  // 5.1 uses the internal name hmw7, 5.2 uses hmw8.
  '/hmw7': {
    label: 'Homework 5.1',
    title: 'Homework 5.1 — Riemann and Lebesgue Integration',
    render: renderHmw7
  },

  '/hmw8': {
    label: 'Homework 5.2',
    title: 'Homework 5.2 — Numerical Computation of the Normal CDF',
    render: renderHmw8
  },

  // Homework 6 has a single exercise (internal name hmw9).
  '/hmw9': {
    label: 'Homework 6',
    title: 'Homework 6 — Statistical Independence',
    render: renderHmw9
  }
};

const content = document.getElementById('content');
const breadcrumb = document.getElementById('breadcrumb-current');
const sidebar = document.getElementById('sidebar');
const menuTrigger = document.getElementById('menu-trigger');
const overlay = document.getElementById('mobile-overlay');
const homeworkToggle = document.getElementById('homework-toggle');
const homeworkItems = document.getElementById('homework-items');

function currentRoute() {
  const fragment = decodeURIComponent(location.hash.slice(1));
  return routes[fragment] ? fragment : '/';
}

function setMenuOpen(open) {
  sidebar.classList.toggle('is-open', open);
  overlay.hidden = !open;
  menuTrigger.setAttribute('aria-expanded', String(open));
  menuTrigger.setAttribute(
    'aria-label',
    open ? 'Close menu' : 'Open menu'
  );
  document.body.classList.toggle('menu-open', open);
}

let disposeHomework = () => {};

function navigate() {
 // Ferma eventuali animazioni della pagina precedente.
  disposeHomework();

  const path = currentRoute();
  const page = routes[path];

  content.innerHTML = page.render();

  if (path === '/hmw1') {
    // Initialize the ECC simulator and statistical analysis.
    const cleanupSimulator = initHmw1Simulator();
    const cleanupStatistics = initHmw1Statistics();

    disposeHomework = () => {
      cleanupSimulator();
      cleanupStatistics();
    };  
  } else if (path === '/hmw2') {

    // Initialize Ethereum wallet simulation.
    const cleanupWallet = initHmw2Wallet();

    // Initialize statistical exploration.
    const cleanupStatistics = initHmw2Statistics();

    disposeHomework = () => {
      cleanupWallet();
      cleanupStatistics();
    };

  } else if (path === '/hmw3') {

    // Homework 2 — Caesar Cipher simulator.
    disposeHomework = initHmw3Simulator();

  } else if (path === '/hmw4') {

    // Homework 3 — interactive sections 07 to 11.
    const cleanupTrajectories = initHmw4Trajectories();
    const cleanupDistributions = initHmw4Distributions();
    const cleanupLln = initHmw4Lln();
    const cleanupClt = initHmw4Clt();
    const cleanupAggregate = initHmw4Aggregate();

    disposeHomework = () => {
      cleanupTrajectories();
      cleanupDistributions();
      cleanupLln();
      cleanupClt();
      cleanupAggregate();
    };

  } else if (path === '/hmw5') {

    // Homework 4.1 — step-by-step laboratory (06) and stability (07).
    const cleanupLab = initHmw5Lab();
    const cleanupStability = initHmw5Stability();

    disposeHomework = () => {
      cleanupLab();
      cleanupStability();
    };

  } else if (path === '/hmw6') {

    // Homework 4.2 — distribution (02), experiment (04), variability (05).
    const cleanupDistribution = initHmw6Distribution();
    const cleanupSampling = initHmw6Sampling();
    const cleanupVariability = initHmw6Variability();

    disposeHomework = () => {
      cleanupDistribution();
      cleanupSampling();
      cleanupVariability();
    };

  } else if (path === '/hmw7') {

    // Homework 5.1 — lab (04), convergence (05), pathological functions (06).
    const cleanupLab = initHmw7Lab();
    const cleanupConvergence = initHmw7Convergence();
    const cleanupPathological = initHmw7Pathological();

    disposeHomework = () => {
      cleanupLab();
      cleanupConvergence();
      cleanupPathological();
    };

  } else if (path === '/hmw8') {

    // Homework 5.2 — calculator (05), accuracy (06), efficiency (07).
    const cleanupCalculator = initHmw8Calculator();
    const cleanupAccuracy = initHmw8Accuracy();
    const cleanupEfficiency = initHmw8Efficiency();

    disposeHomework = () => {
      cleanupCalculator();
      cleanupAccuracy();
      cleanupEfficiency();
    };

  } else if (path === '/hmw9') {

    // Homework 6 — data, χ² and p-value (03–05), lab (06), Berkeley (07).
    const cleanupAnalysis = initHmw9Analysis();
    const cleanupLab = initHmw9Lab();
    const cleanupSimpson = initHmw9Simpson();

    disposeHomework = () => {
      cleanupAnalysis();
      cleanupLab();
      cleanupSimpson();
    };

  } else {
    
    // No interactive components on this page.
    disposeHomework = () => {};
  }

  breadcrumb.textContent = page.label;
  document.title = `${page.title} — Statistics-Lab`;

  document.querySelectorAll('[data-route]').forEach(link => {
    const selected = link.dataset.route === path;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  // Porta in alto la pagina quando si cambia modulo, senza ricaricare il sito.
  if (location.hash === '#homeworks') {
    requestAnimationFrame(() => document.getElementById('homeworks')?.scrollIntoView({ behavior: 'smooth' }));
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  setMenuOpen(false);
}

homeworkToggle.addEventListener('click', () => {
  const expanded = homeworkToggle.getAttribute('aria-expanded') === 'true';
  homeworkToggle.setAttribute('aria-expanded', String(!expanded));
  homeworkItems.hidden = expanded;
});
menuTrigger.addEventListener('click', () => setMenuOpen(!sidebar.classList.contains('is-open')));
overlay.addEventListener('click', () => setMenuOpen(false));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') setMenuOpen(false);
});
window.addEventListener('hashchange', navigate);
navigate();
