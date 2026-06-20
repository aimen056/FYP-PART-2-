# AirGuard

[![CI](https://github.com/aimen056/FYP-PART-2-/actions/workflows/ci.yml/badge.svg)](https://github.com/aimen056/FYP-PART-2-/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-20-brightgreen)
![React](https://img.shields.io/badge/react-18-blue)

AirGuard is a real-time IoT-based air quality monitoring system for Rawalpindi and Islamabad, Pakistan. IoT sensors stream PM2.5, PM10, CO, NO2, SO2, and O3 readings to a cloud backend; users see live AQI on an interactive map, receive health-based alerts, file pollution reports, and view ARIMA-powered 72-hour forecasts — all in English, Urdu, and Spanish.

<!-- screenshot -->

---

## Features

- Real-time AQI monitoring with live sensor map
- 72-hour AQI forecast (Python Flask + ARIMA, deployed on Render)
- Health recommendations based on AQI level and user conditions
- Pollution reporting (crowdsourced, admin-verified)
- Admin dashboard: sensor management, report verification, historical logs
- Alert system: custom thresholds, condition-based health alerts
- Multilingual: English / اردو / Español
- Dark mode

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Three.js |
| Backend | Node.js 20, Express, JWT auth, Helmet, express-rate-limit |
| Database | MongoDB Atlas, Mongoose |
| Forecast | Python Flask, ARIMA (statsmodels) |
| DevOps | GitHub Actions CI, Vercel (frontend), Render (backend + Flask) |

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 9
- MongoDB Atlas cluster (or local MongoDB)

### Clone & install

```bash
git clone https://github.com/aimen056/FYP-PART-2-.git
cd FYP-PART-2-

# Backend
cd backend && cp .env.example .env   # fill in values
npm install

# Frontend
cd ../frontend && cp .env.example .env  # fill in values
npm install
```

### Run locally

```bash
# Terminal 1 — backend
cd backend && node server.js

# Terminal 2 — frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5002

## Folder Structure

```
FYP-PART-2-/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── jobs/          # cron aggregation
│   ├── .env.example
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── auth/       # ProtectedRoute
│       │   ├── layout/     # Navbar, Footer, navbars
│       │   ├── ui/         # Modal, Chatbot, ErrorBoundary, Ticker
│       │   ├── map/        # HomeMap, FullscreenMapPage, LocationPickerMap
│       │   └── dashboard/  # AQI charts, health cards, report form
│       ├── context/        # AuthContext
│       ├── pages/
│       ├── redux/
│       └── hooks/
├── forecast_service/   # Python Flask + ARIMA (DO NOT MODIFY)
└── .github/workflows/ci.yml
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `PORT` | Server port (default 5002) | No |
| `JWT_SECRET` | JWT signing secret | Yes |
| `FRONTEND_URL` | Allowed CORS origin | Yes |
| `EMAIL_USER` | Gmail address for sending emails | Yes |
| `EMAIL_PASS` | Gmail app password | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `OPENROUTER_API_KEY` | OpenRouter API key (chatbot) | No |
| `FLASK_SERVICE_URL` | Forecast service URL | Yes |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BACKEND_URL` | Backend API base URL | Yes |
| `VITE_ADMIN_EMAIL` | Email address with admin role | Yes |

## GitHub Actions Secrets

Set these in **Settings → Secrets → Actions**:

`MONGO_URI`, `JWT_SECRET`, `VITE_BACKEND_URL`, `VITE_ADMIN_EMAIL`

## Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| Frontend | Vercel | Set env vars in project settings |
| Backend | Render | Web service, set all backend env vars |
| Forecast | Render | Already deployed — do not redeploy |

## Contributing

Branch naming:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<description>` | `feat/dark-mode-toggle` |
| Bug fix | `fix/<description>` | `fix/auth-redirect-loop` |
| Chore | `chore/<description>` | `chore/update-deps` |

1. Fork → create branch → commit → open PR against `master`
2. PRs require CI to pass before merge

## License

MIT
