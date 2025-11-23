import os
import json
import re
from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import google.generativeai as genai
from urllib.parse import urlparse
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini API
API_KEY = os.getenv('GEMINI_API_KEY', '')
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=API_KEY)

# System Prompt
SYSTEM_PROMPT = """
You are InsightAgent, a world-class corporate research assistant.
Your goal is to help the user build a comprehensive, structured **Account Plan** for a specific company.

**Core Responsibilities:**
1. **Research**: Use the `googleSearch` tool to find the latest financial data, news, risks, and competitor info.
2. **Synthesize**: Maintain a mental model of the Account Plan.
3. **Detect Conflicts**: If you find conflicting data (e.g., different revenue numbers), explicitly discuss this with the user in the chat ("I found X from Source A and Y from Source B...").
4. **Update Plan**: Whenever you have gathered enough information to create or update the plan, you **MUST** output the FULL JSON of the account plan in your response, wrapped in a markdown code block labeled `json`.

**JSON Structure:**
The JSON you output must strictly follow this schema:
```json
{
  "company": "Company Name",
  "snapshot_date": "YYYY-MM-DD",
  "summary": "...",
  "financials": {
    "revenue": [{"value": "...", "currency": "...", "period": "...", "source": "url", "confidence": 0.9}],
    "employees": [{"value": "...", "source": "url", "confidence": 0.8}],
    "funding": [...]
  },
  "products": ["..."],
  "competitors": ["..."],
  "risks": ["..."],
  "recent_news": [{"title": "...", "url": "...", "date": "...", "snippet": "..."}],
  "recommended_actions": ["..."],
  "conflicts": [{"id": "...", "fact_type": "...", "values": [{"value": "...", "source": "..."}], "recommendation": "..."}],
  "confidence_by_section": {"summary": 0.9, ...}
}
```

**Interaction Style:**
- Be conversational and helpful.
- Ask clarifying questions if the company name is ambiguous.
- If the user asks to "change the summary" or "update risks", regenerate the JSON with those changes.
- ALWAYS use the Google Search tool for factual queries.
"""

# Helper functions
def get_safe_domain(uri):
    """Extract domain from URL safely"""
    try:
        if not uri:
            return 'Unknown Source'
        return urlparse(uri).hostname
    except:
        return 'External Source'

def determine_reliability(url):
    """Determine source reliability"""
    if '.gov' in url or 'investor' in url:
        return 'Official'
    return 'Major Press'

# Store chat sessions in memory (in production, use Redis or database)
chat_sessions = {}

@app.route('/api/chat/create', methods=['POST'])
def create_chat():
    """Create a new chat session"""
    session_id = str(datetime.now().timestamp())
    
    # Create a new chat with Gemini
    model = genai.GenerativeModel(
        'gemini-2.0-flash-exp',
        system_instruction=SYSTEM_PROMPT,
        tools='google_search_retrieval'
    )
    
    chat = model.start_chat(history=[])
    chat_sessions[session_id] = chat
    
    return jsonify({'session_id': session_id})

@app.route('/api/chat/message', methods=['POST'])
def send_message():
    """Send a message and stream the response"""
    data = request.json
    session_id = data.get('session_id')
    message = data.get('message')
    
    if not session_id or session_id not in chat_sessions:
        return jsonify({'error': 'Invalid session'}), 400
    
    chat = chat_sessions[session_id]
    
    def generate():
        """Generator function for streaming response"""
        try:
            full_text = ""
            sources_sent = set()
            
            # Send message with streaming
            response = chat.send_message(message, stream=True)
            
            for chunk in response:
                # Extract text
                if chunk.text:
                    full_text += chunk.text
                    
                    # Send text chunk
                    yield f"data: {json.dumps({'type': 'text', 'content': full_text})}\n\n"
                
                # Extract grounding metadata (sources)
                if hasattr(chunk, 'candidates') and chunk.candidates:
                    candidate = chunk.candidates[0]
                    if hasattr(candidate, 'grounding_metadata'):
                        grounding = candidate.grounding_metadata
                        if hasattr(grounding, 'grounding_chunks'):
                            for gc in grounding.grounding_chunks:
                                if hasattr(gc, 'web') and gc.web:
                                    url = gc.web.uri
                                    if url not in sources_sent:
                                        sources_sent.add(url)
                                        source_data = {
                                            'title': getattr(gc.web, 'title', 'Untitled'),
                                            'url': url,
                                            'domain': get_safe_domain(url),
                                            'fetchedAt': datetime.now().isoformat(),
                                            'reliability': determine_reliability(url)
                                        }
                                        yield f"data: {json.dumps({'type': 'source', 'content': source_data})}\n\n"
            
            # Extract JSON plan from response
            json_match = re.search(r'```json\s*(.*?)\s*```', full_text, re.DOTALL)
            if json_match:
                try:
                    plan_json = json.loads(json_match.group(1))
                    if 'company' in plan_json and 'financials' in plan_json:
                        yield f"data: {json.dumps({'type': 'plan', 'content': plan_json})}\n\n"
                except json.JSONDecodeError as e:
                    print(f"Failed to parse JSON plan: {e}")
            
            # Send completion signal
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            
        except Exception as e:
            print(f"Error in stream: {e}")
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'api_configured': bool(API_KEY)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
