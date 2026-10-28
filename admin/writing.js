// Behaviours for the writing canvas (styles live in writing.css):
// - details sidebar toggle (button + Cmd/Ctrl+\), remembered across visits
// - placeholders; title/standfirst stay single-line, Enter moves down the page
// - live word count
// Sveltia re-renders freely and owns its DOM, so nothing here is inserted into
// its tree: the controls are fixed-position siblings on <body>, kept in sync
// through event delegation and a MutationObserver.
(() => {
  const PANE = '.content-editor .pane[data-mode="edit"]';
  const COLLAPSED_CLASS = 'writing-details-collapsed';
  const STORAGE_KEY = 'writing-details-collapsed';
  const PLACEHOLDERS = {
    title: 'Title',
    description: 'A line or two to draw the reader in',
  };
  const NEXT = { title: 'description', description: 'body' };
  const MAIN_FIELDS = ['title', 'description', 'body'];
  const WORDS_PER_MINUTE = 230;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

  const root = document.documentElement;
  const fieldOf = (el) => el.closest?.(`${PANE} section.field`)?.dataset.keyPath;

  // ── Details sidebar ──────────────────────────────────────────────────────

  const setCollapsed = (collapsed) => {
    root.classList.toggle(COLLAPSED_CLASS, collapsed);
    localStorage.setItem(STORAGE_KEY, String(collapsed));
    refresh();
  };

  root.classList.toggle(COLLAPSED_CLASS, localStorage.getItem(STORAGE_KEY) === 'true');

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'writing-details-toggle';
  toggle.addEventListener('click', () => setCollapsed(!root.classList.contains(COLLAPSED_CLASS)));

  const ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
    '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M14.5 4.5v15"/></svg>';
  const SHORTCUT = isMac ? '⌘\\' : 'Ctrl+\\';

  const renderToggle = () => {
    const collapsed = root.classList.contains(COLLAPSED_CLASS);
    if (toggle.dataset.collapsed === String(collapsed)) return;
    const label = collapsed ? 'Details' : 'Hide details';
    toggle.dataset.collapsed = String(collapsed);
    toggle.innerHTML = `${ICON}<span>${label}</span><kbd>${SHORTCUT}</kbd>`;
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.title = `${label} (${SHORTCUT})`;
  };

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== '\\' || !(isMac ? event.metaKey : event.ctrlKey)) return;
      if (!document.querySelector(PANE)) return;
      event.preventDefault();
      setCollapsed(!root.classList.contains(COLLAPSED_CLASS));
    },
    true,
  );

  // ── Title and standfirst ─────────────────────────────────────────────────

  const focusField = (keyPath) => {
    const section = document.querySelector(`${PANE} section[data-key-path="${keyPath}"]`);
    const target = section?.querySelector('.lexical-root, textarea:not([hidden]), input');
    if (!target) return;
    target.focus();
    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      target.setSelectionRange(target.value.length, target.value.length);
    }
  };

  // They're textareas so long lines wrap, but must stay one line in front
  // matter: Enter moves on, pasted newlines become spaces.
  document.addEventListener(
    'keydown',
    (event) => {
      const key = fieldOf(event.target);
      if (event.key !== 'Enter' || !(key in NEXT) || event.isComposing) return;
      event.preventDefault();
      focusField(NEXT[key]);
    },
    true,
  );

  document.addEventListener(
    'paste',
    (event) => {
      if (!(fieldOf(event.target) in NEXT)) return;
      const text = event.clipboardData?.getData('text/plain') ?? '';
      if (!/[\r\n]/.test(text)) return;
      event.preventDefault();
      document.execCommand('insertText', false, text.replace(/\s*[\r\n]+\s*/g, ' '));
    },
    true,
  );

  const prepareFields = (pane) => {
    for (const [keyPath, text] of Object.entries(PLACEHOLDERS)) {
      const field = pane.querySelector(`section[data-key-path="${keyPath}"] textarea`);
      if (!field) continue;
      if (field.placeholder !== text) field.placeholder = text;
      if (field.rows !== 1) field.rows = 1;
    }
  };

  // ── Word count ───────────────────────────────────────────────────────────

  const counter = document.createElement('div');
  counter.className = 'writing-word-count';

  const renderCount = (pane) => {
    const body = pane.querySelector('section[data-key-path="body"]');
    const markdown = body?.querySelector('.text-area:not([hidden]) textarea');
    const text = markdown ? markdown.value : (body?.querySelector('.lexical-root')?.innerText ?? '');
    const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0;
    const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
    const label = `${words.toLocaleString()} ${words === 1 ? 'word' : 'words'} · ${minutes} min read`;
    if (counter.textContent !== label) counter.textContent = label;
  };

  // ── Sync ─────────────────────────────────────────────────────────────────

  const place = (el, styles) => {
    for (const [prop, value] of Object.entries(styles)) {
      if (el.style[prop] !== value) el.style[prop] = value;
    }
  };

  // Writes are guarded so the body observer doesn't re-trigger us forever.
  const sync = () => {
    const pane = document.querySelector(PANE);
    if (!pane) {
      toggle.remove();
      counter.remove();
      return;
    }

    // A detail field failing validation shouldn't stay hidden.
    const invalidDetail = [...pane.querySelectorAll('section.field')].some(
      (section) => !MAIN_FIELDS.includes(section.dataset.keyPath) && section.querySelector('[aria-invalid="true"]'),
    );
    if (invalidDetail && root.classList.contains(COLLAPSED_CLASS)) setCollapsed(false);

    prepareFields(pane);
    renderToggle();
    renderCount(pane);

    // Both pin to the scroll container (minus its scrollbar): the toggle to
    // the top-right, inside the sidebar panel; the count to the bottom-right
    // of the page column, i.e. left of the sidebar when it's open beside it.
    const scroller = pane.querySelector('#first-pane-body > .content') ?? pane;
    const rect = scroller.getBoundingClientRect();
    const innerRight = rect.left + scroller.clientLeft + scroller.clientWidth;
    const body = pane.querySelector('section[data-key-path="body"]')?.getBoundingClientRect();
    const sidebar = pane.querySelector('section[data-key-path="body"] + section.field')?.getBoundingClientRect();
    const pageRight = body && sidebar?.width && sidebar.left >= body.right ? sidebar.left : innerRight;
    place(toggle, {
      top: `${Math.round(rect.top + 16)}px`,
      right: `${Math.round(window.innerWidth - innerRight + 16)}px`,
    });
    place(counter, {
      bottom: `${Math.round(window.innerHeight - rect.bottom + 16)}px`,
      right: `${Math.round(window.innerWidth - pageRight + 20)}px`,
    });
    if (!toggle.isConnected) document.body.append(toggle);
    if (!counter.isConnected) document.body.append(counter);
  };

  let queued = false;
  function refresh() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      sync();
    });
  }

  document.addEventListener('input', refresh, true);
  window.addEventListener('resize', refresh);
  new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true });
})();
