/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Small formatting helpers shared by the sections of the page
 */

export const escapeHtml = text => String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** Fixed decimals with thousands separators: 22544 → "22,544". */
export const fmt = (value, digits = 0) =>
  Number.isFinite(value)
    ? value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    : '—';

/** Proportion as a percentage: 0.4154 → "41.5%". */
export const pct = (value, digits = 1) =>
  Number.isFinite(value) ? `${(100 * value).toFixed(digits)}%` : '—';

/** Signed number with a true minus sign. */
export const signed = (value, digits = 1) =>
  `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(digits)}`;

/** A count, a noun and its plural. */
export const plural = (count, singular, pluralForm = `${singular}s`) =>
  `${fmt(count)} ${count === 1 ? singular : pluralForm}`;

/**
 * Background colour of a cell from its adjusted residual:
 * teal when the cell has more records than independence predicts,
 * coral when it has fewer; the strength saturates at |r| = 4.
 */
export function residualStyle(r) {
  if (!Number.isFinite(r) || Math.abs(r) < 0.5) return '';
  const strength = Math.min(Math.abs(r), 4) / 4;
  const alpha = (0.1 + 0.45 * strength).toFixed(2);
  const rgb = r > 0 ? '103, 226, 197' : '242, 139, 130';
  return ` style="background: rgba(${rgb}, ${alpha})"`;
}

/** Words for the size of Cramér's V (conventional thresholds). */
export function strengthWord(v) {
  if (v < 0.1) return 'negligible';
  if (v < 0.3) return 'weak';
  if (v < 0.5) return 'moderate';
  return 'strong';
}
