/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Bar charts for categorical data (hand-written SVG)
 *
 * 1. Profile bars: one 100 % stacked bar per category of X, showing
 *    the conditional distribution of F, plus one bar for the
 *    marginal distribution of F. Under independence every bar would
 *    look like the marginal one.
 * 2. Grouped bars: a few series side by side for each group
 *    (admission rates of men and women per department).
 *
 * Same look as the charts of Homework 3 (hmw4/chart.js).
 */

import { CHART_COLORS } from '../hmw4/chart.js';

const FONT = 'Inter, ui-sans-serif, -apple-system, "Segoe UI", sans-serif';

/* Categorical palette, readable on the dark chart background */
export const CATEGORY_COLORS = Object.freeze([
  '#67e2c5', '#f8c879', '#8ab4ff', '#f28b82', '#c58af9', '#7fd4f5',
  '#fdd663', '#a8dab5', '#ff9e7a', '#b0bec5', '#e6a4c8', '#9fc5a6'
]);

export const categoryColor = j => CATEGORY_COLORS[j % CATEGORY_COLORS.length];

const escapeText = text => String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* Shortens a label to fit roughly `max` characters */
const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

const pct = v => `${(100 * v).toFixed(v < 0.1 ? 1 : 0)}%`;

/* =====================================================
 * 1. PROFILE BARS
 * ===================================================== */

/**
 * @param {object} options
 * @param {number} options.width
 * @param {string} options.title  Accessible description.
 * @param {{ label: string, values: number[], note?: string, marginal?: boolean }[]} options.bars
 *   Each bar's values are proportions that sum to 1.
 * @returns {string} SVG markup.
 */
export function renderProfileBars({ width, title, bars }) {
  const w = Math.max(280, Math.round(width));
  const compact = w < 520;
  const fontSize = compact ? 10 : 11;

  const labelWidth = compact ? 86 : 132;
  const margin = { top: 12, right: compact ? 10 : 16, bottom: 30, left: labelWidth + 12 };
  const barHeight = compact ? 22 : 26;
  const gap = compact ? 10 : 12;
  const separator = 14;            // extra space before the marginal bar

  const plotW = w - margin.left - margin.right;
  const hasMarginal = bars.some(b => b.marginal);
  const height = margin.top + margin.bottom
    + bars.length * barHeight + (bars.length - 1) * gap
    + (hasMarginal ? separator : 0);

  const xAt = v => margin.left + v * plotW;
  const c = v => v.toFixed(1);

  let yCursor = margin.top;
  const rows = bars.map(bar => {
    if (bar.marginal) yCursor += separator;
    const y = yCursor;
    yCursor += barHeight + gap;

    let acc = 0;
    const segments = bar.values.map((v, j) => {
      const x0 = xAt(acc);
      acc += v;
      const segW = xAt(acc) - x0;
      if (segW <= 0) return '';
      const text = segW > (compact ? 30 : 36)
        ? `<text x="${c(x0 + segW / 2)}" y="${c(y + barHeight / 2)}" fill="#0b1a27"
                 font-size="${fontSize}" font-weight="700" text-anchor="middle"
                 dominant-baseline="central">${pct(v)}</text>`
        : '';
      return `
        <rect x="${c(x0)}" y="${c(y)}" width="${c(Math.max(segW - 1, 0.5))}" height="${barHeight}"
              fill="${categoryColor(j)}" fill-opacity="${bar.marginal ? 0.75 : 0.95}" />
        ${text}`;
    }).join('');

    const outline = bar.marginal
      ? `<rect x="${c(margin.left - 0.5)}" y="${c(y - 0.5)}" width="${c(plotW + 1)}" height="${barHeight + 1}"
               fill="none" stroke="${CHART_COLORS.title}" stroke-width="1" stroke-dasharray="4 3" />`
      : '';

    return `
      <text x="${labelWidth}" y="${c(y + barHeight / 2)}" fill="${bar.marginal ? CHART_COLORS.title : CHART_COLORS.text}"
            font-size="${fontSize}" font-weight="${bar.marginal ? 700 : 400}"
            text-anchor="end" dominant-baseline="central">${escapeText(clip(bar.label, compact ? 14 : 20))}</text>
      ${segments}
      ${outline}`;
  }).join('');

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => `
    <line x1="${c(xAt(t))}" x2="${c(xAt(t))}" y1="${margin.top}" y2="${height - margin.bottom}"
          stroke="${CHART_COLORS.grid}" stroke-width="1" />
    <text x="${c(xAt(t))}" y="${height - margin.bottom + 16}" fill="${CHART_COLORS.text}"
          font-size="${fontSize}" text-anchor="middle">${t * 100}%</text>`).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${w} ${height}"
         role="img" aria-label="${escapeText(title)}" font-family='${FONT}' style="display:block">
      <title>${escapeText(title)}</title>
      <rect x="0" y="0" width="${w}" height="${height}" rx="9" fill="${CHART_COLORS.background}" />
      ${ticks}
      ${rows}
    </svg>`;
}

/* =====================================================
 * 2. GROUPED BARS
 * ===================================================== */

/**
 * @param {object} options
 * @param {number} options.width
 * @param {number} [options.height]
 * @param {string} options.title
 * @param {string} [options.yLabel]
 * @param {string[]} options.groups  Labels under each group.
 * @param {{ label: string, color: string, values: number[] }[]} options.series
 *   Values in [0, 1], shown as percentages.
 */
export function renderGroupedBars({ width, height = 300, title, yLabel = '', groups, series }) {
  const w = Math.max(280, Math.round(width));
  const compact = w < 520;
  const fontSize = compact ? 10 : 11;
  const margin = { top: 14, right: compact ? 10 : 16, bottom: 34, left: compact ? 44 : 56 };
  const plotW = w - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const maxValue = Math.max(...series.flatMap(s => s.values), 0.01);
  const top = Math.min(1, Math.ceil((maxValue * 1.12) * 10) / 10);
  const y = v => margin.top + plotH - (v / top) * plotH;
  const c = v => v.toFixed(1);

  const groupW = plotW / groups.length;
  const inner = groupW * 0.78;
  const barW = inner / series.length;

  const yTicks = [];
  const step = top > 0.5 ? 0.2 : 0.1;
  for (let t = 0; t <= top + 1e-9; t += step) yTicks.push(t);

  const grid = yTicks.map(t => `
    <line x1="${margin.left}" x2="${margin.left + plotW}" y1="${c(y(t))}" y2="${c(y(t))}"
          stroke="${CHART_COLORS.grid}" stroke-width="1" />
    <text x="${margin.left - 8}" y="${c(y(t))}" fill="${CHART_COLORS.text}" font-size="${fontSize}"
          text-anchor="end" dominant-baseline="middle">${Math.round(t * 100)}%</text>`).join('');

  const bars = groups.map((g, gi) => {
    const x0 = margin.left + gi * groupW + (groupW - inner) / 2;
    const rects = series.map((s, si) => {
      const v = s.values[gi];
      const bx = x0 + si * barW;
      return `<rect x="${c(bx + 1)}" y="${c(y(v))}" width="${c(Math.max(barW - 2, 1))}"
                    height="${c(margin.top + plotH - y(v))}" fill="${s.color}" fill-opacity="0.9">
                <title>${escapeText(`${g}, ${s.label}: ${pct(v)}`)}</title></rect>`;
    }).join('');
    return `${rects}
      <text x="${c(margin.left + gi * groupW + groupW / 2)}" y="${margin.top + plotH + 18}"
            fill="${CHART_COLORS.title}" font-size="${fontSize}" text-anchor="middle">${escapeText(g)}</text>`;
  }).join('');

  const yTitle = yLabel
    ? `<text transform="translate(13 ${margin.top + plotH / 2}) rotate(-90)" fill="${CHART_COLORS.title}"
             font-size="${fontSize + 1}" text-anchor="middle">${escapeText(yLabel)}</text>`
    : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${w} ${height}"
         role="img" aria-label="${escapeText(title)}" font-family='${FONT}' style="display:block">
      <title>${escapeText(title)}</title>
      <rect x="0" y="0" width="${w}" height="${height}" rx="9" fill="${CHART_COLORS.background}" />
      ${grid}
      ${bars}
      <rect x="${margin.left}" y="${margin.top}" width="${plotW}" height="${plotH}"
            fill="none" stroke="${CHART_COLORS.axis}" stroke-width="1" />
      ${yTitle}
    </svg>`;
}
