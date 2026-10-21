# Convex Auth environment variables

Sign-in runs on the Convex deployment, not in the app files. Pushing `convex/` is not enough. Convex Auth will crash with `Missing environment variable JWT_PRIVATE_KEY` until the three variables below exist **on that Convex**.

Official: [Convex Auth](https://labs.convex.dev/auth). Convex env: [Environment variables](https://docs.convex.dev/production/environment-variables).

## What to set

Set these on the Convex dev deployment (dashboard → Environment Variables, or `npx convex env set`). Do not put them in Git, in `ACCESS-LIST.md`, or in a chat.

- `JWT_PRIVATE_KEY` — private key used to sign a login session
- `JWKS` — the matching public key
- `SITE_URL` — the address Convex Auth sends people back to after a redirect sign-in. Showlog signs in with email and password, which never redirects, so this is the app link `showlog://`.

`CONVEX_URL` and `EXPO_PUBLIC_CONVEX_URL` only tell the app **which** Convex to call. They are not these keys.

Email and password still need all three.

## How to set them

From the repo root, after `npx convex login`, the CLI uses the deployment in root `.env.local` (`CONVEX_DEPLOYMENT`). Confirm that is the **dev** deployment before you write secrets.

Do not run the interactive `npx @convex-dev/auth` wizard from an agent session. It hangs without a terminal to answer it.

Generate a key pair with `jose` (already in this repo via Convex Auth), then set each value as one argument so a key that starts with `-----BEGIN` is not parsed as a CLI flag:

```bash
npx convex env set "JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY----- …"
npx convex env set "JWKS={…}"
npx convex env set "SITE_URL=showlog://"
```

Delete any local file that held the keys (for example `.auth-keys.json`). That filename is gitignored.

`npx convex env list` prints the private key. Do not paste that output into chat or a ticket.

A sign-in ticket is not done until these three names exist on that Convex. Tests do not prove they exist.

## Simulator and iPhone

The development build on the simulator and the preview build on the iPhone both use this one dev deployment. Once the keys exist there, sign-in works on both. You do not set the keys on Expo.

The production app uses the production deployment. Generate a new key pair for it. Do not copy the dev private key. Set the three names with `npx convex env set --prod "NAME=value"`. `SITE_URL` is `showlog://` there too.
