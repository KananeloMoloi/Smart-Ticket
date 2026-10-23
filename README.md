# Smart Ticketing System — Backend

Two cooperating services: **Node.js / Express / Prisma / PostgreSQL** for business APIs and **Python / Flask** for AI classification and suggestions. This repository is a working development starter, not a production-certified system.

## Quick start (Docker)

Requirements: Docker Desktop with Compose.

1. Copy `.env.example` to `.env` at the project root.
2. Replace `JWT_SECRET` and `AI_SERVICE_TOKEN` with different, random, long secrets.
3. Run `docker compose up --build`.
4. Node API: `http://localhost:4000/health`; Flask AI: `http://localhost:5000/health`.
5. Register: `POST http://localhost:4000/api/auth/register` with JSON `{"name":"Admin User","email":"admin@example.com","password":"change-this-password"}`.
6. Bootstrap the first admin **only in a trusted development environment**: `docker compose exec node-api node src/promote-admin.js admin@example.com`.
7. Login: `POST /api/auth/login` with `{"email":"admin@example.com","password":"change-this-password"}`. Use the returned JWT as `Authorization: Bearer <token>`.
8. Create a department: `POST /api/admin/departments` with `{"name":"IT Network","category":"Network"}`.
9. Create a ticket: `POST /api/tickets` with `{"title":"Office Wi-Fi disconnected","description":"My office laptop cannot connect to the wireless network."}`.

**Note:** The Node service starts after running `prisma db push` for development. For production use versioned migrations (`prisma migrate dev` then `prisma migrate deploy`), HTTPS, a managed database, secure object storage, backups, monitoring, and a durable background job queue.

## Local development without Docker

Start PostgreSQL separately. In `node-api/`, copy `.env.example` to `.env`, run `npm install`, `npx prisma generate`, `npx prisma db push`, `npm run dev`. In `flask-ai/`, create a virtual environment, `pip install -r requirements.txt`, copy `.env.example` to `.env`, and run `python app.py`. Ensure both services share `AI_SERVICE_TOKEN`.

## API routes

| Method | Route | Permissions |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET, PATCH | /api/auth/me | Authenticated |
| POST, GET | /api/tickets | Authenticated |
| GET | /api/tickets/:id | Authorized ticket viewer |
| PATCH | /api/tickets/:id/status | Agent/Admin |
| PATCH | /api/tickets/:id/assign | Admin |
| GET, POST | /api/tickets/:id/comments | Authorized ticket viewer |
| POST | /api/tickets/:id/reanalyze | Agent/Admin |
| GET | /api/admin/departments | Authenticated |
| POST | /api/admin/departments | Admin |
| GET | /api/admin/agents | Agent/Admin |
| GET | /api/admin/users | Admin |
| PATCH | /api/admin/users/:id/role | Admin |
| GET | /api/admin/analytics | Admin |
| GET | /api/admin/reports/tickets.csv | Admin |
| POST | /api/admin/escalate | Admin (manual trigger) |
| GET | /api/notifications | Authenticated |
| PATCH | /api/notifications/:id/read | Authenticated owner |
| POST | /api/attachments/tickets/:id | Authorized ticket viewer (multipart file) |
| GET | /api/attachments/:id | Authorized ticket viewer |
| POST | Flask /analyze | Internal service token |

### Ticket lifecycle
`OPEN → IN_PROGRESS → RESOLVED → CLOSED`; reopened tickets use `REOPENED → IN_PROGRESS`. Users may view and comment on tickets they own; only agents/admins change statuses. Admins assign agents.

### AI
AI service uses OpenAI when `OPENAI_API_KEY` is provided; otherwise it uses deterministic keyword rules. The Node API triggers classification after creating a ticket. Check `aiState` for `PENDING`, `COMPLETED`, or `FAILED`. Recommendations are advisory; agents can override them by handling the ticket manually. The rule-based fallback is intentionally basic and should not be used for safety-critical triage.

### Testing
`cd flask-ai && python -m pytest -q` (after installing requirements). API end-to-end tests against a disposable PostgreSQL instance should be added before deployment.

## Known MVP limitations / production hardening

- AI analysis is fire-and-forget inside the Node process; use Redis/BullMQ or another durable queue for reliability.
- Escalation is manually triggered by admin; schedule it in a protected worker/cron for automatic SLA checks. `dueAt` needs SLA configuration.
- Notifications are in-app records only; email delivery is not integrated.
- Attachments use local disk and MIME header checks; production needs content sniffing, malware scanning and object storage.
- No password reset email workflow, refresh tokens, or login lockout; use a managed identity provider or add these before real use.
- CSV exports are capped at 10,000 rows; pagination and streaming are needed for large datasets.
- API should be protected by TLS, request auditing, rate limits beyond authentication, and tenant isolation if used by multiple companies.
- No billing, external integrations, or automatic agent load balancing.
- Test, security review, and production configuration are required before using real customer data.

## Team ownership
1. Frontend developer: consume `/api/auth`, `/api/tickets`, `/api/attachments`.
2. Backend developer: ticket routes, workflows, comments, assignment.
3. Database/auth developer: Prisma schema, roles, authentication, migrations.
4. AI developer: Flask classification, prompt/rules, quality tests.
5. Analytics/DevOps developer: admin analytics, notifications, Docker, CI, QA.
