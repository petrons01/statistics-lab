
// HMW 1 — Render statistics using plain HTML/CSS.

import {
  analyzeMultiples,
  COORDINATE_BITS,
  STAT_BASE_POINTS
} from './statistics.js';

const formatPoint = point =>
  point === null ? '𝒪' : `(${point.x}, ${point.y})`;

const number = value =>
  value === null ? 'N/A' : value.toFixed(3);


// Renders a generic bar chart.
// All data originate from the fixed toy-curve calculation.
function renderBars(items, highest, colorClass = '') {
  const max = Math.max(1, highest);

  return `
    <div class="hmw1-stat-chart">
      <div class="hmw1-stat-bars"
           style="--stat-cols:${items.length}">

        ${items.map(({ label, count, description }) => `
          <div class="hmw1-stat-column"
               title="${description || `${label}: ${count}`}">

            <span class="hmw1-stat-bar-value">
              ${count}
            </span>

            <div class="hmw1-stat-bar-track">
              <div
                class="hmw1-stat-bar ${colorClass}"
                style="height:${(count / max) * 100}%">
              </div>
            </div>

            <span class="hmw1-stat-bar-label">
              ${label}
            </span>
          </div>
        `).join('')}

      </div>
    </div>
  `;
}


// Each bar represents the number of 1s in a bit position.
function renderBitChart(ones, total) {
  return renderBars(
    ones.map((count, index) => ({
      label: `b${COORDINATE_BITS - 1 - index}`,
      count,
      description:
        `Bit ${COORDINATE_BITS - 1 - index}: ` +
        `${count} ones, ${total - count} zeros ` +
        `(${(100 * count / total).toFixed(1)}% ones)`
    })),
    total,
    'hmw1-stat-bit-bar'
  );
}


// Initializes the statistical section.
export function initHmw1Statistics() {
  const root = document.getElementById(
    'hmw1-statistics'
  );

  if (!root) return () => {};

  const get = id => root.querySelector(`#${id}`);

  const baseSelect = get('hmw1-stat-base');
  const countSelect = get('hmw1-stat-count');

  function update() {
    const base =
      STAT_BASE_POINTS[Number(baseSelect.value)] ||
      STAT_BASE_POINTS[0];

    const stats = analyzeMultiples(
      Number(countSelect.value),
      base.point
    );

    // Summary.
    get('hmw1-stat-summary').innerHTML = `
      <div>
        <span>SCALAR VALUES</span>
        <strong>1–${stats.count}</strong>
      </div>
      <div>
        <span>DISTINCT OUTPUT POINTS</span>
        <strong>
          ${stats.distinctCount} / ${stats.order}
        </strong>
      </div>
      <div>
        <span>POINT AT INFINITY</span>
        <strong>${stats.infinityCount}</strong>
      </div>
      <div>
        <span>OBSERVED ENTROPY</span>
        <strong>${stats.entropy.toFixed(3)} bits</strong>
      </div>
    `;

    // Distribution over complete subgroup.
    get('hmw1-stat-points').innerHTML = renderBars(
      stats.pointFrequencies.map(({ point, count }) => ({
        label: point === null
          ? '𝒪'
          : `${point.x},${point.y}`,
        count,
        description:
          `${formatPoint(point)}: ${count} times`
      })),
      Math.max(
        ...stats.pointFrequencies.map(row => row.count)
      ),
      'hmw1-stat-point-bar'
    );

    // Coordinate distributions.
    for (const axis of ['x', 'y']) {
      const counts = axis === 'x'
        ? stats.xFrequency
        : stats.yFrequency;

      get(`hmw1-stat-${axis}`).innerHTML = renderBars(
        counts.map((count, value) => ({
          label: String(value),
          count
        })),
        Math.max(...counts)
      );
    }

    // Bit distributions.
    get('hmw1-stat-bits-x').innerHTML =
      renderBitChart(stats.xOnes, stats.finiteCount);

    get('hmw1-stat-bits-y').innerHTML =
      renderBitChart(stats.yOnes, stats.finiteCount);

    // Input/output correlations.
    get('hmw1-stat-correlation').innerHTML = `
      <div>
        <span>Pearson r(k, x)</span>
        <strong>${number(stats.correlationX)}</strong>
      </div>
      <div>
        <span>Pearson r(k, y)</span>
        <strong>${number(stats.correlationY)}</strong>
      </div>
    `;

    // Hamming distances between consecutive outputs.
    get('hmw1-stat-avalanche').textContent =
      stats.averageHamming === null
        ? 'N/A (no finite consecutive pairs)'
        : `${stats.averageHamming.toFixed(2)} / ` +
          `${2 * COORDINATE_BITS} bits ` +
          `(${(
            stats.averageHamming /
            (2 * COORDINATE_BITS) * 100
          ).toFixed(1)}%)`;

    get('hmw1-stat-pairs').innerHTML =
      stats.comparisons.length
        ? stats.comparisons.map(
            ({ from, to, bitsChanged }) => `
              <tr>
                <td>${from} → ${to}</td>
                <td>
                  ${bitsChanged} /
                  ${2 * COORDINATE_BITS}
                </td>
              </tr>
            `
          ).join('')
        : `<tr>
             <td colspan="2">No comparable pairs</td>
           </tr>`;

    // Contextual interpretation of point uniformity.
    get('hmw1-stat-note').textContent =
      stats.count % stats.order === 0
        ? `The selected range contains ` +
          `${stats.count / stats.order} complete ` +
          `cycle(s) of ${stats.order} subgroup points, ` +
          `so every point appears equally often.`
        : `The selected range does not contain a ` +
          `whole number of cycles of ${stats.order} ` +
          `subgroup points; unequal point frequencies ` +
          `here are due to the chosen input range.`;
  }

  baseSelect.addEventListener('change', update);
  countSelect.addEventListener('change', update);

  update();

  // The SPA router discards these DOM nodes on navigation.
  return () => {};
}
