/*
 * Statistics-Lab — Homework 3 (internal folder: hmw4)
 * SVG chart helpers
 *
 * Hand-written SVG, no external library, consistent with the
 * rest of the site. Charts are returned as strings and inserted
 * with innerHTML.
 *
 * All styling (colors, stroke widths, font sizes) is set through
 * SVG attributes, so a chart renders correctly without any
 * dedicated CSS.
 *
 * Charts are drawn at the real pixel width of their container
 * (passed in by the caller), so text keeps a readable size on
 * both desktop and mobile screens.
 */

/* =====================================================
 * 1. THEME
 * ===================================================== */

export const CHART_COLORS = Object.freeze({
  background: '#0b1a27',
  grid: '#1d3341',
  axis: '#3a5666',
  text: '#8da6b6',
  title: '#c4dde3',
  path: '#67e2c5',      // simulated data (site accent)
  theory: '#f8c879',    // theoretical curves (site amber)
  band: '#f8c879'
});

const FONT = 'Inter, ui-sans-serif, -apple-system, "Segoe UI", sans-serif';

/* =====================================================
 * 2. SCALES AND TICKS
 * ===================================================== */

/** Linear map from [d0, d1] to [r0, r1]. */
export function linearScale([d0, d1], [r0, r1]) {
  const span = d1 - d0 || 1;
  return value => r0 + ((value - d0) / span) * (r1 - r0);
}

/**
 * "Nice" tick values covering [min, max]: steps of 1, 2 or 5
 * times a power of ten, about `count` ticks in total.
 */
export function niceTicks(min, max, count = 5) {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];

  const rough = (max - min) / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / power;
  const step = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * power;

  const ticks = [];
  const first = Math.ceil(min / step - 1e-9) * step;

  for (let value = first; value <= max + step * 1e-9; value += step) {
    // Remove floating-point noise such as 0.30000000000000004.
    ticks.push(Number(value.toPrecision(12)));
  }

  return ticks;
}

/** Compact tick label: 1200 -> 1.2k, 0.00025 -> 2.5e-4. */
export function formatTick(value) {
  const abs = Math.abs(value);
  if (abs === 0) return '0';
  if (abs >= 10000) return `${Number((value / 1000).toPrecision(3))}k`;
  if (abs < 0.001) return value.toExponential(1);
  return String(Number(value.toPrecision(4)));
}

/** Extends [min, max] by a relative padding on both sides. */
export function padDomain([min, max], ratio = 0.06) {
  if (min === max) return [min - 1, max + 1];
  const pad = (max - min) * ratio;
  return [min - pad, max + pad];
}

/**
 * Keeps at most maxPoints points, evenly spaced, always
 * including the first and the last one. Used for long paths:
 * a 600-pixel chart cannot show more than ~600 distinct x values.
 */
export function downsample(points, maxPoints = 600) {
  if (points.length <= maxPoints) return points;

  const result = [];
  const step = (points.length - 1) / (maxPoints - 1);

  for (let i = 0; i < maxPoints; i++) {
    result.push(points[Math.round(i * step)]);
  }

  return result;
}

/* =====================================================
 * 3. LINE CHART WITH OPTIONAL THEORY BAND
 * ===================================================== */

const escapeText = text => String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

/*
 * Axis titles support a minimal subscript notation:
 * "S_k / k" is drawn as S with subscript k, followed by " / k".
 * The baseline is lowered for the subscript and restored after it.
 */
function svgLabel(text) {
  const parts = escapeText(text).split(/_(\w+)/);
  let html = '';
  let lowered = false;

  parts.forEach((part, i) => {
    if (part === '') return;

    if (i % 2 === 1) {
      html += `<tspan dy="${lowered ? 0 : 0.3}em" font-size="78%">${part}</tspan>`;
      lowered = true;
    } else {
      html += lowered
        ? `<tspan dy="-0.3em">${part}</tspan>`
        : part;
      lowered = false;
    }
  });

  return html;
}

let clipCounter = 0;

/**
 * @param {object} options
 * @param {number} options.width  Width in pixels (container width).
 * @param {number} [options.height]
 * @param {string} options.title  Accessible description of the chart.
 * @param {string} [options.xLabel]
 * @param {string} [options.yLabel]
 * @param {[number, number]} options.xDomain
 * @param {[number, number]} options.yDomain
 * @param {number[]} [options.xTicks]  Custom x tick positions
 *   (default: automatic "nice" ticks).
 * @param {(value: number) => string} [options.xFormat]  Custom x tick
 *   labels. Together with xTicks this allows a logarithmic axis:
 *   pass x = log10(n), xTicks = [1, 2, 3, 4] and
 *   xFormat = t => formatTick(10 ** t).
 * @param {{ points: [number, number][], color?: string, *           width?: number, opacity?: number, dash?: string }[]} [options.lines]
 * @param {{ points: [number, number, number][], color?: string,
 *           opacity?: number }} [options.band]  Points [x, low, high].
 * @returns {string} SVG markup.
 */
export function renderLineChart({
  width,
  height = 340,
  title,
  xLabel = '',
  yLabel = '',
  xDomain,
  yDomain,
  xTicks: customXTicks = null,
  xFormat = formatTick,
  lines = [],
  band = null
}) {

  const w = Math.max(280, Math.round(width));
  const compact = w < 520;

  const margin = {
    top: 14,
    right: compact ? 20 : 24,   // room for the last x tick label
    bottom: 46,
    left: compact ? 46 : 60
  };

  const plotW = w - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const x = linearScale(xDomain, [margin.left, margin.left + plotW]);
  const y = linearScale(yDomain, [margin.top + plotH, margin.top]);

  const fontSize = compact ? 10 : 11;
  const clipId = `hmw4-clip-${++clipCounter}`;

  const xTicks = customXTicks
    ? customXTicks.filter(t => t >= xDomain[0] && t <= xDomain[1])
    : niceTicks(xDomain[0], xDomain[1], compact ? 4 : 7);
  const yTicks = niceTicks(yDomain[0], yDomain[1], 5);

  const coordinate = value => value.toFixed(1);

  /* Grid and tick labels */

  const grid = [
    ...yTicks.map(t => `
      <line x1="${margin.left}" x2="${margin.left + plotW}"
            y1="${coordinate(y(t))}" y2="${coordinate(y(t))}"
            stroke="${CHART_COLORS.grid}" stroke-width="1" />
      <text x="${margin.left - 8}" y="${coordinate(y(t))}"
            fill="${CHART_COLORS.text}" font-size="${fontSize}"
            text-anchor="end" dominant-baseline="middle">${formatTick(t)}</text>`),
    ...xTicks.map(t => `
      <line x1="${coordinate(x(t))}" x2="${coordinate(x(t))}"
            y1="${margin.top}" y2="${margin.top + plotH}"
            stroke="${CHART_COLORS.grid}" stroke-width="1" />
      <text x="${coordinate(x(t))}" y="${margin.top + plotH + 18}"
            fill="${CHART_COLORS.text}" font-size="${fontSize}"
            text-anchor="middle">${xFormat(t)}</text>`)
  ].join('');

  /* Zero line, drawn stronger when 0 is inside the y range */

  const zeroLine = yDomain[0] < 0 && yDomain[1] > 0
    ? `<line x1="${margin.left}" x2="${margin.left + plotW}"
             y1="${coordinate(y(0))}" y2="${coordinate(y(0))}"
             stroke="${CHART_COLORS.axis}" stroke-width="1.2" />`
    : '';

  /* Theory band: polygon through the upper edge, then the lower edge backwards */

  const bandShape = band && band.points.length > 1
    ? `<polygon
         points="${[
           ...band.points.map(([px, , high]) => `${coordinate(x(px))},${coordinate(y(high))}`),
           ...[...band.points].reverse().map(([px, low]) => `${coordinate(x(px))},${coordinate(y(low))}`)
         ].join(' ')}"
         fill="${band.color ?? CHART_COLORS.band}"
         fill-opacity="${band.opacity ?? 0.12}" stroke="none" />`
    : '';

  /* Lines */

  const paths = lines
    .filter(line => line.points.length > 0)
    .map(line => `
      <polyline
        points="${line.points.map(([px, py]) => `${coordinate(x(px))},${coordinate(y(py))}`).join(' ')}"
        fill="none"
        stroke="${line.color ?? CHART_COLORS.path}"
        stroke-width="${line.width ?? 1.4}"
        stroke-opacity="${line.opacity ?? 1}"
        stroke-linejoin="round" stroke-linecap="round"
        ${line.dash ? `stroke-dasharray="${line.dash}"` : ''} />`)
    .join('');

  /* Axis titles */

  const axisTitles = `
    <text x="${margin.left + plotW / 2}" y="${height - 6}"
          fill="${CHART_COLORS.title}" font-size="${fontSize + 1}"
          text-anchor="middle">${svgLabel(xLabel)}</text>
    <text transform="translate(13 ${margin.top + plotH / 2}) rotate(-90)"
          fill="${CHART_COLORS.title}" font-size="${fontSize + 1}"
          text-anchor="middle">${svgLabel(yLabel)}</text>`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="100%" viewBox="0 0 ${w} ${height}"
         role="img" aria-label="${escapeText(title)}"
         font-family='${FONT}' style="display:block">

      <title>${escapeText(title)}</title>

      <rect x="0" y="0" width="${w}" height="${height}"
            rx="9" fill="${CHART_COLORS.background}" />

      <clipPath id="${clipId}">
        <rect x="${margin.left}" y="${margin.top}"
              width="${plotW}" height="${plotH}" />
      </clipPath>

      ${grid}
      ${zeroLine}

      <g clip-path="url(#${clipId})">
        ${bandShape}
        ${paths}
      </g>

      <rect x="${margin.left}" y="${margin.top}"
            width="${plotW}" height="${plotH}"
            fill="none" stroke="${CHART_COLORS.axis}" stroke-width="1" />

      ${axisTitles}
    </svg>`;
}
/* =====================================================
 * 4. HISTOGRAM WITH OPTIONAL DENSITY CURVE
 * =====================================================
 *
 * Bars come from latticeHistogram() in statistics.js:
 * each bin has { from, to, density }, where
 * density = count / (m · width), so the total area is 1 and
 * the bars can be compared directly with a probability density
 * (for instance the normal approximation N(E[Q], Var(Q))).
 *
 * Designed to work also as a small multiple (width ≈ 220 px):
 * below 360 px tick labels are reduced to a minimum.
 */

/**
 * @param {object} options
 * @param {number} options.width  Width in pixels (container width).
 * @param {number} [options.height]
 * @param {string} options.title  Accessible description of the chart.
 * @param {string} [options.xLabel]
 * @param {string} [options.yLabel]
 * @param {{ from: number, to: number, density: number }[]} options.bins
 * @param {[number, number]} options.xDomain
 * @param {number} [options.yMax]  Upper end of the y axis
 *   (default: highest bar or curve point + 8%).
 * @param {[number, number][]} [options.curve]  Density curve points.
 * @param {{ x: number, color?: string, dash?: string }[]} [options.markers]
 *   Vertical reference lines, e.g. the theoretical mean.
 * @returns {string} SVG markup.
 */
export function renderHistogram({
  width,
  height = 260,
  title,
  xLabel = '',
  yLabel = 'Density',
  bins,
  xDomain,
  yMax,
  curve = [],
  markers = []
}) {

  const w = Math.max(140, Math.round(width));
  const tiny = w < 360;
  const compact = w < 520;

  const margin = {
    top: 12,
    right: tiny ? 12 : 18,
    bottom: xLabel ? 44 : 28,
    left: tiny ? 40 : compact ? 46 : 58
  };

  const plotW = w - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const highest = Math.max(
    ...bins.map(b => b.density),
    ...curve.map(([, y]) => y),
    1e-12
  );
  const top = yMax ?? highest * 1.08;

  const x = linearScale(xDomain, [margin.left, margin.left + plotW]);
  const y = linearScale([0, top], [margin.top + plotH, margin.top]);

  const fontSize = tiny ? 9 : compact ? 10 : 11;
  const clipId = `hmw4-clip-${++clipCounter}`;
  const coordinate = value => value.toFixed(1);

  const xTicks = niceTicks(xDomain[0], xDomain[1], tiny ? 5 : compact ? 6 : 8);
  const yTicks = niceTicks(0, top, tiny ? 3 : 4);

  /* Grid and tick labels */

  const grid = [
    ...yTicks.map(t => `
      <line x1="${margin.left}" x2="${margin.left + plotW}"
            y1="${coordinate(y(t))}" y2="${coordinate(y(t))}"
            stroke="${CHART_COLORS.grid}" stroke-width="1" />
      <text x="${margin.left - 6}" y="${coordinate(y(t))}"
            fill="${CHART_COLORS.text}" font-size="${fontSize}"
            text-anchor="end" dominant-baseline="middle">${formatTick(t)}</text>`),
    ...xTicks.map(t => `
      <text x="${coordinate(x(t))}" y="${margin.top + plotH + 16}"
            fill="${CHART_COLORS.text}" font-size="${fontSize}"
            text-anchor="middle">${formatTick(t)}</text>`)
  ].join('');

  /* Bars: a 0.5 px gap keeps neighbouring bars distinguishable */

  const bars = bins.map(bin => {
    const left = x(bin.from);
    const right = x(bin.to);
    const barTop = y(bin.density);
    return `
      <rect x="${coordinate(left + 0.5)}" y="${coordinate(barTop)}"
            width="${Math.max(0.6, right - left - 1).toFixed(1)}"
            height="${coordinate(margin.top + plotH - barTop)}"
            fill="${CHART_COLORS.path}" fill-opacity="0.55" />`;
  }).join('');

  /* Density curve */

  const curveLine = curve.length > 1
    ? `<polyline
         points="${curve.map(([px, py]) => `${coordinate(x(px))},${coordinate(y(py))}`).join(' ')}"
         fill="none" stroke="${CHART_COLORS.theory}" stroke-width="2"
         stroke-linejoin="round" />`
    : '';

  /* Vertical markers */

  const markerLines = markers.map(marker => `
    <line x1="${coordinate(x(marker.x))}" x2="${coordinate(x(marker.x))}"
          y1="${margin.top}" y2="${margin.top + plotH}"
          stroke="${marker.color ?? CHART_COLORS.theory}" stroke-width="1.5"
          ${marker.dash !== '' ? `stroke-dasharray="${marker.dash ?? '4 4'}"` : ''} />`
  ).join('');

  /* Axis titles */

  const axisTitles = `
    ${xLabel ? `
    <text x="${margin.left + plotW / 2}" y="${height - 6}"
          fill="${CHART_COLORS.title}" font-size="${fontSize + 1}"
          text-anchor="middle">${svgLabel(xLabel)}</text>` : ''}
    ${yLabel && !tiny ? `
    <text transform="translate(12 ${margin.top + plotH / 2}) rotate(-90)"
          fill="${CHART_COLORS.title}" font-size="${fontSize + 1}"
          text-anchor="middle">${svgLabel(yLabel)}</text>` : ''}`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="100%" viewBox="0 0 ${w} ${height}"
         role="img" aria-label="${escapeText(title)}"
         font-family='${FONT}' style="display:block">

      <title>${escapeText(title)}</title>

      <rect x="0" y="0" width="${w}" height="${height}"
            rx="9" fill="${CHART_COLORS.background}" />

      <clipPath id="${clipId}">
        <rect x="${margin.left}" y="${margin.top}"
              width="${plotW}" height="${plotH}" />
      </clipPath>

      ${grid}

      <g clip-path="url(#${clipId})">
        ${bars}
        ${curveLine}
        ${markerLines}
      </g>

      <line x1="${margin.left}" x2="${margin.left + plotW}"
            y1="${margin.top + plotH}" y2="${margin.top + plotH}"
            stroke="${CHART_COLORS.axis}" stroke-width="1" />

      ${axisTitles}
    </svg>`;
}
