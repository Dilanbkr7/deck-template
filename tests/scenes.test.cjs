/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, require: (name) => dependencies[name] ?? require(name),
    DOMException, ...globals,
  }, { filename: file });
  return exports;
}

test('layered chapters remain in range through jumps, reverse scroll and invalid input', () => {
  const { SCENES, TOTAL_TRAVEL, sceneAt, sceneProgress } = load('src/components/hero/layered/scenes.ts');
  assert.equal(SCENES.length, 3);
  assert.equal(TOTAL_TRAVEL, 3, 'three viewport lengths, including reading time in the last scene');
  for (let i = 0; i < 3; i++) assert.equal(sceneAt(sceneProgress(i)), i);
  for (let i = 2; i >= 0; i--) assert.equal(sceneAt(sceneProgress(i)), i);
  assert.equal(sceneAt(-1), 0);
  assert.equal(sceneAt(2), 2);
  assert.equal(sceneAt(NaN), 0);
  assert.equal(sceneAt(Infinity), 0);
  assert.equal(sceneAt(1 / 3 - 0.001), 0);
  assert.equal(sceneAt(1 / 3), 1);
  assert.equal(sceneAt(2 / 3 - 0.001), 1);
  assert.equal(sceneAt(2 / 3), 2);
  assert.equal(sceneAt(1), 2);
  assert.ok(sceneProgress(2) < 0.9, 'final chapter button leaves time to read before unpinning');
  assert.equal(sceneProgress(-1), 0);
  assert.equal(sceneProgress(NaN), 0);
  assert.equal(sceneProgress(99), sceneProgress(2));
  for (const scene of SCENES) assert.ok(fs.existsSync(path.join(root, 'public/media/hero-character', scene.image + '.webp')));
});
