'use strict';
(() => {
  function mount(root, preferences = {}) {
    if (!root) return () => {};
    const slides = [...root.querySelectorAll('[data-slide]')];
    const dots = [...root.querySelectorAll('[data-slide-to]')];
    const toggle = root.querySelector('[data-autoplay]');
    const count = root.querySelector('[data-slide-count]');
    const stage = root.querySelector('[data-slide-stage]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const removers = [];
    let index = 0, timer = null, hovering = false, visible = true, destroyed = false;
    let paused = preferences.paused ?? reduced.matches;

    function on(target, event, callback) {
      target.addEventListener(event, callback);
      removers.push(() => target.removeEventListener(event, callback));
    }
    function stop() { if (timer !== null) window.clearTimeout(timer); timer = null; }
    function schedule() {
      stop();
      if (destroyed || paused || hovering || document.hidden || !visible || slides.length < 2) return;
      timer = window.setTimeout(() => { show(index + 1); schedule(); }, 7000);
    }
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.inert = !active;
      });
      dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
      count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }
    function setPaused(value) {
      paused = value;
      preferences.paused = value;
      toggle.setAttribute('aria-label', paused ? toggle.dataset.playLabel : toggle.dataset.pauseLabel);
      toggle.querySelector('[data-play-label]').textContent = paused ? toggle.dataset.playText : toggle.dataset.pauseText;
      toggle.querySelector('[data-play-icon]').textContent = paused ? '▶' : 'Ⅱ';
      stage.setAttribute('aria-live', paused ? 'polite' : 'off');
      schedule();
    }
    on(toggle, 'click', () => setPaused(!paused));
    root.querySelectorAll('[data-slide-step]').forEach(button => on(button, 'click', () => {
      setPaused(true); show(index + Number(button.dataset.slideStep));
    }));
    dots.forEach(button => on(button, 'click', () => { setPaused(true); show(Number(button.dataset.slideTo)); }));
    on(root, 'mouseenter', () => { hovering = true; schedule(); });
    on(root, 'mouseleave', () => { hovering = false; schedule(); });
    // Keyboard navigation stops rotation until the visitor explicitly restarts it.
    // Do not pause on pointer focus before a click: that would invert the play/pause action.
    on(root, 'focusin', event => { if (event.target.matches(':focus-visible')) setPaused(true); });
    on(document, 'visibilitychange', schedule);
    on(reduced, 'change', () => { if (reduced.matches) setPaused(true); });
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new window.IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { threshold: 0.1 });
      observer.observe(root);
    }
    show(0); setPaused(paused);
    return () => { destroyed = true; stop(); removers.forEach(remove => remove()); observer?.disconnect(); };
  }
  window.EASI_CAROUSEL = { mount };
})();
