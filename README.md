# Matesther ERP

Uniform manufacturing ERP for **Matesther**, built to the *Uniform Manufacturing ERP —
Database Schema, Production Tracking & Next.js Architecture Specification*.

The specification is delivered in milestones (Section 65). This repository currently
contains **Milestone 1 — Foundation** and **Milestone 2 — Customers & Products**.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, Server Components by default) |
| Language | TypeScript (strict, no `any`) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma with UUID primary keys |
| Validation | Zod |
| Auth | Credentials + signed HTTP-only session cookie (`jose`), bcrypt password hashes |

## Milestone 1 — what is delivered

- Organizations, Users and the seven application roles (`OWNER`, `ADMIN`, `MANAGER`,
  `SUPERVISOR`, `ACCOUNTANT`, `STAFF`, `VIEWER`).
- Multi-tenancy from day one: every tenant-owned table carries `organization_id`, and
  every query is filtered by the session's organization (Sections 53, 54).
- A role/permission matrix enforced server-side in `src/lib/permissions` and
  `src/lib/auth/guards.ts` — never by hiding UI (Agent rule 7).
- Login page, session middleware, and a dashboard shell with a responsive sidebar
  covering the full route tree from Section 43.
- Prisma migration and an idempotent seed script.

## Milestone 2 — what is delivered

- Customers with contacts, and products with categories — all organization-scoped.
- Full CRUD: create, edit, deactivate/reactivate (master data is never deleted,
  Section 57), plus add/edit/remove of customer contacts with a single primary contact.
- Server-rendered lists with search, filters (type / category / status) and pagination;
  filter state lives in the URL so lists are shareable and bookmarkable.
- Every mutation is a server action guarded by `customer:write` / `product:write` and
  validated with Zod; every read and write is filtered by the session's organization.
- Selling prices are Prisma `Decimal` end to end and are formatted from strings, so no
  amount ever passes through a JavaScript float.

Modules for later milestones exist as routes with a placeholder that names the milestone
that delivers them, so navigation is complete without pre-building the ERP (Agent rules
1 and 2).

## Getting started

```bash
nvm use                  # Node version from .nvmrc
npm install
cp .env.example .env     # then fill in the values
npm run db:deploy        # apply migrations
npm run db:seed          # create the organization and one user per role
npm run dev
```

Open <http://localhost:3000> and sign in with `SEED_OWNER_EMAIL` /
`SEED_OWNER_PASSWORD`.

### Environment variables

See [.env.example](./.env.example). `.env` is gitignored and must never be committed.

Supabase note: the `db.<project-ref>.supabase.co` direct host resolves to IPv6 only on
current projects. On IPv4-only networks (most CI runners and container hosts) use the
pooler hostnames — transaction mode on port 6543 for `DATABASE_URL`, session mode on
port 5432 for `DIRECT_URL`, with the `postgres.<project-ref>` username.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | `prisma generate` then a production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests (set `RUN_DB_TESTS=1` to include the database tests) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create and apply a migration in development |
| `npm run db:deploy` | Apply pending migrations (CI / production) |
| `npm run db:validate` | Validate the Prisma schema |
| `npm run db:seed` | Seed the bootstrap organization and role accounts |
| `npm run db:studio` | Prisma Studio |

## Project layout

```
prisma/
  schema.prisma          # enums, Organization, User (Section 64 ordering)
  seed.ts
  migrations/
src/
  app/
    (auth)/              # login, forgot-password
    (dashboard)/         # dashboard shell + every module route from Section 43
  components/
    layout/              # sidebar, topbar, page header, placeholders
    ui/                  # shadcn/ui primitives
  features/              # per-domain actions / queries / schemas
    auth/
    customers/
    dashboard/
    products/
  lib/
    auth/                # session cookie, password hashing, request guards
    constants/           # roles, navigation
    db/                  # Prisma client, transaction helper
    errors/
    permissions/
  middleware.ts          # edge-level session-cookie gate
```

Business logic lives in `src/features/<domain>` and `src/lib`, never in page components
(Section 44).

## Architecture rules honoured here

- Money is `Decimal`, quantities are `Integer` — never JavaScript floats (Rule 8).
- Multi-row mutations go through `withTransaction` in `src/lib/db/transactions.ts`
  (Section 55).
- Prisma is server-only and never imported by a client component (Rule 6).
- Master data deactivates via `is_active` instead of being deleted (Section 57).
- No `any` (Rule 5).

## Roadmap

| Milestone | Scope |
| --- | --- |
| 1 | Foundation — auth, organizations, users, roles, dashboard shell ✅ |
| 2 | Customers & products ✅ |
| 3 | Orders, order items, sizes, payments |
| 4 | Workers |
| 5 | Production workflows, batches, operations, state machine |
| 6 | Materials & inventory |
| 7 | Expenses & costing |
| 8 | Quality control & rework |
| 9 | Packing & delivery |
| 10 | Reports & dashboard KPIs |
| 11 | Audit & notifications |
| 12 | Production hardening |
