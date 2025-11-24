# InsightAgent - AI-Powered Account Plan Generator

An intelligent account planning assistant that leverages Google's Gemini AI to generate comprehensive, research-backed account plans.
## Project Structure

```
insightagent-python/
├── backend/
│   ├── app.py              # Flask server with Gemini AI integration
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── index.tsx
    │   ├── types.ts
    │   ├── components/
    │   │   ├── ChatInterface.tsx
    │   │   ├── SectionCard.tsx
    │   │   ├── ConflictPanel.tsx
    │   │   └── StatusBadge.tsx
    │   └── services/
    │       └── apiService.ts
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── index.html
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```powershell
cd backend
```

2. Create a virtual environment:
```powershell
python -m venv venv
```

3. Activate virtual environment:
```powershell
.\venv\Scripts\activate
```

4. Install dependencies:
```powershell
pip install -r requirements.txt
```

5. Set your Gemini API key in `.env` file (already configured)

6. Run the Flask server:
```powershell
python app.py
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```powershell
cd frontend
```

2. Install dependencies:
```powershell
npm install
```

3. Run the development server:
```powershell
npm run dev
```

Frontend will run on http://localhost:3000

## Features

- ✅ Real-time chat interface with Gemini AI
- ✅ Streaming responses with SSE (Server-Sent Events)
- ✅ Google Search integration for company research
- ✅ Dynamic account plan generation
- ✅ Source citation and tracking
- ✅ Conflict detection and resolution
- ✅ Confidence scoring
- ✅ Export to JSON
- ✅ Print/PDF support
- ✅ Voice input (Web Speech API)
- ✅ Mobile responsive design

## API Endpoints

- `POST /api/chat/create` - Create a new chat session
- `POST /api/chat/message` - Send a message (returns SSE stream)
- `GET /api/health` - Health check

## Technologies

**Backend:**
- Flask (Python web framework)
- Google Generative AI SDK
- Flask-CORS (for CORS support)
- Server-Sent Events for streaming

**Frontend:**
- React 19
- TypeScript
- Vite (build tool)
- Tailwind CSS
- Lucide React (icons)

## Usage

1. Start both backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Type a query like "Research Tesla", "Create an account plan for Microsoft", or "Tell me about Eightfold.ai"
4. The AI will research the company and generate a comprehensive account plan
5. Review conflicts and resolve them interactively
6. Export the plan as JSON or print to PDF

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy Options:**
- **Backend**: Render or Railway
- **Frontend**: Vercel ,Netlify, or Railway


