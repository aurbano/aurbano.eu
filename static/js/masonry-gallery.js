function initMasonryGallery() {
  const grids = document.querySelectorAll('.masonry-grid');

  grids.forEach(function(grid) {
    // Get all image items (not description cells)
    const imageItems = grid.querySelectorAll('.masonry-item:not(.masonry-description)');

    // Wait for images to load to get their dimensions
    imagesLoaded(grid, function() {
      imageItems.forEach(function(item) {
        const img = item.querySelector('img');
        if (!img) return;

        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const isPortrait = aspectRatio < 0.85;
        const isLandscape = aspectRatio > 1.3;

        // Random chance to make images larger (15% chance)
        const random = Math.random();
        const makeLarger = random < 0.15;
        const makeVeryLarge = random < 0.05;

        // Assign width based on orientation and randomness
        let width = 1; // default: 20% width

        if (isPortrait) {
          // Portrait: usually 1 column, rarely 2
          width = makeLarger ? 2 : 1;
        } else if (isLandscape) {
          // Landscape: usually 2 columns, sometimes 3 for very wide
          if (makeVeryLarge && aspectRatio > 1.8) {
            width = 3;
          } else if (makeLarger) {
            width = 2;
          } else {
            width = 1;
          }
        } else {
          // Square-ish: usually 1 column, rarely 2
          width = makeLarger ? 2 : 1;
        }

        // Remove existing width classes
        item.classList.remove('masonry-width-1', 'masonry-width-2', 'masonry-width-3');
        // Add new width class
        item.classList.add('masonry-width-' + width);

        // Remove fixed aspect ratio to let image determine height
        item.style.aspectRatio = '';
      });

      // Initialize Masonry after sizing
      new Masonry(grid, {
        itemSelector: '.masonry-item',
        percentPosition: true,
        transitionDuration: '0.3s'
      });
    });
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMasonryGallery);
} else {
  initMasonryGallery();
}
