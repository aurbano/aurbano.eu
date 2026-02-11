function initMasonryGallery() {
  var grids = document.querySelectorAll('.masonry-grid');
  var masonryInstances = [];

  grids.forEach(function(grid) {
    // Check if this is a packed grid (uniform width for maximum packing)
    var isPacked = grid.classList.contains('masonry-packed');

    // Add a column-width sizer element so Masonry can calculate positions
    // based on CSS-driven widths at every breakpoint
    var sizer = document.createElement('div');
    sizer.className = 'masonry-sizer masonry-width-1';
    grid.insertBefore(sizer, grid.firstChild);

    // Get all image items (not description cells)
    var imageItems = grid.querySelectorAll('.masonry-item:not(.masonry-description)');

    // Wait for images to load to get their dimensions
    imagesLoaded(grid, function() {
      imageItems.forEach(function(item) {
        var img = item.querySelector('img');
        if (!img) return;

        var width = 1;

        if (!isPacked) {
          // Event list page: landscape photos double width
          var aspectRatio = img.naturalWidth / img.naturalHeight;
          var isLandscape = aspectRatio > 1.0;
          width = isLandscape ? 2 : 1;
        }
        // Packed mode: all items same width (default width-1)

        // Remove existing width classes
        item.classList.remove('masonry-width-1', 'masonry-width-2', 'masonry-width-3');
        // Add new width class — CSS media queries handle the actual percentage
        item.classList.add('masonry-width-' + width);

        // Remove fixed aspect ratio to let image determine height
        item.style.aspectRatio = '';
      });

      // Initialize Masonry using the sizer for columnWidth
      var msnry = new Masonry(grid, {
        itemSelector: '.masonry-item',
        columnWidth: '.masonry-sizer',
        percentPosition: true,
        transitionDuration: '0.3s'
      });

      masonryInstances.push(msnry);
    });
  });

  // Re-layout on resize (orientation change, window resize)
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      masonryInstances.forEach(function(msnry) {
        msnry.layout();
      });
    }, 150);
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMasonryGallery);
} else {
  initMasonryGallery();
}
