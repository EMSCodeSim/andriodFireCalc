import assert from 'node:assert/strict';
import fs from 'node:fs';

// store.js is browser ESM inside a package that is otherwise CommonJS.
// Load the exact production source as a data: module so the regression tests
// execute the real hydraulic helpers without changing the app's module setup.
const storage = new Map();
globalThis.localStorage = {
  getItem(key) { return storage.has(String(key)) ? storage.get(String(key)) : null; },
  setItem(key, value) { storage.set(String(key), String(value)); },
  removeItem(key) { storage.delete(String(key)); },
  clear() { storage.clear(); },
};

const source = fs.readFileSync('www/js/store.js', 'utf8');
const encoded = Buffer.from(source, 'utf8').toString('base64');
const hydraulics = await import(`data:text/javascript;base64,${encoded}`);

const {
  FL,
  FL_total,
  applianceLoss,
  PSI_PER_FT,
  NOZ,
  canonicalNozzleId,
} = hydraulics;

function approx(actual, expected, tolerance = 0.0001, label = 'value') {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected}, received ${actual}`,
  );
}

// Core FireOps legacy baselines. These are intentionally conservative tests:
// they protect existing Android behavior rather than introducing new formulas.
const fl175_185_200 = FL(185, '1.75', 200);
approx(fl175_185_200, 106.0975, 0.0001, '200 ft 1.75 in @ 185 gpm friction loss');
approx(50 + fl175_185_200, 156.0975, 0.0001, 'Chief XD 185 baseline PDP');

const fl25_265_250 = FL(265, '2.5', 250);
approx(fl25_265_250, 35.1125, 0.0001, '250 ft 2.5 in @ 265 gpm friction loss');
approx(50 + fl25_265_250, 85.1125, 0.0001, 'Chief XD 265 baseline PDP');

assert.equal(PSI_PER_FT, 0.5, 'Legacy elevation rule must remain 5 psi per 10 ft');
approx(50 + fl175_185_200 + (20 * PSI_PER_FT), 166.0975, 0.0001, '20 ft elevation PDP');

assert.equal(applianceLoss(350), 0, '350 gpm must not auto-add appliance loss');
assert.equal(applianceLoss(351), 10, 'Flow above 350 gpm must auto-add 10 psi appliance loss');

approx(
  FL_total(185, [
    { size: '1.75', lengthFt: 100 },
    { size: '1.75', lengthFt: 100 },
  ]),
  106.0975,
  0.0001,
  'segmented 200 ft line friction loss',
);

assert.equal(NOZ.chief185_50.gpm, 185, 'Chief XD 185 flow');
assert.equal(NOZ.chief185_50.NP, 50, 'Chief XD 185 nozzle pressure');
assert.equal(NOZ.chiefXD265.gpm, 265, 'Chief XD 265 flow');
assert.equal(NOZ.chiefXD265.NP, 50, 'Chief XD 265 nozzle pressure');
assert.equal(canonicalNozzleId('fog_xd_175_50_185'), 'chief185_50', 'Legacy nozzle id mapping');

console.log('PASS: legacy FireOps Calc hydraulic regression suite');
