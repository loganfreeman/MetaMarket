I’d build it as **metadata-driven vertical marketplace**, not generic ecommerce.

## Recommended stack

**Core app**

* **Backend:** Node.js + TypeScript + NestJS
* **API:** GraphQL for app/admin flexibility, REST webhooks for integrations
* **DB:** PostgreSQL + PostGIS
* **ORM:** Prisma or Drizzle
* **Cache/queue:** Redis + BullMQ
* **Search:** Meilisearch first; OpenSearch later
* **Frontend web:** Next.js
* **Mobile:** React Native / Expo
* **Admin/config studio:** Next.js admin or NocoBase-inspired metadata UI
* **Infra:** Docker Compose first, then Kubernetes/Fly.io/Render/AWS later
* **Payments:** Stripe Connect for marketplace onboarding, destination charges, split payouts, KYC, refunds, disputes, and provider payouts. ([Stripe][1])
* **Maps/geocoding:** PostGIS + Mapbox/Google Maps; use OpenStreetMap carefully because public Nominatim has strict usage limits and is not ideal for production-heavy geocoding. ([Reddit][2])

## Why not start from Shopify-like commerce?

Handyman marketplace is closer to **Thumbtack / TaskRabbit / Angi**, not ecommerce. You need:

* service categories
* quote requests
* provider availability
* service areas
* lead routing
* booking
* chat
* escrow-ish payment flow
* reviews
* dispute handling
* configurable intake forms

Saleor, Medusa, Vendure are strong commerce engines, but they are product/cart/order oriented. Saleor is GraphQL-first and extensible, ([Saleor Commerce][3]) Vendure is TypeScript/NestJS/GraphQL and plugin-friendly, ([vendure.io][4]) and Mercur adds marketplace features on Medusa. ([mercur][5]) But for local services, I’d borrow ideas rather than build on them.

## The key design: metadata-driven service engine

Create a generic marketplace kernel:

```txt
ServiceCategory
  -> metadata schema
  -> intake form fields
  -> pricing model
  -> required provider qualifications
  -> matching rules
  -> booking rules
  -> commission rules
```

Example:

```yaml
category: plumbing.water_heater_install
displayName: Water Heater Installation
intakeForm:
  - name: property_type
    type: select
    options: [house, condo, apartment]
  - name: heater_type
    type: select
    options: [tank, tankless, not_sure]
  - name: urgency
    type: select
    options: [today, this_week, flexible]
matching:
  radiusMiles: 25
  requiredSkills: [plumbing, water_heater]
pricing:
  mode: quote_request
commission:
  type: percentage
  value: 12
```

This lets you add “roof repair”, “TV mounting”, “lawn care”, “appliance repair”, etc. without changing code every time.

## Domain modules

Start with these bounded contexts:

```txt
identity/
  users, roles, auth, sessions

provider/
  provider profile, licenses, insurance, skills, service areas

catalog/
  categories, metadata schemas, form definitions

request/
  customer job request, photos, address, urgency, quote status

matching/
  provider search, ranking, lead distribution

quote/
  estimate, provider response, customer acceptance

booking/
  schedule, availability, appointment lifecycle

payment/
  Stripe Connect accounts, charges, transfers, refunds

messaging/
  customer-provider chat, notifications

review/
  ratings, trust signals, moderation

admin/
  metadata editor, provider approval, disputes, reports
```

## MVP build order

1. Customer posts job request.
2. Provider creates profile and service area.
3. Metadata-driven category intake form.
4. Match providers by category + distance.
5. Provider sends quote.
6. Customer accepts quote.
7. Booking scheduled.
8. Stripe payment + platform fee.
9. Review after completion.
10. Admin dashboard.

## Open-source repo structure

```txt
handyverse/
  apps/
    web/          # Next.js customer/provider web
    mobile/       # Expo React Native app
    admin/        # metadata/admin console
    api/          # NestJS backend
  packages/
    db/           # schema, migrations, seed data
    config/       # metadata schemas
    ui/           # shared components
    types/        # shared TypeScript types
    workflows/    # state machines
  infra/
    docker-compose.yml
    terraform/
  docs/
    architecture.md
    metadata-engine.md
    marketplace-payments.md
```

## My strong recommendation

Name the project around the core idea:

**MetaMarket Local**
or
**OpenHandy**

Position it as:

> An open-source, metadata-driven local services marketplace framework for building Thumbtack-style provider platforms.

Build the first version with **NestJS + PostgreSQL/PostGIS + Next.js + Expo + Stripe Connect**. Keep the metadata system as the differentiator.

[1]: https://stripe.com/connect?utm_source=chatgpt.com "Stripe Connect | Platform and Marketplace Payment Solutions"
[2]: https://www.reddit.com/r/programming/comments/zau8j7?utm_source=chatgpt.com "Nominatim - a free alternative geocoding service from OpenStreetMap"
[3]: https://saleor.io/open-source?utm_source=chatgpt.com "The Open Source Headless Commerce - Saleor Commerce"
[4]: https://vendure.io/platform/commerce-framework?utm_source=chatgpt.com "Vendure Core: the open-source commerce framework for Node.js | Vendure"
[5]: https://registry.mercurjs.com/?utm_source=chatgpt.com "mercur | Open-source multi-vendor marketplace platform for B2B & B2C. Built on top of MedusaJS. Create your own custom marketplace. 🛍️"
