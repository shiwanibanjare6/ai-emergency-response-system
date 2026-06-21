# AI Emergency Response Coordination System

A robust, production-ready backend coordination system for dispatching emergency services (Ambulance, Police, Fire), recommending nearest available units/hospitals based on GPS proximity, auto-classifying severity via AI, and notifying target recipients in real-time.

---

## 🚀 Key Features

*   **Role-Based Security:** Custom DRF permissions for `Citizen`, `Dispatcher`, `Responder`, and `Hospital` users.
*   **Automatic AI Triage:** Classifies severity (`low`, `medium`, `critical`) and recommends units upon report submission. Supports Gemini multimodal uploads (text/audio/image) with a robust rule-based fallback.
*   **Geospatial Dispatching:** Computes real-time Haversine distance between incidents, active responders, and hospitals.
*   **Notifications Engine:** Signals automatically trigger event notifications for target users.
*   **Deploy-Ready Setup:** Multi-database support (SQLite/PostgreSQL) and complete Docker-compose configuration.

---

## 🛠️ Quick Local Setup

### 1. Environment Setup

```bash
# Clone/Open the directory and create venv
python -m venv .venv

# Activate virtualenv (Windows)
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration (`.env`)
Create a `.env` file in the root directory. To run quickly without setting up PostgreSQL, use the **SQLite fallback**:
```ini
DJANGO_SECRET_KEY=dev-secret-key-123456789
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Enable SQLite for out-of-the-box local setup:
USE_SQLITE=True

# Optional: Add your Google Gemini API Key for real multimodal analysis
# GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Migrations, Seeding & Tests

```bash
# Apply migrations
python emergency_response/manage.py migrate

# Seed mock users, responders, and hospitals
python emergency_response/manage.py seed_data

# Run the integration test suite
python emergency_response/manage.py test apps.users
```

### 4. Running Dev Server (with WebSockets)

**Use uvicorn** (required for Socket.IO real-time features):

```bash
uvicorn config.asgi:application --reload --host 127.0.0.1 --port 8000
```

Run from the `emergency_response/` directory, or:

```bash
cd emergency_response
..\.venv\Scripts\uvicorn config.asgi:application --reload --host 127.0.0.1 --port 8000
```

> `runserver` does **not** support WebSockets. Use uvicorn for live map, analytics, and notifications.

Alternatively for quick testing without real-time:
```bash
python emergency_response/manage.py runserver
```

---

## 👥 Seeded Mock Credentials
Use these credentials to query authenticated API endpoints:

| Username | Password | Role | Description |
|---|---|---|---|
| `citizen1` | `password123` | Citizen | Report emergencies |
| `dispatcher1` | `password123` | Dispatcher | Query AI recommendations, assign responders, notify hospitals |
| `responder_unit1` | `password123` | Responder | Ambulance (Unit 1), updates location & status |
| `responder_unit2` | `password123` | Responder | Patrol (Unit 1) |
| `responder_unit3` | `password123` | Responder | Fire Engine (Unit 1) |
| `hospital_staff1` | `password123` | Hospital | Hospital recipient user |

---

## 🖥️ Frontend (Next.js Command Center UI)

A production-quality React dashboard is included in the `frontend/` folder.

```bash
# Terminal 1 — Backend
python emergency_response/manage.py runserver

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** and sign in with seeded credentials (e.g. `dispatcher1` / `password123`).

**Real-time features** require the backend to run with **uvicorn** (see root README).

See [frontend/README.md](frontend/README.md) for full details.

---

## 🐳 Docker Deployment

The application is completely containerized. Start the API server alongside a PostgreSQL database with a single command:

```bash
docker-compose up --build
```
This automatically compiles the image, starts PostgreSQL, runs migrations, seeds dummy data, and binds the server to `http://localhost:8000`.

---

## 📡 Core API Routes

### Authentication (`/api/auth/`)
*   `POST /api/auth/register/` — Register a new account.
*   `POST /api/auth/login/` — Retrieve JWT access & refresh tokens.
*   `POST /api/auth/refresh/` — Refresh active token.
*   `GET /api/auth/me/` — Retrieve current user profile details.

### Incident Management (`/api/emergencies/`)
*   `POST /api/emergencies/report/` — Report an emergency (Citizen). Accepts text descriptions, voice audio files, and images.
*   `GET /api/emergencies/` — List reported emergencies (Dispatcher).
*   `PATCH /api/emergencies/{id}/assign/` — Assign a responder unit to an incident (Dispatcher).
*   `PATCH /api/emergencies/{id}/status/` — Update status and log details (Dispatcher / Responder).

### Responder Tracking (`/api/responders/`)
*   `GET /api/responders/` — List all responders (Dispatcher).
*   `PATCH /api/responders/{id}/location/` — Update latitude & longitude coordinates (Responder).

### Hospital Logistics (`/api/hospitals/`)
*   `GET /api/hospitals/` — List hospitals and bed counts (Dispatcher).
*   `POST /api/hospitals/notify/` — Route an incoming patient ETA notification to a hospital (Dispatcher).

### AI Recommendations (`/api/ai/`)
*   `POST /api/ai/emergencies/{id}/analyze/` — Request a manual AI evaluation of an emergency (Dispatcher).
*   `GET /api/ai/emergencies/{id}/suggest-dispatch/` — Query nearby available responder units sorted by distance, matching AI recommendation (Dispatcher).
*   `GET /api/ai/emergencies/{id}/suggest-hospital/` — Query nearby hospitals with available beds sorted by travel distance and ETA (Dispatcher).

### Notifications (`/api/notifications/`)
*   `GET /api/notifications/` — List notifications for the authenticated user (All roles).
*   `PATCH /api/notifications/{pk}/read/` — Mark a notification as read (All roles).
