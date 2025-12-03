function initMasonryGallery() {
  const grids = document.querySelectorAll('.masonry-grid');

  grids.forEach(function(grid) {
    // Check if this is a packed grid (uniform width for maximum packing)
    const isPacked = grid.classList.contains('masonry-packed');

    // Get all image items (not description cells)
    const imageItems = grid.querySelectorAll('.masonry-item:not(.masonry-description)');

    // Wait for images to load to get their dimensions
    imagesLoaded(grid, function() {
      imageItems.forEach(function(item) {
        const img = item.querySelector('img');
        if (!img) return;

        let width = 1;
        let widthPercent = '20%';

        if (!isPacked) {
          // Event list page: landscape photos double width
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          const isLandscape = aspectRatio > 1.0;
          width = isLandscape ? 2 : 1;
          widthPercent = width === 2 ? '40%' : '20%';
        }
        // Packed mode: all items same width (default 20%)

        // Remove existing width classes
        item.classList.remove('masonry-width-1', 'masonry-width-2', 'masonry-width-3');
        // Add new width class
        item.classList.add('masonry-width-' + width);

        // Also set inline style to ensure it takes effect
        item.style.width = widthPercent;

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
