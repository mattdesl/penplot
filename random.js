// utility for random features
import seedRandom from 'seed-random';
import SimplexNoise from 'simplex-noise';

const defaultRandom = () => Math.random();
let currentRandom = defaultRandom;
let currentSimplex = new SimplexNoise(currentRandom);

export const random = () => currentRandom();

export const setSeed = seed => {
  if (typeof seed === 'number' || typeof seed === 'string') {
    currentRandom = seedRandom(seed);
  } else {
    currentRandom = defaultRandom;
  }
  currentSimplex = new SimplexNoise(currentRandom);
}

export const noise2D = (x, y) => currentSimplex.noise2D(x, y);
export const noise3D = (x, y, z) => currentSimplex.noise3D(x, y, z);
export const noise4D = (x, y, z, w) => currentSimplex.noise4D(x, y, z, w);

export const randomSign = () => random() > 0.5 ? 1 : -1;

export const randomFloat = (min, max) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Expected all arguments to be numbers');
  }

  return random() * (max - min) + min;
};

export const shuffle = (arr) => {
  if (!Array.isArray(arr)) {
    throw new TypeError('Expected Array, got ' + typeof arr);
  }

  var rand;
  var tmp;
  var len = arr.length;
  var ret = arr.slice();
  while (len) {
    rand = Math.floor(random() * len--);
    tmp = ret[len];
    ret[len] = ret[rand];
    ret[rand] = tmp;
  }
  return ret;
};

export const randomInt = (min, max) => {
  if (max === undefined) {
    max = min;
    min = 0;
  }

  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new TypeError('Expected all arguments to be numbers');
  }

  return Math.floor(randomFloat(min, max));
};

// uniform distribution in a 2D circle
export const randomCircle = (out, scale) => {
  scale = scale || 1.0;
  var r = random() * 2.0 * Math.PI;
  out[0] = Math.cos(r) * scale;
  out[1] = Math.sin(r) * scale;
  return out;
};

// uniform distribution in a 3D sphere
export const randomSphere = (out, scale) => {
  scale = scale || 1.0;
  var r = random() * 2.0 * Math.PI;
  var z = (random() * 2.0) - 1.0;
  var zScale = Math.sqrt(1.0 - z * z) * scale;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale;
  return out;
};

// uniform distribution of quaternion rotations
export const randomQuaternion = (out) => {
  const u1 = random();
  const u2 = random();
  const u3 = random();

  const sq1 = Math.sqrt(1 - u1);
  const sq2 = Math.sqrt(u1);

  const theta1 = Math.PI * 2 * u2;
  const theta2 = Math.PI * 2 * u3;

  const x = Math.sin(theta1) * sq1;
  const y = Math.cos(theta1) * sq1;
  const z = Math.sin(theta2) * sq2;
  const w = Math.cos(theta2) * sq2;
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
};
