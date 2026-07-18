# 🚨 AI Emergency Response Coordination System

An **AI-powered Emergency Response Coordination System** that enables citizens, dispatchers, responders, and hospitals to collaborate efficiently during emergency situations.

The platform leverages **Google Gemini AI**, **real-time communication**, and **geospatial intelligence** to analyze emergencies, recommend responders, identify suitable hospitals, and coordinate emergency response from a centralized dashboard.

---

# 📌 Problem Statement

Traditional emergency response systems often suffer from:

- Delayed emergency analysis
- Manual responder allocation
- Lack of hospital awareness
- Poor coordination
- Limited real-time monitoring

This project solves these problems through AI-assisted emergency triage, intelligent dispatching, live tracking, and hospital coordination.

---

# ✨ Features

## 🤖 AI Emergency Analysis

- AI-powered emergency severity prediction
- Priority generation (P1, P2, P3)
- Severity score (0–100)
- Confidence estimation
- Emergency condition prediction
- Recommended responder type
- Hospital recommendation
- Estimated response time
- Gemini multimodal support (Text, Image & Voice)
- Automatic fallback to local rule engine

---

## 🚑 Smart Emergency Dispatch

- Automatic responder recommendation
- GPS-based responder discovery
- Haversine distance calculation
- Availability-aware dispatch
- Multiple responder unit support

---

## 🏥 Hospital Recommendation

- Nearby hospital discovery
- Bed availability monitoring
- ICU capacity awareness
- Distance estimation
- AI-assisted hospital recommendation

---

## 📍 Real-Time Coordination

- Live emergency updates
- Real-time responder tracking
- Emergency timeline
- WebSocket communication
- Dispatcher command center

---

## 🔐 Authentication & Role Management

Role-based authentication for:

- 👤 Citizen
- 🎛️ Dispatcher
- 🚑 Responder
- 🏥 Hospital Staff
- 👨‍💼 Administrator

---

# 🏗️ System Workflow

```text
Citizen Reports Emergency
            │
            ▼
AI Emergency Analysis
            │
            ▼
Dispatcher Dashboard
            │
            ▼
Nearest Responder Recommendation
            │
            ▼
Hospital Recommendation
            │
            ▼
Responder Assigned
            │
            ▼
Real-Time Tracking
            │
            ▼
Hospital Notification
            │
            ▼
Emergency Resolved
```

---

# 📷 Screenshots

> Add your screenshots inside a folder named **screenshots**.

### Landing Page

```
screenshots/home.png
```

### Dispatcher Dashboard

```
screenshots/dashboard.png
```

### Emergency AI Analysis

```
screenshots/ai-analysis.png
```

### Analytics Dashboard

```
screenshots/analytics.png
```

### Live Emergency Map

```
screenshots/map.png
```

---

# 🛠️ Tech Stack

## Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Recharts
- Leaflet Maps

## Backend

- Django
- Django REST Framework
- Django Channels
- JWT Authentication

## AI

- Google Gemini API
- Rule-Based Emergency Classification

## Database

- SQLite
- PostgreSQL

## Real-Time

- WebSockets
- ASGI
- Uvicorn

## DevOps

- Docker
- Docker Compose

---

# 📂 Project Structure

```text
AI-Emergency-Response-System
│
├── backend/
│   ├── apps/
│   ├── config/
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── public/
│
├── docker-compose.yml
├── README.md
└── .env.example
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/shiwanibanjare6/ai-emergency-response-system.git

cd ai-emergency-response-system
```

---

## Backend Setup

Create virtual environment

```bash
python -m venv .venv
```

Activate

Windows

```bash
.venv\Scripts\activate
```

Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file.

```env
DJANGO_SECRET_KEY=your-secret-key

DJANGO_DEBUG=True

DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

USE_SQLITE=True

GEMINI_API_KEY=your_gemini_api_key
```

---

## Database

```bash
python manage.py migrate
```

(Optional)

```bash
python manage.py seed_data
```

---

## Run Backend

```bash
python manage.py runserver
```

or

```bash
uvicorn config.asgi:application --reload
```

Backend

```
http://127.0.0.1:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend

```
http://localhost:3000
```

---

# 👥 Demo Accounts

| Username | Password | Role |
|------------|------------|------------|
| citizen1 | password123 | Citizen |
| dispatcher1 | password123 | Dispatcher |
| responder_unit1 | password123 | Ambulance |
| responder_unit2 | password123 | Police |
| responder_unit3 | password123 | Fire |
| hospital_staff1 | password123 | Hospital |

---

# 📊 Major Modules

- Citizen Portal
- Dispatcher Dashboard
- AI Emergency Analysis
- Analytics Dashboard
- Emergency Timeline
- Hospital Dashboard
- Responder Dashboard
- Live Map Tracking
- Notification System

---

# 🔥 Key Highlights

- AI-powered emergency severity prediction
- Multimodal emergency analysis
- Intelligent responder recommendation
- Hospital recommendation engine
- Real-time dashboards
- Live location tracking
- Secure JWT authentication
- WebSocket communication
- Responsive UI
- Modern dashboard interface

---

# 🐳 Docker

Run the complete application.

```bash
docker-compose up --build
```

---

# 🚀 Future Enhancements

- Mobile Application
- Traffic-aware Routing
- Drone-assisted Emergency Response
- Emergency Heatmaps
- Predictive Emergency Analytics
- GIS Integration
- Federated AI Models
- Offline Emergency Reporting

---

# 👩‍💻 Author

**Shiwani Banjare**

B.Tech – Data Science & Artificial Intelligence

International Institute of Information Technology, Naya Raipur

---

## ⭐ If you found this project useful, consider giving it a star.
