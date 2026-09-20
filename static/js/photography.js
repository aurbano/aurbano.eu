(() => {
  const gallery = document.getElementById('photo-gallery');
  const viewer = document.getElementById('photo-viewer');
  if (!gallery || !viewer) return;

  const photos = Array.from(gallery.querySelectorAll('[data-photo-url]'));
  if (!photos.length) return;

  const closeButton = document.getElementById('photo-viewer-close');
  const previousButton = document.getElementById('photo-viewer-prev');
  const nextButton = document.getElementById('photo-viewer-next');
  const imageHost = document.getElementById('photo-viewer-image-host');
  const status = document.getElementById('photo-viewer-status');
  const counter = document.getElementById('photo-viewer-counter');
  let currentIndex = 0;
  let imageVersion = 0;
  let returnFocus = null;
  let returnHash = '';
  let scrollState = null;

  function decodeFilename(filename) {
    try {
      return decodeURIComponent(filename.replace(/\+/g, ' '));
    } catch {
      return filename;
    }
  }

  function updateUrl(hash, push = false) {
    const url = new URL(window.location.href);
    url.hash = hash;
    if (push) history.pushState(history.state, '', url);
    else history.replaceState(history.state, '', url);
  }

  function lockScroll() {
    scrollState = {
      x: window.scrollX,
      y: window.scrollY,
      overflow: document.documentElement.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollState.y}px`;
    document.body.style.width = '100%';
  }

  function unlockScroll() {
    if (!scrollState) return;
    document.documentElement.style.overflow = scrollState.overflow;
    document.body.style.position = scrollState.position;
    document.body.style.top = scrollState.top;
    document.body.style.width = scrollState.width;
    window.scrollTo({ left: scrollState.x, top: scrollState.y, behavior: 'instant' });
    scrollState = null;
  }

  function renderPhoto() {
    const photo = photos[currentIndex];
    const version = ++imageVersion;
    const image = new Image();
    image.alt = photo.dataset.photoLabel;
    image.className = 'photo-viewer-image';
    image.hidden = true;
    image.decoding = 'async';
    imageHost.replaceChildren(image);
    imageHost.setAttribute('aria-busy', 'true');
    status.hidden = false;
    status.textContent = 'Loading photograph…';
    counter.textContent = `${currentIndex + 1} / ${photos.length}`;

    image.onload = () => {
      if (version !== imageVersion) return;
      imageHost.setAttribute('aria-busy', 'false');
      status.hidden = true;
      status.textContent = '';
      image.hidden = false;
    };
    image.onerror = () => {
      if (version !== imageVersion) return;
      imageHost.setAttribute('aria-busy', 'false');
      image.remove();
      status.textContent = 'This photograph could not be loaded. Please try another photo or close the viewer and try again.';
    };
    image.src = photo.dataset.photoUrl;
  }

  function openPhoto(index, updateHash = true) {
    if (index < 0 || index >= photos.length) return;
    const wasOpen = viewer.open;
    if (!wasOpen) {
      returnFocus = gallery.contains(document.activeElement) ? document.activeElement : photos[index];
      returnHash = window.location.hash.startsWith('#photo-') ? '' : window.location.hash;
      lockScroll();
      viewer.showModal();
      closeButton.focus({ preventScroll: true });
    }
    currentIndex = index;
    renderPhoto();
    if (updateHash) {
      updateUrl(`#photo-${encodeURIComponent(decodeFilename(photos[index].dataset.photoFilename))}`, !wasOpen);
    }
  }

  function closeViewer(updateHash = true) {
    if (!viewer.open) return;
    ++imageVersion;
    viewer.close();
    imageHost.replaceChildren();
    status.textContent = '';
    unlockScroll();
    if (updateHash) updateUrl(returnHash);
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  }

  function navigate(direction) {
    openPhoto((currentIndex + direction + photos.length) % photos.length);
  }

  function syncHash() {
    const hash = window.location.hash;
    const filename = hash.startsWith('#photo-') ? decodeFilename(hash.slice(7)) : null;
    const index = filename === null ? -1 : photos.findIndex(photo => decodeFilename(photo.dataset.photoFilename) === filename);
    if (index >= 0) openPhoto(index, false);
    else closeViewer(false);
  }

  photos.forEach((photo, index) => photo.addEventListener('click', () => openPhoto(index)));
  previousButton.disabled = photos.length < 2;
  nextButton.disabled = photos.length < 2;
  previousButton.addEventListener('click', () => navigate(-1));
  nextButton.addEventListener('click', () => navigate(1));
  closeButton.addEventListener('click', () => closeViewer());
  viewer.addEventListener('cancel', event => {
    event.preventDefault();
    closeViewer();
  });
  viewer.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const first = closeButton;
      const last = nextButton.disabled ? closeButton : nextButton;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      if (photos.length > 1) navigate(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  window.addEventListener('hashchange', syncHash);
  syncHash();
})();
