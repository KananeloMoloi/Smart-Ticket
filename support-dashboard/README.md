# SmartDesk — redesigned React frontend

A responsive IT support workspace built with React 18 and Vite. The same visual system is applied to every signed-in view: dashboard, ticket list, create ticket, ticket details, comments, AI Assistant, reports, user approvals and settings.

## Run locally

```bash
copy .env.example .env   # Windows CMD; use cp on macOS/Linux
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:4000` in `.env` to point at the Node API.

## Design and interaction system

- Lenis root smooth scrolling is synchronized to GSAP's ticker; nested tables and chat history use native scroll.
- GSAP/ScrollTrigger animate route entry and reveal content. Animations are disabled when the device requests reduced motion.
- React Three Fiber supplies the restrained 3D sign-in background; the dashboard hero uses a lightweight orbital visual.
- React Bits and Uiverse references are used as inspiration for project-owned motion, buttons, cards, form controls, status pills, loaders and empty states.
- Responsive layouts adapt the navigation, ticket tables, charts, forms, AI chat and settings for mobile.

## Role-based screens

- `PENDING`: only the access-pending screen.
- `USER`: create tickets and view only tickets created by that account.
- `AGENT`: view assigned tickets and tickets personally created; manage assigned tickets.
- `ADMIN`: all tickets, reports, users and role assignment.

The backend enforces permissions. Frontend navigation is a usability layer, not an authorization boundary.

## Frontend visual direction

The current frontend uses a static, content-first visual system: deep navy navigation, a restrained blue/green palette, clear page headings, readable cards and tables, and consistent form controls. It intentionally does not use animated transitions, scroll effects, animated backgrounds, 3D scenes, or motion-based interactions. The AI Assistant is presented as a dedicated support workspace with clear prompt suggestions and a readable conversation area.

The frontend keeps the existing API integration and routes for authentication, tickets, comments, assignments, notifications, reports, administration, and the OpenRouter-powered AI chat. Configure `VITE_API_URL` to point to the Node API when deploying separately.

Install dependencies and run locally from this directory:

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```
