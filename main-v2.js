/* ==========================================================================
   Daloy — v2 interactions (ui-ux-pro-max driven)
   AI-native: chat simulation w/ typing indicator + streaming reply.
   Vanilla JS. transform/opacity only. Respects prefers-reduced-motion.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.mobile-nav');
  var mobileNavClose = document.querySelector('.mobile-nav-close');

  function closeNav() {
    if (!mobileNav || !hamburger) return;
    mobileNav.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openNav() {
    if (!mobileNav || !hamburger) return;
    mobileNav.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      hamburger.getAttribute('aria-expanded') === 'true' ? closeNav() : openNav();
    });
    if (mobileNavClose) mobileNavClose.addEventListener('click', closeNav);
    mobileNav.querySelectorAll('a').forEach(function (l) { l.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var ro = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { ro.observe(el); });
    }
  }

  /* ---------- Pipeline stagger ---------- */
  var pipeline = document.querySelector('.pipeline-track');
  if (pipeline) {
    var nodes = pipeline.querySelectorAll('.pipe-node');
    var showPipe = function () {
      nodes.forEach(function (n, i) {
        setTimeout(function () { n.classList.add('is-visible'); }, prefersReducedMotion ? 0 : i * 150);
      });
    };
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      showPipe();
    } else {
      var po = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) { if (e.isIntersecting) { showPipe(); obs.unobserve(e.target); } });
      }, { threshold: 0.3 });
      po.observe(pipeline);
    }
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      faqItems.forEach(function (o) {
        o.classList.remove('is-open');
        var oq = o.querySelector('.faq-question');
        if (oq) oq.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- AI-native hero chat simulation ---------- */
  var chatBody = document.querySelector('.chat-body');
  if (chatBody) {
    var inbound = 'Hi! Available po ba kayo for a deep clean this Saturday? Magkano?';
    var reply = 'Hi! Yes po, may slot kami this Saturday. For a 2-bedroom deep clean, around ₱2,500. Gusto n’yo po ba i-book? I can lock it in now. 📅';

    // Screen-reader accessible static transcript (always present, visually hidden)
    var srText = document.createElement('p');
    srText.className = 'visually-hidden';
    srText.textContent = 'Example conversation. Customer: ' + inbound + ' Daloy AI: ' + reply;
    chatBody.parentNode.appendChild(srText);

    if (prefersReducedMotion) {
      // Static render, no animation
      chatBody.appendChild(makeMsg('in', 'Customer', inbound, true));
      chatBody.appendChild(makeMsg('out', 'Daloy AI · instant', reply, true));
    } else {
      runChatLoop(chatBody, inbound, reply);
    }
  }

  function makeMsg(dir, label, text, shown) {
    var el = document.createElement('div');
    el.className = 'msg msg-' + dir + (shown ? ' show' : '');
    el.setAttribute('aria-hidden', 'true');
    var lab = document.createElement('span');
    lab.className = 'msg-label';
    lab.textContent = label;
    var body = document.createElement('span');
    body.className = 'msg-text';
    body.textContent = text;
    el.appendChild(lab);
    el.appendChild(body);
    return el;
  }

  function makeTyping() {
    var t = document.createElement('div');
    t.className = 'typing';
    t.setAttribute('aria-hidden', 'true');
    t.innerHTML = '<span></span><span></span><span></span>';
    return t;
  }

  function runChatLoop(container, inbound, reply) {
    var timers = [];
    function clearAll() { timers.forEach(clearTimeout); timers = []; container.innerHTML = ''; }
    function wait(ms, fn) { timers.push(setTimeout(fn, ms)); }

    // Pause when off-screen to save cycles
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible = e.isIntersecting; });
      }, { threshold: 0.2 }).observe(container.closest('.chat-card') || container);
    }

    function cycle() {
      clearAll();
      // 1. inbound message appears
      var inMsg = makeMsg('in', 'Customer', inbound, false);
      container.appendChild(inMsg);
      wait(120, function () { inMsg.classList.add('show'); });

      // 2. typing indicator
      var typing = makeTyping();
      wait(700, function () {
        container.appendChild(typing);
        requestAnimationFrame(function () { typing.classList.add('show'); });
      });

      // 3. swap typing for streaming reply
      wait(2000, function () {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        var outMsg = makeMsg('out', 'Daloy AI · instant', '', false);
        var textEl = outMsg.querySelector('.msg-text');
        var cursor = document.createElement('span');
        cursor.className = 'stream-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        outMsg.appendChild(cursor);
        container.appendChild(outMsg);
        requestAnimationFrame(function () { outMsg.classList.add('show'); });

        // 4. stream tokens
        var i = 0;
        function stream() {
          if (i <= reply.length) {
            textEl.textContent = reply.slice(0, i);
            i += 1;
            wait(22, stream);
          } else {
            if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
            // 5. hold, then restart
            wait(4200, cycle);
          }
        }
        stream();
      });
    }

    // Kick off; if user scrolls away it keeps running but cheaply (text only)
    cycle();
  }
})();
