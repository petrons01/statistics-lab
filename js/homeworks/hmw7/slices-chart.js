/*
 * Statistics-Lab — Homework 5.1 (internal folder: hmw7)
 * SVG drawing of the two partitions
 *
 *   Riemann:  vertical rectangles [x_i, x_{i+1}] × [0, f(x_i*)]
 *   Lebesgue: horizontal layers [y_k, y_{k+1}] over the preimages
 *             {f > y_k} (upper sum, light) and {f > y_{k+1}}
 *             (lower sum, dark)
 *
 * Same frame, colors and fonts as the charts of Homework 3
 * (hmw4/chart.js), so the two figures sit naturally next to the
 * line charts of the other sections.
 */

import { CHART_COLORS, linearScale, niceTicks, formatTick } from '../hmw4/chart.js';

export const RIEMANN_COLOR = CHART_COLORS.path;     // teal
export const LEBESGUE_COLOR = CHART_COLORS.theory;  // amber
const CURVE_COLOR = '#e8f4f6';

const FONT = 'Inter, ui-sans-serif, -apple-system, "Segoe UI", sans-serif';

let clipCounter = 0;

const c = value => value.toFixed(1);

/** Polylines of the graph of f, split at the jumps. */
function curvePaths(fn, x, y, yMax) {
  const cuts = [fn.a, ...(fn.breaks ?? []), fn.b];
  const paths = [];

  for (let s = 0; s < cuts.length - 1; s++) {
    const from = cuts[s];
    const to = cuts[s + 1];
    const samples = 400;
    const points = [];

    for (let i = 0; i <= samples; i++) {
      let px = from + ((to - from) * i) / samples;
      // at a jump, approach the break from the left
      if (i === samples && s < cuts.length - 2) px = to - 1e-12;
      const py = fn.f(px);
      if (Number.isFinite(py)) points.push(`${c(x(px))},${c(y(Math.min(py, yMax * 2)))}`);
    }

    paths.push(`<polyline points="${points.join(' ')}" fill="none"
      stroke="${CURVE_COLOR}" stroke-width="2" stroke-linejoin="round" />`);
  }

  return paths.join('');
}

/**
 * @param {object} o
 * @param {number} o.width
 * @param {number} [o.height]
 * @param {string} o.title       Accessible description.
 * @param {object} o.fn          Entry of functions.js.
 * @param {number} o.yMax        Upper end of the y axis.
 * @param {'riemann'|'lebesgue'} o.mode
 * @param {object} [o.riemann]   { N, tags } (tags: x_i*).
 * @param {object} [o.lebesgue]  { M, top, preimages }.
 */
export function renderSlicesChart({
  width,
  height = 300,
  title,
  fn,
  yMax,
  mode,
  riemann = null,
  lebesgue = null
}) {
  const w = Math.max(280, Math.round(width));
  const compact = w < 520;
  const margin = { top: 14, right: compact ? 16 : 22, bottom: 40, left: compact ? 40 : 48 };
  const plotW = w - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const x = linearScale([fn.a, fn.b], [margin.left, margin.left + plotW]);
  const y = linearScale([0, yMax], [margin.top + plotH, margin.top]);
  const fontSize = compact ? 10 : 11;
  const clipId = `hmw7-clip-${++clipCounter}`;

  const xTicks = fn.xTicks ?? niceTicks(fn.a, fn.b, compact ? 4 : 5).map(t => [t, formatTick(t)]);
  const yTicks = niceTicks(0, yMax, 5);

  const grid = [
    ...yTicks.map(t => `
      <line x1="${margin.left}" x2="${margin.left + plotW}" y1="${c(y(t))}" y2="${c(y(t))}"
            stroke="${CHART_COLORS.grid}" stroke-width="1" />
      <text x="${margin.left - 7}" y="${c(y(t))}" fill="${CHART_COLORS.text}"
            font-size="${fontSize}" text-anchor="end" dominant-baseline="middle">${formatTick(t)}</text>`),
    ...xTicks.map(([t, label]) => `
      <line x1="${c(x(t))}" x2="${c(x(t))}" y1="${margin.top}" y2="${margin.top + plotH}"
            stroke="${CHART_COLORS.grid}" stroke-width="1" />
      <text x="${c(x(t))}" y="${margin.top + plotH + 17}" fill="${CHART_COLORS.text}"
            font-size="${fontSize}" text-anchor="middle">${label}</text>`)
  ].join('');

  let shapes = '';

  if (mode === 'riemann' && riemann) {
    const { N, tags } = riemann;
    const outline = N <= 80;
    const h = (fn.b - fn.a) / N;

    shapes = tags.map((tag, i) => {
      const value = fn.f(tag);
      const top = Number.isFinite(value) ? Math.min(value, yMax * 2) : yMax * 2;
      const x0 = fn.a + (i * (fn.b - fn.a)) / N;
      return `<rect x="${c(x(x0))}" y="${c(y(top))}"
        width="${c(Math.max(0.5, x(x0 + h) - x(x0)))}" height="${c(Math.max(0, y(0) - y(top)))}"
        fill="${RIEMANN_COLOR}" fill-opacity="0.26"
        ${outline ? `stroke="${RIEMANN_COLOR}" stroke-opacity="0.85" stroke-width="1"` : ''} />`;
    }).join('');

    if (N <= 80) {
      shapes += tags.map(tag => {
        const value = fn.f(tag);
        if (!Number.isFinite(value) || value > yMax) return '';
        return `<circle cx="${c(x(tag))}" cy="${c(y(value))}" r="2.6" fill="${RIEMANN_COLOR}" />`;
      }).join('');
    }
  }

  if (mode === 'lebesgue' && lebesgue) {
    const { M, top, preimages } = lebesgue;
    const outline = M <= 80;

    for (let k = 0; k < M; k++) {
      const y0 = (k * top) / M;
      const y1 = ((k + 1) * top) / M;
      if (y0 > yMax) break;

      const strip = (intervals, opacity) => intervals.map(([from, to]) => `
        <rect x="${c(x(from))}" y="${c(y(Math.min(y1, yMax * 2)))}"
          width="${c(Math.max(0.5, x(to) - x(from)))}" height="${c(Math.max(0.4, y(y0) - y(Math.min(y1, yMax * 2))))}"
          fill="${LEBESGUE_COLOR}" fill-opacity="${opacity}" />`).join('');

      shapes += strip(preimages[k], 0.2) + strip(preimages[k + 1], 0.42);
    }

    if (outline) {
      for (let k = 1; k < M; k++) {
        const level = (k * top) / M;
        if (level > yMax) break;
        shapes += `<line x1="${margin.left}" x2="${margin.left + plotW}"
          y1="${c(y(level))}" y2="${c(y(level))}" stroke="${LEBESGUE_COLOR}"
          stroke-opacity="0.55" stroke-width="1" stroke-dasharray="3 4" />`;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${w} ${height}"
         role="img" aria-label="${title}" font-family='${FONT}' style="display:block">
      <title>${title}</title>
      <rect x="0" y="0" width="${w}" height="${height}" rx="9" fill="${CHART_COLORS.background}" />
      <clipPath id="${clipId}">
        <rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}" />
      </clipPath>
      ${grid}
      <g clip-path="url(#${clipId})">
        ${shapes}
        ${curvePaths(fn, x, y, yMax)}
      </g>
      <rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}"
            fill="none" stroke="${CHART_COLORS.axis}" stroke-width="1" />
      <text x="${margin.left + plotW / 2}" y="${height - 6}" fill="${CHART_COLORS.title}"
            font-size="${fontSize + 1}" text-anchor="middle">x</text>
    </svg>`;
}
