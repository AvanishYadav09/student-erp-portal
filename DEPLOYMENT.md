# 🚀 Student ERP Portal - Cloud Deployment Guide

This guide provides step-by-step instructions for deploying the **Student ERP Portal** to popular free cloud hosting platforms (**Render**, **Railway**) or as a **Docker Container**.

---

## Option 1: Deploy to Render (Recommended - Free)

1. **Push Code to GitHub**:
   Ensure your repository is pushed to GitHub.

2. **Connect to Render**:
   - Go to [render.com](https://render.com) and sign in.
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.

3. **Configure Service**:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Deploy**:
   Click **Create Web Service**. Render will automatically build and deploy your portal to a live public URL (e.g. `https://student-erp-portal.onrender.com`).

---

## Option 2: Deploy to Railway (Free Trial)

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select `student-erp-portal`.
4. Railway will auto-detect Node.js and the `Procfile`, then build and generate a public domain for your app.

---

## Option 3: Deploy with Docker Container

1. **Build Docker Image**:
   ```bash
   docker build -t student-erp-portal .
   ```

2. **Run Container**:
   ```bash
   docker run -d -p 3000:3000 --name student-erp student-erp-portal
   ```

3. Access your app at `http://localhost:3000`.

---

## Default Login Credentials:
- **Admin**: Username: `admin` | Password: `admin123`
- **Student**: ID: `student` | Password: `123` (or `student123`)
