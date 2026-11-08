// Matt Shoss — the small amount of script the page needs.
// Content is in the HTML and readable without any of this.

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Reveal once when an element enters the viewport. Never replays; never leaves content hidden.
  const targets = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    targets.forEach((el) => io.observe(el));
    window.addEventListener('load', () => setTimeout(() => {
      targets.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
    }, 2500));
    // anything still hidden after 6s regardless of position
    setTimeout(() => targets.forEach((el) => el.classList.add('is-in')), 6000);
  }

  // 2. The fixed photograph changes with the section in the middle of the screen; the nav follows.
  const stills = [...document.querySelectorAll('.still-img')];
  const caption = document.getElementById('still-caption');
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  const sections = [...document.querySelectorAll('[data-photo][id]')];
  let current = 'matt';

  function showPhoto(key, cap) {
    if (key === current) return;
    current = key;
    stills.forEach((img) => img.classList.toggle('is-on', img.dataset.photo === key));
    if (caption && cap) caption.textContent = cap;
  }
  function setCurrentNav(id) {
    navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + id));
  }

  if ('IntersectionObserver' in window && sections.length) {
    const mid = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        showPhoto(entry.target.dataset.photo, entry.target.dataset.caption);
        setCurrentNav(entry.target.id);
      }
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    sections.forEach((s) => mid.observe(s));

    // back at the top: the portrait and no current link
    const hero = document.getElementById('top');
    if (hero) {
      const topIo = new IntersectionObserver((entries) => {
        for (const entry of entries) if (entry.isIntersecting) { showPhoto('matt', 'Toronto, 2026'); setCurrentNav(''); }
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      topIo.observe(hero);
    }
  }

  // 4. Signature move fallback: the wordmark settles as the first screen leaves, where scroll timelines are unsupported.
  const mark = document.getElementById('wordmark');
  if (mark && !reduce && !CSS.supports('animation-timeline: scroll()')) {
    let ticking = false;
    const update = () => {
      const p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.6)));
      mark.style.transform = `scale(${1 - p * 0.06})`;
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  // 5. Watch: the thumbnail becomes the player in place; the title still opens YouTube.
  document.querySelectorAll('.video-link[data-video]').forEach((link) => {
    const frame = link.querySelector('.video-frame');
    if (!frame) return;
    frame.addEventListener('click', (e) => {
      if (link.classList.contains('is-playing')) return;
      e.preventDefault();
      const id = link.dataset.video;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
      iframe.title = link.querySelector('.video-title')?.textContent || 'Video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      frame.appendChild(iframe);
      link.classList.add('is-playing');
    });
  });

  // 6. Brand frame: a tap advances to the next name at once.
  const frame = document.getElementById('brand-frame');
  if (frame) {
    const slides = [...frame.querySelectorAll('.brand-slide')];
    let manual = -1;
    frame.addEventListener('click', () => {
      slides.forEach((s) => { s.style.animation = 'none'; s.style.opacity = '0'; s.style.visibility = 'hidden'; s.style.transform = 'none'; });
      manual = (manual + 1) % slides.length;
      slides[manual].style.opacity = '1'; slides[manual].style.visibility = 'visible';
    });
  }
})();
