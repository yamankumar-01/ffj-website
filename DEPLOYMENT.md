# 🚀 Complete Deployment Guide: Tree Aadhar (PostgreSQL on Render + Vercel)

The system now runs on **PostgreSQL** with Sequelize ORM, making deployment on Render 100% native with **zero external database setup required**!

---

## Part 1: Deploy Backend & Database on Render (2 Options)

### 🌟 Option A: 1-Click Render Blueprint (Super Easy)
1. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints).
2. Click **New Blueprint Instance**.
3. Select your repository: **`yamankumar-01/ffj-website`**.
4. Render will automatically read `render.yaml` and create:
   - **PostgreSQL Database**: `ffj-tree-aadhar-db` (Free plan)
   - **Web Service**: `ffj-tree-aadhar-backend`
   - Automatically links `DATABASE_URL` between them!
5. Click **Apply**.
6. Once deployed, copy your backend URL: e.g. `https://ffj-tree-aadhar-backend.onrender.com`.

---

### Option B: Manual Setup on Render
1. **Create PostgreSQL Database**:
   - In [Render Dashboard](https://dashboard.render.com), click **New +** → **PostgreSQL**.
   - Name: `ffj-tree-aadhar-db`
   - Database: `ffj_tree_aadhar`
   - User: `ffj_user`
   - Plan: **Free**
   - Click **Create Database**.
   - Copy the **Internal Database URL** (e.g. `postgres://ffj_user:...@dpg-...:5432/ffj_tree_aadhar`).

2. **Create Web Service**:
   - Click **New +** → **Web Service**.
   - Connect repository `yamankumar-01/ffj-website`.
   - **Root Directory**: `backend` *(⚠️ Zaroori)*
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - In **Environment Variables**, add:
     - `DATABASE_URL`: *(Paste the Internal Database URL from above)*
     - `NODE_VERSION`: `20`
     - `ADMIN_USER`: `admin`
     - `ADMIN_PASSWORD`: `ffj@jecrc2025`
     - `JWT_SECRET`: `ffj_super_secret_jwt_key_2025`
   - Click **Deploy Web Service**.

---

## Part 2: Deploy Frontend on Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select repository **`yamankumar-01/ffj-website`**.
4. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** → select `frontend` *(⚠️ Zaroori)*
5. Open **Environment Variables** section:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://<YOUR_RENDER_BACKEND_URL>/api` (e.g. `https://ffj-tree-aadhar-backend.onrender.com/api`)
6. Click **Deploy**.
7. In ~40 seconds, your site will be live at `https://ffj-tree-aadhar.vercel.app`!

---

## Part 3: Final Linkage (Sync QR Code URLs)

Once your Vercel URL is live:
1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Open your backend web service → **Environment**.
3. Set `FRONTEND_URL`:
   ```text
   FRONTEND_URL=https://ffj-tree-aadhar.vercel.app
   ```
4. Save changes. Now every QR code generated on physical tree plaques will automatically link directly to your live Vercel site!
