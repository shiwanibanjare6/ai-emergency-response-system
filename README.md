# 🚨 AI Emergency Response Coordination System

An AI-powered emergency coordination platform designed to streamline communication between citizens, dispatchers, responders, and hospitals during emergency situations.

The system automatically analyzes emergency reports, recommends the nearest available response units, identifies suitable hospitals based on capacity and proximity, tracks responders in real time, and provides a centralized command center for emergency management.

---

## 📌 Problem Statement

Traditional emergency response systems often suffer from delayed coordination, inefficient resource allocation, and lack of real-time visibility.

This platform addresses these challenges by combining:

* AI-powered emergency triage
* Geospatial responder dispatching
* Hospital capacity awareness
* Real-time responder tracking
* Automated notifications and coordination workflows

---

## ✨ Key Features

### 🤖 AI Emergency Analysis

* Automatic severity classification
* Emergency category detection
* Responder type recommendation
* Priority score generation
* Gemini multimodal support (text, image, audio)
* Rule-based fallback when AI services are unavailable

### 🚑 Smart Responder Dispatching

* Automatic nearest responder discovery
* GPS-based distance calculation using Haversine formula
* Availability-aware responder recommendations
* Real-time responder status updates

### 🏥 Intelligent Hospital Recommendation

* Nearby hospital discovery
* Emergency bed availability tracking
* ICU capacity awareness
* Travel distance estimation
* Hospital recommendation engine

### 📍 Real-Time Coordination

* Live responder location tracking
* Emergency status monitoring
* Automated event notifications
* Dispatcher command center dashboard

### 🔐 Secure Role-Based Access Control

Separate workflows and permissions for:

* Citizen
* Dispatcher
* Responder
* Hospital Staff
* Administrator

---

## 🏗️ System Architecture

Citizen reports emergency
↓
AI analyzes incident
↓
Dispatcher receives alert
↓
Nearest responder identified
↓
Hospital recommendation generated
↓
Responder dispatched
↓
Location tracked in real time
↓
Hospital notified
↓
Emergency resolved and logged

---

## 🛠️ Tech Stack

### Backend

* Django
* Django REST Framework
* Django Channels
* JWT Authentication

### AI & Analytics

* Google Gemini API
* Rule-Based Emergency Classification
* Geospatial Distance Calculations

### Database

* SQLite (Development)
* PostgreSQL (Production)

### Real-Time Communication

* WebSockets
* ASGI
* Uvicorn

### DevOps

* Docker
* Docker Compose

---

## 📂 Project Structure

```text
AI-Emergency-Response-System/
│
├── emergency_response/
│   ├── apps/
│   │   ├── users/
│   │   ├── emergencies/
│   │   ├── responders/
│   │   ├── hospitals/
│   │   ├── notifications/
│   │   └── ai/
│   │
│   ├── config/
│   └── manage.py
│
├── frontend/
│
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## 🚀 Local Setup

### Clone Repository

```bash
git clone <repository-url>
cd AI-Emergency-Response-System
```

### Create Virtual Environment

```bash
python -m venv .venv
```

### Activate Environment

Windows:

```bash
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

USE_SQLITE=True

# Optional
GEMINI_API_KEY=your_api_key
```

---

## 🗄️ Database Setup

```bash
python emergency_response/manage.py migrate
```

Seed demo data:

```bash
python emergency_response/manage.py seed_data
```

---

## ▶️ Run Backend Server

Development:

```bash
python emergency_response/manage.py runserver
```

Real-Time Mode:

```bash
uvicorn config.asgi:application --reload
```

API Base URL:

```text
http://127.0.0.1:8000
```

---

## 🖥️ Run Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

---

## 👥 Demo Accounts

| Username        | Password    | Role       |
| --------------- | ----------- | ---------- |
| citizen1        | password123 | Citizen    |
| dispatcher1     | password123 | Dispatcher |
| responder_unit1 | password123 | Ambulance  |
| responder_unit2 | password123 | Police     |
| responder_unit3 | password123 | Fire       |
| hospital_staff1 | password123 | Hospital   |

---

## 🐳 Docker Deployment

Start the complete application stack:

```bash
docker-compose up --build
```

This will:

* Start PostgreSQL
* Run migrations
* Seed demo data
* Launch the backend server

---

## 🔮 Future Enhancements

* Advanced AI triage models
* Hospital capacity prediction
* Emergency heatmaps
* Mass casualty response mode
* Traffic-aware routing
* Mobile application
* GIS-powered emergency analytics
* Predictive emergency forecasting

---

## 👩‍💻 Author

**Shiwani Banjare**

B.Tech – Data Science & Artificial Intelligence
International Institute of Information Technology, Naya Raipur

Built to explore AI-assisted emergency coordination, geospatial dispatching, and real-time emergency response systems.
