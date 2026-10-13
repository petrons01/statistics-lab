
// HMW 1 - Interactive ECC Simulator

import {
  CURVE,
  BASE_POINT,
  isOnCurve,
  generateMultiples,
  scalarMultiply
} from './ecc.js';

// Formatta un punto per la visualizzazione.
const formatPoint = point => point === null
  ? '𝒪 (point at infinity)'
  : `(${point.x}, ${point.y})`;


// Trova tutti i punti validi della curva.
const curvePoints = [];

for (let x = 0; x < CURVE.p; x++) {
  for (let y = 0; y < CURVE.p; y++) {
    if (isOnCurve({ x, y })) {
      curvePoints.push({ x, y });
    }
  }
}


// Genera il grafico SVG della curva.
function makePlot(current, target) {
  const left = 44;
  const bottom = 354;
  const step = 20;

  const position = point => ({
    x: left + point.x * step,
    y: bottom - point.y * step
  });

  const ticks = [0, 4, 8, 12, 16];

  // Griglia cartesiana discreta.
  const grid = Array.from({ length: 17 }, (_, i) => {
    const x = left + i * step;
    const y = bottom - i * step;

    return `
      <line x1="${x}" y1="34" x2="${x}" y2="354"
            class="hmw1-grid-line"/>
      <line x1="44" y1="${y}" x2="364" y2="${y}"
            class="hmw1-grid-line"/>
    `;
  }).join('');

  // Numeri sugli assi.
  const labels = ticks.map(i => `
    <text x="${left + i * step}" y="372"
          text-anchor="middle">${i}</text>
    <text x="34" y="${bottom - i * step + 4}"
          text-anchor="end">${i}</text>
  `).join('');

  // Punti appartenenti alla curva.
  const dots = curvePoints.map(point => {
    const { x, y } = position(point);

    return `
      <circle class="hmw1-curve-point"
              cx="${x}" cy="${y}" r="4">
        <title>(${point.x}, ${point.y})</title>
      </circle>
    `;
  }).join('');

  // Evidenzia un punto.
  const mark = (point, className, radius) => {
    if (!point) return '';

    const { x, y } = position(point);

    return `
      <circle class="${className}"
              cx="${x}" cy="${y}" r="${radius}"/>
    `;
  };

  return `
    <svg class="hmw1-graph-svg"
         viewBox="0 0 410 395"
         role="img"
         aria-label="Finite elliptic curve plotted modulo 17">

      ${grid}

      <path d="M44 34 V354 H364" class="hmw1-axis"/>

      ${labels}

      <text x="382" y="358">x</text>
      <text x="44" y="18">y</text>

      ${dots}

      ${mark(target, 'hmw1-target-point', 9)}
      ${mark(BASE_POINT, 'hmw1-base-point', 6)}
      ${mark(current, 'hmw1-current-point', 10)}

    </svg>
  `;
}


// Inizializza il simulatore dopo il rendering della pagina.
export function initHmw1Simulator() {
  const root = document.getElementById('hmw1-simulator');

  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);

  const input = get('hmw1-key');
  const slider = get('hmw1-key-range');
  const targetLabel = get('hmw1-target');
  const currentLabel = get('hmw1-current');
  const stepLabel = get('hmw1-progress-label');
  const progress = get('hmw1-progress');
  const operation = get('hmw1-operation');
  const rows = get('hmw1-steps');
  const graph = get('hmw1-graph');

  const nextButton = get('hmw1-next');
  const playButton = get('hmw1-play');
  const resetButton = get('hmw1-reset');

  // Stato della simulazione.
  let k = 6;
  let steps = generateMultiples(k);
  let stepIndex = 0;
  let timer = null;


  // Ferma l'animazione.
  function stop() {
    if (timer !== null) {
      clearInterval(timer);
    }

    timer = null;
    playButton.textContent = '▶ Play';
  }


  // Aggiorna tutti gli elementi dell'interfaccia.
  function update() {
    const current = stepIndex === 0
      ? null
      : steps[stepIndex - 1].point;

    const target = scalarMultiply(k);

    const prior = stepIndex <= 1
      ? null
      : steps[stepIndex - 2].point;

    targetLabel.textContent = formatPoint(target);
    currentLabel.textContent = formatPoint(current);

    stepLabel.textContent = `Step ${stepIndex} of ${k}`;

    progress.max = k;
    progress.value = stepIndex;

    nextButton.disabled =
      timer !== null || stepIndex === k;

    playButton.disabled = stepIndex === k;

    resetButton.disabled =
      stepIndex === 0 && timer === null;

    operation.textContent = stepIndex === 0
      ? 'Start with the identity element 𝒪. Press Next step or Play.'
      : `Step ${stepIndex}: ${formatPoint(prior)} + G = ${formatPoint(current)}.`;

    // Aggiorna il grafico.
    graph.innerHTML = makePlot(current, target);

    // Aggiorna la cronologia.
    rows.innerHTML = stepIndex === 0
      ? '<tr><td colspan="3">No additions performed yet.</td></tr>'
      : steps.slice(0, stepIndex).map((s, index) => `
          <tr>
            <td>${s.k}</td>
            <td>
              ${index === 0
                ? '𝒪'
                : formatPoint(steps[index - 1].point)} + G
            </td>
            <td>${formatPoint(s.point)}</td>
          </tr>
        `).join('');
  }


  // Cambia lo scalare k.
  function setKey(value) {
    const candidate = Number(value);

    if (Number.isInteger(candidate)) {
      k = Math.max(1, Math.min(18, candidate));
    }

    input.value = String(k);
    slider.value = String(k);

    stop();

    steps = generateMultiples(k);
    stepIndex = 0;

    update();
  }


  // Avanza di un'addizione.
  function next() {
    if (stepIndex >= k) return;

    stepIndex++;

    if (stepIndex === k) {
      stop();
    }

    update();
  }


  // Event listeners.
  slider.addEventListener('input', () => {
    setKey(slider.value);
  });

  input.addEventListener('change', () => {
    setKey(input.value);
  });

  nextButton.addEventListener('click', next);

  resetButton.addEventListener('click', () => {
    stop();
    stepIndex = 0;
    update();
  });

  playButton.addEventListener('click', () => {
    if (timer !== null) {
      stop();
      update();
      return;
    }

    if (stepIndex === k) return;

    timer = setInterval(next, 900);
    playButton.textContent = '❚❚ Pause';

    update();
  });


  // Primo rendering.
  update();

  // Cleanup utilizzato dal router.
  return stop;
}
