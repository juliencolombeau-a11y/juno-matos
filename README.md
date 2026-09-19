# Juno-Matos

Juno-Matos is a responsive Nuxt application for browsing and managing educational materials. Visitors can search the public catalogue, while authenticated editors can create, update, delete, and image materials.

## Current status

The public catalogue, authentication, protected CRUD API, editor interface, Cloudinary upload flow, local database, production D1 schema, and initial production data transfer are complete.

The production D1 database currently contains the imported materials, reference values, existing Cloudinary links, and the primary administrator. The remaining work is the accessibility review, optional account deactivation/password reset flows, and any deployment adjustments discovered during live use.

## Stack

- Nuxt 4
- NuxtHub DB with SQLite locally and Cloudflare D1 in production
- Drizzle ORM
- Vuetify
- `nuxt-auth-utils` for encrypted server sessions
- Cloudinary for image storage
- Cloudflare Workers and GitHub deployment

## Local setup

Install dependencies from the repository root:

```bash
npm install
```

Create `.env` from `.env.example` and configure the local Cloudinary credentials and a session password of at least 32 characters. Start the development server:

```bash
npm run dev
```

On this Windows development environment, use `http://localhost:3000`. The address `http://127.0.0.1:3000` may not be reachable.

## Production configuration

Configure these values in the Cloudflare Workers & Pages project for the Production environment:

| Name | Type |
| --- | --- |
| `CLOUDFLARE_D1_DATABASE_ID` | Variable |
| `CLOUDINARY_CLOUD_NAME` | Variable |
| `CLOUDINARY_API_KEY` | Secret |
| `CLOUDINARY_API_SECRET` | Secret |
| `NUXT_SESSION_PASSWORD` | Secret |

`NUXT_BOOTSTRAP_SECRET` is temporary. Add it only when creating the first production administrator, then remove it and redeploy.

## D1 migrations and data transfer

NuxtHub generates the production D1 binding from `CLOUDFLARE_D1_DATABASE_ID` during the build. Apply schema migrations with:

```powershell
npx wrangler d1 migrations apply juno-matos-db --remote
```

The one-time local data export is generated in the ignored `.data` directory:

```powershell
npm run data:export
npx wrangler d1 execute juno-matos-db --remote --file .data/d1-data.sql --yes
```

The export includes materials, reference values, Cloudinary fields, and users. Do not commit `.data/d1-data.sql` or any `.env` file.

## Useful commands

```bash
npm run dev
npm run build
npx nuxt typecheck
npm run data:export
```

The implementation roadmap in `roadmap.md` records completed work and the remaining steps.
