import { AccountPlan } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ChatSession {
  private sessionId: string | null = null;

  async initialize(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    this.sessionId = data.session_id;
  }

  async sendMessageStream(
    message: string,
    onChunk: (text: string) => void,
    onPlanUpdate: (plan: AccountPlan) => void,
    onSourcesFound: (sources: any[]) => void
  ): Promise<void> {
    if (!this.sessionId) {
      await this.initialize();
    }

    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: this.sessionId,
        message: message
      })
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));

          switch (data.type) {
            case 'text':
              onChunk(data.content);
              break;
            case 'source':
              onSourcesFound([data.content]);
              break;
            case 'plan':
              onPlanUpdate(data.content);
              break;
            case 'error':
              throw new Error(data.content);
          }
        }
      }
    }
  }
}
