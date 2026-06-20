# Project Vision: MetaMarket Engine

I want to build an open-source metadata-driven marketplace framework that can power local service marketplaces such as handyman services, plumbing, electrical work, lawn care, cleaning, tutoring, pet sitting, moving services, and similar businesses.

The goal is NOT to build a handyman marketplace with hardcoded business logic.

The goal is to build a generic marketplace engine where new marketplace verticals can be created through metadata configuration rather than code changes.

## Core Principles

Everything should be configurable through metadata:

* Service Categories
* Dynamic Forms
* Validation Rules
* Matching Rules
* Pricing Rules
* Booking Rules
* Workflow Definitions
* Commissions
* Notifications
* Permissions
* Provider Requirements

A new service category should be creatable by adding metadata to the database, without deploying new code.

Example:

Instead of creating custom code for:

* Plumbing
* Electrical
* Roofing
* Appliance Repair

the system should allow administrators to define service categories through metadata.

## Architecture

Build a monorepo using:

* TypeScript
* NestJS backend
* Next.js frontend
* PostgreSQL
* Prisma
* Redis
* Docker Compose
* GraphQL APIs
* React Hook Form
* Zod

Structure:

apps/
api/
web/
admin/

packages/
db/
shared/
metadata-engine/
workflow-engine/
ui/

## Metadata Engine

The metadata engine is the heart of the system.

ServiceCategory should contain:

* id
* slug
* name
* description
* metadataSchema (JSON)

Example metadata schema:

{
"fields": [
{
"name": "heater_type",
"label": "Water Heater Type",
"type": "select",
"required": true,
"options": [
"tank",
"tankless"
]
},
{
"name": "urgency",
"label": "Urgency",
"type": "select",
"options": [
"today",
"this_week",
"flexible"
]
}
],
"workflow": [
"request",
"quote",
"booking",
"payment"
],
"matching": {
"radiusMiles": 25,
"requiredSkills": [
"plumbing"
]
},
"pricing": {
"type": "quote"
}
}

## Dynamic Form Engine

Build a generic FormRenderer component.

The renderer should generate forms from metadata.

Supported field types:

* text
* textarea
* number
* select
* checkbox
* radio
* date
* address
* file upload
* image upload

No category-specific React forms should exist.

## Workflow Engine

Implement a state-machine-based workflow engine.

Workflows should be metadata driven.

Examples:

Simple Workflow:

Request
→ Quote
→ Booking
→ Payment
→ Complete

Advanced Workflow:

Request
→ Site Visit
→ Estimate
→ Approval
→ Booking
→ Payment
→ Complete

The workflow engine should not know anything about plumbing, roofing, tutoring, or cleaning.

It should execute states defined by metadata.

## Matching Engine

Build a generic provider matching engine.

Inputs:

* Service Category
* Customer Location
* Provider Skills
* Provider Service Area
* Provider Rating

Matching rules should come from metadata.

## Provider Platform

Providers should have:

* Profile
* Skills
* Certifications
* Service Areas
* Availability
* Stripe Connect Account

Provider requirements should be metadata driven.

Example:

Electrical services may require:

* Electrician License

Roofing services may require:

* Roofing License
* Insurance

## Marketplace Features

Customer:

* Browse categories
* Submit requests
* Receive quotes
* Book providers
* Pay providers
* Review providers

Provider:

* Manage profile
* Receive leads
* Submit quotes
* Manage bookings
* Receive payouts

Admin:

* Create service categories
* Configure metadata
* Manage providers
* Manage disputes
* Configure commissions

## Open Source Goal

The final platform should act as a marketplace operating system.

Example implementations should be included:

examples/
handyman/
cleaning/
tutoring/
pet_sitting/

The core engine should be reusable across multiple marketplace verticals.

Focus on clean architecture, domain-driven design, modularity, extensibility, and developer experience.

Start by implementing:

1. ServiceCategory entity
2. Metadata storage
3. Dynamic form rendering
4. Workflow engine
5. Provider matching engine

Generate the project structure, database schema, API contracts, and implementation plan before writing code.
