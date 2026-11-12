import { renderHome } from './pages/home.js';
import { renderHmw1 } from './pages/hmw1.js';
import { renderHmw2 } from './pages/hmw2.js';
import { renderHmw3 } from './pages/hmw3.js';
import { renderHmw4 } from './pages/hmw4.js';
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

    // Homework 3 — Sample trajectories (section 07).
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
