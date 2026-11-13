/*
 * Statistics-Lab — Homework 6 (internal folder: hmw9)
 * Section 08 — Conclusions
 *
 * Static text. The numbers refer to the bundled datasets and were
 * checked against SciPy and against the values computed by the page.
 */

export function renderHmw9Conclusion() {
  return `
    <section class="panel" id="hmw9-conclusion" aria-labelledby="hmw9-conclusion-title">

      <div class="panel-label">08 / CONCLUSIONS</div>

      <h2 id="hmw9-conclusion-title">What the Tables Tell Us, and What They Do Not</h2>

      <h3>8.1 — The Method</h3>

      <p>
        From raw records the program counts the pairs (x, f) into a
        contingency table, and derives the marginal frequencies of X and F,
        the joint frequencies and the two families of conditional
        frequencies. Independence means that every conditional distribution
        of F given X equals the marginal of F; equivalently, that each count
        is close to E<sub>ij</sub> = n<sub>i·</sub> n<sub>·j</sub> / n.
        Pearson's χ² measures the distance from that prediction, and its
        p-value, computed here both from the χ² distribution and by 1,000
        permutations, says how often chance alone would produce such a
        distance.
      </p>

      <h3>8.2 — Network Traffic: Dependent</h3>

      <p>
        In the 22,544 NSL-KDD connections, the protocol and the class are
        clearly dependent: 91.1% of the icmp connections are attacks, against
        58.5% for tcp and 32.2% for udp, while the overall share is 56.9%.
        χ² = 1,165.90 with 2 degrees of freedom, p ≈ 6.7·10⁻²⁵⁴, and
        Cramér's V = 0.227, a weak association by the usual convention. The connection
        state (flag) is even more informative, V = 0.607: a rejected or
        unanswered connection (REJ, S0) is almost always an attack. That table
        also shows the limits of the approximation: 4 of its 22 cells have
        expected counts below 5, one below 1, which breaks Cochran's rule; the
        permutation test, which needs no approximation, confirms the
        dependence. For an intrusion detector these dependencies are good
        news: they are why such fields are useful features.
      </p>

      <h3>8.3 — Significance Is Not Strength</h3>

      <p>
        The lab shows the two errors of the test. When X and F are
        independent, a 5% test still rejects about 5% of the time (type I
        error). When they are dependent, a small sample often misses it
        (type II error), and a large sample detects even a negligible
        association. A small p-value says the dependence is real; Cramér's V
        and the residuals say how large it is and where it lies. A large
        p-value never proves independence: it only says the data are
        compatible with it.
      </p>

      <h3>8.4 — Association Is Not Causation</h3>

      <p>
        The Berkeley admissions of 1973 are dependent on gender in the pooled
        table (44.5% of men admitted against 30.4% of women, p ≈ 8·10⁻²²), yet
        inside the departments the difference almost vanishes: only
        department A is significant, in favour of women, and the
        Cochran–Mantel–Haenszel test, with the department held fixed, gives
        p = 0.22. The department is a confounder: it is related to gender
        (where people applied) and to admission (how selective it was). A χ²
        test detects association only. It is symmetric in X and F, so it
        cannot tell which causes which; it cannot see variables that were
        not recorded; and an association can come from a common cause, from
        the way the sample was selected, or from chance. Causal claims need
        a design that rules these out, above all a randomized experiment, or
        an explicit causal model with its assumptions stated.
      </p>

      <div class="hmw2-key-idea">
        <span>IN ONE SENTENCE</span>
        <p>
          Independence is a property of the whole table: χ² tells us whether
          the data contradict it, V tells us how much, and only the design of
          the study can tell us why.
        </p>
      </div>

      <h3>Sources</h3>

      <ul class="hmw8-sources">
        <li>M. Tavallaee, E. Bagheri, W. Lu, A. A. Ghorbani, “A Detailed Analysis of the KDD CUP 99 Data Set”, IEEE Symposium on Computational Intelligence for Security and Defense Applications (CISDA), 2009. NSL-KDD dataset: <a href="https://www.unb.ca/cic/datasets/nsl.html" target="_blank" rel="noopener">Canadian Institute for Cybersecurity, University of New Brunswick</a> (redistribution allowed with this citation); file KDDTest+, columns protocol_type, flag and class.</li>
        <li>P. J. Bickel, E. A. Hammel, J. W. O'Connell, “Sex Bias in Graduate Admissions: Data from Berkeley”, <em>Science</em> 187 (4175), 398–404, 1975. Counts as distributed in R's <a href="https://github.com/vincentarelbundock/Rdatasets/blob/master/csv/datasets/UCBAdmissions.csv" target="_blank" rel="noopener">UCBAdmissions dataset</a>.</li>
        <li>NIST/SEMATECH e-Handbook of Statistical Methods, <a href="https://www.itl.nist.gov/div898/handbook/eda/section3/eda3674.htm" target="_blank" rel="noopener">1.3.6.7.4 Critical Values of the Chi-Square Distribution</a>: all 50 values of the table are reproduced by the quantile function of this page.</li>
        <li>K. Pearson, “On the criterion that a given system of deviations from the probable…”, <em>Philosophical Magazine</em> 50, 157–175, 1900; W. G. Cochran, “Some methods for strengthening the common χ² tests”, <em>Biometrics</em> 10, 417–451, 1954.</li>
        <li>W. H. Press et al., <em>Numerical Recipes</em>, 3rd ed., §6.2 (incomplete gamma function, used for the p-values).</li>
      </ul>

    </section>
  `;
}
