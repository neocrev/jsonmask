import { spawnSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bin = join(__dirname, '..', 'bin', 'jsonmask.js');

function run(input, args = []) {
  const proc = spawnSync('node', [bin, ...args], { input });
  return { stdout: proc.stdout.toString().trim(), stderr: proc.stderr.toString().trim(), status: proc.status };
}

function assert(condition, msg) {
  if (!condition) {
    console.error(`FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`PASS: ${msg}`);
}

// Test 1: basic password masking via pipe
const r1 = run(JSON.stringify({ user: 'alice', password: 'supersecret' }));
const o1 = JSON.parse(r1.stdout);
assert(o1.password.includes('****'), 'password is masked');
assert(o1.user === 'alice', 'non-sensitive field untouched');

// Test 2: custom fields
const r2 = run(JSON.stringify({ name: 'John', ssn: '123-45-6789' }), ['-f', 'ssn']);
const o2 = JSON.parse(r2.stdout);
assert(o2.ssn.includes('***'), 'custom field is masked');
assert(o2.name === 'John', 'other field untouched');

// Test 3: mask all
const r3 = run(JSON.stringify({ a: 'hello', b: 'world' }), ['-f', 'all']);
const o3 = JSON.parse(r3.stdout);
assert(o3.a.includes('*'), 'all strings masked');
assert(o3.b.includes('*'), 'all strings masked');

// Test 4: nested objects
const r4 = run(JSON.stringify({ outer: { user: 'bob', token: 'abc123' } }));
const o4 = JSON.parse(r4.stdout);
assert(o4.outer.token.includes('*'), 'nested token masked');
assert(o4.outer.user === 'bob', 'nested user untouched');

// Test 5: arrays
const r5 = run(JSON.stringify({ users: [{ name: 'alice', pass: 'x' }, { name: 'bob', pass: 'y' }] }));
const o5 = JSON.parse(r5.stdout);
assert(o5.users[0].pass.includes('*'), 'password in array masked');
assert(o5.users[0].name === 'alice', 'name in array untouched');

// Test 6: file input
const tmp = '/tmp/_jsonmask_test.json';
writeFileSync(tmp, JSON.stringify({ api_key: 'sk-abc123def456' }));
const r6 = run(null, ['-i', tmp]);
unlinkSync(tmp);
const o6 = JSON.parse(r6.stdout);
assert(o6.api_key.includes('*'), 'file input works');

// Test 7: invalid JSON
const r7 = run('not json');
assert(r7.status === 1, 'invalid JSON exits 1');

// Test 8: --list
const r8 = run(null, ['-l']);
assert(r8.stdout.includes('password'), 'list shows default fields');

// Test 9: custom mask char
const r9 = run(JSON.stringify({ token: 'secret123' }), ['-c', '#']);
const o9 = JSON.parse(r9.stdout);
assert(o9.token.includes('#'), 'custom mask char works');

console.log('\n✓ All jsonmask tests passed');
