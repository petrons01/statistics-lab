/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Section 07 — Association Is Not Causation: Berkeley, 1973
 *
 * The pooled gender × admission table shows a clear dependence.
 * Department by department it almost vanishes: women applied more
 * often to the departments that admitted fewer applicants. The
 * department is a confounder, and the pooled association says
 * nothing about a causal effect of gender on admission.
 */

import { loadDataset, getDataset } from './dataset.js';
import { buildTable, frequencies, chiSquareTest } from './contingency.js';
import { stratify, mantelHaenszel, oddsRatio } from './simpson.js';
import { logChiSquareTail, formatPValue } from './chi-square.js';
import { renderGroupedBars, renderProfileBars, categoryColor } from './bar-chart.js';
import { fmt, pct, signed } from './format.js';

const MEN_COLOR = '#8ab4ff';
const WOMEN_COLOR = '#f8c879';

/* =====================================================
 * 1. RENDER
 * ===================================================== */

export function renderHmw9Simpson() {
  return `
    <section class="panel hmw4-lab" id="hmw9-simpson" aria-labelledby="hmw9-simpson-title">

      <div class="panel-label">07 / ASSOCIATION IS NOT CAUSATION</div>

      <h2 id="hmw9-simpson-title">Berkeley, 1973: a Dependence That Disappears</h2>

      <p>
        In autumn 1973 the graduate division of the University of
        California, Berkeley admitted 44% of its male applicants and 35% of
        its female applicants. The gap raised the question of discrimination;
        the statistician Bickel, with Hammel and O'Connell, studied the data
        and published the answer in <em>Science</em> in 1975.
        The dataset below covers the six largest departments (A–F), with
        ${fmt(4526)} applications: the pattern is the same.
      </p>

      <p id="hmw9-simpson-status" class="hmw4-status" role="status" aria-live="polite">Loading the dataset…</p>

      <h3>7.1 — The Pooled Table</h3>
      <div class="hmw4-metrics" id="hmw9-simpson-pooled"></div>
      <div class="hmw4-interpretation" id="hmw9-simpson-pooled-text"></div>

      <h3>7.2 — Department by Department</h3>
      <div class="hmw4-table-wrap">
        <table class="hmw4-table hmw9-table">
          <caption>
            The gender × admission table inside each department: applicants,
            admission rates, and the χ² test of independence (1 degree of freedom).
            Highlighted: significant at the 5% level.
          </caption>
          <thead>
            <tr>
              <th scope="col">Department</th>
              <th scope="col">Men</th>
              <th scope="col">Women</th>
              <th scope="col">Admitted, men</th>
              <th scope="col">Admitted, women</th>
              <th scope="col">Women − men</th>
              <th scope="col">χ²</th>
              <th scope="col">p-value</th>
            </tr>
          </thead>
          <tbody id="hmw9-simpson-table"></tbody>
        </table>
      </div>

      <div class="hmw4-chart hmw9-chart-spaced" id="hmw9-simpson-rates"></div>
      <div class="hmw4-legend" aria-hidden="true">
        <span><i style="background:${MEN_COLOR}"></i> Men admitted</span>
        <span><i style="background:${WOMEN_COLOR}"></i> Women admitted</span>
      </div>

      <h3>7.3 — The Lurking Variable</h3>
      <p>
        Where did men and women apply? Each bar splits the applicants of one
        gender across the six departments; the legend gives each
        department's overall admission rate.
      </p>
      <div class="hmw4-chart hmw9-chart-auto" id="hmw9-simpson-where"></div>
      <div class="hmw4-legend" id="hmw9-simpson-where-legend" aria-hidden="true"></div>

      <div class="hmw4-metrics" id="hmw9-simpson-links"></div>

      <figure class="hmw9-dag">
        <svg viewBox="0 0 440 146" width="100%" role="img"
             aria-label="Gender affects the choice of department, the department affects admission; a direct effect of gender on admission is the open question">
          <defs>
            <marker id="hmw9-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#8da6b6" />
            </marker>
          </defs>
          <rect x="4" y="90" width="120" height="44" rx="10" fill="#102532" stroke="#355464" />
          <text x="64" y="118" fill="#c4dde3" font-size="17" text-anchor="middle">Gender</text>
          <rect x="160" y="12" width="120" height="44" rx="10" fill="#102532" stroke="#f8c879" />
          <text x="220" y="40" fill="#f8c879" font-size="17" text-anchor="middle">Department</text>
          <rect x="316" y="90" width="120" height="44" rx="10" fill="#102532" stroke="#355464" />
          <text x="376" y="118" fill="#c4dde3" font-size="17" text-anchor="middle">Admission</text>
          <line x1="100" y1="90" x2="166" y2="58" stroke="#8da6b6" stroke-width="2" marker-end="url(#hmw9-arrow)" />
          <line x1="274" y1="58" x2="340" y2="90" stroke="#8da6b6" stroke-width="2" marker-end="url(#hmw9-arrow)" />
          <line x1="126" y1="112" x2="312" y2="112" stroke="#f28b82" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#hmw9-arrow)" />
          <text x="219" y="104" fill="#f28b82" font-size="14" text-anchor="middle">direct effect?</text>
          <text x="72" y="52" fill="#8da6b6" font-size="13" text-anchor="middle">where one applies</text>
          <text x="370" y="52" fill="#8da6b6" font-size="13" text-anchor="middle">how selective</text>
        </svg>
        <figcaption>
          Two paths link gender to admission. The pooled table mixes them;
          holding the department fixed isolates the dashed one.
        </figcaption>
      </figure>

      <div class="hmw4-interpretation" id="hmw9-simpson-text"></div>

    </section>
  `;
}

/* =====================================================
 * 2. INITIALIZE
 * ===================================================== */

export function initHmw9Simpson() {
  const root = document.getElementById('hmw9-simpson');
  if (!root) return () => {};

  const $ = id => document.getElementById(id);
  const controller = new AbortController();
  const { signal } = controller;
  let data = null;
  const widths = {};

  const metric = ([l, v]) => `<div class="hmw4-metric"><span>${l}</span><strong>${v}</strong></div>`;

  function compute(parsed) {
    const meta = getDataset('ucb');
    const col = name => parsed.columns.indexOf(name);
    const G = col('gender');
    const D = col('department');
    const A = col('admission');
    const order = { xOrder: meta.order.gender, fOrder: meta.order.admission };

    const { pooled, pooledTest, strata } = stratify(parsed.records, G, A, D, order);
    const rate = (t, i) => t.counts[i][0] / (t.counts[i][0] + t.counts[i][1]);
    const mh = mantelHaenszel(strata.map(s => s.table));

    const genderDept = buildTable(parsed.records, G, D, { xOrder: meta.order.gender });
    const deptAdmit = buildTable(parsed.records, D, A, { fOrder: meta.order.admission });

    data = {
      pooled, pooledTest, strata, mh, rate,
      genderDept, genderDeptTest: chiSquareTest(genderDept), genderDeptFreq: frequencies(genderDept),
      deptAdmit, deptAdmitTest: chiSquareTest(deptAdmit), deptAdmitFreq: frequencies(deptAdmit)
    };

    $('hmw9-simpson-status').textContent =
      `${fmt(pooled.n)} applications built from data/independence/ucb-admissions-1973.csv, one record per applicant.`;

    render();
  }

  function render() {
    const { pooled, pooledTest, strata, mh, rate, genderDeptTest, deptAdmitTest, deptAdmitFreq } = data;
    const menRate = rate(pooled, 0);
    const womenRate = rate(pooled, 1);
    const pooledLogP = logChiSquareTail(pooledTest.statistic, pooledTest.df);

    $('hmw9-simpson-pooled').innerHTML = [
      ['ADMITTED, MEN', `${pct(menRate)} of ${fmt(pooled.counts[0][0] + pooled.counts[0][1])}`],
      ['ADMITTED, WOMEN', `${pct(womenRate)} of ${fmt(pooled.counts[1][0] + pooled.counts[1][1])}`],
      ['χ² (1 df)', fmt(pooledTest.statistic, 2)],
      ['P-VALUE', formatPValue(pooledLogP)],
      ["CRAMÉR'S V", fmt(pooledTest.cramersV, 3)]
    ].map(metric).join('');

    $('hmw9-simpson-pooled-text').innerHTML = `<p><strong>Taken at face value, gender and
      admission are dependent.</strong> Men were admitted ${pct(menRate)} of the time, women
      ${pct(womenRate)}: a gap of ${fmt(100 * (menRate - womenRate), 1)} points, with
      p = ${formatPValue(pooledLogP)}. The test of section 04 rejects independence without
      hesitation. It is tempting to read this as "being a woman lowered the chance of
      admission". The data do not allow that reading, as the next table shows.</p>`;

    const significant = strata.filter(s => logChiSquareTail(s.test.statistic, 1) < Math.log(0.05));
    const womenAhead = strata.filter(s => rate(s.table, 1) > rate(s.table, 0));

    $('hmw9-simpson-table').innerHTML = strata.map(s => {
      const t = s.table;
      const men = t.counts[0][0] + t.counts[0][1];
      const women = t.counts[1][0] + t.counts[1][1];
      const diff = 100 * (rate(t, 1) - rate(t, 0));
      const logP = logChiSquareTail(s.test.statistic, 1);
      return `<tr${logP < Math.log(0.05) ? ' class="hmw4-row-selected"' : ''}>
        <th scope="row">${s.level}</th>
        <td>${fmt(men)}</td><td>${fmt(women)}</td>
        <td>${pct(rate(t, 0))}</td><td>${pct(rate(t, 1))}</td>
        <td>${signed(diff, 1)} pts</td>
        <td>${fmt(s.test.statistic, 2)}</td><td>${formatPValue(logP)}</td>
      </tr>`;
    }).join('') + `<tr class="hmw9-total-row">
        <th scope="row">All (pooled)</th>
        <td class="hmw9-total">${fmt(pooled.counts[0][0] + pooled.counts[0][1])}</td>
        <td class="hmw9-total">${fmt(pooled.counts[1][0] + pooled.counts[1][1])}</td>
        <td class="hmw9-total">${pct(menRate)}</td><td class="hmw9-total">${pct(womenRate)}</td>
        <td class="hmw9-total">${signed(100 * (womenRate - menRate), 1)} pts</td>
        <td class="hmw9-total">${fmt(pooledTest.statistic, 2)}</td><td class="hmw9-total">${formatPValue(pooledLogP)}</td>
      </tr>`;

    const mhLogP = logChiSquareTail(mh.statistic, 1);
    $('hmw9-simpson-links').innerHTML = [
      ["GENDER × DEPARTMENT, V", fmt(genderDeptTest.cramersV, 3)],
      ["DEPARTMENT × ADMISSION, V", fmt(deptAdmitTest.cramersV, 3)],
      ['WITHIN DEPARTMENTS, CMH χ²', `${fmt(mh.statistic, 2)} (p = ${formatPValue(mhLogP)})`],
      ['COMMON ODDS RATIO, MEN : WOMEN', fmt(mh.oddsRatio, 2)]
    ].map(metric).join('');

    $('hmw9-simpson-where-legend').innerHTML = data.deptAdmit.rows.map((d, j) =>
      `<span><i style="background:${categoryColor(j)}"></i> ${d}: ${pct(deptAdmitFreq.rowProfiles[j][0], 0)} admitted</span>`).join('');

    const pooledOr = oddsRatio(pooled.counts);
    $('hmw9-simpson-text').innerHTML = [
      `<strong>Inside the departments the dependence almost vanishes.</strong> Only
       ${significant.length} of ${strata.length} departments ${significant.length === 1 ? 'shows' : 'show'} a significant difference at
       5% (${significant.map(s => s.level).join(', ')}), and in ${womenAhead.length} of
       ${strata.length} it is women who are admitted more often. In department A, the one
       significant case, women were admitted ${pct(rate(strata[0].table, 1))} of the time
       against ${pct(rate(strata[0].table, 0))} for men.`,
      `<strong>Why the pooled table says the opposite.</strong> Departments differ enormously in
       selectivity, from ${pct(Math.max(...deptAdmitFreq.rowProfiles.map(r => r[0])), 0)} to
       ${pct(Math.min(...deptAdmitFreq.rowProfiles.map(r => r[0])), 0)} admitted (V = ${fmt(deptAdmitTest.cramersV, 2)}),
       and men and women applied to different departments (V = ${fmt(genderDeptTest.cramersV, 2)}):
       ${pct(data.genderDeptFreq.rowProfiles[0][0] + data.genderDeptFreq.rowProfiles[0][1], 0)} of the men
       applied to A and B, which admitted most of their applicants, against
       ${pct(data.genderDeptFreq.rowProfiles[1][0] + data.genderDeptFreq.rowProfiles[1][1], 0)} of the women;
       the other ${pct(1 - data.genderDeptFreq.rowProfiles[1][0] - data.genderDeptFreq.rowProfiles[1][1], 0)}
       of the women applied to C–F, which rejected most. The department is related to both variables: it is a
       <em>confounder</em>, and pooling over it creates an association between gender and
       admission. This reversal of a comparison when a third variable is ignored is
       <em>Simpson's paradox</em>.`,
      `<strong>Holding the department fixed.</strong> The Cochran–Mantel–Haenszel test combines
       the six 2 × 2 tables without pooling them: CMH χ² = ${fmt(mh.statistic, 2)},
       p = ${formatPValue(mhLogP)}. The common odds ratio of admission, men against women, is
       ${fmt(mh.oddsRatio, 2)}, against ${fmt(pooledOr, 2)} in the pooled table: once the
       department is accounted for, men are not favoured at all.`,
      `<strong>What this does and does not prove.</strong> The pooled χ² was a correct test: the
       two variables <em>are</em> statistically dependent. What was wrong was reading the
       dependence as a cause. Even the within-department analysis is not a causal proof: it
       assumes the department is the only confounder (the qualifications of the applicants were
       not recorded), and it does not ask why women applied to the more crowded departments.
       Bickel and colleagues concluded that the bias, if any, lay earlier, in the paths that led
       women towards those fields, not in the admission decisions.`
    ].map(p => `<p>${p}</p>`).join('');

    draw();
  }

  function draw() {
    if (!data) return;
    const ratesBox = $('hmw9-simpson-rates');
    const whereBox = $('hmw9-simpson-where');
    widths.rates = ratesBox.clientWidth;
    widths.where = whereBox.clientWidth;
    const { strata, pooled, rate, genderDept, genderDeptFreq } = data;

    ratesBox.innerHTML = renderGroupedBars({
      width: ratesBox.clientWidth,
      height: 280,
      title: 'Admission rate of men and women in each department and overall',
      yLabel: 'Admitted',
      groups: [...strata.map(s => s.level), 'All'],
      series: [
        { label: 'Men', color: MEN_COLOR, values: [...strata.map(s => rate(s.table, 0)), rate(pooled, 0)] },
        { label: 'Women', color: WOMEN_COLOR, values: [...strata.map(s => rate(s.table, 1)), rate(pooled, 1)] }
      ]
    });

    whereBox.innerHTML = renderProfileBars({
      width: whereBox.clientWidth,
      title: 'Distribution of the applications of men and of women across the six departments',
      bars: genderDept.rows.map((g, i) => ({
        label: `${g === 'male' ? 'Men' : g === 'female' ? 'Women' : g} (${fmt(genderDeptFreq.rowTotals[i])})`,
        values: genderDeptFreq.rowProfiles[i]
      }))
    });
  }

  loadDataset('ucb', signal)
    .then(parsed => { if (!signal.aborted) compute(parsed); })
    .catch(error => {
      if (!signal.aborted) $('hmw9-simpson-status').textContent = `The dataset could not be loaded: ${error.message}`;
    });

  const observer = new ResizeObserver(() => {
    if (!data) return;
    if (Math.abs($('hmw9-simpson-rates').clientWidth - (widths.rates ?? 0)) > 4
      || Math.abs($('hmw9-simpson-where').clientWidth - (widths.where ?? 0)) > 4) draw();
  });
  observer.observe($('hmw9-simpson-rates'));

  return () => {
    controller.abort();
    observer.disconnect();
  };
}
