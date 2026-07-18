/* ==========================================================================
   Daloy — site interactions
   Vanilla JS. Transform/opacity animation only. Respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 12) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav overlay ---------- */
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.mobile-nav');
  var mobileNavClose = document.querySelector('.mobile-nav-close');

  function closeMobileNav() {
    if (!mobileNav || !hamburger) return;
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMobileNav() {
    if (!mobileNav || !hamburger) return;
    mobileNav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      if (isOpen) { closeMobileNav(); } else { openMobileNav(); }
    });
    if (mobileNavClose) {
      mobileNavClose.addEventListener('click', closeMobileNav);
    }
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMobileNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMobileNav();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------- Pipeline: connector draw + node stagger ---------- */
  var pipeline = document.querySelector('.pipeline');
  if (pipeline) {
    var connectorFill = pipeline.querySelector('.pipeline-connector-fill');
    var nodes = pipeline.querySelectorAll('.pipeline-node');

    var revealPipeline = function () {
      if (connectorFill) connectorFill.classList.add('is-drawn');
      nodes.forEach(function (node, i) {
        setTimeout(function () {
          node.classList.add('is-visible');
        }, prefersReducedMotion ? 0 : i * 160);
      });
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealPipeline();
    } else {
      var pipelineObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealPipeline();
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      pipelineObserver.observe(pipeline);
    }
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        var q = other.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Hero sub-line typed rotator ---------- */
  var rotator = document.querySelector('.hero-rotator');
  if (rotator) {
    var phrases = ['…answering leads.', '…scoring them.', '…routing them.'];

    if (prefersReducedMotion) {
      rotator.textContent = phrases[0];
    } else {
      var phraseIndex = 0;
      var charIndex = 0;
      var deleting = false;
      var textNode = document.createElement('span');
      var cursor = document.createElement('span');
      cursor.className = 'cursor';
      cursor.setAttribute('aria-hidden', 'true');
      rotator.textContent = '';
      rotator.appendChild(textNode);
      rotator.appendChild(cursor);
      rotator.setAttribute('aria-live', 'polite');

      var paused = false;
      var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { paused = !entry.isIntersecting; });
      }) : null;
      if (io) io.observe(rotator);

      function tick() {
        if (paused) { setTimeout(tick, 400); return; }
        var current = phrases[phraseIndex];

        if (!deleting) {
          charIndex++;
          textNode.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = false;
            setTimeout(function () { deleting = true; tick(); }, 1600);
            return;
          }
          setTimeout(tick, 45);
        } else {
          charIndex--;
          textNode.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(tick, 300);
            return;
          }
          setTimeout(tick, 28);
        }
      }
      tick();
    }
  }

  /* ---------- Wave mark idle loop is pure CSS; nothing to wire here ---------- */

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
