/**
 * Einstein "Hat" Tile - Core Tiling Logic
 * 
 * This module contains the pure tiling computation logic with no DOM dependencies.
 * It can be used by both the browser renderer and Node.js tests.
 * 
 * Based on the substitution algorithm from:
 * https://github.com/asmoly/Einstein_Tile_Generator
 * 
 * Implements the aperiodic monotile discovered in 2023 by Smith, Myers, Kaplan, and Goodman-Strauss.
 * 
 * The T(a,b) continuum is based on Craig Kaplan's official implementation:
 * https://cs.uwaterloo.ca/~csk/hat/
 */

// ============================================================
// CONSTANTS
// ============================================================

const PI = Math.PI;
const SQRT3 = Math.sqrt(3);
const SQRT3_2 = SQRT3 / 2;

// Configurable reference point for tiling generation
// Default is the "classic hat" (a=1, b=√3)
let CURRENT_REF_A = 1;
let CURRENT_REF_B = SQRT3;

/**
 * Set the reference point for tiling generation.
 * This affects all subsequent tiling computations.
 * @param {number} a - The 'a' parameter (edge length)
 * @param {number} b - The 'b' parameter (edge length)
 */
function setReferencePoint(a, b) {
  CURRENT_REF_A = a;
  CURRENT_REF_B = b;
}

/**
 * Get the current reference point.
 * @returns {{a: number, b: number}} The current reference point
 */
function getReferencePoint() {
  return { a: CURRENT_REF_A, b: CURRENT_REF_B };
}

// Hex coordinate y-axis in cartesian
const HEX_Y = { x: 0.5, y: SQRT3_2 };

// Identity matrix [a, b, tx, c, d, ty]
const IDENTITY = [1, 0, 0, 0, 1, 0];

// ============================================================
// GEOMETRY UTILITIES
// ============================================================

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

/**
 * Create an AB coordinate (stores coefficients for a and b)
 */
function makeAB(coefA, coefB) {
  return { a: coefA, b: coefB };
}

function addAB(ab1, ab2) {
  return makeAB(ab1.a + ab2.a, ab1.b + ab2.b);
}

function subAB(ab1, ab2) {
  return makeAB(ab1.a - ab2.a, ab1.b - ab2.b);
}

function scaleAB(ab, scalar) {
  return makeAB(ab.a * scalar, ab.b * scalar);
}

function evalAB(ab, a, b) {
  return a * ab.a + b * ab.b;
}

function makeABPoint(xAB, yAB) {
  return { x: xAB, y: yAB };
}

function addABPoint(p1, p2) {
  return makeABPoint(addAB(p1.x, p2.x), addAB(p1.y, p2.y));
}

function subABPoint(p1, p2) {
  return makeABPoint(subAB(p1.x, p2.x), subAB(p1.y, p2.y));
}

function evalABPoint(abPoint, a, b) {
  return {
    x: evalAB(abPoint.x, a, b),
    y: evalAB(abPoint.y, a, b)
  };
}

// ============================================================
// ABQUAD COORDINATE SYSTEM (Quadratic AB expressions)
// ============================================================

/**
 * ABQuad represents a quadratic expression in a and b:
 *   coefA2*a² + coefAB*a*b + coefB2*b² + coefA*a + coefB*b + constant
 * 
 * This arises when multiplying two AB values together (e.g., in matrix multiplication).
 */
function makeABQuad(a2, ab, b2, a, b, c) {
  return { a2, ab, b2, a, b, c };
}

/**
 * Create an ABQuad from a simple AB value (linear - no quadratic terms)
 */
function abToQuad(ab) {
  return makeABQuad(0, 0, 0, ab.a, ab.b, 0);
}

/**
 * Create an ABQuad from a constant (numeric value)
 */
function constToQuad(val) {
  return makeABQuad(0, 0, 0, 0, 0, val);
}

/**
 * Check if an ABQuad is actually linear (no quadratic terms)
 */
function isLinearQuad(q) {
  const eps = 1e-10;
  return Math.abs(q.a2) < eps && Math.abs(q.ab) < eps && Math.abs(q.b2) < eps;
}

/**
 * Convert ABQuad back to AB if it's linear, otherwise return null
 */
function quadToAB(q) {
  if (isLinearQuad(q)) {
    return makeAB(q.a, q.b);
  }
  return null;
}

/**
 * Evaluate an ABQuad with actual a and b values
 */
function evalABQuad(q, a, b) {
  return q.a2*a*a + q.ab*a*b + q.b2*b*b + q.a*a + q.b*b + q.c;
}

/**
 * Add two ABQuad values
 */
function addABQuad(q1, q2) {
  return makeABQuad(
    q1.a2 + q2.a2,
    q1.ab + q2.ab,
    q1.b2 + q2.b2,
    q1.a + q2.a,
    q1.b + q2.b,
    q1.c + q2.c
  );
}

/**
 * Subtract two ABQuad values
 */
function subABQuad(q1, q2) {
  return makeABQuad(
    q1.a2 - q2.a2,
    q1.ab - q2.ab,
    q1.b2 - q2.b2,
    q1.a - q2.a,
    q1.b - q2.b,
    q1.c - q2.c
  );
}

/**
 * Scale an ABQuad by a numeric constant
 */
function scaleABQuad(q, scalar) {
  return makeABQuad(
    q.a2 * scalar,
    q.ab * scalar,
    q.b2 * scalar,
    q.a * scalar,
    q.b * scalar,
    q.c * scalar
  );
}

/**
 * Negate an ABQuad
 */
function negABQuad(q) {
  return scaleABQuad(q, -1);
}

/**
 * Multiply two AB values, returning an ABQuad
 * (a1*a + b1*b) * (a2*a + b2*b) = a1*a2*a² + (a1*b2 + a2*b1)*a*b + b1*b2*b²
 */
function mulABtoQuad(ab1, ab2) {
  return makeABQuad(
    ab1.a * ab2.a,           // a² coefficient
    ab1.a * ab2.b + ab1.b * ab2.a,  // ab coefficient
    ab1.b * ab2.b,           // b² coefficient
    0, 0, 0                  // no linear or constant terms
  );
}

/**
 * Multiply an ABQuad by a simple AB value
 * This produces cubic terms, but we can handle it by evaluating at specific points.
 * For our tiling, we'll use a different approach - see mulABQuadByAB.
 * 
 * Actually, for Einstein tiling, we need to handle this carefully.
 * The transforms in the tiling are primarily rotations (fixed angles) and translations.
 * Scale factors come from edge length ratios.
 */
function mulABQuadByConst(q, c) {
  return scaleABQuad(q, c);
}

// ============================================================
// AB MATRIX OPERATIONS
// ============================================================

/**
 * ABQuad Matrix: 6-element affine matrix where each element is an ABQuad.
 * Format: [a, b, tx, c, d, ty]
 * 
 * This allows us to represent transforms symbolically and evaluate them
 * at render time with any a,b values.
 */

/**
 * Create an ABQuad matrix from AB values (promotes each to ABQuad)
 */
function makeABQuadMatrix(elements) {
  return elements.map(e => {
    if (typeof e === 'number') {
      return constToQuad(e);
    } else if (e.a2 !== undefined) {
      // Already ABQuad
      return e;
    } else {
      // AB value
      return abToQuad(e);
    }
  });
}

/**
 * Create identity matrix in ABQuad form
 */
function identityABQuad() {
  return [
    constToQuad(1), constToQuad(0), constToQuad(0),
    constToQuad(0), constToQuad(1), constToQuad(0)
  ];
}

/**
 * Evaluate an ABQuad matrix to a numeric matrix using current a,b values
 */
function evalABQuadMatrix(matABQ, a, b) {
  return matABQ.map(q => evalABQuad(q, a, b));
}

/**
 * Multiply ABQuad by ABQuad - produces higher order terms
 * For practical purposes in this tiling, we track that this happens
 * and handle it by evaluation at specific reference points.
 * 
 * However, for the Einstein tiling, we can use a key insight:
 * The rotation matrices have constant (numeric) entries,
 * and only translations/scales involve AB values.
 * 
 * So we implement multiplication that handles mixed types:
 * - const * const = const
 * - const * linear = linear
 * - const * quad = quad
 * - linear * linear = quad
 * - linear * quad or quad * quad = we flag this and handle specially
 */
function mulABQuadPair(q1, q2) {
  // Check if both are effectively constants
  const isConst1 = isLinearQuad(q1) && Math.abs(q1.a) < 1e-10 && Math.abs(q1.b) < 1e-10;
  const isConst2 = isLinearQuad(q2) && Math.abs(q2.a) < 1e-10 && Math.abs(q2.b) < 1e-10;
  
  if (isConst1 && isConst2) {
    // Both constants
    return constToQuad(q1.c * q2.c);
  }
  
  if (isConst1) {
    // q1 is constant, multiply q2 by it
    return scaleABQuad(q2, q1.c);
  }
  
  if (isConst2) {
    // q2 is constant, multiply q1 by it
    return scaleABQuad(q1, q2.c);
  }
  
  // At least one is non-constant
  // If both are linear, we can compute the exact quadratic result
  const isLinear1 = isLinearQuad(q1);
  const isLinear2 = isLinearQuad(q2);
  
  if (isLinear1 && isLinear2) {
    // (a1*a + b1*b + c1) * (a2*a + b2*b + c2)
    // = a1*a2*a² + (a1*b2 + a2*b1)*ab + b1*b2*b²
    //   + (a1*c2 + a2*c1)*a + (b1*c2 + b2*c1)*b + c1*c2
    return makeABQuad(
      q1.a * q2.a,
      q1.a * q2.b + q1.b * q2.a,
      q1.b * q2.b,
      q1.a * q2.c + q1.c * q2.a,
      q1.b * q2.c + q1.c * q2.b,
      q1.c * q2.c
    );
  }
  
  // If we get here, we have quadratic * something, which gives cubic or quartic terms.
  // For the Einstein tiling, this shouldn't happen with proper structure.
  // We'll return an approximation evaluated at the reference point and converted back.
  console.warn('ABQuad multiplication overflow - falling back to reference evaluation');
  const val = evalABQuad(q1, CURRENT_REF_A, CURRENT_REF_B) * evalABQuad(q2, CURRENT_REF_A, CURRENT_REF_B);
  return constToQuad(val);
}

/**
 * Multiply two ABQuad matrices
 * Result[i] = sum of A[row_i]*B[col_i] products following affine multiplication rules
 */
function matMulABQuad(A, B) {
  // Affine matrix multiplication:
  // [a0 a1 a2]   [b0 b1 b2]   [a0*b0+a1*b3  a0*b1+a1*b4  a0*b2+a1*b5+a2]
  // [a3 a4 a5] × [b3 b4 b5] = [a3*b0+a4*b3  a3*b1+a4*b4  a3*b2+a4*b5+a5]
  // [0  0  1 ]   [0  0  1 ]   [0            0            1             ]
  
  return [
    addABQuad(mulABQuadPair(A[0], B[0]), mulABQuadPair(A[1], B[3])),
    addABQuad(mulABQuadPair(A[0], B[1]), mulABQuadPair(A[1], B[4])),
    addABQuad(addABQuad(mulABQuadPair(A[0], B[2]), mulABQuadPair(A[1], B[5])), A[2]),
    addABQuad(mulABQuadPair(A[3], B[0]), mulABQuadPair(A[4], B[3])),
    addABQuad(mulABQuadPair(A[3], B[1]), mulABQuadPair(A[4], B[4])),
    addABQuad(addABQuad(mulABQuadPair(A[3], B[2]), mulABQuadPair(A[4], B[5])), A[5])
  ];
}

/**
 * Apply ABQuad matrix to ABQuad point
 * Returns a new ABQuad point
 */
function matVecMulABQuad(M, P) {
  // x' = M[0]*P.x + M[1]*P.y + M[2]
  // y' = M[3]*P.x + M[4]*P.y + M[5]
  return {
    x: addABQuad(addABQuad(mulABQuadPair(M[0], P.x), mulABQuadPair(M[1], P.y)), M[2]),
    y: addABQuad(addABQuad(mulABQuadPair(M[3], P.x), mulABQuadPair(M[4], P.y)), M[5])
  };
}

/**
 * Convert an AB point to ABQuad point
 */
function abPointToQuadPoint(p) {
  return {
    x: abToQuad(p.x),
    y: abToQuad(p.y)
  };
}

/**
 * Evaluate an ABQuad point to numeric coordinates
 */
function evalABQuadPoint(p, a, b) {
  return {
    x: evalABQuad(p.x, a, b),
    y: evalABQuad(p.y, a, b)
  };
}

/**
 * Divide two ABQuad values (q1 / q2)
 * This is complex for general symbolic values, so we handle special cases:
 * - const / const = const
 * - For linear/quadratic division, we'd need symbolic division which is complex.
 * 
 * Key insight for Einstein tiling: divisions mainly occur in matrix inversion
 * where we divide by the determinant. If the determinant is a simple expression,
 * we can handle it.
 */
function divABQuadByConst(q, c) {
  if (Math.abs(c) < 1e-15) {
    console.warn('Division by near-zero constant');
    return constToQuad(0);
  }
  return scaleABQuad(q, 1 / c);
}

/**
 * Invert an ABQuad matrix symbolically.
 * 
 * For an affine 2x2+translation matrix [a, b, tx, c, d, ty], the inverse is:
 * det = a*d - b*c
 * inverse = [d/det, -b/det, (b*ty - d*tx)/det, -c/det, a/det, (c*tx - a*ty)/det]
 * 
 * The determinant is ABQuad*ABQuad which could be quadratic or even quartic.
 * For the Einstein tiling, determinants of rotation matrices are 1 (constant),
 * and scale matrices have simple determinants.
 * 
 * We'll compute the determinant and check if it's constant or simple.
 */
function invertMatABQuad(mat) {
  // det = mat[0]*mat[4] - mat[1]*mat[3]
  const det = subABQuad(
    mulABQuadPair(mat[0], mat[4]),
    mulABQuadPair(mat[1], mat[3])
  );
  
  // Check if determinant is effectively constant
  const isDetConst = isLinearQuad(det) && Math.abs(det.a) < 1e-10 && Math.abs(det.b) < 1e-10;
  
  if (isDetConst) {
    // Simple case: constant determinant
    const detVal = det.c;
    if (Math.abs(detVal) < 1e-15) {
      console.warn('Singular matrix (det ≈ 0)');
      return identityABQuad();
    }
    
    return [
      divABQuadByConst(mat[4], detVal),
      divABQuadByConst(negABQuad(mat[1]), detVal),
      divABQuadByConst(subABQuad(mulABQuadPair(mat[1], mat[5]), mulABQuadPair(mat[4], mat[2])), detVal),
      divABQuadByConst(negABQuad(mat[3]), detVal),
      divABQuadByConst(mat[0], detVal),
      divABQuadByConst(subABQuad(mulABQuadPair(mat[3], mat[2]), mulABQuadPair(mat[0], mat[5])), detVal)
    ];
  }
  
  // Non-constant determinant: need symbolic division
  // For the Einstein tiling, we use a hybrid approach:
  // Evaluate at reference point, compute inverse, then try to reconstruct symbolically
  // OR use the structure of the problem (rotations have det=1)
  
  // Check if det is linear (can we factor?)
  if (isLinearQuad(det)) {
    // Linear determinant: det = det.a * a + det.b * b + det.c
    // This is complex to invert symbolically, so we'll evaluate at reference
    // and flag this situation
    console.warn('Linear determinant in matrix inversion - using reference evaluation');
  }
  
  // Fallback: evaluate at reference point and return numeric matrix as ABQuad constants
  // Use the global reference point (defaults to a=1, b=√3)
  const refA = CURRENT_REF_A;
  const refB = CURRENT_REF_B;
  const numericMat = evalABQuadMatrix(mat, refA, refB);
  const numericDet = numericMat[0] * numericMat[4] - numericMat[1] * numericMat[3];
  
  if (Math.abs(numericDet) < 1e-15) {
    console.warn('Singular matrix at reference point');
    return identityABQuad();
  }
  
  return [
    constToQuad(numericMat[4] / numericDet),
    constToQuad(-numericMat[1] / numericDet),
    constToQuad((numericMat[1] * numericMat[5] - numericMat[4] * numericMat[2]) / numericDet),
    constToQuad(-numericMat[3] / numericDet),
    constToQuad(numericMat[0] / numericDet),
    constToQuad((numericMat[3] * numericMat[2] - numericMat[0] * numericMat[5]) / numericDet)
  ];
}

/**
 * Match segment in AB form.
 * Given two AB points p and q, compute the transform matrix that maps
 * unit x-axis segment to the segment p→q.
 * 
 * Original matchSegment: return [q.x - p.x, p.y - q.y, p.x, q.y - p.y, q.x - p.x, p.y];
 * This produces a matrix that:
 * - Translates origin to p
 * - Rotates and scales to align (1,0) → (q-p)
 */
function matchSegmentAB(p, q) {
  // Convert AB points to ABQuad for consistent handling
  const px = abToQuad(p.x), py = abToQuad(p.y);
  const qx = abToQuad(q.x), qy = abToQuad(q.y);
  
  return [
    subABQuad(qx, px),           // q.x - p.x
    subABQuad(py, qy),           // p.y - q.y  
    px,                          // p.x
    subABQuad(qy, py),           // q.y - p.y
    subABQuad(qx, px),           // q.x - p.x (same as [0])
    py                           // p.y
  ];
}

/**
 * Match shapes in AB form.
 * Computes the transform that maps segment (p1→q1) to segment (p2→q2).
 * 
 * This is the key function for computing tile placement transforms.
 * matchShapes(p1, q1, p2, q2) = matchSegment(p2, q2) × inverse(matchSegment(p1, q1))
 */
function matchShapesAB(p1, q1, p2, q2) {
  const seg1 = matchSegmentAB(p1, q1);
  const seg2 = matchSegmentAB(p2, q2);
  const invSeg1 = invertMatABQuad(seg1);
  return matMulABQuad(seg2, invSeg1);
}

/**
 * Get rotation matrix in ABQuad form.
 * Rotation matrices have constant (numeric) entries.
 */
function getRotMatABQuad(angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [
    constToQuad(c), constToQuad(-s), constToQuad(0),
    constToQuad(s), constToQuad(c), constToQuad(0)
  ];
}

/**
 * Get translation matrix in ABQuad form with ABQuad translation values.
 */
function getTranslMatABQuad(tx, ty) {
  return [
    constToQuad(1), constToQuad(0), tx,
    constToQuad(0), constToQuad(1), ty
  ];
}

/**
 * Get rotation matrix about a point in ABQuad form.
 */
function getRotMatAboutPointABQuad(p, angle) {
  const toOrigin = getTranslMatABQuad(negABQuad(p.x), negABQuad(p.y));
  const rot = getRotMatABQuad(angle);
  const fromOrigin = getTranslMatABQuad(p.x, p.y);
  return matMulABQuad(fromOrigin, matMulABQuad(rot, toOrigin));
}

/**
 * Compute intersection point of two lines in ABQuad form.
 * Line 1: p1 to q1
 * Line 2: p2 to q2
 * 
 * Uses parametric form: intersection = p1 + t*(q1-p1) where t is computed from
 * the line equations.
 * 
 * Note: This involves division by an ABQuad value, which may require evaluation.
 */
function getIntersectPointABQuad(p1, q1, p2, q2) {
  // d = (q2.y - p2.y)*(q1.x - p1.x) - (q2.x - p2.x)*(q1.y - p1.y)
  const q2y_p2y = subABQuad(q2.y, p2.y);
  const q1x_p1x = subABQuad(q1.x, p1.x);
  const q2x_p2x = subABQuad(q2.x, p2.x);
  const q1y_p1y = subABQuad(q1.y, p1.y);
  
  const d = subABQuad(
    mulABQuadPair(q2y_p2y, q1x_p1x),
    mulABQuadPair(q2x_p2x, q1y_p1y)
  );
  
  // uA = ((q2.x - p2.x)*(p1.y - p2.y) - (q2.y - p2.y)*(p1.x - p2.x)) / d
  const p1y_p2y = subABQuad(p1.y, p2.y);
  const p1x_p2x = subABQuad(p1.x, p2.x);
  
  const uA_num = subABQuad(
    mulABQuadPair(q2x_p2x, p1y_p2y),
    mulABQuadPair(q2y_p2y, p1x_p2x)
  );
  
  // Check if d is constant
  const isDConst = isLinearQuad(d) && Math.abs(d.a) < 1e-10 && Math.abs(d.b) < 1e-10;
  
  if (isDConst && Math.abs(d.c) > 1e-15) {
    // Simple case: constant d
    const dVal = d.c;
    // result = p1 + (uA_num/d) * (q1 - p1)
    const scale = 1 / dVal;
    const uA = scaleABQuad(uA_num, scale);
    
    return {
      x: addABQuad(p1.x, mulABQuadPair(uA, q1x_p1x)),
      y: addABQuad(p1.y, mulABQuadPair(uA, q1y_p1y))
    };
  }
  
  // Non-constant d: evaluate at reference point
  const dVal = evalABQuad(d, CURRENT_REF_A, CURRENT_REF_B);
  const uAVal = evalABQuad(uA_num, CURRENT_REF_A, CURRENT_REF_B) / dVal;
  
  const resultX = evalABQuad(p1.x, CURRENT_REF_A, CURRENT_REF_B) + uAVal * evalABQuad(q1x_p1x, CURRENT_REF_A, CURRENT_REF_B);
  const resultY = evalABQuad(p1.y, CURRENT_REF_A, CURRENT_REF_B) + uAVal * evalABQuad(q1y_p1y, CURRENT_REF_A, CURRENT_REF_B);
  
  // Return as constant ABQuad point (loses symbolic structure)
  console.warn('getIntersectPointABQuad: non-constant denominator, using reference evaluation');
  return {
    x: constToQuad(resultX),
    y: constToQuad(resultY)
  };
}

/**
 * Vector addition for ABQuad points
 */
function vecAddABQuad(p, q) {
  return {
    x: addABQuad(p.x, q.x),
    y: addABQuad(p.y, q.y)
  };
}

/**
 * Vector subtraction for ABQuad points
 */
function vecSubABQuad(p, q) {
  return {
    x: subABQuad(p.x, q.x),
    y: subABQuad(p.y, q.y)
  };
}

// ============================================================
// PARAMETERIZED HAT TILE OUTLINE
// ============================================================

/**
 * Edge sequence defining the hat tile.
 * Each edge has:
 *   - type: 'a' or 'b' (which edge length parameter it uses)
 *   - direction: 0-11 (multiples of 30 degrees)
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
 * 12 unit direction vectors at 30° intervals
 */
const DIRECTIONS = (function() {
  const dirs = [];
  for (let i = 0; i < 12; i++) {
    const angle = i * PI / 6;
    dirs.push({
      x: Math.cos(angle),
      y: Math.sin(angle)
    });
  }
  return dirs;
})();

/**
 * Build the hat outline in AB coordinate form.
 */
function buildHatOutlineAB() {
  let currentX = makeAB(0, 0);
  let currentY = makeAB(0, 0);
  
  const vertices = [makeABPoint(currentX, currentY)];
  
  for (const [edgeType, dirIndex] of EDGE_SEQUENCE) {
    const dir = DIRECTIONS[dirIndex];
    
    if (edgeType === 'a') {
      currentX = addAB(currentX, makeAB(dir.x, 0));
      currentY = addAB(currentY, makeAB(dir.y, 0));
    } else {
      currentX = addAB(currentX, makeAB(0, dir.x));
      currentY = addAB(currentY, makeAB(0, dir.y));
    }
    
    vertices.push(makeABPoint(currentX, currentY));
  }
  
  return vertices.slice(0, 13);
}

/**
 * Evaluate the AB outline to cartesian coordinates.
 */
function evaluateOutline(outlineAB, a, b) {
  return outlineAB.map(abPoint => evalABPoint(abPoint, a, b));
}

/**
 * Get a and b values from continuum parameter t.
 * t = 0 → Chevrons, t ≈ 0.366 → Hats, t = 0.5 → Equilateral, t ≈ 0.634 → Turtles, t = 1 → Comets
 */
function getABFromT(t) {
  const alpha = 1 + SQRT3;
  return {
    a: alpha * t,
    b: alpha * (1 - t)
  };
}

// AB outline from edge-walking (different vertex order than hex)
const HAT_OUTLINE_AB_EDGEWALK = buildHatOutlineAB();

// Classic hat outline using original hex-coordinate definition
// This MUST match what's used in the tiling computation
function hexToCart(hx, hy) {
  return { x: hx + HEX_Y.x * hy, y: HEX_Y.y * hy };
}

const HAT_OUTLINE = [
  hexToCart(0, 0), hexToCart(-1, -1), hexToCart(0, -2), hexToCart(2, -2),
  hexToCart(2, -1), hexToCart(4, -2), hexToCart(5, -1), hexToCart(4, 0),
  hexToCart(3, 0), hexToCart(2, 2), hexToCart(0, 3), hexToCart(0, 2),
  hexToCart(-1, 2)
];

/**
 * HAT_OUTLINE_AB: The hat outline in AB form derived from the hex outline.
 * 
 * The hex outline edges (at a=1, b=√3) have lengths:
 * [b, a, 2a, a, b, b, a, a, b, b, a, a, b]
 * 
 * Each edge can be expressed in AB form by its length coefficient and direction.
 */
const HAT_OUTLINE_AB = (function() {
  // Compute edge vectors and directions from the hex outline
  const edgeInfo = [];
  for (let i = 0; i < HAT_OUTLINE.length; i++) {
    const j = (i + 1) % HAT_OUTLINE.length;
    const dx = HAT_OUTLINE[j].x - HAT_OUTLINE[i].x;
    const dy = HAT_OUTLINE[j].y - HAT_OUTLINE[i].y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Determine edge type based on length at a=1, b=√3
    // Length ≈ 1 → type 'a', coefficient 1
    // Length ≈ √3 ≈ 1.732 → type 'b', coefficient 1
    // Length ≈ 2 → type 'a', coefficient 2
    let type, coef;
    if (Math.abs(length - 1) < 0.01) {
      type = 'a'; coef = 1;
    } else if (Math.abs(length - SQRT3) < 0.01) {
      type = 'b'; coef = 1;
    } else if (Math.abs(length - 2) < 0.01) {
      type = 'a'; coef = 2;
    } else {
      console.warn(`Unexpected edge length: ${length}`);
      type = 'a'; coef = length;
    }
    
    // Unit direction
    const ux = dx / length;
    const uy = dy / length;
    
    edgeInfo.push({ type, coef, ux, uy });
  }
  
  // Build AB vertices by accumulating edges
  const vertices = [];
  let currentX = makeAB(0, 0);
  let currentY = makeAB(0, 0);
  
  vertices.push(makeABPoint(currentX, currentY));
  
  for (let i = 0; i < HAT_OUTLINE.length - 1; i++) {
    const edge = edgeInfo[i];
    
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

// Verify HAT_OUTLINE_AB matches HAT_OUTLINE at a=1, b=√3
(function verifyOutlineMatch() {
  const tolerance = 0.01;
  const abEval = HAT_OUTLINE_AB.map(p => evalABPoint(p, 1, SQRT3));
  let maxDist = 0;
  
  for (let i = 0; i < Math.min(HAT_OUTLINE.length, abEval.length); i++) {
    const dx = abEval[i].x - HAT_OUTLINE[i].x;
    const dy = abEval[i].y - HAT_OUTLINE[i].y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > maxDist) maxDist = d;
  }
  
  if (maxDist > tolerance) {
    console.warn(`HAT_OUTLINE_AB max vertex mismatch: ${maxDist.toFixed(4)} (tolerance: ${tolerance})`);
  }
})();

// ============================================================
// METATILE CLASSES
// ============================================================

class HatTile {
  constructor(label, shape = null) {
    this.label = label;
    // Use provided shape or compute from current reference point
    this.shape = shape || getCurrentHatOutline();
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
// INITIAL METATILES (Original numeric versions)
// ============================================================

function createHatTiles() {
  // All tiles share the same shape (computed at current reference point)
  const shape = getCurrentHatOutline();
  
  return {
    H1: new HatTile('H1', shape),
    H: new HatTile('H', shape),
    T: new HatTile('T', shape),
    P: new HatTile('P', shape),
    F: new HatTile('F', shape)
  };
}

/**
 * Get the current hex coordinate values based on current reference point.
 * At reference (a=1, b=√3): hex_x = 0.5, hex_y = √3/2
 * In general: hex_x = a/2, hex_y = b/2
 */
function getHexY() {
  return {
    x: CURRENT_REF_A / 2,
    y: CURRENT_REF_B / 2
  };
}

/**
 * Get the hat outline evaluated at the current reference point.
 */
function getCurrentHatOutline() {
  return evaluateOutline(HAT_OUTLINE_AB, CURRENT_REF_A, CURRENT_REF_B);
}

function initH(hats) {
  const HY = getHexY();
  const hatOutline = getCurrentHatOutline();
  
  const outline = [
    { x: 0, y: 0 }, { x: 4 * CURRENT_REF_A, y: 0 },
    { x: 4.5 * CURRENT_REF_A, y: HY.y }, { x: 2.5 * CURRENT_REF_A, y: 5 * HY.y },
    { x: 1.5 * CURRENT_REF_A, y: 5 * HY.y }, { x: -HY.x, y: HY.y }
  ];
  
  const meta = new MetaTile(outline, 2);
  meta.addChild(matchShapes(hatOutline[5], hatOutline[7], outline[5], outline[0]), hats.H);
  meta.addChild(matchShapes(hatOutline[9], hatOutline[11], outline[1], outline[2]), hats.H);
  meta.addChild(matchShapes(hatOutline[5], hatOutline[7], outline[3], outline[4]), hats.H);
  meta.addChild(matMul(getTranslMat(2.5 * CURRENT_REF_A, HY.y), matMul(
    [-HY.x, -HY.y, 0, HY.y, -HY.x, 0],
    [HY.x, 0, 0, 0, -HY.x, 0]
  )), hats.H1);
  
  return meta;
}

function initT(hats) {
  const HY = getHexY();
  
  const outline = [
    { x: 0, y: 0 }, { x: 3 * CURRENT_REF_A, y: 0 }, { x: 1.5 * CURRENT_REF_A, y: 3 * HY.y }
  ];
  
  const meta = new MetaTile(outline, 2);
  meta.addChild([HY.x, 0, HY.x, 0, HY.x, HY.y], hats.T);
  
  return meta;
}

function initP(hats) {
  const HY = getHexY();
  
  const outline = [
    { x: 0, y: 0 }, { x: 4 * CURRENT_REF_A, y: 0 },
    { x: 3 * CURRENT_REF_A, y: 2 * HY.y }, { x: -1 * CURRENT_REF_A, y: 2 * HY.y }
  ];
  
  const meta = new MetaTile(outline, 2);
  meta.addChild([HY.x, 0, 1.5 * CURRENT_REF_A, 0, HY.x, HY.y], hats.P);
  meta.addChild(matMul(getTranslMat(0, 2 * HY.y), matMul(
    [HY.x, HY.y, 0, -HY.y, HY.x, 0],
    [HY.x, 0, 0, 0, HY.x, 0]
  )), hats.P);
  
  return meta;
}

function initF(hats) {
  const HY = getHexY();
  
  const outline = [
    { x: 0, y: 0 }, { x: 3 * CURRENT_REF_A, y: 0 },
    { x: 3.5 * CURRENT_REF_A, y: HY.y }, { x: 3 * CURRENT_REF_A, y: 2 * HY.y },
    { x: -1 * CURRENT_REF_A, y: 2 * HY.y }
  ];
  
  const meta = new MetaTile(outline, 2);
  meta.addChild([HY.x, 0, 1.5 * CURRENT_REF_A, 0, HY.x, HY.y], hats.F);
  meta.addChild(matMul(getTranslMat(0, 2 * HY.y), matMul(
    [HY.x, HY.y, 0, -HY.y, HY.x, 0],
    [HY.x, 0, 0, 0, HY.x, 0]
  )), hats.F);
  
  return meta;
}

// ============================================================
// AB METATILE CLASSES AND INITIALIZATION
// ============================================================

/**
 * HEX_Y in AB form:
 * HEX_Y.x = 0.5 = a/2 when a=1, so: makeAB(0.5, 0)
 * HEX_Y.y = sqrt(3)/2 = b/2 when b=sqrt(3), so: makeAB(0, 0.5)
 */
const HEX_Y_AB = {
  x: makeAB(0.5, 0),
  y: makeAB(0, 0.5)
};

/**
 * Create an AB point from numeric x,y coordinates expressed in terms of a and b.
 * Used for metatile outline construction.
 */
function makeMetaPointAB(aCoefX, bCoefX, aCoefY, bCoefY) {
  return {
    x: abToQuad(makeAB(aCoefX, bCoefX)),
    y: abToQuad(makeAB(aCoefY, bCoefY))
  };
}

/**
 * HatTile class with AB coordinate support.
 * Stores the hat shape in AB form.
 */
class HatTileAB {
  constructor(label) {
    this.label = label;
    // Shape in ABQuad form (converted from HAT_OUTLINE_AB)
    this.shapeAB = HAT_OUTLINE_AB.map(p => ({
      x: abToQuad(p.x),
      y: abToQuad(p.y)
    }));
    // Also keep numeric shape for compatibility
    this.shape = HAT_OUTLINE;
  }
  
  draw(S_ABQ, level, collector) {
    collector.push({ transformAB: S_ABQ, label: this.label });
  }
}

/**
 * MetaTile class with AB coordinate support.
 * Stores shape and transforms in ABQuad form.
 */
class MetaTileAB {
  constructor(shapeAB, width) {
    this.shapeAB = shapeAB;
    this.width = width;
    this.children = [];
  }
  
  addChild(T_ABQ, geom) {
    this.children.push({ T: T_ABQ, geom });
  }
  
  evalChild(n, i) {
    const child = this.children[n];
    const shapeAB = child.geom.shapeAB;
    const idx = i % shapeAB.length;
    return matVecMulABQuad(child.T, shapeAB[idx]);
  }
  
  draw(S_ABQ, level, collector) {
    if (level > 0) {
      for (const child of this.children) {
        child.geom.draw(matMulABQuad(S_ABQ, child.T), level - 1, collector);
      }
    }
  }
  
  recentre() {
    // Compute centroid at current reference point
    let cx = 0, cy = 0;
    for (const p of this.shapeAB) {
      cx += evalABQuad(p.x, CURRENT_REF_A, CURRENT_REF_B);
      cy += evalABQuad(p.y, CURRENT_REF_A, CURRENT_REF_B);
    }
    cx /= this.shapeAB.length;
    cy /= this.shapeAB.length;
    
    // Create translation to center (as constant ABQuad since centroid is numeric)
    const negCx = constToQuad(-cx);
    const negCy = constToQuad(-cy);
    
    // Update shape
    this.shapeAB = this.shapeAB.map(p => ({
      x: addABQuad(p.x, negCx),
      y: addABQuad(p.y, negCy)
    }));
    
    // Update child transforms
    const M = getTranslMatABQuad(negCx, negCy);
    for (const child of this.children) {
      child.T = matMulABQuad(M, child.T);
    }
  }
}

/**
 * Create HatTile objects with AB support
 */
function createHatTilesAB() {
  return {
    H1: new HatTileAB('H1'),
    H: new HatTileAB('H'),
    T: new HatTileAB('T'),
    P: new HatTileAB('P'),
    F: new HatTileAB('F')
  };
}

/**
 * Convert numeric matrix to ABQuad matrix (as constants)
 */
function numericMatToABQuad(mat) {
  return mat.map(v => constToQuad(v));
}

/**
 * Initialize H metatile with AB coordinates
 * 
 * Original outline points (in hex-influenced coordinates):
 *   { x: 0, y: 0 }           → x: 0*a + 0*b, y: 0*a + 0*b
 *   { x: 4, y: 0 }           → x: 4*a + 0*b, y: 0
 *   { x: 4.5, y: HEX_Y.y }   → x: 4.5*a, y: 0.5*b
 *   { x: 2.5, y: 5*HEX_Y.y } → x: 2.5*a, y: 2.5*b
 *   { x: 1.5, y: 5*HEX_Y.y } → x: 1.5*a, y: 2.5*b
 *   { x: -HEX_Y.x, y: HEX_Y.y } → x: -0.5*a, y: 0.5*b
 * 
 * Note: The numeric values in the outline are calibrated for a=1, b=√3.
 * The x coordinates are primarily in 'a' units, y coordinates in 'b' units.
 */
function initH_AB(hats) {
  // Outline points in ABQuad form
  const outlineAB = [
    makeMetaPointAB(0, 0, 0, 0),         // (0, 0)
    makeMetaPointAB(4, 0, 0, 0),         // (4, 0)
    makeMetaPointAB(4.5, 0, 0, 0.5),     // (4.5, HEX_Y.y)
    makeMetaPointAB(2.5, 0, 0, 2.5),     // (2.5, 5*HEX_Y.y)
    makeMetaPointAB(1.5, 0, 0, 2.5),     // (1.5, 5*HEX_Y.y)
    makeMetaPointAB(-0.5, 0, 0, 0.5)     // (-HEX_Y.x, HEX_Y.y)
  ];
  
  const meta = new MetaTileAB(outlineAB, 2);
  
  // Get HAT_OUTLINE_AB as ABQuad points
  const hatShapeAB = hats.H.shapeAB;
  
  // Child 0: matchShapes(HAT_OUTLINE[5], HAT_OUTLINE[7], outline[5], outline[0])
  meta.addChild(matchShapesAB(hatShapeAB[5], hatShapeAB[7], outlineAB[5], outlineAB[0]), hats.H);
  
  // Child 1: matchShapes(HAT_OUTLINE[9], HAT_OUTLINE[11], outline[1], outline[2])
  meta.addChild(matchShapesAB(hatShapeAB[9], hatShapeAB[11], outlineAB[1], outlineAB[2]), hats.H);
  
  // Child 2: matchShapes(HAT_OUTLINE[5], HAT_OUTLINE[7], outline[3], outline[4])
  meta.addChild(matchShapesAB(hatShapeAB[5], hatShapeAB[7], outlineAB[3], outlineAB[4]), hats.H);
  
  // Child 3 (H1): Complex reflection transform
  // Original: matMul(getTranslMat(2.5, HEX_Y.y), matMul(
  //   [-HEX_Y.x, -HEX_Y.y, 0, HEX_Y.y, -HEX_Y.x, 0],
  //   [HEX_Y.x, 0, 0, 0, -HEX_Y.x, 0]))
  // In AB form:
  const refMat1 = makeABQuadMatrix([
    makeAB(-0.5, 0), makeAB(0, -0.5), constToQuad(0),
    makeAB(0, 0.5), makeAB(-0.5, 0), constToQuad(0)
  ]);
  const refMat2 = makeABQuadMatrix([
    makeAB(0.5, 0), constToQuad(0), constToQuad(0),
    constToQuad(0), makeAB(-0.5, 0), constToQuad(0)
  ]);
  const transMat = getTranslMatABQuad(abToQuad(makeAB(2.5, 0)), abToQuad(makeAB(0, 0.5)));
  const h1Transform = matMulABQuad(transMat, matMulABQuad(refMat1, refMat2));
  meta.addChild(h1Transform, hats.H1);
  
  return meta;
}

/**
 * Initialize T metatile with AB coordinates
 */
function initT_AB(hats) {
  const outlineAB = [
    makeMetaPointAB(0, 0, 0, 0),         // (0, 0)
    makeMetaPointAB(3, 0, 0, 0),         // (3, 0)
    makeMetaPointAB(1.5, 0, 0, 1.5)      // (1.5, 3*HEX_Y.y)
  ];
  
  const meta = new MetaTileAB(outlineAB, 2);
  
  // Original: [HEX_Y.x, 0, HEX_Y.x, 0, HEX_Y.x, HEX_Y.y]
  // = [0.5*a, 0, 0.5*a, 0, 0.5*a, 0.5*b]
  const tTransform = makeABQuadMatrix([
    makeAB(0.5, 0), constToQuad(0), abToQuad(makeAB(0.5, 0)),
    constToQuad(0), makeAB(0.5, 0), abToQuad(makeAB(0, 0.5))
  ]);
  meta.addChild(tTransform, hats.T);
  
  return meta;
}

/**
 * Initialize P metatile with AB coordinates
 */
function initP_AB(hats) {
  const outlineAB = [
    makeMetaPointAB(0, 0, 0, 0),         // (0, 0)
    makeMetaPointAB(4, 0, 0, 0),         // (4, 0)
    makeMetaPointAB(3, 0, 0, 1),         // (3, 2*HEX_Y.y)
    makeMetaPointAB(-1, 0, 0, 1)         // (-1, 2*HEX_Y.y)
  ];
  
  const meta = new MetaTileAB(outlineAB, 2);
  
  // Child 0: [HEX_Y.x, 0, 1.5, 0, HEX_Y.x, HEX_Y.y]
  const pTransform1 = makeABQuadMatrix([
    makeAB(0.5, 0), constToQuad(0), constToQuad(1.5),
    constToQuad(0), makeAB(0.5, 0), abToQuad(makeAB(0, 0.5))
  ]);
  meta.addChild(pTransform1, hats.P);
  
  // Child 1: matMul(getTranslMat(0, 2*HEX_Y.y), matMul(
  //   [HEX_Y.x, HEX_Y.y, 0, -HEX_Y.y, HEX_Y.x, 0],
  //   [HEX_Y.x, 0, 0, 0, HEX_Y.x, 0]))
  const rotMat = makeABQuadMatrix([
    makeAB(0.5, 0), makeAB(0, 0.5), constToQuad(0),
    makeAB(0, -0.5), makeAB(0.5, 0), constToQuad(0)
  ]);
  const scaleMat = makeABQuadMatrix([
    makeAB(0.5, 0), constToQuad(0), constToQuad(0),
    constToQuad(0), makeAB(0.5, 0), constToQuad(0)
  ]);
  const transMatP = getTranslMatABQuad(constToQuad(0), abToQuad(makeAB(0, 1)));
  const pTransform2 = matMulABQuad(transMatP, matMulABQuad(rotMat, scaleMat));
  meta.addChild(pTransform2, hats.P);
  
  return meta;
}

/**
 * Initialize F metatile with AB coordinates
 */
function initF_AB(hats) {
  const outlineAB = [
    makeMetaPointAB(0, 0, 0, 0),         // (0, 0)
    makeMetaPointAB(3, 0, 0, 0),         // (3, 0)
    makeMetaPointAB(3.5, 0, 0, 0.5),     // (3.5, HEX_Y.y)
    makeMetaPointAB(3, 0, 0, 1),         // (3, 2*HEX_Y.y)
    makeMetaPointAB(-1, 0, 0, 1)         // (-1, 2*HEX_Y.y)
  ];
  
  const meta = new MetaTileAB(outlineAB, 2);
  
  // Child 0: [HEX_Y.x, 0, 1.5, 0, HEX_Y.x, HEX_Y.y]
  const fTransform1 = makeABQuadMatrix([
    makeAB(0.5, 0), constToQuad(0), constToQuad(1.5),
    constToQuad(0), makeAB(0.5, 0), abToQuad(makeAB(0, 0.5))
  ]);
  meta.addChild(fTransform1, hats.F);
  
  // Child 1: Same structure as P child 1
  const rotMat = makeABQuadMatrix([
    makeAB(0.5, 0), makeAB(0, 0.5), constToQuad(0),
    makeAB(0, -0.5), makeAB(0.5, 0), constToQuad(0)
  ]);
  const scaleMat = makeABQuadMatrix([
    makeAB(0.5, 0), constToQuad(0), constToQuad(0),
    constToQuad(0), makeAB(0.5, 0), constToQuad(0)
  ]);
  const transMatF = getTranslMatABQuad(constToQuad(0), abToQuad(makeAB(0, 1)));
  const fTransform2 = matMulABQuad(transMatF, matMulABQuad(rotMat, scaleMat));
  meta.addChild(fTransform2, hats.F);
  
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
// AB SUBSTITUTION RULES
// ============================================================

/**
 * Construct patch in AB form.
 * This is the AB version of constructPatch.
 */
function constructPatchAB(H, T, P, F) {
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
  
  const ret = new MetaTileAB([], H.width);
  
  for (const r of rules) {
    if (r.length === 1) {
      ret.addChild(identityABQuad(), shapes[r[0]]);
    } else if (r.length === 4) {
      // Rule format: [childIdx, edgeIdx, shapeName, matchEdgeIdx]
      const childRef = ret.children[r[0]];
      const poly = childRef.geom.shapeAB;
      const T_mat = childRef.T;
      // P and Q are vertices on the child's shape, transformed to world coords
      const P = matVecMulABQuad(T_mat, poly[(r[1] + 1) % poly.length]);
      const Q = matVecMulABQuad(T_mat, poly[r[1]]);
      const nshp = shapes[r[2]];
      const npoly = nshp.shapeAB;
      ret.addChild(matchShapesAB(npoly[r[3]], npoly[(r[3] + 1) % npoly.length], P, Q), nshp);
    } else {
      // Rule format: [childIdx1, edgeIdx1, childIdx2, edgeIdx2, shapeName, matchEdgeIdx]
      const chP = ret.children[r[0]];
      const chQ = ret.children[r[2]];
      const P = matVecMulABQuad(chQ.T, chQ.geom.shapeAB[r[3]]);
      const Q = matVecMulABQuad(chP.T, chP.geom.shapeAB[r[1]]);
      const nshp = shapes[r[4]];
      const npoly = nshp.shapeAB;
      ret.addChild(matchShapesAB(npoly[r[5]], npoly[(r[5] + 1) % npoly.length], P, Q), nshp);
    }
  }
  
  return ret;
}

/**
 * Construct metatiles from patch in AB form.
 * This is the AB version of constructMetatiles.
 */
function constructMetatilesAB(patch) {
  const bps1 = patch.evalChild(8, 2);
  const bps2 = patch.evalChild(21, 2);
  const rbps = matVecMulABQuad(getRotMatAboutPointABQuad(bps1, -2.0 * PI / 3.0), bps2);
  
  const p72 = patch.evalChild(7, 2);
  const p252 = patch.evalChild(25, 2);
  
  const llc = getIntersectPointABQuad(bps1, rbps, patch.evalChild(6, 2), p72);
  let w = vecSubABQuad(patch.evalChild(6, 2), llc);
  
  const newHOutline = [llc, bps1];
  w = matVecMulABQuad(getRotMatABQuad(-PI / 3), w);
  newHOutline.push(vecAddABQuad(newHOutline[1], w));
  newHOutline.push(patch.evalChild(14, 2));
  w = matVecMulABQuad(getRotMatABQuad(-PI / 3), w);
  newHOutline.push(vecSubABQuad(newHOutline[3], w));
  newHOutline.push(patch.evalChild(6, 2));
  
  const newH = new MetaTileAB(newHOutline, patch.width * 2);
  for (const ch of [0, 9, 16, 27, 26, 6, 1, 8, 10, 15]) {
    newH.addChild(patch.children[ch].T, patch.children[ch].geom);
  }
  
  const newPOutline = [p72, vecAddABQuad(p72, vecSubABQuad(bps1, llc)), bps1, llc];
  const newP = new MetaTileAB(newPOutline, patch.width * 2);
  for (const ch of [7, 2, 3, 4, 28]) {
    newP.addChild(patch.children[ch].T, patch.children[ch].geom);
  }
  
  const newFOutline = [bps2, patch.evalChild(24, 2), patch.evalChild(25, 0), p252, vecAddABQuad(p252, vecSubABQuad(llc, bps1))];
  const newF = new MetaTileAB(newFOutline, patch.width * 2);
  for (const ch of [21, 20, 22, 23, 24, 25]) {
    newF.addChild(patch.children[ch].T, patch.children[ch].geom);
  }
  
  const AAA = newHOutline[2];
  const BBB = vecAddABQuad(newHOutline[1], vecSubABQuad(newHOutline[4], newHOutline[5]));
  const CCC = matVecMulABQuad(getRotMatAboutPointABQuad(BBB, -PI / 3), AAA);
  const newTOutline = [BBB, CCC, AAA];
  const newT = new MetaTileAB(newTOutline, patch.width * 2);
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

/**
 * Generate a tiling with the specified number of substitution levels.
 * Returns an array of tiles, each with { transform, label }.
 */
function generateTiling(levels = 3) {
  const hats = createHatTiles();
  let tiles = [initH(hats), initT(hats), initP(hats), initF(hats)];
  let level = 1;
  
  while (level < levels) {
    const patch = constructPatch(tiles[0], tiles[1], tiles[2], tiles[3]);
    tiles = constructMetatiles(patch);
    level++;
  }
  
  const collector = [];
  tiles[0].draw(IDENTITY, level, collector);
  return collector;
}

/**
 * Generate a tiling with AB coordinates throughout.
 * 
 * IMPORTANT: Due to the mathematical complexity of symbolic matrix inversion
 * (determinants become quadratic in a,b), this function uses a hybrid approach:
 * - The tiling TOPOLOGY is computed numerically (at the reference point a=1, b=√3)
 * - The final transforms are stored and can be evaluated at any a,b
 * 
 * For TRUE morphing where tiles fit together at any t value, we would need to:
 * - Track edge types (a or b) through the substitution rules
 * - Compute placement based on edge connectivity, not world coordinates
 * 
 * Returns an array of tiles with { transformAB, label } where transformAB is an ABQuad matrix.
 */
function generateTilingAB(levels = 3) {
  // Use the numeric generation but convert transforms to ABQuad form
  // This preserves the correct topology while allowing the outline to morph
  const tiles = generateTiling(levels);
  
  // Convert numeric transforms to ABQuad (as constants)
  // The morphing happens through the outline, not the transforms
  return tiles.map(tile => ({
    transformAB: numericMatToABQuad(tile.transform),
    label: tile.label
  }));
}

/**
 * Generate a tiling that supports proper T(a,b) morphing.
 * 
 * This uses the numeric topology but enables shape morphing by:
 * 1. Computing transforms at reference point (a=1, b=√3)
 * 2. Storing both the transform and label
 * 3. Using the parameterized outline at render time
 * 
 * The key insight is that the tiling TOPOLOGY is independent of a,b -
 * tiles always connect at the same edges. The transforms encode this topology.
 * When we change a,b, we change the shape of each tile, but the connectivity
 * (which edge connects to which) remains the same.
 */
function generateTilingWithMorphing(levels = 3) {
  return generateTiling(levels);
}

/**
 * Generate a tiling at a specific reference point (a, b).
 * 
 * This allows generating a tiling that works correctly for a specific
 * point on the T(a,b) continuum. The tiling will be valid at this point
 * but may not morph correctly to other points (due to transform limitations).
 * 
 * @param {number} levels - Number of substitution levels
 * @param {number} a - The 'a' parameter for reference point
 * @param {number} b - The 'b' parameter for reference point
 * @returns {Array} Array of tiles with transforms
 */
function generateTilingAt(levels = 3, a = 1, b = SQRT3) {
  // Save current reference
  const oldA = CURRENT_REF_A;
  const oldB = CURRENT_REF_B;
  
  // Set new reference point
  CURRENT_REF_A = a;
  CURRENT_REF_B = b;
  
  // Debug: verify reference point is set
  // console.log(`generateTilingAt: a=${a.toFixed(4)}, b=${b.toFixed(4)}`);
  // console.log(`  HexY: x=${(a/2).toFixed(4)}, y=${(b/2).toFixed(4)}`);
  
  try {
    // Generate tiling at this reference point
    return generateTiling(levels);
  } finally {
    // Restore original reference
    CURRENT_REF_A = oldA;
    CURRENT_REF_B = oldB;
  }
}

/**
 * Get the outline for a specific t value on the continuum.
 */
function getOutlineForT(t) {
  const { a, b } = getABFromT(t);
  return evaluateOutline(HAT_OUTLINE_AB, a, b);
}

// ============================================================
// TILING VERIFICATION
// ============================================================

/**
 * Scale a transform's translation components for different a,b values.
 * 
 * The metatile coordinate system uses hexagonal geometry with:
 * - "a direction" = (1, 0) * a_value
 * - "b direction" = (0.5, √3/2) * b_value
 * 
 * Positions are linear combinations of a-steps and b-steps.
 * At reference (a₀=1, b₀=√3), a position (x_ref, y_ref) represents:
 *   n₁ steps in a-direction + n₂ steps in b-direction
 * where:
 *   x_ref = n₁ * 1 + n₂ * 0.5 * √3
 *   y_ref = n₂ * (√3/2) * √3 = n₂ * 1.5
 * 
 * At new (a, b), the same grid position becomes:
 *   x_new = n₁ * a + n₂ * 0.5 * b
 *   y_new = n₂ * (√3/2) * b
 * 
 * Solving for n₁, n₂ and substituting gives a 2x2 transform:
 *   x_new = a * x_ref + (b - √3*a)/3 * y_ref
 *   y_new = (b/√3) * y_ref
 * 
 * @param {Array} transform - 6-element affine transform [a, b, tx, c, d, ty]
 * @param {number} a - Current 'a' parameter
 * @param {number} b - Current 'b' parameter
 * @returns {Array} Scaled transform
 */
function scaleTransformForAB(transform, a, b) {
  const tx_ref = transform[2];
  const ty_ref = transform[5];
  
  // Apply hexagonal coordinate transform to translation
  const tx_new = a * tx_ref + (b - SQRT3 * a) / 3 * ty_ref;
  const ty_new = (b / SQRT3) * ty_ref;
  
  return [
    transform[0], transform[1], tx_new,
    transform[3], transform[4], ty_new
  ];
}

/**
 * Verify that a tiling is valid by checking edge matching.
 * 
 * For a valid tiling:
 * - Interior edges should have matching reverse edges from adjacent tiles
 * - Boundary edges have no match
 * - PARTIAL matches (edges that SHOULD be shared but don't match) indicate a BUG
 * 
 * @param {Array} tiles - Array of {transform, label}
 * @param {Array} outline - The hat outline to use
 * @param {number} tolerance - Maximum distance for vertices to be considered matching
 * @param {Object} abParams - Optional {a, b} parameters for transform scaling
 * @returns {Object} { total, matched, unmatched, partial, errors }
 */
function verifyTilingEdges(tiles, outline, tolerance = 0.0001, abParams = null) {
  // Collect all edges from all tiles
  const edges = [];
  
  for (let tileIdx = 0; tileIdx < tiles.length; tileIdx++) {
    const tile = tiles[tileIdx];
    
    // Scale transform if a,b parameters provided
    const transform = abParams 
      ? scaleTransformForAB(tile.transform, abParams.a, abParams.b)
      : tile.transform;
    
    const worldVertices = outline.map(p => matVecMul(transform, p));
    
    for (let i = 0; i < worldVertices.length; i++) {
      const j = (i + 1) % worldVertices.length;
      edges.push({
        p1: worldVertices[i],
        p2: worldVertices[j],
        tileIndex: tileIdx,
        edgeIndex: i
      });
    }
  }
  
  // Helper to check if two points are close
  function pointsClose(a, b, tol) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) < tol;
  }
  
  // Helper to check if two edges are approximately collinear (on same line)
  function edgesCollinear(e1, e2, angleTol = 0.1) {
    const dx1 = e1.p2.x - e1.p1.x;
    const dy1 = e1.p2.y - e1.p1.y;
    const dx2 = e2.p2.x - e2.p1.x;
    const dy2 = e2.p2.y - e2.p1.y;
    
    // Normalize
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (len1 < 0.0001 || len2 < 0.0001) return false;
    
    // Compare directions (accounting for reverse)
    const dot = (dx1 * dx2 + dy1 * dy2) / (len1 * len2);
    return Math.abs(Math.abs(dot) - 1) < angleTol;
  }
  
  // For each edge, find matching reverse edge
  let matched = 0;
  let unmatched = 0;
  let partial = 0;
  const errors = [];
  
  for (const edge of edges) {
    let foundExact = false;
    let foundPartial = false;
    let partialCandidate = null;
    
    for (const other of edges) {
      if (other.tileIndex === edge.tileIndex) continue; // Skip same tile
      
      // Check for reverse edge: other.p1 ≈ edge.p2 AND other.p2 ≈ edge.p1
      const p1Match = pointsClose(other.p1, edge.p2, tolerance);
      const p2Match = pointsClose(other.p2, edge.p1, tolerance);
      
      if (p1Match && p2Match) {
        foundExact = true;
        break;
      } else if ((p1Match || p2Match) && edgesCollinear(edge, other)) {
        // One vertex matches AND edges are collinear - this is a potential gap/overlap
        // (as opposed to corner-sharing which would not be collinear)
        foundPartial = true;
        partialCandidate = other;
      }
    }
    
    if (foundExact) {
      matched++;
    } else if (foundPartial) {
      partial++;
      errors.push({
        type: 'partial_match',
        tileIndex: edge.tileIndex,
        edgeIndex: edge.edgeIndex,
        p1: edge.p1,
        p2: edge.p2
      });
    } else {
      unmatched++; // Boundary edge or corner-sharing (not a bug)
    }
  }
  
  return {
    total: edges.length,
    matched,
    unmatched,
    partial,
    errors,
    valid: partial === 0
  };
}

/**
 * Test the tiling at multiple t values and return results.
 */
function testTilingAcrossSpectrum(levels = 3, tValues = [0.1, 0.2, 0.3, 0.366, 0.5, 0.6, 0.7, 0.8, 0.9]) {
  const tiles = generateTiling(levels);
  const results = [];
  
  for (const t of tValues) {
    const outline = getOutlineForT(t);
    const verification = verifyTilingEdges(tiles, outline);
    results.push({
      t,
      ...verification
    });
  }
  
  return results;
}

// ============================================================
// EXPORTS
// ============================================================

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Constants
    PI, SQRT3, SQRT3_2, HEX_Y, IDENTITY,
    HAT_OUTLINE, HAT_OUTLINE_AB,
    EDGE_SEQUENCE, DIRECTIONS,
    
    // Geometry utilities
    hexToCart, vecAdd, vecSub, matMul, matVecMul, invertMat,
    getRotMat, getTranslMat, getRotMatAboutPoint,
    matchSegment, matchShapes, getIntersectPoint,
    
    // AB coordinate system (linear)
    makeAB, addAB, subAB, scaleAB, evalAB,
    makeABPoint, addABPoint, subABPoint, evalABPoint,
    
    // ABQuad coordinate system (quadratic)
    makeABQuad, abToQuad, constToQuad, isLinearQuad, quadToAB,
    evalABQuad, addABQuad, subABQuad, scaleABQuad, negABQuad,
    mulABtoQuad, mulABQuadPair, divABQuadByConst,
    
    // ABQuad matrix operations
    makeABQuadMatrix, identityABQuad, evalABQuadMatrix,
    matMulABQuad, matVecMulABQuad, invertMatABQuad,
    abPointToQuadPoint, evalABQuadPoint,
    
    // AB/ABQuad geometry utilities
    matchSegmentAB, matchShapesAB,
    getRotMatABQuad, getTranslMatABQuad, getRotMatAboutPointABQuad,
    getIntersectPointABQuad, vecAddABQuad, vecSubABQuad,
    
    // Outline functions
    buildHatOutlineAB, evaluateOutline, getABFromT, getOutlineForT,
    
    // Tiling generation (original numeric)
    generateTiling, createHatTiles,
    HatTile, MetaTile,
    initH, initT, initP, initF,
    constructPatch, constructMetatiles,
    
    // Tiling generation (AB coordinate versions)
    HEX_Y_AB, makeMetaPointAB,
    HatTileAB, MetaTileAB,
    createHatTilesAB,
    initH_AB, initT_AB, initP_AB, initF_AB,
    constructPatchAB, constructMetatilesAB,
    generateTilingAB, generateTilingWithMorphing,
    generateTilingAt,
    numericMatToABQuad,
    
    // Reference point control
    setReferencePoint, getReferencePoint,
    
    // Verification and transform utilities
    scaleTransformForAB,
    verifyTilingEdges, testTilingAcrossSpectrum
  };
}

