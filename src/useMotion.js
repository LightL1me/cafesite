import { useEffect } from 'react';

const groups = [
  ['.menu-feature .coffee-photo', 'left', 0],
  ['.menu-teaser', 'right', 90],
  ['.pickup-intro>.eyebrow,.pickup-intro>h2', 'text', 60],
  ['.pickup-intro>p:not(.eyebrow):not(.image-note)', 'text', 100],
  ['.pickup-intro>img', 'media', 40],
  ['.pickup-order', 'right', 100],
  ['.about-layout>h2', 'left', 0],
  ['.about-layout>div>p', 'text', 80],
  ['.gallery-section .section-heading', 'text', 0],
  ['.gallery-layout>figure', 'media', 100],
  ['.questions-section>div:first-child', 'left', 0],
  ['.questions-list>details', 'text', 55],
  ['.visit-intro', 'left', 0],
  ['.visit-info', 'right', 100],
  ['.menu-page .menu-heading,.catalog-tools', 'text', 50],
  ['.catalog-dish', 'text', 65],
];

// Only JS prepares off-screen content. There is no global hidden-content CSS.
// Reduced motion uses a brief fade; normal mode also moves/staggers elements.
export function useMotion(page) {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const records = new Map();
    let observer;
    let mutations;
    let resizeFrame;
    let scrollFrame;

    function show(record) {
      record.state = 'visible';
      record.element.dataset.reveal = 'visible';
      observer?.unobserve(record.element);
      record.animation?.cancel();
      record.animation = null;
    }

    function reveal(record) {
      if (!record || record.state !== 'pending') return;
      record.state = 'running';
      record.element.dataset.reveal = 'running';
      record.animation.play();
      record.animation.finished.then(() => show(record)).catch(() => {});
    }

    function scan() {
      for (const [element, record] of records) {
        if (!element.isConnected) {
          observer.unobserve(element);
          record.animation?.cancel();
          records.delete(element);
        }
      }
      groups.forEach(([selector, kind, stagger]) => {
        document.querySelectorAll(selector).forEach((element, index) => {
          if (records.has(element)) return;
          const rect = element.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const record = {element, animation: null, state: 'visible'};
          records.set(element, record);
          // Never hide content that is already being read or focused.
          if (rect.top < innerHeight - 24 || element.contains(document.activeElement)) {
            show(record);
            return;
          }
          const reduced = preference.matches;
          const mobile = matchMedia('(max-width: 780px)').matches;
          const offsetX = mobile ? 0 : kind === 'left' ? -28 : kind === 'right' ? 28 : 0;
          const offsetY = kind === 'media' ? 38 : 26;
          const from = reduced
            ? {opacity: 0}
            : {opacity: 0, transform: `translate(${offsetX}px, ${offsetY}px)${kind === 'media' ? ' scale(.97)' : ''}`};
          const to = reduced ? {opacity: 1} : {opacity: 1, transform: 'translate(0, 0) scale(1)'};
          try {
            record.animation = element.animate([from, to], {
              duration: reduced ? 180 : 850,
              delay: reduced ? 0 : Math.min(180, stagger * (index % 3)),
              easing: reduced ? 'ease-out' : 'cubic-bezier(.18,.7,.2,1)',
              fill: 'both',
            });
            record.animation.pause();
            record.animation.currentTime = 0;
            record.animation.finished.catch(() => {});
            record.state = 'pending';
            element.dataset.reveal = 'pending';
            observer.observe(element);
          } catch {
            show(record);
          }
        });
      });
    }

    function stop() {
      observer?.disconnect();
      mutations?.disconnect();
      records.forEach(record => {
        record.animation?.cancel();
        record.element.removeAttribute('data-reveal');
      });
      records.clear();
    }

    function start() {
      stop();
      document.documentElement.dataset.motion = preference.matches ? 'reduced-fade' : 'full';
      if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) reveal(records.get(entry.target));
        });
      }, {threshold: 0.08, rootMargin: '0px 0px -48px 0px'});
      scan();
      // Filtered menu rows are new nodes; give them the same scroll treatment.
      mutations = new MutationObserver(scan);
      const main = document.querySelector('main');
      if (main) mutations.observe(main, {childList: true, subtree: true});
    }

    function focus(event) {
      records.forEach(record => {
        if (record.state !== 'visible' && record.element.contains(event.target)) show(record);
      });
    }
    function resize() {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => { if (observer) scan(); });
    }
    function scroll() {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = null;
        // A fast wheel/anchor jump may skip an observer intersection entirely.
        records.forEach(record => {
          if (record.state === 'pending' && record.element.getBoundingClientRect().bottom <= 0) show(record);
        });
      });
    }
    start();
    preference.addEventListener('change', start);
    document.addEventListener('focusin', focus);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', scroll, {passive: true});
    return () => {
      stop();
      cancelAnimationFrame(resizeFrame);
      cancelAnimationFrame(scrollFrame);
      preference.removeEventListener('change', start);
      document.removeEventListener('focusin', focus);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', scroll);
    };
  }, [page]);
}
