/**
 * Symbolic H7/H8 construction for the hat family T(a,b).
 * Geometric rules: Smith, Myers, Kaplan, and Goodman-Strauss.
 * Reference: https://cs.uwaterloo.ca/~csk/hat/h7h8.js
 *
 * Every point stores [xa, xb, ya, yb], representing
 * (xa*a + xb*b, ya*a + yb*b). Matching corners symbolically keeps
 * neighboring hats joined throughout the family, not just at one shape.
 */

const SQRT3 = Math.sqrt(3);
const HALF_SQRT3 = SQRT3 / 2;
const MORPH_CENTER = 1 / (1 + SQRT3);
const MORPH_MIN = MORPH_CENTER - 0.05;
const MORPH_MAX = MORPH_CENTER + 0.05;
const VERTICES_PER_TILE = 13;
const COEFFICIENTS_PER_TILE = VERTICES_PER_TILE * 4;
const REFERENCE_AREA = 8 * SQRT3;

// Rotations are multiples of 60 degrees. Lookup avoids accumulating trig error.
const COS = [1, 0.5, -0.5, -1, -0.5, 0.5];
const SIN = [0, HALF_SQRT3, HALF_SQRT3, 0, -HALF_SQRT3, -HALF_SQRT3];

function add(p, q) {
  return [p[0] + q[0], p[1] + q[1], p[2] + q[2], p[3] + q[3]];
}

function subtract(p, q) {
  return [p[0] - q[0], p[1] - q[1], p[2] - q[2], p[3] - q[3]];
}

function rotate(p, turn) {
  const c = COS[turn];
  const s = SIN[turn];
  return [
    c * p[0] - s * p[2],
    c * p[1] - s * p[3],
    s * p[0] + c * p[2],
    s * p[1] + c * p[3],
  ];
}

// A placement references its source rather than copying all descendant hats.
function place(node, turn, corner, target) {
  const rotatedQuad = node.quad.map((p) => rotate(p, turn));
  const offset = subtract(target, rotatedQuad[corner]);
  return {
    node,
    turn,
    offset,
    quad: rotatedQuad.map((p) => add(p, offset)),
  };
}

function identityPlacement(node) {
  return { node, turn: 0, offset: [0, 0, 0, 0], quad: node.quad };
}

function group(children, quad) {
  return {
    children,
    quad,
    tileCount: children.reduce((count, child) => count + child.node.tileCount, 0),
  };
}

function baseTiles() {
  const r = HALF_SQRT3;
  const directions = [
    [1, 0], [r, 0.5], [0.5, r], [0, 1], [-0.5, r], [-r, 0.5],
    [-1, 0], [-r, -0.5], [-0.5, -r], [0, -1], [0.5, -r], [r, -0.5],
  ];
  // 0 selects a, 1 selects b; directions are multiples of 30 degrees.
  const edges = [
    [0, 0], [0, 2], [1, 11], [1, 1], [0, 4], [0, 2], [1, 5],
    [1, 3], [0, 6], [0, 8], [0, 8], [0, 10], [1, 7],
  ];
  const points = [[0, 0, 0, 0]];
  for (const [length, direction] of edges) {
    const next = points[points.length - 1].slice();
    next[length] += directions[direction][0];
    next[length + 2] += directions[direction][1];
    points.push(next);
  }

  const quad = [points[1], points[3], points[9], points[13]];
  // The official outline has 14 points: point 10 is a collinear midpoint
  // on its length-2a edge. Point 13 is (0,b), NOT a repeated closing vertex.
  const single = {
    points: points.filter((_, index) => index !== 10),
    quad,
    flipped: false,
    tileCount: 1,
  };
  const mirrored = points.slice().reverse().map((p) => [p[0], p[1], -p[2], -p[3]]);
  const offset = subtract(points[0], mirrored[5]);
  const reflected = {
    points: mirrored.filter((_, index) => index !== 3).map((p) => add(p, offset)),
    quad,
    flipped: true,
    tileCount: 1,
  };
  return {
    h8: single,
    h7: group([identityPlacement(single), identityPlacement(reflected)], quad),
  };
}

// [rotation in sixth-turns, source corner, previous child's corner, use H7].
const PLACEMENTS = [
  [1, 2, 0, false],
  [2, 2, 0, false],
  [0, 1, 1, true],
  [4, 2, 2, false],
  [5, 2, 0, false],
  [0, 2, 0, false],
];

function substitute({ h8, h7 }) {
  const children = [identityPlacement(h8)];
  for (const [turn, sourceCorner, targetCorner, composite] of PLACEMENTS) {
    const target = children[children.length - 1].quad[targetCorner];
    children.push(place(composite ? h7 : h8, turn, sourceCorner, target));
  }
  const quad = [
    children[1].quad[3], children[2].quad[0],
    children[4].quad[3], children[6].quad[0],
  ];
  return {
    h8: group(children, quad),
    h7: group(children.slice(0, -1), quad),
  };
}

function createMorphingPatch(levels = 4) {
  let system = baseTiles();
  for (let level = 0; level < levels; level++) {
    system = substitute(system);
  }
  const root = system.h8;
  const coefficients = new Float64Array(root.tileCount * COEFFICIENTS_PER_TILE);
  const colors = new Uint8Array(root.tileCount);
  let tile = 0;

  function flatten(node, turn, offset) {
    if (node.children) {
      for (const child of node.children) {
        flatten(child.node, (turn + child.turn) % 6, add(rotate(child.offset, turn), offset));
      }
      return;
    }
    const c = COS[turn];
    const s = SIN[turn];
    let index = tile * COEFFICIENTS_PER_TILE;
    for (const p of node.points) {
      coefficients[index++] = c * p[0] - s * p[2] + offset[0];
      coefficients[index++] = c * p[1] - s * p[3] + offset[1];
      coefficients[index++] = s * p[0] + c * p[2] + offset[2];
      coefficients[index++] = s * p[1] + c * p[3] + offset[3];
    }
    colors[tile] = node.flipped ? 0 : 1 + (tile % 4);
    tile++;
  }
  flatten(root, 0, [0, 0, 0, 0]);

  let quadX = 0;
  let quadY = 0;
  for (const p of root.quad) {
    quadX += (p[0] + SQRT3 * p[1]) / 4;
    quadY += (p[2] + SQRT3 * p[3]) / 4;
  }
  let nearestDistance = Infinity;
  let center = [0, 0, 0, 0];
  for (let start = 0; start < coefficients.length; start += COEFFICIENTS_PER_TILE) {
    const mean = [0, 0, 0, 0];
    for (let vertex = start; vertex < start + COEFFICIENTS_PER_TILE; vertex += 4) {
      for (let component = 0; component < 4; component++) {
        mean[component] += coefficients[vertex + component] / VERTICES_PER_TILE;
      }
    }
    const dx = mean[0] + SQRT3 * mean[1] - quadX;
    const dy = mean[2] + SQRT3 * mean[3] - quadY;
    const distance = dx * dx + dy * dy;
    if (distance < nearestDistance) {
      nearestDistance = distance;
      center = mean;
    }
  }
  // Subtract the symbolic center, so this same hat stays anchored during morphs.
  for (let index = 0; index < coefficients.length; index += 4) {
    coefficients[index] -= center[0];
    coefficients[index + 1] -= center[1];
    coefficients[index + 2] -= center[2];
    coefficients[index + 3] -= center[3];
  }
  return { coefficients, colors, tileCount: root.tileCount };
}

function evaluateMorph(patch, t, output) {
  let a = (1 + SQRT3) * t;
  let b = (1 + SQRT3) * (1 - t);
  // Shoelace area of T(a,b): 2√3 a² + 3ab + √3 b².
  // Scaling both lengths by sqrt(reference/current area) removes global zoom.
  const scale = Math.sqrt(REFERENCE_AREA / (2 * SQRT3 * a * a + 3 * a * b + SQRT3 * b * b));
  a *= scale;
  b *= scale;
  const coefficients = patch.coefficients;
  for (let source = 0, target = 0; source < coefficients.length; source += 4) {
    output[target++] = coefficients[source] * a + coefficients[source + 1] * b;
    output[target++] = coefficients[source + 2] * a + coefficients[source + 3] * b;
  }
  return output;
}

module.exports = {
  MORPH_CENTER,
  MORPH_MIN,
  MORPH_MAX,
  createMorphingPatch,
  evaluateMorph,
};
