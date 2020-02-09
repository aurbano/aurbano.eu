$(document).ready(function() {
  function getCanvas(id) {
    var $canvas = $('canvas#' + id);
    var canvas = $canvas.get(0);

    canvas.height = $canvas.height();
    canvas.width = $canvas.width();

    return canvas;
  }

  try {
    var noiseCanvas = getCanvas('noise');
    var terrainCanvas = getCanvas('terrainBasic');

    var noiseCtx = noiseCanvas.getContext('2d');
    var terrainCtx = terrainCanvas.getContext('2d');

    var simplexNoise = new SimplexNoise();
    var noiseScale = 75;
    var shiftSpeed = 1;
    var offset = 0;

    var colorMap = [
      {
        max: 20,
        name: 'waterMax',
        color: '#0a90d8',
      },
      {
        max: 22,
        name: 'sandMax',
        color: '#cea244',
      },
      {
        max: 80,
        name: 'grassMax',
        color: '#59b513',
      },
      {
        max: 101,
        name: 'rockMax',
        color: '#393f3e',
      },
    ];

    function renderNoise(initX, initY, maxX, maxY, offsetX, offsetY) {
      for (var x = initX; x < maxX; x++) {
        for (var y = initY; y < maxY; y++) {
          // Get noise value scaled to [0, 255]
          var value = (simplexNoise.noise2D(
            (x + offsetX) / noiseScale,
            (y + offsetY) / noiseScale
          ) / 2 + 0.5) * 255;
          noiseCtx.fillStyle = 'rgb(' + value + ',' + value + ',' + value + ')';
          noiseCtx.fillRect(x, y, 1, 1);
        }
      }
    }

    function renderTerrain() {
      for (var x = 0; x < terrainCanvas.width; x++) {
        for (var y = 0; y < terrainCanvas.height; y++) {
          // Get noise value scaled to [0, 100]
          var value = (simplexNoise.noise2D(
            x / noiseScale,
            y / noiseScale
          ) / 2 + 0.5) * 100;
          var color = colorMap.find(eachColor => value <= eachColor.max);
          terrainCtx.fillStyle = color ? color.color : '#59b513'; // default to grass
          terrainCtx.fillRect(x, y, 1, 1);
        }
      }
    }

    function moveNoise() {
      // shift current content 1 to the left
      var imageData = noiseCtx.getImageData(shiftSpeed, 0, noiseCanvas.width - shiftSpeed, noiseCanvas.height);
      noiseCtx.putImageData(imageData, 0, 0);
      // render a new vertical slice of noise
      renderNoise(noiseCanvas.width - shiftSpeed, 0, noiseCanvas.width, noiseCanvas.height, offset, 0);
    }

    function nextFrame() {
      moveNoise();
      offset = offset + shiftSpeed;
      window.requestAnimationFrame(nextFrame);
    }

    // Update color map
    $('input.terrainSlider').change(function(event) {
      var color = colorMap.find(eachColor => eachColor.name === event.target.id);
      if (!color) {
        return;
      }
      color.max = event.target.value;
      renderTerrain();
    });

    // Start rendering

    renderNoise(0, 0, noiseCanvas.width, noiseCanvas.height, 0, 0);
    // start animation loop
    nextFrame();

    renderTerrain();
  } catch (e) {
    alert('Hey! Some of the code on this page failed to run! Maybe it has gotten too old... Drop me an issue on Github if you want me to look into it: https://github.com/aurbano/aurbano.eu');
    console.warn('Failed to render examples', e);
  }
});
