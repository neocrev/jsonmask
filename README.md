<p align="center">
  <h1>jsonmask</h1>
  <p>Pipe JSON through it. Secrets get masked. Nothing leaks.</p>
  <a href="https://www.npmjs.com/package/@neocrev/jsonmask"><img src="https://img.shields.io/npm/v/@neocrev/jsonmask" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License"></a>
</p>

<p align="center">
  <img src="demo.svg" alt="jsonmask in action" width="600">
</p>

---

## Use cases

- Debug logging without leaking tokens
- Sharing API responses with colleagues
- CI pipelines that dump JSON
- Any `curl | jsonmask` situation

---

## Quick start

```bash
# Basic usage
echo '{"user":"admin","password":"supersecret"}' | npx @neocrev/jsonmask

# Mask everything
kubectl get secrets -o json | npx @neocrev/jsonmask -f all

# Custom fields
cat response.json | npx @neocrev/jsonmask -f ssn,credit_card,api_key

# Custom mask character
echo '{"token":"abc123"}' | npx @neocrev/jsonmask -c █
```

---

## Install

```bash
# No install needed
npx @neocrev/jsonmask --help

# Or globally
npm install -g @neocrev/jsonmask
```

---

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-f, --fields` | Fields to mask (comma-separated or `all`) | built-in list |
| `-i, --file` | Read from file | stdin |
| `-c, --char` | Mask character | `*` |
| `-l, --list` | Show default sensitive fields | |
| `-h, --help` | Show help | |

Runs with 20+ built-in field names: `password`, `secret`, `token`, `api_key`, `jwt`, `session`, `cookie`, `ssn`, `credit_card` and more.

---

## License

MIT
