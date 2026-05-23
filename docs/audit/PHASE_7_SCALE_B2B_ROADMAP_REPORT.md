# Phase 7 Scale and B2B Roadmap Report

## Metadata

- Date: 2026-05-23
- Branch: `feat/syncxml-phased-hardening`
- Status: Roadmap only.

## Gate Decision

Fase 7 must not be implemented as product scope until phases 1-6 are closed or explicitly narrowed. Multiproperty and B2B features would multiply the privacy, security, role-management and support surface.

## Not Implemented

The following were intentionally not implemented:

- Multiproperty management.
- White-label layer.
- Roles and permissions.
- Billing.
- Public API.
- Importers for Lodgify, Booking, Airbnb, Vrbo or generic CSV.
- Usage analytics.
- Regulatory monitoring workflow.

## Recommended Roadmap

### Step 1: Stabilize Villa Kentia

- Obtain XSD.
- Obtain accepted SES XML evidence.
- Complete visual XML review.
- Complete correction workflow.
- Close retention decision.

### Step 2: Add Mapping Templates

- Villa Kentia manual template.
- Lodgify template if confirmed as source of truth.
- Generic CSV/XLSX mapping only after visual mapper exists.

### Step 3: Introduce Tenant Boundaries

- Property model.
- Property-specific establishment code.
- Property-level configuration.
- Pseudonymous audit events per property.

### Step 4: Add Roles

- Owner.
- Manager.
- Assistant.
- Admin.

### Step 5: Prepare B2B Operations

- DPA.
- Support procedure.
- Data deletion procedure.
- Key rotation procedure.
- Incident response checklist.

## Residual Risk

Scaling before closing Villa Kentia validation and governance would spread unresolved assumptions into a broader product.
