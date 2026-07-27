/**
 * Global Layout Loader - Injects header and footer into all pages
 */

const EMBEDDED_HEADER = `<nav>
  <a href="index.html" class="logo">
    <img src="assets/favicon.svg" alt="NokorPass" style="height: 28px; width: auto;">
    NokorPass
  </a>
  <button class="nav-toggle" type="button" aria-label="Toggle navigation menu" aria-expanded="false">
    <span></span>
    <span></span>
    <span></span>
  </button>
  <ul class="nav-links">
    <li><a href="index.html" data-route="home">Home</a></li>
    <li><a href="movies.html" data-route="movies">Movies</a></li>
    <li><a href="events.html" data-route="events">Events</a></li>
    <li><a href="tickets.html" data-route="tickets">Tickets</a></li>
    <li><a href="account.html" data-route="account">Account</a></li>
  </ul>
  <div class="nav-backdrop" aria-hidden="true"></div>
</nav>`;

const EMBEDDED_FOOTER = `<footer id="site-footer">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="index.html" class="logo">
          <img src="assets/favicon.svg" alt="NokorPass">
          NokorPass
        </a>
        <p>Book your favourite movie tickets instantly, anywhere, and anytime with ease.</p>
        <div class="social-links">
          <a href="https://x.com/NokorPassService" title="X / Twitter" aria-label="X" target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a href="https://www.tiktok.com/@nokorpass_service" title="TikTok" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
            </svg>
          </a>
        </div>
      </div>

      <div class="footer-payments">
        <h4>Accepted Payments</h4>
        <div class="payment-icons">
          <img src="assets/aba.png" alt="ABA Pay" title="ABA Pay">
          <img src="assets/acleda.jpg" alt="ACLEDA Pay" title="ACLEDA Pay">
          <img src="assets/Mastercard_logo.webp" alt="Mastercard" title="Mastercard">
          <img src="assets/visa.png" alt="Visa" title="Visa">
          <img src="assets/KHQR_Logo.png" alt="KHQR" title="KHQR">
        </div>
      </div>

      <div class="footer-col">
          <h4>Features</h4>
          <ul>
            <li><a href="movies.html">Book tickets</a></li>
            <li><a href="events.html">Events & Concerts</a></li>
            <li><a href="movies.html">Trailers</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Discover</h4>
          <ul>
            <li><a href="movies.html">New releases</a></li>
            <li><a href="movies.html?tab=coming-soon">Coming soon</a></li>
            <li><a href="index.html#top-rated">Top rated</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="help.html">Help centre</a></li>
            <li><a href="mailto:nokorpass-cs@nokorpass.store?subject=NokorPass%20Support">Support chat</a></li>
            <li><a href="privacy.html">Privacy Policy</a></li>
            <li><a href="terms.html">Terms of Service</a></li>
          </ul>
        </div>
    </div>

    <div class="footer-bottom">
      <span>© 2026 NokorPass. All rights reserved. <small class="site-version">v1.9.1</small></span>
      <span class="footer-bottom-links">
        <a href="/privacy">Privacy</a> ·
        <a href="/terms">Terms</a> ·
        <a href="/privacy#cookies-section">Cookies</a>
      </span>
    </div>
  </footer>`;

function isValidFooter(html) {
  const colCount = (html.match(/class="footer-col"/g) || []).length;
  return (
    html.includes('footer-payments') &&
    colCount >= 3 &&
    html.includes('footer-bottom')
  );
}

const MOBILE_OVERLAY_HTML = `
  <div class="mobile-device-overlay" role="dialog" aria-modal="true" aria-label="Mobile access notice">
    <div class="mobile-device-overlay__card">
      <div class="mobile-device-overlay__brand">
        <img src="assets/favicon.svg" alt="NokorPass logo" />
        <span>NokorPass</span>
      </div>
      <h1 class="mobile-device-overlay__title">Mobile access is temporarily unavailable</h1>
      <p class="mobile-device-overlay__text">
        We are enhancing the mobile experience for a polished booking flow. Please return on a desktop or tablet for the full NokorPass experience.
      </p>
    </div>
  </div>`;

async function fetchPartial(url, fallback, validate) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const text = (await res.text()).trim();
      if (text.length > 0 && (!validate || validate(text))) return text;
    }
  } catch (_) {
    /* use embedded fallback */
  }
  return fallback;
}

async function loadGlobalLayout() {
  if (document.body.dataset.layoutLoaded === 'true') return;

  try {
    const headerHTML = await fetchPartial('header.html', EMBEDDED_HEADER);
    const footerHTML = await fetchPartial('footer.html', EMBEDDED_FOOTER, isValidFooter);

    const headerPlaceholder = document.querySelector('[data-header-placeholder]');
    if (headerPlaceholder) {
      headerPlaceholder.innerHTML = headerHTML;
    } else if (!document.querySelector('body > nav, body > header nav')) {
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
    }

    const footerPlaceholder = document.querySelector('[data-footer-placeholder]');
    if (footerPlaceholder) {
      footerPlaceholder.innerHTML = footerHTML;
    } else if (!document.getElementById('site-footer') && !document.querySelector('body > footer')) {
      document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    // Mobile overlay disabled for testing. Keep the markup and styling in place for future reactivation.
    // if (!document.querySelector('.mobile-device-overlay')) {
    //   document.body.insertAdjacentHTML('beforeend', MOBILE_OVERLAY_HTML);
    // }

    const rawPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentPage = rawPage.replace('.html', '') || 'index';
    document.querySelectorAll('.nav-links a[data-route]').forEach((link) => {
      const href = (link.getAttribute('href') || '').replace('.html', '');
      if (href === currentPage || (currentPage === 'index' && href === 'index')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    initNavScroll();
    initMobileNav();
    document.body.dataset.layoutLoaded = 'true';
  } catch (error) {
    console.error('Failed to load global layout:', error);
    if (!document.querySelector('body > footer')) {
      document.body.insertAdjacentHTML('beforeend', EMBEDDED_FOOTER);
    }
    if (!document.querySelector('body > nav')) {
      document.body.insertAdjacentHTML('afterbegin', EMBEDDED_HEADER);
    }
    initNavScroll();
  }
}

function initNavScroll() {
  const nav = document.querySelector('body > nav');
  if (!nav) return;

  const updateNav = () => {
    const y = window.scrollY;
    nav.classList.toggle('nav-at-top', y < 16);
    nav.classList.toggle('nav-scrolled', y >= 16);
  };

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });
}

function initMobileNav() {
  const nav = document.querySelector('body > nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navBackdrop = document.querySelector('.nav-backdrop');
  if (!nav || !navToggle || !navLinks || !navBackdrop) return;

  const mobileMq = window.matchMedia('(max-width: 900px)');

  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('active');
    navBackdrop.classList.remove('active');
    document.documentElement.classList.remove('mobile-nav-open');
    document.body.classList.remove('mobile-nav-open');
  };

  function placeNavForViewport() {
    if (mobileMq.matches) {
      if (navLinks.parentElement !== document.body) {
        document.body.appendChild(navBackdrop);
        document.body.appendChild(navLinks);
      }
    } else {
      closeMenu();
      if (navLinks.parentElement === document.body) {
        nav.appendChild(navLinks);
        nav.appendChild(navBackdrop);
      }
    }
  }

  placeNavForViewport();
  mobileMq.addEventListener('change', placeNavForViewport);

  const openMenu = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('active');
    navBackdrop.classList.add('active');
    document.documentElement.classList.add('mobile-nav-open');
    document.body.classList.add('mobile-nav-open');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  navBackdrop.addEventListener('click', closeMenu);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGlobalLayout);
} else {
  loadGlobalLayout();
}


// crisp integration -beta channel
// window.$crisp = [];
// window.CRISP_WEBSITE_ID = "cf15f293-0a2c-45f8-9026-afd4aa5687bd";

// (function () {
//   var d = document;
//   var s = d.createElement("script");
//   s.src = "https://client.crisp.chat/l.js";
//   s.async = 1;
//   d.getElementsByTagName("head")[0].appendChild(s);
// })();
