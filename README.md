# Karibu Groceries LTD (KGL) - Full Stack Rewrite

This implementation uses `Node.js + Express + MongoDB` for the backend and `HTML + CSS + JavaScript` for the frontend.

## Roles and Access
- `manager`: records procurement, records sales, views stock and branch summary.
- `agent`: records cash and credit sales only for own branch.
- `director` (Mr. Orban): views aggregated totals only.

## Default Accounts
All accounts use password: `groceries2026`
- `kgl_admin` (manager)
- `agent_maganjo` (agent)
- `agent_matugga` (agent)
- `orban` (director)

## Backend Setup
1. `cd kgl-backend`
2. `npm install`
3. Copy `.env.example` to `.env` and set values.
4. Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017/kgl` or update `.env`.
5. `npm start`

Server runs on `http://localhost:5000`.

## Core Business Rules Implemented
- Only manager can record procurement.
- Agent cannot record produce/procurement.
- Cash and credit sales reduce stock immediately.
- Sale blocked when stock is insufficient.
- Dealer procurement requires at least `1000kg`.
- Selling price is manager-defined from procurement and used to compute sale/credit amounts.
- Director receives aggregation-only dashboards.

## Main API Endpoints
- `POST /auth/login`
- `POST /procurements`
- `GET /procurements`
- `POST /sales/cash`
- `POST /sales/credit`
- `GET /sales/cash`
- `GET /sales/credit`
- `GET /inventory`
- `GET /reports/branch-summary`
- `GET /reports/director-summary`
