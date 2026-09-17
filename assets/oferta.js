(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const videoPlay = document.querySelector('[data-video-play]');
  videoPlay?.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/gFFzCE0N69U?rel=0&autoplay=1';
    frame.title = 'Vídeo de apresentação da Comunidade Psi Viral Pro';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    videoPlay.replaceWith(frame);
    frame.focus();
  });
  const menu = document.querySelector('[data-menu]');
  const nav = document.querySelector('#offer-navigation');
  const closeMenu = () => {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('is-open');
  };
  if (menu && nav) {
    menu.hidden = false;
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', open);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menu.focus();
      }
    });
    window.matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);
  }

  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        if (!motion.matches) target.classList.add('is-visible');
        reveals.unobserve(target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section:not(.presentation) .section-head,.card,.timeline li,.faq details,.cta-panel').forEach((element) => {
      element.classList.add('reveal');
      if (element.parentElement.matches('.grid-4,.grid-3,.grid-2,.timeline')) {
        const index = Array.from(element.parentElement.children).indexOf(element);
        element.style.setProperty('--reveal-delay', `${Math.min(index * 65, 195)}ms`);
      }
      reveals.observe(element);
    });
  }

  const progress = document.querySelector('[data-progress]');
  const sticky = document.querySelector('[data-mobile-enroll]');
  const purchase = document.querySelector('#inscricao');
  const finalCta = document.querySelector('.cta-panel');
  const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = navLinks.map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) })).filter(({ section }) => section);
  const visible = (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 84;
  };
  let queued = false;
  const updateScroll = () => {
    queued = false;
    // Read geometry before changing styles, visibility or navigation attributes.
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;
    const showSticky = window.innerWidth <= 700 && purchase && purchase.getBoundingClientRect().bottom <= 84 && !visible(finalCta);
    let current = null;
    sections.forEach((entry) => { if (entry.section.getBoundingClientRect().top <= 150) current = entry; });
    if (progress) progress.style.transform = `scaleX(${scrollProgress})`;
    // Keep an actively focused checkout link available until focus leaves it.
    if (sticky && (showSticky || !sticky.contains(document.activeElement))) sticky.hidden = !showSticky;
    sections.forEach(({ link }) => {
      if (link === current?.link) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  const scheduleScroll = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(updateScroll);
  };
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll);
  window.addEventListener('load', scheduleScroll, { once: true });
  sticky?.addEventListener('focusout', scheduleScroll);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleScroll).observe(document.body);
  // Let the mobile page paint before measuring sections for scroll controls.
  if (window.matchMedia('(max-width: 700px)').matches) {
    window.requestAnimationFrame(() => window.requestAnimationFrame(scheduleScroll));
  } else {
    scheduleScroll();
  }
})();
