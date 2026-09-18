# 🚀 Complete Deployment Guide: Tree Aadhar (Render + Vercel)

This guide walks you through deploying:
- **Backend API**: on [Render](https://render.com) (Node.js/Express)
- **Frontend Web App**: on [Vercel](https://vercel.com) (React 19/Vite)
- **Database**: on [MongoDB Atlas](https://www.mongodb.com/atlas) (Free M0 Cluster)

---

## Part 1: Push Code to GitHub

Open your terminal in the project root (`c:\Users\yaman\OneDrive\Desktop(1)\ffj-website`):

```bash
# 1. Initialize git repository
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Initial commit: Tree Aadhar full-stack system"

# 4. Create a new repository on GitHub (e.g. 'ffj-tree-aadhar')
# 5. Link and push to GitHub:
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
git push -u origin main
```

---

## Part 2: Setup Free MongoDB Atlas Database

Since Render's free tier spins down inactive web services, an external MongoDB cluster ensures your tree records, photos, and vitals persist forever.

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign in.
2. Click **Create a Deployment** → Select **M0 (Free Tier)**.
3. Choose your closest region (e.g. `Mumbai (ap-south-1)`).
4. Under **Security Quickstart**:
   - Create a database user (e.g. username: `ffj_admin`, choose a strong password).
   - Under **Network Access**, click **Add IP Address** → choose **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** → **Drivers (Node.js)** → Copy your connection string:
   ```
   mongodb+srv://ffj_admin:<password>@cluster0.xxxxx.mongodb.net/ffj_tree_aadhar?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your actual password).*

---

## Part 3: Deploy Backend on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`ffj-tree-aadhar`).
4. Configure the settings:
   - **Name**: `ffj-tree-aadhar-backend` (or your choice)
   - **Language**: `Node`
   - **Region**: `Singapore` or `Frankfurt`
   - **Root Directory**: `backend`  *(⚠️ VERY IMPORTANT: type `backend`)*
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Advanced** → **Add Environment Variable**:
   | Key | Value | Description |
   |---|---|---|
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `NODE_VERSION` | `20` | Recommended Node version |
   | `JWT_SECRET` | `ffj_super_secret_jwt_key_2025` | Any secret string |
   | `ADMIN_USER` | `admin` | Admin dashboard username |
   | `ADMIN_PASSWORD` | `ffj@jecrc2025` | Admin dashboard password |
   | `FRONTEND_URL` | *(leave empty for now, fill in after Vercel deploy)* | Vercel domain for QR links |
6. Click **Deploy Web Service**.
7. Once deployed, copy your Render URL:
   ```
   https://ffj-tree-aadhar-backend.onrender.com
   ```
   Test in browser: `https://ffj-tree-aadhar-backend.onrender.com/api/trees/stats` should return JSON!

---

## Part 4: Deploy Frontend on Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`ffj-tree-aadhar`).
4. In the configuration screen:
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: Click **Edit** → select `frontend` *(⚠️ VERY IMPORTANT)*
5. Open **Environment Variables** section:
   - Add:
     - **Name**: `VITE_API_BASE_URL`
     - **Value**: `https://ffj-tree-aadhar-backend.onrender.com/api` *(Your Render backend URL with `/api`)*
6. Click **Deploy**.
7. In ~40 seconds, your site will be live at:
   ```
   https://ffj-tree-aadhar.vercel.app
   ```

---

## Part 5: Final Linkage (Sync QR Code URLs)

Now that you have your live Vercel URL (e.g. `https://ffj-tree-aadhar.vercel.app`):

1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Open your backend web service → **Environment**.
3. Edit the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://ffj-tree-aadhar.vercel.app
   ```
4. Click **Save Changes** (Render will automatically re-deploy in 30 seconds).

🎉 **Congratulations! Your Tree Aadhar System is fully deployed!**
- Anyone scanning physical tree QR codes on JECRC campus will open your live Vercel site.
- Admin dashboard is live and protected with CSV onboarding and printable plaque downloads.
