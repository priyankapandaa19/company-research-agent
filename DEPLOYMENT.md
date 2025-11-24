# InsightAgent Deployment Guide

## Quick Deploy

### Backend (Render)
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect settings from `render.yaml`
5. Add environment variable: `GEMINI_API_KEY` = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
6. Click "Create Web Service"

### Frontend (Vercel)
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Framework Preset: Vite
5. Root Directory: `frontend`
6. Add environment variable: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
7. Click "Deploy"

## Alternative: Railway Deployment

### Full Stack on Railway
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Add two services:
   - Backend: Root path, Start command: `cd backend && gunicorn app:app`
   - Frontend: Root path `frontend`, Start command: `npm run build && npx vite preview --host --port $PORT`
4. Add environment variables as needed
5. Deploy!

## Local Development

Backend:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Backend (.env):
- `GEMINI_API_KEY`: Your Google Gemini API key

Frontend (.env):
- `VITE_API_URL`: Backend API URL (e.g., https://your-app.onrender.com/api)
