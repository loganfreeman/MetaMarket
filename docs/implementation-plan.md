# MetaMarket Engine Implementation Plan

MetaMarket Engine is an open-source, metadata-driven marketplace framework for local service platforms. The first implementation should prove the core product loop: metadata schema -> dynamic form -> validated request -> stored submission.

Metadata is a published contract. Administrators draft category metadata, validate it, publish an immutable version, and every submitted request references the exact category version used to render and validate the form.

## Initial Monorepo Structure

```txt
apps/
  api/
    src/
      app.module.ts
      metadata/
      service-categories/
      service-requests/
  web/
    app/
      services/
      requests/
  admin/
    app/
      service-categories/
      metadata/

packages/
  db/
    prisma/
      schema.prisma
      seed.ts
  shared/
    src/
      metadata/
      domain/
  metadata-engine/
    src/
      schemas/
      validation/
      form-model/
  ui/
    src/
      form-renderer/
      fields/

infra/
  docker-compose.yml

docs/
  architecture.md
  metadata-engine.md
  implementation-plan.md
```

## Domain Boundaries

`catalog` owns service categories and published metadata versions.

`metadata-engine` owns Zod schema validation, dynamic form models, metadata versioning, and safe parsing.

`request` owns customer service requests, submitted metadata values, request location, and the category version that validated the submission.

`admin` owns draft metadata editing, validation, and publishing. A full admin UI can wait; seed scripts or API mutations are enough for Milestone 1.

## Web App Principle

The web app knows how to render metadata. It does not know about plumbing, electrical, handyman, cleaning, tutoring, pet sitting, or any other marketplace vertical.

Pages should be generic shells:

```txt
apps/web/app/services/page.tsx
  Only list active service categories from API data.

apps/web/app/services/[slug]/page.tsx
  Fetch the category metadata by slug and pass currentVersion.metadataSchema to FormRenderer.
```

No page, route, component, form, validation branch, or submit handler should contain category-specific logic. Category behavior must come from the published metadata version returned by the API.

The frontend data flow is:

```txt
route slug
  -> fetch category with current published version
  -> render fields from metadataSchema.fields
  -> derive client validation from metadata
  -> submit values plus categorySlug
  -> backend validates against the same published version
```

Milestone 1 web and shared files:

```txt
apps/web/app/services/page.tsx
apps/web/app/services/[slug]/page.tsx

packages/ui/form-renderer/FormRenderer.tsx
packages/ui/form-renderer/fields/TextField.tsx
packages/ui/form-renderer/fields/SelectField.tsx
packages/ui/form-renderer/fields/TextareaField.tsx
packages/ui/form-renderer/fields/FileField.tsx

packages/shared/metadata/types.ts
packages/shared/metadata/zod.ts
```

`FormRenderer.tsx` is the only component that maps metadata field types to React field components. Page files pass metadata and submit handlers down; field-specific rendering stays inside `packages/ui/form-renderer`.

## Prisma Schema Direction

```prisma
model ServiceCategory {
  id             String   @id @default(cuid())
  slug           String   @unique
  name           String
  description    String?
  active         Boolean  @default(true)
  currentVersionId String?  @unique
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  versions       ServiceCategoryVersion[] @relation("CategoryVersions")
  currentVersion ServiceCategoryVersion? @relation("CurrentServiceCategoryVersion", fields: [currentVersionId], references: [id])
  requests       ServiceRequest[]
}

model ServiceCategoryVersion {
  id             String   @id @default(cuid())
  categoryId     String
  version        Int
  status         String   @default("draft")
  metadataSchema Json
  publishedAt    DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  category       ServiceCategory @relation("CategoryVersions", fields: [categoryId], references: [id])
  currentFor     ServiceCategory[] @relation("CurrentServiceCategoryVersion")
  requests       ServiceRequest[]

  @@unique([categoryId, version])
}

model ServiceRequest {
  id                String   @id @default(cuid())
  categoryId        String
  categoryVersionId String
  customerId        String?
  status            String
  submittedMetadata Json
  addressLine1      String?
  addressLine2      String?
  city              String?
  region            String?
  postalCode        String?
  country           String?  @default("US")
  latitude          Decimal?
  longitude         Decimal?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  category          ServiceCategory        @relation(fields: [categoryId], references: [id])
  categoryVersion   ServiceCategoryVersion @relation(fields: [categoryVersionId], references: [id])
}
```

Provider matching is intentionally not part of Milestone 1. When it starts, avoid `Provider.skills String[]` as the durable model. Matching needs structured provider capabilities by category/version, with service radius, availability, pricing hints, and qualifications scoped to the capability.

Location should not remain JSON. Milestone 1 stores ordinary address fields plus latitude/longitude columns. When matching begins, add PostGIS and geospatial indexes instead of building distance logic on JSON.

## Metadata Schema Contract

```ts
type ServiceCategoryMetadataSchema = {
  fields: MetadataField[];
  requestStates?: RequestStateDefinition;
};
```

```ts
type MetadataField = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "checkbox"
    | "radio"
    | "date"
    | "address"
    | "file"
    | "image";
  required?: boolean;
  options?: string[];
  validations?: ValidationRule[];
  helpText?: string;
  placeholder?: string;
};
```

```ts
type RequestStateDefinition = {
  initialStatus?: "submitted";
  allowedStatuses?: Array<"submitted" | "reviewing" | "closed">;
};
```

Milestone 1 should use hard generic request states such as `submitted`, `reviewing`, and `closed`. A metadata-driven workflow engine belongs in Milestone 2 or 3 after the category version contract is proven.

## REST API Contracts

GraphQL is fine long-term, but Milestone 1 should use REST for build speed. The metadata system is the innovation, not the API transport.

```txt
GET /service-categories
GET /service-categories/:slug
POST /service-categories
POST /service-categories/:slug/versions
POST /service-categories/:slug/versions/:version/publish
POST /service-requests
```

Create category:

```json
{
  "slug": "plumbing",
  "name": "Plumbing",
  "description": "Plumbing repairs and installation"
}
```

Create draft version:

```json
{
  "metadataSchema": {
    "fields": [
      {
        "name": "heater_type",
        "label": "Water Heater Type",
        "type": "select",
        "required": true,
        "options": ["tank", "tankless"]
      }
    ]
  }
}
```

Submit request:

```json
{
  "categorySlug": "plumbing",
  "submittedMetadata": {
    "heater_type": "tankless"
  },
  "location": {
    "addressLine1": "123 Main St",
    "city": "Denver",
    "region": "CO",
    "postalCode": "80202",
    "country": "US",
    "latitude": 39.752,
    "longitude": -104.999
  }
}
```

## First Build Sequence

1. Scaffold the pnpm monorepo with `apps/api`, `apps/web`, and shared packages.
2. Add Docker Compose for PostgreSQL and Redis.
3. Add Prisma in `packages/db` with `ServiceCategory`, `ServiceCategoryVersion`, and `ServiceRequest`.
4. Implement `packages/metadata-engine` with Zod validation for metadata schemas and submissions.
5. Seed `plumbing`, `electrical`, and `handyman` categories with published version `1` metadata.
6. Implement NestJS REST endpoints for category creation, version creation, version publishing, category listing, category detail, and request submission.
7. Implement `packages/ui` `FormRenderer` using React Hook Form and Zod-derived validation.
8. Add `apps/web` `/services` and `/services/[slug]`.
9. Submit requests from the dynamic form and store `submittedMetadata` with `categoryVersionId`.
10. Add API service tests for version publishing and request validation.

## Acceptance Criteria For Milestone 1

An admin or seed script can create a service category and draft metadata version.

The system validates draft metadata before publishing.

The API lists categories and fetches one category by slug with its current published version.

The web app renders an intake form from `currentVersion.metadataSchema.fields`.

The backend validates submitted metadata against the exact current published version before storing.

Stored requests include `categoryVersionId` so old requests remain explainable after metadata changes.

No React component, API handler, service, or request code contains plumbing-, electrical-, handyman-, cleaning-, tutoring-, or pet-specific branching.

## Implementation Guardrails

Metadata is configuration, not executable code. Guards, validators, workflows, and matching rules should reference registered safe rule names instead of arbitrary scripts.

Category slugs and metadata versions should be stable because requests must remain explainable after category metadata changes.

Published metadata versions are immutable. Updating metadata creates a new draft version and publishing it advances `ServiceCategory.currentVersionId`.

Milestone 1 request state should be deliberately boring: `submitted`, `reviewing`, `closed`. Do not build a workflow engine until the metadata contract loop works end to end.
