/* ================================================================
   footer.js — single source of truth for site footer
   Edit here. Every page updates automatically.
   ================================================================ */

(function () {

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-inner">
        <div>
          <span class="footer-logo">🛡️ AllergyPass</span>
          <p class="footer-tagline">Practical tools and guides for safer travel and living abroad.</p>
        </div>
        <div class="footer-col">
          <h5>AllergyPass</h5>
          <nav class="footer-links">
            <a href="/app.html">Build My Card</a>
            <a href="/allergy-card/">About the Card</a>
          </nav>
        </div>
        <div class="footer-col">
          <h5>Guides</h5>
          <nav class="footer-links">
            <a href="/guides/">All Guides</a>
            <a href="/guides/food-allergy-survival-guide.html">Food Allergy Survival Guide</a>
            <a href="/guides/hidden-allergens-thai-food.html">Hidden Allergens</a>
          </nav>
        </div>
        <div class="footer-col">
          <h5>Thailand Essentials</h5>
          <nav class="footer-links">
            <a href="/thailand-essentials/">Overview</a>
            <a href="/thailand-essentials/emergency-healthcare.html">Emergency Healthcare</a>
          </nav>
        </div>
        <div class="footer-col">
          <h5>More</h5>
          <nav class="footer-links">
            <a href="/recommendations/">Recommendations</a>
            <a href="/blog/">Blog</a>
            <a href="/about.html">About Abe</a>
            <a href="https://instagram.com/bookofabe" target="_blank" rel="noopener noreferrer">Instagram</a>
          </nav>
        </div>
      </div>
      <div class="footer-copy-wrap">
        <p class="footer-copy" style="margin:0;border:none;padding:0;">© 2026 AllergyPass. All rights reserved.</p>
        <nav class="footer-legal-nav" style="border:none;margin:0;padding:0;" aria-label="Legal links">
          <a href="/disclaimer/" class="footer-legal-link">Disclaimer</a>
          <a href="/privacy/" class="footer-legal-link">Privacy</a>
          <a href="/terms/" class="footer-legal-link">Terms</a>
          <a href="/refunds/" class="footer-legal-link">Refunds</a>
        </nav>
      </div>
    </div>
  `;

  document.body.appendChild(footer);

})();
