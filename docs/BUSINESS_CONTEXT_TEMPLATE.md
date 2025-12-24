# BUSINESS_CONTEXT.md
# Product Goals & Domain Logic

## 1. Project Goal
*One specific sentence about what the product does and for whom.*
> Example: "A real-time dashboard for Logistics Managers to track fleet fuel efficiency."

## 2. Core User Personas
- **Admin:** Has full access to settings.
- **Manager:** Can view reports but cannot delete data.
- **Driver:** Read-only access to their own routes.

## 3. Domain Glossary (Naming Standards)
*Use these exact terms in code variable names.*
- **Shipment:** A package being moved (Not "Package" or "Item").
- **Lane:** A specific route between two cities (Not "Route").
- **Carrier:** The trucking company (Not "Vendor").

## 4. Critical Business Rules
- Shipments cannot be cancelled after pickup.
- All currency must be stored in Cents (integers), never floats.