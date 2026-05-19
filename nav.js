/* ================================================================
   nav.js — single source of truth for site navigation
   Edit here. Every page updates automatically.
   ================================================================ */

(function () {
  /* ── NAV LINKS ── edit this array to add/remove/reorder links */
    const NAV_LINKS = [
    { label: 'Blog',   href: '/blog/' },
    { label: 'About',  href: '/about.html' },
  ];

  /* ── ACTIVE LINK DETECTION ── marks current section */
  function isCurrent(href) {
    const path = window.location.pathname;
    if (href === '/') return path === '/';
    return path.startsWith(href.replace('.html', ''));
  }

  /* ── BUILD NAV LINKS HTML ── */
  function buildLinks(mobile) {
    return NAV_LINKS.map(({ label, href }) => {
      const current = isCurrent(href) ? ' aria-current="page"' : '';
      if (mobile) {
        return `<a href="${href}"${current}>${label}</a>`;
      }
      return `<a href="${href}"${current}>${label}</a>`;
    }).join('\n');
  }

  /* ── INJECT NAV ── */
  const nav = document.createElement('nav');
  nav.className = 'site-nav';
  nav.setAttribute('aria-label', 'Main navigation');
  nav.innerHTML = `
    <div class="container">
      <a href="/" class="nav-logo">🛡️ AllergyPass</a>
      <div class="nav-links">
        ${buildLinks(false)}
      </div>
      <button class="nav-hamburger" onclick="APNav.open()" aria-label="Open main navigation menu">&#9776;</button>
      <a href="/app.html" class="nav-cta">Build My Card</a>
    </div>
  `;

  /* ── INJECT MOBILE DRAWER ── */
  const drawer = document.createElement('div');
  drawer.className = 'mobile-drawer';
  drawer.id = 'mobileDrawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-label', 'Navigation menu');
  drawer.innerHTML = `
    <div class="mobile-drawer__head">
      <span style="font-family:var(--font-display);font-size:1.2rem;">🛡️ AllergyPass</span>
      <button class="mobile-drawer__close" onclick="APNav.close()" aria-label="Close menu">&#10005;</button>
    </div>
    <a href="/">Home</a>
    ${buildLinks(true)}
    <a href="/app.html" class="mobile-drawer__cta">Build My Card →</a>
  `;

  /* ── SKIP LINK ── */
  const skip = document.createElement('a');
  skip.className = 'skip-link';
  skip.href = '#main-content';
  skip.textContent = 'Skip to content';

  /* ── INSERT INTO PAGE ── */
  document.body.insertAdjacentElement('afterbegin', drawer);
  document.body.insertAdjacentElement('afterbegin', nav);
  document.body.insertAdjacentElement('afterbegin', skip);

  const hamburger = nav.querySelector('.nav-hamburger');
  const closeButton = drawer.querySelector('.mobile-drawer__close');
  let lastDrawerFocus = null;

  /* ── DRAWER CONTROLS ── exposed globally so onclick attrs work */
  window.APNav = {
    open() {
      lastDrawerFocus = document.activeElement;
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      let bd = document.getElementById('drawerBackdrop');
      if (!bd) {
        bd = document.createElement('div');
        bd.id = 'drawerBackdrop';
        bd.style.cssText = 'position:fixed;inset:0;z-index:499;background:rgba(0,0,0,0.35);';
        bd.addEventListener('click', () => APNav.close());
        document.body.appendChild(bd);
      }
      bd.style.display = 'block';
      closeButton?.focus();
    },
    close() {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      const bd = document.getElementById('drawerBackdrop');
      if (bd) bd.style.display = 'none';
      if (lastDrawerFocus && typeof lastDrawerFocus.focus === 'function') {
        lastDrawerFocus.focus();
      } else {
        hamburger?.focus();
      }
    }
  };

  document.addEventListener('keydown', (e) => {
    if (!drawer.classList.contains('open')) {
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      APNav.close();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusable = Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(el => el.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

})();
