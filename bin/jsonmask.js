#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    fields: { type: 'string', short: 'f' },
    file: { type: 'string', short: 'i' },
    char: { type: 'string', short: 'c', default: '*' },
    list: { type: 'boolean', short: 'l', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
});

if (values.help) {
  console.log(`
jsonmask — mask sensitive JSON fields

USAGE
  cat data.json | jsonmask                    Mask default sensitive fields
  echo '{"user":"alice","password":"secret"}' | jsonmask
  jsonmask -i data.json                       Read from file
  jsonmask -f password,api_key,secret         Custom fields to mask
  jsonmask -f all                             Mask every string value
  jsonmask -c #                               Use custom mask character
  jsonmask -l                                 List default sensitive fields

DEFAULT FIELDS
  password, pass, pwd, secret, token, api_key, apikey,
  access_key, secret_key, private_key, auth, authorization,
  jwt, session, cookie, credit_card, ssn, ssh_key
`);
  process.exit(0);
}

const SENSITIVE_FIELDS = new Set([
  'password', 'pass', 'pwd', 'passwd',
  'secret', 'token', 'api_key', 'apikey',
  'access_key', 'accesskey', 'secret_key', 'secretkey',
  'private_key', 'privatekey',
  'auth', 'authorization', 'jwt', 'bearer',
  'session', 'cookie',
  'credit_card', 'creditcard', 'cc_number', 'ccv', 'cvv',
  'ssn', 'social_security',
  'ssh_key', 'sshkey',
  'mysql_password', 'postgres_password',
  'slack_token', 'discord_token', 'telegram_token',
  'aws_secret', 'gcp_key', 'azure_key',
  'refresh_token', 'access_token',
]);

if (values.list) {
  console.log([...SENSITIVE_FIELDS].sort().join('\n'));
  process.exit(0);
}

function mask(value, char, maxReveal = 4) {
  if (typeof value !== 'string') return value;
  if (value.length <= maxReveal) return char.repeat(Math.min(value.length, 8));
  return value.slice(0, maxReveal) + char.repeat(Math.min(value.length - maxReveal, 12)) + value.slice(-1);
}

function shouldMask(key, customFields, maskAll) {
  if (maskAll) return true;
  const lower = key.toLowerCase().replace(/[_-]/g, '');
  if (customFields) {
    return customFields.some(f => f.toLowerCase().replace(/[_-]/g, '') === lower);
  }
  return SENSITIVE_FIELDS.has(key.toLowerCase());
}

function processValue(value, maskChar, customFields, maskAll, depth = 0) {
  if (depth > 50) return value;
  if (Array.isArray(value)) {
    return value.map(v => processValue(v, maskChar, customFields, maskAll, depth + 1));
  }
  if (value !== null && typeof value === 'object') {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      if (shouldMask(key, customFields, maskAll)) {
        result[key] = mask(val, maskChar);
      } else {
        result[key] = processValue(val, maskChar, customFields, maskAll, depth + 1);
      }
    }
    return result;
  }
  return value;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

async function main() {
  let input;
  if (values.file) {
    input = readFileSync(values.file, 'utf-8');
  } else {
    input = await readStdin();
  }

  if (!input || !input.trim()) {
    console.error('jsonmask: no input (pipe JSON or use -i)');
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch {
    console.error('jsonmask: invalid JSON input');
    process.exit(1);
  }

  const customFields = values.fields
    ? (values.fields === 'all' ? null : values.fields.split(',').map(f => f.trim()))
    : undefined;

  const result = processValue(parsed, values.char, customFields, values.fields === 'all');
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

main();
