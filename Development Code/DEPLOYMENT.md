# 🚀 Hospital & Medicine Services Portal - Deployment Guide

This document provides step-by-step instructions for deploying your Clinical Portal to production hosting environments.

## 🗄️ 1. Database Setup (MongoDB Atlas)
1.  **Create Account:** Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create Cluster:** Deploy a free "M0" shared cluster.
3.  **Network Access:** Add `0.0.0.0/0` (Allow Access from Anywhere) to the IP Access List.
4.  **Database User:** Create a user with Read/Write permissions.
5.  **Get Connection String:** Select **Drivers** -> **Node.js** and copy the `SRV` connection string.
    *   Example: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/hms-portal?retryWrites=true&w=majority`

---

## ⚙️ 2. Backend Deployment (Render.com Recommended)
1.  **Create Web Service:** Connect your GitHub repository.
2.  **Root Directory:** `Development Code/Backend`
3.  **Build Command:** `npm install`
4.  **Start Command:** `node server.js`
5.  **Environment Variables:**
    *   `PORT`: `3001`
    *   `MONGO_URI`: (Your MongoDB Atlas SRV string)
    *   `JWT_SECRET`: (A strong random string)
    *   `FRONTEND_URL`: (Your production frontend URL once you deploy it)

---

## 🖼️ 3. Frontend Deployment (Vercel or Render)
1.  **Create Project:** Connect your GitHub repository.
2.  **Framework Preset:** Vite
3.  **Root Directory:** `Development Code/Frontend`
4.  **Build Command:** `npm run build`
5.  **Output Directory:** `dist`
6.  **Environment Variables:**
    *   `VITE_API_URL`: (Your deployed backend URL, e.g., `https://hms-api.onrender.com`)

---

## 🧪 4. Post-Deployment Verification
1.  Visit your production frontend URL.
2.  Try logging in with an existing account.
3.  Upload a profile picture to ensure the `/uploads` bridge is active.
4.  Open the AI Chatbot to verify the chemical formula dictionary is loading.

---

## ⚠️ Important Production Notes
*   **Static Images:** Currently, profile pictures are stored locally. For high-traffic production, consider migrating to a cloud storage provider like **Cloudinary** or **AWS S3**.
*   **Security:** Ensure `credentials: true` is matched between your Backend CORS and Frontend Axios config.
*   **Scaling:** The SOS and Order Tracking systems use real-time polling. For thousands of users, enable **Socket.io Adapters** (Redis).
