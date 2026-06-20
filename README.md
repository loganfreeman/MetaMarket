# MetaMarket Engine

An open-source, metadata-driven local services marketplace framework.

Milestone 1 proves the core loop:

```txt
metadata schema -> dynamic form -> validated request -> stored submission
```

The application code is generic. Service verticals such as plumbing, electrical, handyman, cleaning, tutoring, and pet sitting are represented as metadata, not branches in React pages or backend services.

## Local Setup

```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Set these environment variables when running locally:

```bash
DATABASE_URL=postgresql://metamarket:metamarket@localhost:5432/metamarket
NEXT_PUBLIC_API_URL=http://localhost:3001
```
