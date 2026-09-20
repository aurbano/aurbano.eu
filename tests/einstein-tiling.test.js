const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  MORPH_CENTER,
  MORPH_MIN,
  MORPH_MAX,
  createMorphingPatch,
  evaluateMorph,
} = require('../assets/js/einstein-tiling-core.js');

const EPSILON = 1e-7;
const VERTICES = 13;
const patch = createMorphingPatch(2);
const ratios = [
  MORPH_MIN,
  (MORPH_MIN + MORPH_CENTER) / 2,
  MORPH_CENTER,
  (MORPH_CENTER + MORPH_MAX) / 2,
  MORPH_MAX,
];

function cross(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

function signedArea(points) {
  return points.reduce((sum, p, i) => {
    const q = points[(i + 1) % points.length];
    return sum + cross(p[0], p[1], q[0], q[1]);
  }, 0) / 2;
}

function geometry(t) {
  const output = new Float64Array(patch.tileCount * VERTICES * 2);
  evaluateMorph(patch, t, output);
  return Array.from({ length: patch.tileCount }, (_, tile) =>
    Array.from({ length: VERTICES }, (_, vertex) => {
      const offset = (tile * VERTICES + vertex) * 2;
      return [output[offset], output[offset + 1]];
    }));
}

function edgesOf(polygons) {
  return polygons.flatMap((points, tile) => points.map((p, i) => {
    const q = points[(i + 1) % points.length];
    const dx = q[0] - p[0];
    const dy = q[1] - p[1];
    return {
      x: p[0], y: p[1], dx, dy, length: Math.hypot(dx, dy),
      tile, winding: Math.sign(signedArea(points)), cuts: [0, 1],
    };
  }));
}

// Geometric oracle, independent of the substitution and coefficient machinery.
// Split at all contacts: hats need partial-edge matches, not just equal endpoints.
function topology(polygons, context) {
  const edges = edgesOf(polygons);
  function cut(edge, t) {
    if (t >= -EPSILON && t <= 1 + EPSILON) {
      edge.cuts.push(Math.max(0, Math.min(1, t)));
    }
  }
  for (let i = 0; i < edges.length; i++) {
    const a = edges[i];
    assert.ok(a.length > EPSILON, `${context}: collapsed edge on tile ${a.tile}`);
    for (let j = i + 1; j < edges.length; j++) {
      const b = edges[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const determinant = cross(a.dx, a.dy, b.dx, b.dy);
      if (Math.abs(determinant) <= EPSILON * a.length * b.length) {
        if (Math.abs(cross(dx, dy, a.dx, a.dy)) > EPSILON * a.length) continue;
        const aa = a.length ** 2;
        const bb = b.length ** 2;
        cut(a, (dx * a.dx + dy * a.dy) / aa);
        cut(a, ((dx + b.dx) * a.dx + (dy + b.dy) * a.dy) / aa);
        cut(b, (-dx * b.dx - dy * b.dy) / bb);
        cut(b, ((a.dx - dx) * b.dx + (a.dy - dy) * b.dy) / bb);
      } else {
        const u = cross(dx, dy, b.dx, b.dy) / determinant;
        const v = cross(dx, dy, a.dx, a.dy) / determinant;
        if (u < -EPSILON || u > 1 + EPSILON || v < -EPSILON || v > 1 + EPSILON) continue;
        assert.ok(
          !(u > EPSILON && u < 1 - EPSILON && v > EPSILON && v < 1 - EPSILON),
          `${context}: crossing edges on tiles ${a.tile} and ${b.tile}`,
        );
        cut(a, u);
        cut(b, v);
      }
    }
  }

  // Neighbor-bin lookup avoids rounding two coincident endpoints to different keys.
  const vertices = [];
  const bins = new Map();
  function vertex(x, y) {
    const bx = Math.floor(x / EPSILON);
    const by = Math.floor(y / EPSILON);
    for (let ix = bx - 1; ix <= bx + 1; ix++) {
      for (let iy = by - 1; iy <= by + 1; iy++) {
        for (const id of bins.get(`${ix},${iy}`) || []) {
          if (Math.hypot(vertices[id][0] - x, vertices[id][1] - y) <= EPSILON) return id;
        }
      }
    }
    const id = vertices.push([x, y]) - 1;
    const key = `${bx},${by}`;
    if (!bins.has(key)) bins.set(key, []);
    bins.get(key).push(id);
    return id;
  }

  const segments = new Map();
  for (const edge of edges) {
    edge.cuts.sort((a, b) => a - b);
    for (let i = 1; i < edge.cuts.length; i++) {
      const lo = edge.cuts[i - 1];
      const hi = edge.cuts[i];
      if ((hi - lo) * edge.length <= EPSILON) continue;
      const a = vertex(edge.x + lo * edge.dx, edge.y + lo * edge.dy);
      const b = vertex(edge.x + hi * edge.dx, edge.y + hi * edge.dy);
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      if (!segments.has(key)) segments.set(key, { a, b, owners: [] });
      segments.get(key).owners.push({
        tile: edge.tile, direction: (a < b ? 1 : -1) * edge.winding,
      });
    }
  }

  const adjacency = polygons.map(() => new Set());
  const boundary = [];
  for (const { a, b, owners } of segments.values()) {
    assert.ok(owners.length <= 2, `${context}: multiply covered boundary segment`);
    if (owners.length === 1) {
      boundary.push([vertices[a], vertices[b]]);
    } else {
      assert.notEqual(owners[0].tile, owners[1].tile, `${context}: self-overlapping tile`);
      assert.equal(owners[0].direction, -owners[1].direction, `${context}: tiles on same side of shared edge`);
      adjacency[owners[0].tile].add(owners[1].tile);
      adjacency[owners[1].tile].add(owners[0].tile);
    }
  }
  const reached = new Set([0]);
  for (const tile of reached) {
    for (const neighbor of adjacency[tile]) reached.add(neighbor);
  }
  assert.equal(reached.size, polygons.length, `${context}: disconnected shared boundaries`);
  // With crossings excluded and a connected planar graph, Euler detects every hole.
  // The official finite H8 supertile is a topological disk; the exterior is one face.
  assert.equal(vertices.length - segments.size + polygons.length, 1, `${context}: hole in patch`);
  return boundary;
}

function contains(points, x, y) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i];
    const b = points[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) {
      inside = !inside;
    }
  }
  return inside;
}

function distanceToSegment(x, y, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
}

const reference = geometry(MORPH_CENTER);
const frames = ratios.map(t => ({ t, polygons: geometry(t) }));

test('the hat shape changes non-uniformly while every tile keeps its classic area', () => {
  // A classic a=1, b=sqrt(3) hat consists of eight kites, each of area sqrt(3).
  const classicArea = 8 * Math.sqrt(3);
  for (const { t, polygons } of frames) {
    for (const [tile, points] of polygons.entries()) {
      assert.ok(Math.abs(Math.abs(signedArea(points)) - classicArea) < EPSILON,
        `t=${t}, tile=${tile}: area changed`);
    }
  }
  function relativeEdges(points) {
    const lengths = points.map((p, i) => {
      const q = points[(i + 1) % points.length];
      return Math.hypot(q[0] - p[0], q[1] - p[1]);
    });
    const perimeter = lengths.reduce((sum, length) => sum + length, 0);
    return lengths.map(length => length / perimeter);
  }
  const low = relativeEdges(frames[0].polygons[0]);
  const high = relativeEdges(frames[frames.length - 1].polygons[0]);
  assert.ok(low.reduce((change, length, i) => change + Math.abs(length - high[i]), 0) > 0.05,
    'edge proportions must change, not just position, rotation, or global zoom');
});

test('all morph frames have connected, opposite shared boundaries and no crossings or holes', () => {
  for (const { t, polygons } of frames) topology(polygons, `t=${t}`);
});

test('a deterministic interior sampling oracle sees exactly one tile throughout the morph', () => {
  const boundary = topology(reference, 'reference sampling domain');
  const points = reference.flat();
  const minX = Math.min(...points.map(p => p[0]));
  const maxX = Math.max(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1]));
  const maxY = Math.max(...points.map(p => p[1]));
  for (const { t, polygons } of frames) {
    let displacement = 0;
    for (let tile = 0; tile < polygons.length; tile++) {
      for (let i = 0; i < VERTICES; i++) {
        displacement = Math.max(displacement, Math.hypot(
          polygons[tile][i][0] - reference[tile][i][0],
          polygons[tile][i][1] - reference[tile][i][1],
        ));
      }
    }
    let checked = 0;
    // Inset the reference boundary by the largest vertex displacement. These
    // points cannot leave a valid continuously deformed patch through its exterior.
    for (let ix = 0; ix < 25; ix++) {
      for (let iy = 0; iy < 25; iy++) {
        const x = minX + (ix + 0.371) / 25 * (maxX - minX);
        const y = minY + (iy + 0.613) / 25 * (maxY - minY);
        if (!reference.some(polygon => contains(polygon, x, y))) continue;
        if (boundary.some(([a, b]) => distanceToSegment(x, y, a, b) <= displacement + EPSILON)) continue;
        // Boundary ownership is immaterial; the exact edge oracle covers seams.
        if (polygons.some(polygon => polygon.some((a, i) =>
          distanceToSegment(x, y, a, polygon[(i + 1) % VERTICES]) <= EPSILON))) continue;
        const coverage = polygons.reduce((count, polygon) => count + Number(contains(polygon, x, y)), 0);
        assert.equal(coverage, 1, `t=${t}, (${x}, ${y}): interior gap or overlap`);
        checked++;
      }
    }
    assert.ok(checked > 0, `t=${t}: no interior samples survived the boundary inset`);
  }
});
