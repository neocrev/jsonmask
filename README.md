# jsonmask

Pipe JSON through it. Sensitive fields get masked. Nothing gets committed by accident.

```bash
echo '{"user":"admin","password":"supersecret"}' | npx jsonmask
# {
#   "user": "admin",
#   "password": "super********"
# }
```

I wrote this after pasting a `kubectl get secrets -o json` output into a Slack DM. You know the feeling.

## But actually, it's useful for

- Logging debug output without leaking tokens
- Sharing API responses with colleagues
- CI pipelines that dump JSON
- Any `curl | jsonmask` situation

## Quick ones

```bash
# Mask everything (strict mode)
kubectl get secrets -o json | npx jsonmask -f all

# Custom fields
cat response.json | npx jsonmask -f ssn,credit_card,api_key

# Pick your mask character
echo '{"token":"abc123"}' | npx jsonmask -c █

# See what it considers sensitive
npx jsonmask -l
# → password, token, api_key, ssh_key, session, cookie...
```

## Install

```bash
# No install needed
npx jsonmask --help

# Or if you use it a lot
npm install -g jsonmask
```

## Options

```
-f, --fields    Fields to mask (comma-separated, or "all")
-i, --file      Read from file instead of stdin
-c, --char      Mask character                    [default: *]
-l, --list      List default sensitive fields
-h, --help      You know the drill
```

**Default sensitive fields**: password, secret, token, api_key, access_key, private_key, auth, jwt, session, cookie, credit_card, ssn, ssh_key, and about 20 more. Run `jsonmask -l` for the full list.

## License

MIT
