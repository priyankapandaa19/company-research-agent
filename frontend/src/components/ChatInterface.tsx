import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check if Speech Recognition is available
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.log('Speech Recognition not supported in this browser');
        setSpeechError('Voice input not supported in this browser. Use Chrome or Edge.');
        return;
      }

      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
          setSpeechError('Listening... Speak now!');
        };

        recognitionRef.current.onresult = (event: any) => {
          console.log('Speech recognition result:', event);
          const transcript = event.results[0][0].transcript;
          console.log('Transcript:', transcript);
          setInput(prev => (prev ? prev + ' ' + transcript : transcript));
          setIsListening(false);
          setSpeechError('');
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          switch(event.error) {
            case 'not-allowed':
              setSpeechError('❌ Microphone blocked! Click the 🔒 in address bar to allow.');
              break;
            case 'no-speech':
              setSpeechError('⚠️ No speech detected. Please try again and speak clearly.');
              break;
            case 'audio-capture':
              setSpeechError('❌ No microphone found. Please connect a microphone.');
              break;
            case 'network':
              setSpeechError('❌ Network error. Check your internet connection.');
              break;
            default:
              setSpeechError(`❌ Error: ${event.error}. Try refreshing the page.`);
          }
          
          setTimeout(() => setSpeechError(''), 5000);
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };

        setIsSpeechSupported(true);
        console.log('Speech Recognition initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Speech Recognition:', error);
        setSpeechError('Failed to initialize voice input');
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError('❌ Voice input not available');
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition...');
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      setIsListening(false);
      setSpeechError('');
    } else {
      console.log('Starting speech recognition...');
      try {
        recognitionRef.current.start();
        setSpeechError('🎤 Listening... Speak now!');
      } catch (error: any) {
        console.error('Failed to start speech recognition:', error);
        if (error.message?.includes('already started')) {
          setSpeechError('⚠️ Already listening. Speak now or click again to stop.');
          setIsListening(true);
        } else {
          setSpeechError('❌ Could not start microphone. Check browser permissions.');
          setTimeout(() => setSpeechError(''), 5000);
        }
      }
    }
  };

  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
           <div className="text-center mt-20 px-6">
              <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
                  <Bot className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-2">Hello! I'm InsightAgent.</h3>
              <p className="text-slate-500 text-sm">
                I can research companies, find financial data, and build account plans for you.
                Try saying "Research Nvidia" or "Create a plan for Airbnb".
              </p>
           </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }
              `}
            >
              <div className="whitespace-pre-wrap">
                {msg.text.replace(/```json[\s\S]*?```/g, '✅ *I have updated the Account Plan.*').trim()}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                <span className="text-xs text-slate-500 font-medium">Thinking & Searching...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative flex items-end bg-slate-100 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <textarea
            className="flex-grow bg-transparent border-none focus:ring-0 p-3 max-h-32 min-h-[50px] resize-none text-sm text-slate-800 placeholder-slate-400"
            placeholder="Ask me to research a company..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
          />
          
          <div className="flex items-center pb-2 pr-2 space-x-1">
            {isSpeechSupported && (
              <button
                onClick={toggleListening}
                className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                title="Voice Input"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className={`p-2 rounded-lg transition-all ${
                input.trim() && !isProcessing 
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="text-center mt-2">
           {speechError && (
             <p className="text-[10px] text-red-500 mb-1">{speechError}</p>
           )}
           <p className="text-[10px] text-slate-400">AI can make mistakes. Verify important info.</p>
        </div>
      </div>
    </div>
  );
};
