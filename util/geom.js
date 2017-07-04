import vec3 from 'gl-vec3';
import vec2 from 'gl-vec2';
import lineclip from 'lineclip';
import arrayAlmostEqual from 'array-almost-equal';
import triangleCentroid from 'triangle-centroid';
import insideTriangle from 'point-in-triangle';

const tmp1 = [];
const tmp2 = [];
const tmpTriangle = [ 0, 0, 0 ];

// Random point in N-dimensional triangle
export function randomPointInTriangle (out = [], a, b, c, u = random(), v = random()) {
  if ((u + v) > 1) {
    u = 1 - u;
    v = 1 - v;
  }
  const dim = a.length;
  const Q = 1 - u - v;
  for (let i = 0; i < dim; i++) {
    out[i] = (a[i] * u) + (b[i] * v) + (c[i] * Q);
  }
  return out;
}

export const FaceCull = {
  BACK: -1,
  FRONT: 1,
  NONE: 0
};

function isTriangleVisible (cell, vertices, rayDir, side = FaceCull.BACK) {
  if (side === FaceCull.NONE) return true;
  const verts = cell.map(i => vertices[i]);
  const v0 = verts[0];
  const v1 = verts[1];
  const v2 = verts[2];
  vec3.subtract(tmp1, v1, v0);
  vec3.subtract(tmp2, v2, v0);
  vec3.cross(tmp1, tmp1, tmp2);
  vec3.normalize(tmp1, tmp1);
  const d = vec3.dot(rayDir, tmp1);
  return side === FaceCull.BACK ? d > 0 : d <= 0;
}

// Whether the 3D triangle face is visible to the camera
// i.e. backface / frontface culling
export function isFaceVisible (cell, vertices, rayDir, side = FaceCull.BACK) {
  if (side === FaceCull.NONE) return true;
  if (cell.length === 3) {
    return isTriangleVisible(cell, vertices, rayDir, side);
  }
  if (cell.length !== 4) throw new Error('isFaceVisible can only handle triangles and quads');
}

export function clipPolylinesToBox (polylines, bbox, border = false, closeLines = true) {
  if (border) {
    return polylines.map(line => {
      const result = lineclip.polygon(line, bbox);
      if (closeLines && result.length > 2) result.push(result[0]);
      return result;
    }).filter(lines => lines.length > 0);
  } else {
    return polylines.map(line => {
      return lineclip.polyline(line, bbox);
    }).reduce((a, b) => a.concat(b), []);
  }
}

// Normal of a 3D triangle face
export function computeFaceNormal (cell, positions, out = []) {
  const a = positions[cell[0]];
  const b = positions[cell[1]];
  const c = positions[cell[2]];
  vec3.subtract(out, c, b);
  vec3.subtract(tmp2, a, b);
  vec3.cross(out, out, tmp2);
  vec3.normalize(out, out);
  return out;
}

// Area of 2D or 3D triangle
export function computeTriangleArea (a, b, c) {
  if (a.length >= 3 && b.length >= 3 && c.length >= 3) {
    vec3.subtract(tmp1, c, b);
    vec3.subtract(tmp2, a, b);
    vec3.cross(tmp1, tmp1, tmp2);
    return vec3.length(tmp1) * 0.5;
  } else {
    return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1])) * 0.5;
  }
}

export function createHatchLines (bounds, angle = -Math.PI / 4, spacing = 0.5, out = []) {
  // Reference:
  // https://github.com/evil-mad/EggBot/blob/master/inkscape_driver/eggbot_hatch.py
  spacing = Math.abs(spacing);
  if (spacing === 0) throw new Error('cannot use a spacing of zero as it will run an infinite loop!');

  const xmin = bounds[0][0];
  const ymin = bounds[0][1];
  const xmax = bounds[1][0];
  const ymax = bounds[1][1];

  const w = xmax - xmin;
  const h = ymax - ymin;
  if (w === 0 || h === 0) return out;
  const r = Math.sqrt(w * w + h * h) / 2;
  const rotAngle = Math.PI / 2 - angle;
  const ca = Math.cos(rotAngle);
  const sa = Math.sin(rotAngle);
  const cx = bounds[0][0] + (w / 2);
  const cy = bounds[0][1] + (h / 2);
  let i = -r;
  while (i <= r) {
    // Line starts at (i, -r) and goes to (i, +r)
    const x1 = cx + ( i * ca ) + ( r * sa ); //  i * ca - (-r) * sa
    const y1 = cy + ( i * sa ) - ( r * ca ); //  i * sa + (-r) * ca
    const x2 = cx + ( i * ca ) - ( r * sa ); //  i * ca - (+r) * sa
    const y2 = cy + ( i * sa ) + ( r * ca ); //  i * sa + (+r) * ca
    i += spacing;
    // Remove any potential hatch lines which are entirely
    // outside of the bounding box
    if ((x1 < xmin && x2 < xmin) || (x1 > xmax && x2 > xmax)) {
      continue;
    }
    if ((y1 < ymin && y2 < ymin) || (y1 > ymax && y2 > ymax)) {
      continue;
    }
    out.push([ [ x1, y1 ], [ x2, y2 ] ]);
  }
  return out;
}



export function intersectLineSegmentLineSegment (p1, p2, p3, p4) {
  // Reference:
  // https://github.com/evil-mad/EggBot/blob/master/inkscape_driver/eggbot_hatch.py
  const d21x = p2[0] - p1[0];
  const d21y = p2[1] - p1[1];
  const d43x = p4[0] - p3[0];
  const d43y = p4[1] - p3[1];
  
  // denominator
  const d = d21x * d43y - d21y * d43x;
  if (d === 0) return -1;

  const nb = (p1[1] - p3[1]) * d21x - (p1[0] - p3[0]) * d21y;
  const sb = nb / d
  if (sb < 0 || sb > 1) return -1;

  const na = (p1[1] - p3[1]) * d43x - (p1[0] - p3[0]) * d43y;
  const sa = na / d;
  if (sa < 0 || sa > 1) return -1;
  return sa;
}

export function expandVector (point, centroid, amount = 0) {
  point = vec2.copy([], point);
  const dir = vec2.subtract([], centroid, point);
  const maxLen = vec2.length(dir);
  const len = Math.min(maxLen, amount);
  if (maxLen !== 0) vec2.scale(dir, dir, 1 / maxLen); // normalize
  vec2.scaleAndAdd(point, point, dir, len);
  return point;
}

export function clipLineToTriangle (p1, p2, a, b, c, border = 0, result = []) {
  if (border !== 0) {
    let centroid = triangleCentroid([ a, b, c ]);
    a = expandVector(a, centroid, border);
    b = expandVector(b, centroid, border);
    c = expandVector(c, centroid, border);
  }

  // first check if all points are inside triangle
  tmpTriangle[0] = a;
  tmpTriangle[1] = b;
  tmpTriangle[2] = c;
  if (insideTriangle(p1, tmpTriangle) && insideTriangle(p2, tmpTriangle)) {
    result[0] = p1.slice();
    result[1] = p2.slice();
    return true;
  }

  // triangle segments
  const segments = [
    [ a, b ],
    [ b, c ],
    [ c, a ]
  ];

  for (let i = 0; i < 3; i++) {
    // test against each triangle edge
    const segment = segments[i];
    let p3 = segment[0];
    let p4 = segment[1];

    const fract = intersectLineSegmentLineSegment(p1, p2, p3, p4);
    if (fract >= 0 && fract <= 1) {
      result.push([
        p1[0] + fract * (p2[0] - p1[0]),
        p1[1] + fract * (p2[1] - p1[1])
      ]);
      // when we have 2 result we can stop checking
      if (result.length >= 2) break;
    }
  }

  if (arrayAlmostEqual(result[0], result[1])) {
    // if the two points are close enough they are basically
    // touching, or if the border pushed them close together,
    // then ignore this altogether
    result.length = 0;
  }

  return result.length === 2;
}

// Parses a Three.js JSON to a mesh
export function parseThreeJSONGeometry (mesh) {
  const positionAttribute = mesh.data.attributes.position;
  const cells = rollArray(mesh.data.index.array, 3);
  const positions = rollArray(positionAttribute.array, positionAttribute.itemSize);
  return { cells, positions };
}

function rollArray (array, count) {
  const output = [];
  for (let i = 0, j = 0; i < array.length / count; i++) {
    const item = [];
    for (let c = 0; c < count; c++, j++) {
      item[c] = array[j];
    }
    output.push(item);
  }
  return output;
}