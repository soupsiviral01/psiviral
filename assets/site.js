(() => {
  const menuButton = document.querySelector('[data-menu]');
  const navigation = document.querySelector('.site-nav');
  const setMenu = (expanded) => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', String(expanded));
    menuButton.setAttribute('aria-label', expanded ? 'Fechar menu' : 'Abrir menu');
    navigation.classList.toggle('is-open', expanded);
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navigation?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });

  const cards = [...document.querySelectorAll('[data-card]:not(.product-disabled)')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const search = document.querySelector('#catalog-search');
  const emptyState = document.querySelector('[data-empty]');
  const resultCount = document.querySelector('[data-count]');
  const savedCount = document.querySelector('[data-saved-count]');
  const toast = document.querySelector('[data-toast]');
  let activeFilter = 'all';
  let toastTimer;
  let saved = new Set();
  const identifiers = new Set(cards.map((card) => card.dataset.card));
  try {
    const stored = JSON.parse(localStorage.getItem('psiflix-list') || '[]');
    if (Array.isArray(stored)) saved = new Set(stored.filter((value) => identifiers.has(value)));
  } catch {}
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const updateCatalog = (resetScroll = true) => {
    const query = normalize(search?.value.trim() || '');
    let count = 0;
    cards.forEach((card) => {
      const matchesFilter = activeFilter === 'all' || (activeFilter === 'saved' ? saved.has(card.dataset.card) : card.dataset.category === activeFilter);
      const visible = matchesFilter && normalize(`${card.dataset.search || ''} ${card.textContent}`).includes(query);
      card.hidden = !visible;
      if (visible) count += 1;
    });
    if (emptyState) {
      emptyState.hidden = count !== 0;
      emptyState.textContent = activeFilter === 'saved' && !query ? 'Sua lista começa aqui. Use o botão + ao lado dos títulos para salvar o que quer assistir.' : 'Nenhum conteúdo encontrado. Experimente outro termo ou filtro.';
    }
    if (resultCount) resultCount.textContent = `${String(count).padStart(2, '0')} ${count === 1 ? 'conteúdo disponível' : 'conteúdos disponíveis'}`;
    if (savedCount) savedCount.textContent = String(saved.size);
    const catalog = document.querySelector('#catalog-cards');
    if (catalog && resetScroll) catalog.scrollLeft = 0;
    filters.forEach((filter) => filter.setAttribute('aria-pressed', String(filter.dataset.filter === activeFilter)));
  };
  const announce = (message) => {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toastTimer = setTimeout(() => { toast.textContent = ''; }, 3000);
  };
  const updateSaveButton = (button) => {
    const selected = saved.has(button.dataset.save);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? 'Remover' : 'Salvar'} ${button.dataset.title} ${selected ? 'da' : 'na'} minha lista`);
  };
  document.querySelectorAll('[data-save]').forEach((button) => {
    button.hidden = false;
    updateSaveButton(button);
    button.addEventListener('click', () => {
      const identifier = button.dataset.save;
      if (saved.has(identifier)) saved.delete(identifier);
      else saved.add(identifier);
      let persisted = true;
      try { localStorage.setItem('psiflix-list', JSON.stringify([...saved])); } catch { persisted = false; }
      updateSaveButton(button);
      updateCatalog();
      if (button.closest('[data-card]')?.hidden) {
        document.querySelector('[data-filter="saved"]')?.focus();
      }
      announce(saved.has(identifier) ? (persisted ? 'Adicionado à sua lista.' : 'Adicionado à lista desta sessão.') : 'Removido da sua lista.');
    });
  });
  document.querySelectorAll('[data-catalog-controls]').forEach((element) => { element.hidden = false; });
  filters.forEach((filter) => filter.addEventListener('click', () => {
    activeFilter = filter.dataset.filter;
    updateCatalog();
  }));
  search?.addEventListener('input', updateCatalog);
  document.querySelector('[data-search-trigger]')?.addEventListener('click', () => {
    document.querySelector('#aulas')?.scrollIntoView();
    search?.focus({ preventScroll: true });
  });
  document.querySelectorAll('[data-open-catalog]').forEach((link) => link.addEventListener('click', () => {
    activeFilter = 'all';
    if (search) search.value = '';
    updateCatalog();
  }));
  document.querySelectorAll('[data-open-list]').forEach((link) => link.addEventListener('click', () => {
    activeFilter = 'saved';
    if (search) search.value = '';
    updateCatalog();
  }));
  // The mobile carousel starts at zero; avoid forcing its layout before first paint.
  if (cards.length) updateCatalog(!window.matchMedia('(max-width: 700px)').matches);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }
  document.querySelector('[data-video]')?.addEventListener('click', (event) => {
    event.preventDefault();
    const link = event.currentTarget;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${link.dataset.video}?autoplay=1&rel=0`;
    frame.title = 'Vídeo de apresentação da Comunidade Psi Viral Pro';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    link.replaceWith(frame);
    frame.focus();
  });
})();
