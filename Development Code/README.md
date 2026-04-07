# 🏥 Hospital & Medicine Services (HMS) Portal

A high-performance, clinical-grade healthcare management system designed for final year projects. This portal provides real-time emergency tracking, medicine delivery, and automated hospital/blood bank synchronization.

## 🚀 Deployment Status: Production Ready

This repository is optimized for one-click deployment on **Vercel** (Frontend) and **Render** (Backend).

### 🛠️ Tech Stack
- **Frontend:** React + Vite, MUI, Chart.js, Leaflet Maps
- **Backend:** Node.js, Express, MongoDB Atlas, Socket.io
- **Deployment:** Vercel (Frontend), Render/Railway (Backend)

---

## 📦 Deployment Guide

### 1. Backend (Render.com)
1.  **Repo:** Point to the root directory.
2.  **Build Command:** `cd Backend && npm install`
3.  **Start Command:** `cd Backend && node server.js`
4.  **Environment Variables:**
    - `MONGO_URI`: Your MongoDB Atlas Connection String
    - `FRONTEND_URL`: Your Vercel app URL (once deployed)
    - `JWT_SECRET`: A secure random string

### 2. Frontend (Vercel)
1.  **Root Directory:** `Development Code/Frontend`
2.  **Framework:** Vite
3.  **Environment Variables:**
    - `VITE_API_URL`: Your Render backend URL

---

## ✨ Features
- **📊 Interactive Health Dashboard:** Track BP, Glucose, and BMI with live charts.
- **🚨 Real-Time SOS:** Locate emergency facilities on a pulse-mapped medical engine.
- **🩸 Blood Bank Connect:** Live inventory tracking and urgent blood requests.
- **💊 Medicine Engine:** Generic alternative suggestions and pizza-style order tracking.
- **🧠 AI Health Bot:** High-performance medical knowledge simulation.

---

## 📜 Project Structure
- `/Development Code/Frontend`: React application with environment-aware API configuration.
- `/Development Code/Backend`: Express server with production CORS and health monitoring.

---

## 🤝 Support
Professional deployment guides:
- [Vercel Guide](./vercel_deployment_guide.md)
- [General Deployment](./DEPLOYMENT.md)
