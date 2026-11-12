/*
 * Statistics-Lab — Homework 5.2 (internal folder: hmw8)
 * Section 05 — The Calculator
 *
 * One value of z, every method, compared with the high-precision
 * reference of reference.js.
 */

import { METHODS, taylorPartialSums } from './normal-cdf.js';
import { referenceCdf } from './reference.js';

const DEFAULT_Z = -3;

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw8Calculator() {
  return `
    <section class="panel hmw4-lab" id="hmw8-calc" aria-labelledby="hmw8-calc-title">

      <div class="panel-label">05 / THE CALCULATOR</div>

      <h2 id="hmw8-calc-title">Φ(z) by Every Method</h2>

      <p>
        Enter z. Every method computes Φ(z), and the result is compared
        with the high-precision reference value. The reference is
        tabulated for z between −10 and 10 in steps of 0.01, and in
        steps of 0.5 up to |z| = 37, where Φ(−37) ≈ 5.7·10⁻³⁰⁰ is near
        the smallest normal double, 2.2·10⁻³⁰⁸. Other values of z are
        rounded to the nearest grid point.
      </p>

      <div class="hmw4-controls">
        <div class="hmw4-field">
          <label class="hmw4-label" for="hmw8-calc-z">z</label>
          <input id="hmw8-calc-z" class="hmw4-input" type="number"
                 min="-37" max="37" step="0.01" value="${DEFAULT_Z}" />
        </div>
        <div class="hmw4-field hmw4-field-action">
          <button type="button" class="button button-ghost" data-z="-1.96">z = −1.96</button>
        </div>
        <div class="hmw4-field hmw4-field-action">
          <button type="button" class="button button-ghost" data-z="-8">z = −8</button>
        </div>
        <div class="hmw4-field hmw4-field-action">
          <button type="button" class="button button-ghost" data-z="-20">z = −20</button>
        </div>
      </div>

      <p id="hmw8-calc-status" class="hmw4-status" role="status" aria-live="polite"></p>

      <div class="hmw4-table-wrap">
        <table class="hmw4-table">
          <caption id="hmw8-calc-caption"></caption>
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col">Φ(z)</th>
              <th scope="col">Absolute error</th>
              <th scope="col">Relative error</th>
              <th scope="col">Correct digits</th>
              <th scope="col">Cost</th>
            </tr>
          </thead>
          <tbody id="hmw8-calc-table"></tbody>
        </table>
      </div>

      <div class="hmw4-interpretation" id="hmw8-calc-interpretation"></div>

    </section>
  `;
}

/* =====================================================
 * 2. HELPERS
 * ===================================================== */

/** Rounds z to the grid of the reference values. */
export function snapToGrid(z) {
  if (!Number.isFinite(z)) return null;
  const x = Math.min(37, Math.abs(z));
  const snapped = x <= 10 ? Math.round(x * 100) / 100 : Math.max(10.5, Math.round(x * 2) / 2);
  return Math.sign(z) * snapped || 0;
}

export function formatPhi(value) {
  if (!Number.isFinite(value)) return '—';
  if (value === 0) return '0';
  return value < 1e-4 ? value.toExponential(15) : value.toPrecision(16);
}

export function relativeError(value, reference) {
  if (!Number.isFinite(value)) return Infinity;
  if (reference === 0) return value === 0 ? 0 : Infinity;
  return Math.abs(value - reference) / reference;
}

export function correctDigits(rel) {
  if (!Number.isFinite(rel)) return 0;
  if (rel < 1e-16) return 16;
  return Math.max(0, Math.min(16, Math.floor(-Math.log10(rel))));
}

const formatError = e =>
  !Number.isFinite(e) ? '—' : e === 0 ? '0' : e.toExponential(1);

function costLabel(method, cost, z) {
  if (method.costUnit === 'fixed') return 'fixed';
  const unit = method.costUnitAt ? method.costUnitAt(z) : method.costUnit;
  return `${cost.toLocaleString('en-US')} ${unit}`;
}

/* =====================================================
 * 3. INITIALIZE
 * ===================================================== */

export function initHmw8Calculator() {
  const root = document.getElementById('hmw8-calc');
  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);
  const input = get('hmw8-calc-z');
  const status = get('hmw8-calc-status');
  const caption = get('hmw8-calc-caption');
  const tableBody = get('hmw8-calc-table');
  const explanation = get('hmw8-calc-interpretation');

  const controller = new AbortController();
  const { signal } = controller;

  function compute() {
    const raw = Number(input.value);
    const z = snapToGrid(raw);

    if (input.value.trim() === '' || z === null) {
      status.textContent = 'Enter a number between −37 and 37.';
      return;
    }

    const reference = referenceCdf(z);
    const zText = String(z).replace('-', '−');
    const note = z === raw ? ''
      : Math.abs(raw) > 37 ? `z limited to ${zText}. `
      : `z rounded to the grid point ${zText}. `;
    // The upper tail comes from symmetry, 1 − Φ(z) = Φ(−z): subtracting
    // from 1 in double precision would lose it for large z.
    status.textContent =
      note +
      `Reference: Φ(${zText}) = ${formatPhi(reference)}` +
      (z > 0 ? `, and the upper tail is 1 − Φ(${zText}) = Φ(−${zText}) = ${formatPhi(referenceCdf(-z))}.` : '.');

    caption.textContent =
      `Φ(${zText}) by each method. Correct digits are significant digits, from the relative error; ` +
      'a double carries about 16.';

    const results = METHODS.map(m => {
      const { value, cost } = m.compute(z);
      const abs = Number.isFinite(value) ? Math.abs(value - reference) : Infinity;
      const rel = relativeError(value, reference);
      return { m, value, cost, abs, rel, digits: correctDigits(rel) };
    });

    tableBody.innerHTML = results.map(r => `
      <tr${r.m.id === 'hybrid' ? ' class="hmw4-row-selected"' : ''}>
        <th scope="row">${r.m.label}</th>
        <td>${formatPhi(r.value)}</td>
        <td>${formatError(r.abs)}</td>
        <td>${formatError(r.rel)}</td>
        <td>${r.digits}</td>
        <td>${costLabel(r.m, r.cost, z)}${Number.isFinite(r.value) ? '' : ' (no result)'}</td>
      </tr>`).join('');

    const get2 = id => results.find(r => r.m.id === id);
    const best = get2('hybrid');
    const taylor = get2('taylor');
    const paragraphs = [];

    if (z < -1) {
      paragraphs.push(`
        <strong>In the left tail, absolute error is not enough.</strong>
        Φ(${zText}) is only ${formatPhi(reference)}. A method with absolute
        error 10⁻¹⁰ can still get every digit wrong when Φ itself is
        smaller than that: the integration rules compute ½ − ∫₀<sup>|z|</sup> φ,
        a difference of two numbers close to ½, and keep
        ${get2('simpson').digits} correct digits here. The tail methods
        (continued fraction, approximations of erfc, our hybrid) compute
        the small number directly: ${best.digits} correct digits for the
        hybrid.`);
    } else if (z > 1) {
      paragraphs.push(`
        <strong>For z &gt; 0, Φ(z) is close to 1.</strong> All methods
        that reach 10⁻⁷ in absolute terms look right to 7 digits, but
        the information is in the tail 1 − Φ(${zText}) = ${formatPhi(referenceCdf(-z))},
        which a double near 1 can only store to about 10⁻¹⁶. That is why
        tail methods return Q(z) and why the accuracy section measures
        the relative error for z ≤ 0.`);
    } else {
      paragraphs.push(`
        <strong>Near the centre every method works.</strong> The series
        converge in a few terms and the integration rules integrate a
        smooth function on a short interval. Only the continued fraction
        struggles: it is a tail method and needs ${get2('fraction').cost.toLocaleString('en-US')}
        steps here${z === 0 ? ', and is not defined at z = 0' : ''}.`);
    }

    if (Math.abs(z) >= 4) {
      const partial = taylorPartialSums(z, taylor.cost);
      const largest = Math.max(...partial.map(v => Math.abs(v - 0.5)));
      paragraphs.push(`
        <strong>The Taylor series of the course notes</strong> keeps
        ${taylor.digits} correct digits at z = ${zText}. Its alternating terms
        grow before they shrink, and its partial sums swing as far as
        ${Number.isFinite(largest) ? largest.toExponential(1) : 'beyond the largest double'} before settling near Φ(z): every rounding
        error of that size, about 10⁻¹⁶ of it, survives in the result.`);
    }

    explanation.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  input.addEventListener('input', compute, { signal });

  root.querySelectorAll('[data-z]').forEach(button =>
    button.addEventListener('click', () => {
      input.value = button.dataset.z;
      compute();
    }, { signal }));

  compute();

  return () => controller.abort();
}
