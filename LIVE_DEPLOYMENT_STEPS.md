# 🚀 Live Deployment Instructions for InsightAgent

Your code is now on GitHub! Here's how to deploy it live:

## Option 1: Render + Vercel (Recommended - FREE)

### Step 1: Deploy Backend on Render
1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub"** and authorize Render
4. Select repository: **company-research-agent**
5. Configure:
   - **Name**: insightagent-backend
   - **Root Directory**: Leave empty
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`
6. Click **"Advanced"** and add Environment Variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyC_JihIHNVfDL3ni-HvZi3qV0ai_Edq-jg`
7. Click **"Create Web Service"**
8. Wait 2-3 minutes for deployment
9. **Copy your backend URL** (e.g., https://insightagent-backend.onrender.com)

### Step 2: Deploy Frontend on Vercel
1. Go to https://vercel.com and sign up/login
2. Click **"Add New"** → **"Project"**
3. Click **"Import Git Repository"** and select **company-research-agent**
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Environment Variables"** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://YOUR-BACKEND-URL.onrender.com/api` (use your Render URL)
6. Click **"Deploy"**
7. Wait 1-2 minutes
8. Your app is LIVE! 🎉

---

## Option 2: Railway (Easiest - Everything in one place)

### Deploy Full Stack on Railway
1. Go to https://railway.app and sign up/login
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect GitHub and select **company-research-agent**
4. Railway will create 2 services automatically
5. Configure Backend Service:
   - Click on backend service
   - **Settings** → **Start Command**: `cd backend && gunicorn app:app`
   - **Variables** → Add: `GEMINI_API_KEY` = `AIzaSyC_JihIHNVfDL3ni-HvZi3qV0ai_Edq-jg`
   - **Generate Domain** to get public URL
6. Configure Frontend Service:
   - Click on frontend service
   - **Settings** → **Root Directory**: `frontend`
   - **Settings** → **Build Command**: `npm run build`
   - **Settings** → **Start Command**: `npm run preview -- --host --port $PORT`
   - **Variables** → Add: `VITE_API_URL` = `YOUR-BACKEND-URL/api`
   - **Generate Domain**
7. Both services will deploy automatically! 🚀

---

## Option 3: Netlify + Render

### Backend on Render (same as Option 1)
Follow Step 1 from Option 1 above.

### Frontend on Netlify
1. Go to https://netlify.com and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub and select **company-research-agent**
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Click **"Advanced build settings"** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://YOUR-BACKEND-URL.onrender.com/api`
6. Click **"Deploy site"**
7. Your app is LIVE! 🎉

---

## Testing Your Live App

1. Open your frontend URL (from Vercel/Railway/Netlify)
2. Type: "Research Tesla"
3. Watch the AI generate a comprehensive account plan
4. Test features:
   - Multiple company searches
   - Conflict resolution
   - JSON export
   - PDF printing

---

## Important Notes

✅ **Free Tier Limits:**
- Render: Backend may sleep after 15 minutes of inactivity (wakes up automatically)
- Vercel: 100 GB bandwidth/month
- Railway: $5 free credit/month

✅ **API Key Security:**
- Your Gemini API key is stored securely in environment variables
- Never commit `.env` files to GitHub
- Monitor your API usage at https://aistudio.google.com

✅ **Custom Domain (Optional):**
- Vercel/Netlify: Add custom domain in project settings
- Render: Add custom domain in web service settings

---

## Need Help?

- **Repository**: https://github.com/priyankapandaa19/company-research-agent
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app

---

## 🎊 Your App is Ready to Go LIVE!

Pick your deployment option above and follow the steps. Your InsightAgent will be live in less than 10 minutes! 🚀
