/**
 * Einstein "Hat" Tile Background with T(a,b) Continuum Animation
 * 
 * Based on the substitution algorithm from:
 * https://github.com/asmoly/Einstein_Tile_Generator
 * 
 * Implements the aperiodic monotile discovered in 2023 by Smith, Myers, Kaplan, and Goodman-Strauss.
 * 
 * The T(a,b) continuum animation is based on Craig Kaplan's official implementation:
 * https://cs.uwaterloo.ca/~csk/hat/
 * 
 * The hat tile is one member of a continuous family of aperiodic tiles parameterized by
 * two edge lengths 'a' and 'b'. By varying the ratio a:b, we can smoothly transition between:
 *   - Chevrons (a=0)
 *   - Hats (a=1, b=√3) - the classic shape
 *   - Equilateral (a=b)
 *   - Turtles (a=√3, b=1)
 *   - Comets (b=0)
 */

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================
  
  const CONFIG = {
    // T(a,b) Continuum animation - morphs between hat family shapes
    continuumSpeed: 0.00015,      // How fast to morph through shapes (faster)
    continuumCenter: 0.366,       // Center point (≈0.366 = classic hat where a=1, b=√3)
    continuumAmplitude: 0.25,     // How far to morph from center (0.25 spans chevron to turtle range)
    
    // Scale breathing animation
    scaleSpeed: 0.00012,          // Scale breathing speed
    scaleAmplitude: 0.015,        // Scale variation (±1.5% - much subtler)
    
    // Visual style
    strokeWidth: 0.6,
    strokeBaseOpacity: 0.12,      // Minimum stroke opacity (always visible) - homepage
    strokeBaseOpacityInner: 0.03, // Lower stroke opacity for inner pages
    
    // Tiling
    baseScale: 14,
    levels: 5,
    mobileBreakpoint: 768,
  };
  
  // Tile colors by type - greens, oranges, and yellows for better contrast
  const TILE_COLORS = {
    'H1': { r: 76,  g: 140, b: 76  },   // Forest green (reflected - special tile)
    'H':  { r: 255, g: 167, b: 64  },   // Warm orange
    'T':  { r: 144, g: 190, b: 109 },   // Sage green
    'P':  { r: 255, g: 215, b: 90  },   // Golden yellow
    'F':  { r: 200, g: 220, b: 140 }    // Light olive/lime
  };

  // ============================================================
  // GEOMETRY UTILITIES
  // ============================================================
  
  const PI = Math.PI;
  const SQRT3 = Math.sqrt(3);
  const SQRT3_2 = SQRT3 / 2; // sqrt(3)/2 ≈ 0.866
  
  // Hex coordinate y-axis in cartesian
  const HEX_Y = { x: 0.5, y: SQRT3_2 };
  
  // Identity matrix [a, b, tx, c, d, ty]
  const IDENTITY = [1, 0, 0, 0, 1, 0];
  
  // Convert hex coordinates to cartesian
  function hexToCart(hx, hy) {
    return { x: hx + HEX_Y.x * hy, y: HEX_Y.y * hy };
  }
  
  // Vector operations
  function vecAdd(p, q) { return { x: p.x + q.x, y: p.y + q.y }; }
  function vecSub(p, q) { return { x: p.x - q.x, y: p.y - q.y }; }
  
  // Matrix operations (affine 2D: [a, b, tx, c, d, ty])
  function matMul(A, B) {
    return [
      A[0]*B[0] + A[1]*B[3], A[0]*B[1] + A[1]*B[4], A[0]*B[2] + A[1]*B[5] + A[2],
      A[3]*B[0] + A[4]*B[3], A[3]*B[1] + A[4]*B[4], A[3]*B[2] + A[4]*B[5] + A[5]
    ];
  }
  
  function matVecMul(M, P) {
    return { x: M[0]*P.x + M[1]*P.y + M[2], y: M[3]*P.x + M[4]*P.y + M[5] };
  }
  
  function invertMat(mat) {
    const det = mat[0]*mat[4] - mat[1]*mat[3];
    return [
      mat[4]/det, -mat[1]/det, (mat[1]*mat[5] - mat[2]*mat[4])/det,
      -mat[3]/det, mat[0]/det, (mat[2]*mat[3] - mat[0]*mat[5])/det
    ];
  }
  
  function getRotMat(angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return [c, -s, 0, s, c, 0];
  }
  
  function getTranslMat(tx, ty) {
    return [1, 0, tx, 0, 1, ty];
  }
  
  function getRotMatAboutPoint(p, angle) {
    return matMul(getTranslMat(p.x, p.y), matMul(getRotMat(angle), getTranslMat(-p.x, -p.y)));
  }
  
  function matchSegment(p, q) {
    return [q.x - p.x, p.y - q.y, p.x, q.y - p.y, q.x - p.x, p.y];
  }
  
  function matchShapes(p1, q1, p2, q2) {
    return matMul(matchSegment(p2, q2), invertMat(matchSegment(p1, q1)));
  }
  
  function getIntersectPoint(p1, q1, p2, q2) {
    const d = (q2.y - p2.y)*(q1.x - p1.x) - (q2.x - p2.x)*(q1.y - p1.y);
    const uA = ((q2.x - p2.x)*(p1.y - p2.y) - (q2.y - p2.y)*(p1.x - p2.x)) / d;
    return { x: p1.x + uA*(q1.x - p1.x), y: p1.y + uA*(q1.y - p1.y) };
  }

  // ============================================================
  // AB COORDINATE SYSTEM FOR T(a,b) CONTINUUM
  // ============================================================
  // 
  // The T(a,b) family of tiles has edges with two different lengths: 'a' and 'b'.
  // We store coordinates as linear combinations: value = coefA * a + coefB * b
  // This allows us to evaluate the actual position at render time with any a,b values.
  
  /**
   * Create an AB coordinate (stores coefficients for a and b)
   * @param {number} coefA - Coefficient for edge length 'a'
   * @param {number} coefB - Coefficient for edge length 'b'
   * @returns {{a: number, b: number}} AB coordinate
   */
  function makeAB(coefA, coefB) {
    return { a: coefA, b: coefB };
  }
  
  /**
   * Add two AB coordinates
   */
  function addAB(ab1, ab2) {
    return makeAB(ab1.a + ab2.a, ab1.b + ab2.b);
  }
  
  /**
   * Subtract two AB coordinates
   */
  function subAB(ab1, ab2) {
    return makeAB(ab1.a - ab2.a, ab1.b - ab2.b);
  }
  
  /**
   * Scale an AB coordinate by a scalar
   */
  function scaleAB(ab, scalar) {
    return makeAB(ab.a * scalar, ab.b * scalar);
  }
  
  /**
   * Evaluate an AB coordinate with actual a and b values
   * @param {{a: number, b: number}} ab - AB coordinate
   * @param {number} a - Value for edge length 'a'
   * @param {number} b - Value for edge length 'b'
   * @returns {number} Evaluated coordinate
   */
  function evalAB(ab, a, b) {
    return a * ab.a + b * ab.b;
  }
  
  /**
   * Create an AB point (x and y are both AB coordinates)
   */
  function makeABPoint(xAB, yAB) {
    return { x: xAB, y: yAB };
  }
  
  /**
   * Add two AB points
   */
  function addABPoint(p1, p2) {
    return makeABPoint(addAB(p1.x, p2.x), addAB(p1.y, p2.y));
  }
  
  /**
   * Evaluate an AB point to cartesian coordinates
   */
  function evalABPoint(abPoint, a, b) {
    return {
      x: evalAB(abPoint.x, a, b),
      y: evalAB(abPoint.y, a, b)
    };
  }
  
  /**
   * Compute the best-fit affine transform that maps points in 'from' to points in 'to'.
   * Uses least-squares fitting for the 6 affine parameters.
   * 
   * This is used to compute a correction transform that maps the current parameterized
   * outline back to the reference outline, ensuring tiles fit together correctly.
   * 
   * @param {Array} from - Source points [{x, y}, ...]
   * @param {Array} to - Target points [{x, y}, ...]
   * @returns {Array} Affine transform [a, b, tx, c, d, ty]
   */
  function computeBestFitAffine(from, to) {
    const n = from.length;
    
    // We solve two independent systems:
    // For x': sum of (a*x + b*y + tx - x')^2 -> minimize
    // For y': sum of (c*x + d*y + ty - y')^2 -> minimize
    
    // Build normal equations for [a, b, tx] and [c, d, ty]
    let sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0, sumXY = 0;
    let sumXx = 0, sumYx = 0, sumXprime = 0;
    let sumXy = 0, sumYy = 0, sumYprime = 0;
    
    for (let i = 0; i < n; i++) {
      const fx = from[i].x, fy = from[i].y;
      const tx = to[i].x, ty = to[i].y;
      
      sumX += fx;
      sumY += fy;
      sumX2 += fx * fx;
      sumY2 += fy * fy;
      sumXY += fx * fy;
      
      sumXx += fx * tx;
      sumYx += fy * tx;
      sumXprime += tx;
      
      sumXy += fx * ty;
      sumYy += fy * ty;
      sumYprime += ty;
    }
    
    // Solve 3x3 system for [a, b, tx]: A * [a,b,tx]^T = B
    // | sumX2  sumXY  sumX  |   | a  |   | sumXx    |
    // | sumXY  sumY2  sumY  | * | b  | = | sumYx    |
    // | sumX   sumY   n     |   | tx |   | sumXprime|
    
    // Using Cramer's rule or direct solve
    const det = sumX2 * (sumY2 * n - sumY * sumY) 
              - sumXY * (sumXY * n - sumY * sumX) 
              + sumX * (sumXY * sumY - sumY2 * sumX);
    
    if (Math.abs(det) < 1e-10) {
      // Degenerate case, return identity
      return [1, 0, 0, 0, 1, 0];
    }
    
    // Solve for a, b, tx (x-component transform)
    const a = (sumXx * (sumY2 * n - sumY * sumY) 
             - sumXY * (sumYx * n - sumY * sumXprime) 
             + sumX * (sumYx * sumY - sumY2 * sumXprime)) / det;
    
    const b = (sumX2 * (sumYx * n - sumY * sumXprime) 
             - sumXx * (sumXY * n - sumY * sumX) 
             + sumX * (sumXY * sumXprime - sumYx * sumX)) / det;
    
    const tx = (sumX2 * (sumY2 * sumXprime - sumY * sumYx) 
              - sumXY * (sumXY * sumXprime - sumY * sumXx) 
              + sumXx * (sumXY * sumY - sumY2 * sumX)) / det;
    
    // Solve for c, d, ty (y-component transform)
    const c = (sumXy * (sumY2 * n - sumY * sumY) 
             - sumXY * (sumYy * n - sumY * sumYprime) 
             + sumX * (sumYy * sumY - sumY2 * sumYprime)) / det;
    
    const d = (sumX2 * (sumYy * n - sumY * sumYprime) 
             - sumXy * (sumXY * n - sumY * sumX) 
             + sumX * (sumXY * sumYprime - sumYy * sumX)) / det;
    
    const ty = (sumX2 * (sumY2 * sumYprime - sumY * sumYy) 
              - sumXY * (sumXY * sumYprime - sumY * sumXy) 
              + sumXy * (sumXY * sumY - sumY2 * sumX)) / det;
    
    return [a, b, tx, c, d, ty];
  }

  // ============================================================
  // PARAMETERIZED HAT TILE OUTLINE
  // ============================================================
  
  /**
   * Edge sequence defining the hat tile.
   * Each edge has:
   *   - type: 'a' or 'b' (which edge length parameter it uses)
   *   - direction: 0-11 (multiples of 30 degrees)
   * 
   * This is from Craig Kaplan's official implementation.
   */
  const EDGE_SEQUENCE = [
    ['a', 0],   // Edge 0: type 'a', direction 0° (east)
    ['a', 2],   // Edge 1: type 'a', direction 60° 
    ['b', 11],  // Edge 2: type 'b', direction 330°
    ['b', 1],   // Edge 3: type 'b', direction 30°
    ['a', 4],   // Edge 4: type 'a', direction 120°
    ['a', 2],   // Edge 5: type 'a', direction 60°
    ['b', 5],   // Edge 6: type 'b', direction 150°
    ['b', 3],   // Edge 7: type 'b', direction 90° (north)
    ['a', 6],   // Edge 8: type 'a', direction 180° (west)
    ['a', 8],   // Edge 9: type 'a', direction 240°
    ['a', 8],   // Edge 10: type 'a', direction 240°
    ['a', 10],  // Edge 11: type 'a', direction 300°
    ['b', 7]    // Edge 12: type 'b', direction 210°
  ];
  
  /**
   * 12 unit direction vectors at 30° intervals (0°, 30°, 60°, ..., 330°)
   * Direction i points at angle i * 30°
   */
  const DIRECTIONS = (function() {
    const dirs = [];
    for (let i = 0; i < 12; i++) {
      const angle = i * PI / 6; // i * 30° in radians
      dirs.push({
        x: Math.cos(angle),
        y: Math.sin(angle)
      });
    }
    return dirs;
  })();
  
  /**
   * Build the hat outline in AB coordinate form.
   * Returns an array of 13 vertices where each vertex has x and y as AB coordinates.
   * This allows us to evaluate the outline with any a,b values at render time.
   */
  function buildHatOutlineAB() {
    // Start at origin (0, 0) in AB form
    let currentX = makeAB(0, 0);
    let currentY = makeAB(0, 0);
    
    const vertices = [makeABPoint(currentX, currentY)];
    
    // Walk along each edge, accumulating position
    for (const [edgeType, dirIndex] of EDGE_SEQUENCE) {
      const dir = DIRECTIONS[dirIndex];
      
      if (edgeType === 'a') {
        // This edge uses length 'a': add dir * a
        currentX = addAB(currentX, makeAB(dir.x, 0));
        currentY = addAB(currentY, makeAB(dir.y, 0));
      } else {
        // This edge uses length 'b': add dir * b
        currentX = addAB(currentX, makeAB(0, dir.x));
        currentY = addAB(currentY, makeAB(0, dir.y));
      }
      
      vertices.push(makeABPoint(currentX, currentY));
    }
    
    // Return 13 vertices (the last vertex should be back at origin for a closed shape)
    // We return only the first 13 (the 14th would be the origin again)
    return vertices.slice(0, 13);
  }
  
  /**
   * Evaluate the AB outline to cartesian coordinates using current a,b values.
   * @param {Array} outlineAB - Array of AB points
   * @param {number} a - Current value for edge length 'a'
   * @param {number} b - Current value for edge length 'b'
   * @returns {Array} Array of cartesian points {x, y}
   */
  function evaluateOutline(outlineAB, a, b) {
    return outlineAB.map(abPoint => evalABPoint(abPoint, a, b));
  }
  
  /**
   * Calculate the continuum parameter t from a and b values.
   * t = a / (a + b), ranges from 0 to 1
   * 
   * Named shapes on the continuum:
   *   t = 0.00  → Chevrons (a=0)
   *   t ≈ 0.366 → Hats (a=1, b=√3) - the classic shape
   *   t = 0.50  → Equilateral (a=b)
   *   t ≈ 0.634 → Turtles (a=√3, b=1)
   *   t = 1.00  → Comets (b=0)
   */
  function getABFromT(t) {
    // The total scale factor (1 + √3) preserves reasonable tile sizes
    const alpha = 1 + SQRT3;
    return {
      a: alpha * t,
      b: alpha * (1 - t)
    };
  }
  
  /**
   * HAT_OUTLINE_AB: The hat outline in AB form derived from the hex outline.
   * 
   * The hex outline edges (at a=1, b=√3) have lengths:
   * [b, a, 2a, a, b, b, a, a, b, b, a, a, b]
   * 
   * Each edge can be expressed in AB form by its length coefficient and direction.
   */
  
  // Classic hat outline using hex-coordinate definition
  // This is used for tiling computation
  const HAT_OUTLINE = [
    hexToCart(0, 0), hexToCart(-1, -1), hexToCart(0, -2), hexToCart(2, -2),
    hexToCart(2, -1), hexToCart(4, -2), hexToCart(5, -1), hexToCart(4, 0),
    hexToCart(3, 0), hexToCart(2, 2), hexToCart(0, 3), hexToCart(0, 2),
    hexToCart(-1, 2)
  ];
  
  // AB outline derived from hex outline edges
  const HAT_OUTLINE_AB = (function() {
    const edges = [];
    for (let i = 0; i < HAT_OUTLINE.length; i++) {
      const j = (i + 1) % HAT_OUTLINE.length;
      const dx = HAT_OUTLINE[j].x - HAT_OUTLINE[i].x;
      const dy = HAT_OUTLINE[j].y - HAT_OUTLINE[i].y;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      // Determine edge type based on length at a=1, b=√3
      let type, coef;
      if (Math.abs(length - 1) < 0.01) {
        type = 'a'; coef = 1;
      } else if (Math.abs(length - SQRT3) < 0.01) {
        type = 'b'; coef = 1;
      } else if (Math.abs(length - 2) < 0.01) {
        type = 'a'; coef = 2;
      } else {
        type = 'a'; coef = length;
      }
      
      const ux = dx / length;
      const uy = dy / length;
      edges.push({ type, coef, ux, uy });
    }
    
    // Build AB vertices
    const vertices = [];
    let currentX = makeAB(0, 0);
    let currentY = makeAB(0, 0);
    vertices.push(makeABPoint(currentX, currentY));
    
    for (let i = 0; i < HAT_OUTLINE.length - 1; i++) {
      const edge = edges[i];
      if (edge.type === 'a') {
        currentX = addAB(currentX, makeAB(edge.coef * edge.ux, 0));
        currentY = addAB(currentY, makeAB(edge.coef * edge.uy, 0));
      } else {
        currentX = addAB(currentX, makeAB(0, edge.coef * edge.ux));
        currentY = addAB(currentY, makeAB(0, edge.coef * edge.uy));
      }
      vertices.push(makeABPoint(currentX, currentY));
    }
    
    return vertices;
  })();

  // ============================================================
  // METATILE CLASSES
  // ============================================================
  
  class HatTile {
    constructor(label) {
      this.label = label;
      this.shape = HAT_OUTLINE;
    }
    
    draw(S, level, collector) {
      collector.push({ transform: S, label: this.label });
    }
  }
  
  class MetaTile {
    constructor(shape, width) {
      this.shape = shape;
      this.width = width;
      this.children = [];
    }
    
    addChild(T, geom) {
      this.children.push({ T, geom });
    }
    
    evalChild(n, i) {
      const child = this.children[n];
      return matVecMul(child.T, child.geom.shape[i % child.geom.shape.length]);
    }
    
    draw(S, level, collector) {
      if (level > 0) {
        for (const child of this.children) {
          child.geom.draw(matMul(S, child.T), level - 1, collector);
        }
      }
    }
    
    recentre() {
      let cx = 0, cy = 0;
      for (const p of this.shape) {
        cx += p.x;
        cy += p.y;
      }
      cx /= this.shape.length;
      cy /= this.shape.length;
      
      this.shape = this.shape.map(p => ({ x: p.x - cx, y: p.y - cy }));
      const M = getTranslMat(-cx, -cy);
      for (const child of this.children) {
        child.T = matMul(M, child.T);
      }
    }
  }

  // ============================================================
  // INITIAL METATILES (H, T, P, F)
  // ============================================================
  
  const H1_HAT = new HatTile('H1');
  const H_HAT = new HatTile('H');
  const T_HAT = new HatTile('T');
  const P_HAT = new HatTile('P');
  const F_HAT = new HatTile('F');
  
  function initH() {
    const outline = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 4.5, y: HEX_Y.y }, { x: 2.5, y: 5 * HEX_Y.y },
      { x: 1.5, y: 5 * HEX_Y.y }, { x: -HEX_Y.x, y: HEX_Y.y }
    ];
    
    const meta = new MetaTile(outline, 2);
    meta.addChild(matchShapes(HAT_OUTLINE[5], HAT_OUTLINE[7], outline[5], outline[0]), H_HAT);
    meta.addChild(matchShapes(HAT_OUTLINE[9], HAT_OUTLINE[11], outline[1], outline[2]), H_HAT);
    meta.addChild(matchShapes(HAT_OUTLINE[5], HAT_OUTLINE[7], outline[3], outline[4]), H_HAT);
    meta.addChild(matMul(getTranslMat(2.5, HEX_Y.y), matMul(
      [-HEX_Y.x, -HEX_Y.y, 0, HEX_Y.y, -HEX_Y.x, 0],
      [HEX_Y.x, 0, 0, 0, -HEX_Y.x, 0]
    )), H1_HAT);
    
    return meta;
  }
  
  function initT() {
    const outline = [
      { x: 0, y: 0 }, { x: 3, y: 0 }, { x: 1.5, y: 3 * HEX_Y.y }
    ];
    
    const meta = new MetaTile(outline, 2);
    meta.addChild([HEX_Y.x, 0, HEX_Y.x, 0, HEX_Y.x, HEX_Y.y], T_HAT);
    
    return meta;
  }
  
  function initP() {
    const outline = [
      { x: 0, y: 0 }, { x: 4, y: 0 },
      { x: 3, y: 2 * HEX_Y.y }, { x: -1, y: 2 * HEX_Y.y }
    ];
    
    const meta = new MetaTile(outline, 2);
    meta.addChild([HEX_Y.x, 0, 1.5, 0, HEX_Y.x, HEX_Y.y], P_HAT);
    meta.addChild(matMul(getTranslMat(0, 2 * HEX_Y.y), matMul(
      [HEX_Y.x, HEX_Y.y, 0, -HEX_Y.y, HEX_Y.x, 0],
      [HEX_Y.x, 0, 0, 0, HEX_Y.x, 0]
    )), P_HAT);
    
    return meta;
  }
  
  function initF() {
    const outline = [
      { x: 0, y: 0 }, { x: 3, y: 0 },
      { x: 3.5, y: HEX_Y.y }, { x: 3, y: 2 * HEX_Y.y },
      { x: -1, y: 2 * HEX_Y.y }
    ];
    
    const meta = new MetaTile(outline, 2);
    meta.addChild([HEX_Y.x, 0, 1.5, 0, HEX_Y.x, HEX_Y.y], F_HAT);
    meta.addChild(matMul(getTranslMat(0, 2 * HEX_Y.y), matMul(
      [HEX_Y.x, HEX_Y.y, 0, -HEX_Y.y, HEX_Y.x, 0],
      [HEX_Y.x, 0, 0, 0, HEX_Y.x, 0]
    )), F_HAT);
    
    return meta;
  }

  // ============================================================
  // SUBSTITUTION RULES
  // ============================================================
  
  function constructPatch(H, T, P, F) {
    const shapes = { H, T, P, F };
    const rules = [
      ['H'],
      [0, 0, 'P', 2], [1, 0, 'H', 2], [2, 0, 'P', 2], [3, 0, 'H', 2],
      [4, 4, 'P', 2], [0, 4, 'F', 3], [2, 4, 'F', 3], [4, 1, 3, 2, 'F', 0],
      [8, 3, 'H', 0], [9, 2, 'P', 0], [10, 2, 'H', 0], [11, 4, 'P', 2],
      [12, 0, 'H', 2], [13, 0, 'F', 3], [14, 2, 'F', 1], [15, 3, 'H', 4],
      [8, 2, 'F', 1], [17, 3, 'H', 0], [18, 2, 'P', 0], [19, 2, 'H', 2],
      [20, 4, 'F', 3], [20, 0, 'P', 2], [22, 0, 'H', 2], [23, 4, 'F', 3],
      [23, 0, 'F', 3], [16, 0, 'P', 2], [9, 4, 0, 2, 'T', 2], [4, 0, 'F', 3]
    ];
    
    const ret = new MetaTile([], H.width);
    
    for (const r of rules) {
      if (r.length === 1) {
        ret.addChild(IDENTITY, shapes[r[0]]);
      } else if (r.length === 4) {
        const poly = ret.children[r[0]].geom.shape;
        const T = ret.children[r[0]].T;
        const P = matVecMul(T, poly[(r[1] + 1) % poly.length]);
        const Q = matVecMul(T, poly[r[1]]);
        const nshp = shapes[r[2]];
        const npoly = nshp.shape;
        ret.addChild(matchShapes(npoly[r[3]], npoly[(r[3] + 1) % npoly.length], P, Q), nshp);
      } else {
        const chP = ret.children[r[0]];
        const chQ = ret.children[r[2]];
        const P = matVecMul(chQ.T, chQ.geom.shape[r[3]]);
        const Q = matVecMul(chP.T, chP.geom.shape[r[1]]);
        const nshp = shapes[r[4]];
        const npoly = nshp.shape;
        ret.addChild(matchShapes(npoly[r[5]], npoly[(r[5] + 1) % npoly.length], P, Q), nshp);
      }
    }
    
    return ret;
  }
  
  function constructMetatiles(patch) {
    const bps1 = patch.evalChild(8, 2);
    const bps2 = patch.evalChild(21, 2);
    const rbps = matVecMul(getRotMatAboutPoint(bps1, -2.0 * PI / 3.0), bps2);
    
    const p72 = patch.evalChild(7, 2);
    const p252 = patch.evalChild(25, 2);
    
    const llc = getIntersectPoint(bps1, rbps, patch.evalChild(6, 2), p72);
    let w = vecSub(patch.evalChild(6, 2), llc);
    
    const newHOutline = [llc, bps1];
    w = matVecMul(getRotMat(-PI / 3), w);
    newHOutline.push(vecAdd(newHOutline[1], w));
    newHOutline.push(patch.evalChild(14, 2));
    w = matVecMul(getRotMat(-PI / 3), w);
    newHOutline.push(vecSub(newHOutline[3], w));
    newHOutline.push(patch.evalChild(6, 2));
    
    const newH = new MetaTile(newHOutline, patch.width * 2);
    for (const ch of [0, 9, 16, 27, 26, 6, 1, 8, 10, 15]) {
      newH.addChild(patch.children[ch].T, patch.children[ch].geom);
    }
    
    const newPOutline = [p72, vecAdd(p72, vecSub(bps1, llc)), bps1, llc];
    const newP = new MetaTile(newPOutline, patch.width * 2);
    for (const ch of [7, 2, 3, 4, 28]) {
      newP.addChild(patch.children[ch].T, patch.children[ch].geom);
    }
    
    const newFOutline = [bps2, patch.evalChild(24, 2), patch.evalChild(25, 0), p252, vecAdd(p252, vecSub(llc, bps1))];
    const newF = new MetaTile(newFOutline, patch.width * 2);
    for (const ch of [21, 20, 22, 23, 24, 25]) {
      newF.addChild(patch.children[ch].T, patch.children[ch].geom);
    }
    
    const AAA = newHOutline[2];
    const BBB = vecAdd(newHOutline[1], vecSub(newHOutline[4], newHOutline[5]));
    const CCC = matVecMul(getRotMatAboutPoint(BBB, -PI / 3), AAA);
    const newTOutline = [BBB, CCC, AAA];
    const newT = new MetaTile(newTOutline, patch.width * 2);
    newT.addChild(patch.children[11].T, patch.children[11].geom);
    
    newH.recentre();
    newP.recentre();
    newF.recentre();
    newT.recentre();
    
    return [newH, newT, newP, newF];
  }

  // ============================================================
  // TILING GENERATOR
  // ============================================================
  
  class EinsteinTiling {
    constructor() {
      this.tiles = [initH(), initT(), initP(), initF()];
      this.level = 1;
    }
    
    buildSupertiles() {
      const patch = constructPatch(this.tiles[0], this.tiles[1], this.tiles[2], this.tiles[3]);
      this.tiles = constructMetatiles(patch);
      this.level++;
    }
    
    generate(levels) {
      while (this.level < levels) {
        this.buildSupertiles();
      }
    }
    
    collect() {
      const collector = [];
      this.tiles[0].draw(IDENTITY, this.level, collector);
      return collector;
    }
  }

  // ============================================================
  // CANVAS RENDERER
  // ============================================================
  
  class EinsteinRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.startTime = performance.now();
      this.animationId = null;
      this.dpr = window.devicePixelRatio || 1;
      this.hatTiles = null;
      
      // Detect page type for opacity adjustment
      this.isHomepage = document.body.dataset.pageType === 'homepage';
      
      // Random offset for non-deterministic pattern each reload
      // The tiling is infinite and aperiodic, so translating gives a different "view" each time
      // Like panning to a different area of the infinite pattern
      this.randomOffsetX = (Math.random() - 0.5) * 60; // Random offset in tile units
      this.randomOffsetY = (Math.random() - 0.5) * 60;
      
      this._resize();
      this._generateTiling();
      
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          this._resize();
        }, 100);
      });
    }
    
    _resize() {
      this.dpr = window.devicePixelRatio || 1;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.canvas.style.width = this.width + 'px';
      this.canvas.style.height = this.height + 'px';
      
      // Calculate scale to ensure full coverage
      // The tiling roughly spans about 100 units at level 5
      const maxDimension = Math.max(this.width, this.height);
      const coverageScale = maxDimension / 80; // Adjust divisor for coverage
      
      this.isMobile = this.width < CONFIG.mobileBreakpoint;
      this.scale = this.isMobile 
        ? Math.max(CONFIG.baseScale * 0.6, coverageScale * 0.6)
        : Math.max(CONFIG.baseScale, coverageScale);
    }
    
    _generateTiling() {
      const tiling = new EinsteinTiling();
      tiling.generate(CONFIG.levels);
      this.hatTiles = tiling.collect();
    }
    
    _getEdgeFadeOpacity(x, y) {
      // On mobile: no padding (fade starts immediately), with a wider fade zone
      // On desktop: small padding before fade begins, tighter fade zone
      const padH = this.isMobile ? 0 : 20;
      const padV = this.isMobile ? 0 : 20;
      const fadeDistanceH = this.isMobile ? this.width * 0.35 : this.width * 0.12;
      const fadeDistanceV = this.isMobile ? this.height * 0.25 : this.height * 0.08;
      
      // Inner pages have much lower max opacity for subtler background
      const maxOpacity = this.isHomepage
        ? (this.isMobile ? 0.25 : 0.7)
        : 0.08;
      
      // Distance from each edge minus the padding zone, normalized by fade distance
      const fromLeft = Math.max(0, x - padH) / fadeDistanceH;
      const fromRight = Math.max(0, (this.width - x) - padH) / fadeDistanceH;
      const fromTop = Math.max(0, y - padV) / fadeDistanceV;
      const fromBottom = Math.max(0, (this.height - y) - padV) / fadeDistanceV;
      
      // Minimum normalized distance from any edge
      const minNormDist = Math.min(fromLeft, fromRight, fromTop, fromBottom);
      
      // Opacity: maxOpacity at edge (dist=0), fading to 0 at normalized distance 1
      // Using quadratic easing for smooth fade
      if (minNormDist >= 1) return 0;
      const t = 1 - minNormDist;
      return t * t * maxOpacity; // quadratic ease-in for smoother transition
    }
    
    _drawHat(ctx, outline, transform, opacity, label) {
      const color = TILE_COLORS[label] || TILE_COLORS['H'];
      // Stroke has a base opacity that's always visible, plus extra near edges
      // Inner pages use lower base opacity for subtler effect
      const baseStroke = this.isHomepage ? CONFIG.strokeBaseOpacity : CONFIG.strokeBaseOpacityInner;
      const strokeOpacity = baseStroke + Math.min(opacity * 0.8, this.isHomepage ? 0.4 : 0.06);
      
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${strokeOpacity})`;
      
      ctx.beginPath();
      const first = matVecMul(transform, outline[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < outline.length; i++) {
        const p = matVecMul(transform, outline[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    
    render = (timestamp) => {
      const time = timestamp - this.startTime;
      const ctx = this.ctx;
      
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.width, this.height);
      
      // Skip tiling on inner pages for mobile - too distracting on small screens
      if (!this.isHomepage && this.isMobile) {
        this.animationId = requestAnimationFrame(this.render);
        return;
      }
      
      // ========================================
      // T(a,b) CONTINUUM (DISABLED - using reference shape)
      // ========================================
      // Morphing is disabled for now - using the classic hat shape (a=1, b=√3)
      // The T(a,b) continuum would go through:
      //   t=0: Chevrons (degenerate)
      //   t≈0.366: Classic "Hat" (a=1, b=√3) <- CURRENT
      //   t=0.5: Equilateral (a=b)
      //   t≈0.634: "Turtle" (a=√3, b=1)
      //   t=1: Comets (degenerate)
      const a = 1, b = SQRT3;
      const currentOutline = HAT_OUTLINE;
      
      // ========================================
      // SCALE BREATHING ANIMATION
      // ========================================
      const scaleT = Math.sin(time * CONFIG.scaleSpeed);
      const animatedScale = this.scale * (1 + CONFIG.scaleAmplitude * scaleT);
      
      // Center and scale transform with random offset for unique pattern each reload
      // The random offset is fixed at page load, giving a different "view" of the infinite tiling
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      
      // Simple scale + translate, with random offset to shift the view origin
      const scaleTransform = [
        animatedScale, 0, centerX + this.randomOffsetX * animatedScale,
        0, -animatedScale, centerY + this.randomOffsetY * animatedScale
      ];
      
      ctx.lineWidth = CONFIG.strokeWidth;
      ctx.lineJoin = 'round';
      
      // ========================================
      // DRAW ALL TILES
      // ========================================
      for (const tile of this.hatTiles) {
        // Use tile transform directly (no morphing adjustment needed at reference point)
        const finalTransform = matMul(scaleTransform, tile.transform);
        
        // Get center of tile for culling and opacity calculation
        let cx = 0, cy = 0;
        for (const p of currentOutline) {
          const tp = matVecMul(finalTransform, p);
          cx += tp.x;
          cy += tp.y;
        }
        cx /= currentOutline.length;
        cy /= currentOutline.length;
        
        // Skip tiles outside viewport with buffer
        if (cx < -100 || cx > this.width + 100 || cy < -100 || cy > this.height + 100) continue;
        
        // Edge-based fill opacity
        const fillOpacity = this._getEdgeFadeOpacity(cx, cy);
        
        // Draw using the TRUE MORPHED OUTLINE
        this._drawHat(ctx, currentOutline, finalTransform, fillOpacity, tile.label);
      }
      
      this.animationId = requestAnimationFrame(this.render);
    }
    
    start() {
      if (!this.animationId) {
        this.animationId = requestAnimationFrame(this.render);
      }
    }
    
    stop() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================
  
  function init() {
    const canvas = document.getElementById('einstein-tiling-canvas');
    if (!canvas) {
      console.warn('Einstein tiling canvas not found');
      return;
    }
    
    const renderer = new EinsteinRenderer(canvas);
    renderer.start();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        renderer.stop();
      } else {
        renderer.start();
      }
    });
    
    window.einsteinTiling = renderer;
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
