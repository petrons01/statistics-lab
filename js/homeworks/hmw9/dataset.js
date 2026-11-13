/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Datasets: CSV parsing and the two bundled datasets
 *
 * Every analysis on the page starts from raw records, one row per
 * observation. The contingency table is never typed in: it is
 * built by counting (contingency.js).
 *
 * The parser handles what real CSV files contain: a byte order
 * mark, Windows line endings, quoted fields with commas or quotes
 * inside, and comma, semicolon or tab as the separator (Excel in
 * Italian saves with semicolons).
 */

/* =====================================================
 * 1. BUNDLED DATASETS
 * ===================================================== */

export const DATASETS = Object.freeze([
  {
    id: 'nsl-kdd',
    label: 'NSL-KDD (network traffic)',
    file: 'nsl-kdd-test.csv',
    description:
      '22,544 connections of the NSL-KDD test set (KDDTest+), each ' +
      'labelled normal or attack.',
    columns: {
      protocol: 'Transport protocol of the connection (tcp, udp, icmp)',
      flag: 'Final state of the connection (SF = normal establishment and termination, REJ = rejected, S0 = no reply, …)',
      class: 'Normal traffic or attack'
    },
    defaultX: 'protocol',
    defaultF: 'class',
    order: { class: ['normal', 'attack'], protocol: ['tcp', 'udp', 'icmp'] }
  },
  {
    id: 'ucb',
    label: 'Berkeley admissions, 1973',
    file: 'ucb-admissions-1973.csv',
    description:
      '4,526 applications to the six largest departments of the ' +
      'University of California, Berkeley, in autumn 1973.',
    columns: {
      gender: 'Gender of the applicant, as recorded in 1973',
      department: 'Department applied to (A–F, anonymised)',
      admission: 'Outcome of the application'
    },
    defaultX: 'gender',
    defaultF: 'admission',
    order: { gender: ['male', 'female'], admission: ['admitted', 'rejected'] }
  }
]);

export function getDataset(id) {
  return DATASETS.find(d => d.id === id) ?? null;
}

/* Works on localhost and on GitHub Pages: resolved from this module */
function datasetUrl(file) {
  return new URL(`../../../data/independence/${file}`, import.meta.url);
}

const cache = new Map();

/**
 * Fetches and parses a bundled dataset once; later calls reuse it.
 * @returns {Promise<{ columns: string[], records: string[][] }>}
 */
export async function loadDataset(id, signal) {
  if (cache.has(id)) return cache.get(id);

  const dataset = getDataset(id);
  if (!dataset) throw new Error(`Unknown dataset "${id}".`);

  const response = await fetch(datasetUrl(dataset.file), { signal });
  if (!response.ok) throw new Error(`Could not load ${dataset.file} (HTTP ${response.status}).`);

  const parsed = parseCsv(await response.text());
  cache.set(id, parsed);
  return parsed;
}

/* =====================================================
 * 2. CSV PARSER
 * ===================================================== */

/** The separator that splits the header line into most fields. */
export function detectSeparator(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  let best = ',';
  let bestCount = 0;

  for (const candidate of [',', ';', '\t']) {
    // Count separators outside quotes only
    let count = 0;
    let quoted = false;
    for (const ch of firstLine) {
      if (ch === '"') quoted = !quoted;
      else if (ch === candidate && !quoted) count++;
    }
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }

  return best;
}

/**
 * Parses CSV text into a header and rows of trimmed strings.
 * Blank lines are skipped; rows shorter than the header are padded
 * with empty strings, so a missing value becomes "".
 *
 * @returns {{ columns: string[], records: string[][], separator: string }}
 */
export function parseCsv(text) {
  const clean = String(text).replace(/^﻿/, '');
  const separator = detectSeparator(clean);
  const rows = [];

  let field = '';
  let row = [];
  let quoted = false;

  const endField = () => { row.push(field.trim()); field = ''; };
  const endRow = () => {
    endField();
    if (row.some(value => value !== '')) rows.push(row);
    row = [];
  };

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];

    if (quoted) {
      if (ch === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; }   // escaped quote
        else quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === separator) {
      endField();
    } else if (ch === '\n') {
      endRow();
    } else if (ch !== '\r') {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) endRow();

  if (rows.length === 0) return { columns: [], records: [], separator };

  const [header, ...body] = rows;
  const columns = header.map((name, i) => name || `column ${i + 1}`);
  const records = body.map(r => columns.map((_, i) => r[i] ?? ''));

  return { columns, records, separator };
}
