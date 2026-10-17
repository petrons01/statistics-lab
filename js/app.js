import { renderHome } from './pages/home.js';
import { renderHmw1 } from './pages/hmw1.js';
import { renderHmw2 } from './pages/hmw2.js';
import { initHmw1Simulator } from './homeworks/hmw1/simulator.js';
import { initHmw1Statistics } from './homeworks/hmw1/statistics-ui.js';
import { initHmw2Wallet } from './homeworks/hmw2/wallet-ui.js';
import { initHmw2Statistics } from './homeworks/hmw2/statistics-ui.js';

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

    // Cleanup when switching to another page.
    disposeHomework = () => {
      cleanupWallet();
      cleanupStatistics();
    };
  } else {
    
    // Pages without interactive modules.
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
