# jsonmask

**Mask sensitive JSON fields in logs, debug output, and CI pipelines.**

A zero-dependency CLI that redacts passwords, tokens, API keys, and other secrets from JSON — so you can safely log, share, or debug without leaking credentials.

## Why?

> "I accidentally committed a real API key in my debug log"

jsonmask prevents this. Pipe any JSON through it, and sensitive fields get masked. Works with `curl`, `kubectl`, `aws CLI` — anything that outputs JSON.

## Quick start

```bash
# Pipe JSON through jsonmask
echo '{"user":"admin","password":"supersecret"}' | npx jsonmask
# {
#   "user": "admin",
#   "password": "super********"
# }

# Mask specific fields
cat response.json | npx jsonmask -f ssn,credit_card

# Mask every string (strict mode)
kubectl get secrets -o json | npx jsonmask -f all
```

## Install

```bash
# Use directly via npx (no install needed)
npx jsonmask --help

# Or install globally
npm install -g jsonmask
```

## Usage

```bash
# Pipe mode (recommended)
cat data.json | jsonmask
curl -s https://api.example.com/data | jsonmask

# File mode
jsonmask -i response.json

# Custom fields
jsonmask -f password,token,secret

# Mask all strings
jsonmask -f all

# Custom mask character
jsonmask -c █

# List default sensitive fields
jsonmask -l
```

## Default sensitive fields

`password`, `pass`, `pwd`, `secret`, `token`, `api_key`, `apikey`, `access_key`, `secret_key`, `private_key`, `auth`, `authorization`, `jwt`, `session`, `cookie`, `credit_card`, `ssn`, `ssh_key`, plus many more. Run `jsonmask -l` for the full list.

## Examples

### Safe logging

```bash
node app.js 2>&1 | jsonmask > app.log
```

### Kubernetes secrets (preview)

```bash
kubectl get secret my-secret -o json | jsonmask
```

### AWS CLI output

```bash
aws secretsmanager get-secret-value --secret-id my-secret | jsonmask
```

## API

```
Usage: jsonmask [options]

Options:
  -f, --fields    Fields to mask (comma-separated, or "all")  [default: built-in list]
  -i, --file      Read from file instead of stdin
  -c, --char      Mask character                              [default: *]
  -l, --list      List default sensitive fields
  -h, --help      Show help
```

## License

MIT
