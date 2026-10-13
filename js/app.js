import { renderHome } from './pages/home.js';
import { renderHmw1 } from './pages/hmw1.js';
import { renderHmw2 } from './pages/hmw2.js';
import { renderHmw3 } from './pages/hmw3.js';

// Per aggiungere HMW 4 in futuro, crea il modulo e registra una nuova rotta.
const routes = {
  '/': { label: 'Overview', title: 'Dashboard', render: renderHome },
  '/hmw1': { label: 'HMW 01', title: 'Elliptic Curve Cryptography', render: renderHmw1 },
  '/hmw2': { label: 'HMW 02', title: 'Ethereum Wallet Pipeline', render: renderHmw2 },
  '/hmw3': { label: 'HMW 03', title: 'Future Homework', render: renderHmw3 },
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
  menuTrigger.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
  document.body.classList.toggle('menu-open', open);
}

function navigate() {
  const path = currentRoute();
  const page = routes[path];
  content.innerHTML = page.render();
  breadcrumb.textContent = page.label;
  document.title = `${page.title} — CryptoLab`;

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
