# SmartDesk AI — IT Helpdesk Ticketing System

This project is an IT problem reporting and support ticketing system. It does **not** sell event tickets and contains no event marketplace or purchase/checkout feature.

## Roles and access

- **PENDING**: default role for every new registration. The account can sign in but sees only an access-pending screen until an administrator assigns a role.
- **USER**: can submit IT issues and view/comment on only their own tickets.
- **AGENT**: employee/support role. Can see tickets assigned to them and tickets they personally created; can manage only tickets assigned to them.
- **ADMIN**: full access to all tickets, users, role assignments, analytics, and reports.

Authorization is enforced in the API as well as in the UI. Hiding a menu item is not the security boundary.

## Project layout

- `support-dashboard/` — React + Vite frontend (main web app)
- `api/` — Node.js + Express API, Prisma ORM, PostgreSQL
- `flask-ai/` — optional Python Flask AI analysis service
- `docker-compose.original.yml` — original development compose file, review before use

## Requirements

- Node.js 20 or newer
- PostgreSQL database (for example, a hosted Neon PostgreSQL database)
- Optional Python 3.11+ for the Flask AI service

## Configure the API

1. Open `api/` and copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to your PostgreSQL connection string.
3. Set `JWT_SECRET` to a random secret of at least 32 characters.
4. Install and prepare the database:

```bash
cd api
npm install
npx prisma format
npx prisma validate
npx prisma generate
npx prisma db push
npm run dev
```

The API listens on `http://localhost:4000`. For an existing database, back it up before applying schema changes. The new `PENDING` role becomes the default for newly registered accounts; existing users retain their current roles unless an administrator changes them.

## Configure the frontend

In a second terminal:

```bash
cd support-dashboard
copy .env.example .env
npm install
npm run dev
```

On macOS/Linux, use `cp .env.example .env` instead of `copy`. Set `VITE_API_URL=http://localhost:4000` in `support-dashboard/.env` if the API runs elsewhere. Vite prints the frontend URL (normally `http://localhost:5173`).

## Bootstrap the first administrator

Register an account through the app first, then from `api/` run:

```bash
node src/promote-admin.js your-email@example.com
```

This updates that account to `ADMIN`. Sign out and sign in again. Do not expose this script as a public endpoint.

## Role assignment workflow

1. A new person registers and receives `PENDING`.
2. The administrator opens **Users** and assigns `USER`, `AGENT` (employee/support agent), or `ADMIN`.
3. The user signs out and back in, or selects **Check access again** while pending.
4. The API verifies permissions on every protected request.

## Important security notes

- Keep `.env` files and database credentials out of Git.
- Use HTTPS in production and set `CORS_ORIGIN` to the exact deployed frontend origin.
- Configure production upload storage and limits before accepting real attachments.
- Review AI output before using it to set ticket priorities or recommend fixes.
- The Flask service is optional; configure its URL/API integration if you want the Node API to call it.

## Build

```bash
cd support-dashboard
npm run build
```

Deploy the frontend as a static Vite app and deploy the Node API separately. Configure the frontend environment variable to point to the deployed API.


## OpenRouter-powered AI Assistant (fixed)

1. Copy `api/.env.example` to `api/.env` (or edit your existing local `api/.env`).
2. Set `OPENROUTER_API_KEY` to your own secret OpenRouter key and optionally change `OPENROUTER_MODEL` to a supported model. **Never put the key in the React/Vite frontend.**
3. Configure `DATABASE_URL`, `JWT_SECRET` (at least 32 characters), and `CORS_ORIGIN` for your setup.
4. In `api`, run `npm install`, `npx prisma generate`, `npx prisma db push`, and `npm run dev`. Back up any existing database before pushing schema changes.
5. In `support-dashboard`, run `npm install` and `npm run dev`. Sign in with a USER, AGENT, or ADMIN account and open **AI Assistant**.
6. The assistant sends authenticated chat requests to `POST /api/ai/chat`, and Node forwards them to OpenRouter. PENDING accounts cannot access the AI. Ticket classification continues to use the separate Flask AI service.

**Security:** The supplied ZIP intentionally excludes `.env` files, local uploads and `node_modules`. Keep existing credentials in your local `.env` only. If you uploaded a ZIP containing real API keys or database credentials, rotate those secrets in the provider dashboards before using them again.

**Admin bootstrap:** Register the desired account first, then from `api` run `node src/promote-admin.js registered@example.com`. A missing account now produces a helpful message instead of Prisma P2025.
