# Frontend - AI Emergency Response System

Modern Next.js 15 command center UI for the Django API backend.

## Quick Start

1. Ensure the Django backend is running on `http://127.0.0.1:8000`
2. Copy env: `cp .env.local.example .env.local`
3. Install & run:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

## Test Credentials

| Username | Password | Dashboard |
|----------|----------|-----------|
| citizen1 | password123 | /citizen |
| dispatcher1 | password123 | /dispatcher |
| responder_unit1 | password123 | /responder |
| hospital_staff1 | password123 | /hospital |

## Real-Time Features (Socket.IO)

The frontend connects to the Django backend via **Socket.IO** for:

- **Live responder tracking** on the map (position updates without refresh)
- **Real-time notifications** (toast + notification drawer)
- **Live analytics dashboard** at `/dispatcher/analytics`

### Requirements

The backend **must** run with uvicorn (not `runserver`):

```bash
cd emergency_response
..\.venv\Scripts\uvicorn config.asgi:application --reload --host 127.0.0.1 --port 8000
```

Look for **"Live connected"** in the header when authenticated.

### Socket events

| Event | Description |
|-------|-------------|
| `notification` | New alert for the logged-in user |
| `responder:update` | Responder GPS/status changed |
| `emergency:update` | Emergency created or updated |
| `analytics:update` | Live stats snapshot for dispatchers |

## Environment

```ini
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_USE_MOCK=false
```

Set `NEXT_PUBLIC_USE_MOCK=true` to use sample data without the API.

## Stack

- Next.js 15 · React 19 · TypeScript
- Tailwind CSS · Shadcn-style UI components
- TanStack Query · Axios · Zustand
- Recharts · Framer Motion · Leaflet
- JWT auth with automatic token refresh

## Structure

```
app/           # Pages (App Router)
components/    # UI, layouts, maps, dashboards
hooks/         # React Query hooks
services/      # API layer
store/         # Auth state (Zustand)
types/         # TypeScript interfaces
lib/           # Utils, constants, mock data
```
