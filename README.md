# Decisioning Console - Demo MVP

Parametric claims decisioning engine demo for flight delay insurance. Demonstrates instant, traceable claim decisions with full governance and audit capabilities.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **Product Catalog** - Versioned products with Draft/Active status
- **Claim Simulator** - Instant decisions with step-by-step trace
- **Rule Preview** - Visual decision flowchart
- **Metrics Dashboard** - Automation rate, decision trends, payout distribution
- **API Demo** - Interactive endpoint tester with integration guide
- **Version Compare** - Diff view with computed change impact

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm test         # Run 106 tests
```

## API Endpoint

```bash
POST /api/decision
Content-Type: application/json

{
  "bookingRef": "BK-12345",
  "flightNo": "BA123",
  "flightDate": "2024-12-20",
  "passengerToken": "pax-abc123",
  "productId": "prod-eu-delay",
  "productVersion": "v1.2"
}
```

## Documentation

See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for full architecture, file reference, and demo script.

## Stack

- Next.js 16.1.0 / React 19.2.3 / TypeScript 5
- Tailwind CSS + shadcn/ui
- Jest + React Testing Library
