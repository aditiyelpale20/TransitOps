# 🚌 TransitOps – Smart Transport Operations Platform

<p align="center">
  <h3>🚀 Intelligent Fleet & Transport Management System</h3>
  <p>Built using <b>React + FastAPI + SQLAlchemy + MySQL/SQLite</b></p>
</p>

---

## 🌟 Overview

TransitOps is a modern transport management platform that helps organizations efficiently manage **vehicles, drivers, trips, fuel, maintenance, expenses, reports, and users** through a secure role-based dashboard.

## ✨ Features

- 🔐 Secure Authentication
- 👤 Role-Based Access
- 🚗 Vehicle Management
- 👨‍✈️ Driver Management
- 🛣️ Trip Management
- ⛽ Fuel Log Tracking
- 🔧 Maintenance Records
- 💰 Expense Management
- 📊 Reports & Analytics
- 🗄️ SQL Database Integration
- ⚡ FastAPI REST APIs
- 🎨 Responsive React Frontend

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| 🎨 Frontend | React, Vite, CSS |
| ⚙️ Backend | Python, FastAPI |
| 🗄️ Database | MySQL / SQLite, SQLAlchemy |
| 🔐 Authentication | JWT |
| 📦 Package Managers | npm, pip |

## 📂 Project Structure

```text
transitops/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── dependencies/
│   │   ├── utils/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── database/
└── README.md
```

## 🚀 Installation

### 1️⃣ Clone
```bash
git clone <repository-url>
cd transitops
```

### 2️⃣ Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3️⃣ Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔗 API Modules

- 🔑 Authentication
- 🚗 Vehicles
- 👨 Drivers
- 🛣️ Trips
- ⛽ Fuel Logs
- 🔧 Maintenance
- 💰 Expenses
- 📈 Reports
- 👥 Users

## 🏗️ Architecture

```text
 React Frontend
       │
 REST API (HTTP)
       │
 FastAPI Backend
       │
 SQLAlchemy ORM
       │
 MySQL / SQLite
```

## 📌 Future Improvements

- 🤖 AI-powered fleet analytics
- 📍 Live GPS tracking
- 📱 Mobile application
- 🔔 Real-time notifications
- ☁️ Cloud deployment

## 🤝 Contributors

Developed as a Smart Transport Operations Platform project.

## 📄 License

This project is intended for educational and demonstration purposes.

---

<p align="center">
Made for Smart Transportation 🚍
</p>
