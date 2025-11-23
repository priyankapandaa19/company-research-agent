import React, { useState, useRef, useEffect } from 'react';
import { Activity, FileText, Download, Database, LayoutTemplate, MessageSquare, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { AccountPlan, ChatMessage } from './types';
import { ChatSession } from './services/apiService';
import { ChatInterface } from './components/ChatInterface';
import { SectionCard } from './components/SectionCard';
import { ConflictPanel } from './components/ConflictPanel';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [plan, setPlan] = useState<AccountPlan | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'plan'>('chat');
  const [showRubric, setShowRubric] = useState(false);

  const sessionRef = useRef<ChatSession | null>(null);

  useEffect(() => {
    sessionRef.current = new ChatSession();
    sessionRef.current.initialize();
  }, []);

  const handleNewSearch = () => {
    if (window.confirm('Start a new search? This will clear the current conversation and plan.')) {
      setMessages([]);
      setPlan(null);
      setSources([]);
      setIsProcessing(false);
      setActiveTab('chat');
      // Reinitialize session
      sessionRef.current = new ChatSession();
      sessionRef.current.initialize();
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!sessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setActiveTab('chat');

    try {
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      await sessionRef.current.sendMessageStream(
        text,
        (chunkText) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: chunkText } : msg
          ));
        },
        (updatedPlan) => {
          setPlan(updatedPlan);
        },
        (newSources) => {
          setSources(prev => {
            const combined = [...prev, ...newSources];
            const unique = Array.from(new Map(combined.map(item => [item.url, item])).values());
            return unique;
          });
        }
      );

    } catch (err) {
      console.error("Interaction failed", err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const resolveConflict = (id: string, chosenValue: string) => {
    if (!plan) return;
    const updatedConflicts = plan.conflicts.map(c => 
      c.id === id ? { ...c, resolved: true, chosenValue } : c
    );
    setPlan({ ...plan, conflicts: updatedConflicts });
    handleSendMessage(`I resolved the ${id} conflict. Please use the value "${chosenValue}" moving forward.`);
  };

  const exportJSON = () => {
    if (!plan) return;
    const blob = new Blob([JSON.stringify({ plan, sources }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.company.replace(/\s+/g, '_')}_AccountPlan.json`;
    a.click();
  };

  const exportPDF = () => {
    window.print();
  };

  const RubricSection = ({ title, target, criteria }: { title: string; target: number; criteria: string[] }) => (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-slate-800">{title}</h4>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
          Target: {target}%+
        </span>
      </div>
      <ul className="space-y-2">
        {criteria.map((item, i) => (
          <li key={i} className="flex items-start text-sm text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderSourceList = () => (
    <div className="grid grid-cols-1 gap-2 mt-4">
      {sources.slice(0, 10).map((source, i) => (
        <div key={i} className="p-2 bg-white border border-slate-200 rounded text-xs hover:border-blue-300 transition-colors flex flex-col">
          <div className="flex justify-between items-center mb-1">
             <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider
               ${source.reliability === 'Official' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
             `}>
               {source.reliability || 'Source'}
             </span>
          </div>
          <a href={source.url} target="_blank" rel="noreferrer" className="font-medium text-blue-700 hover:underline truncate">
            {source.title}
          </a>
        </div>
      ))}
    </div>
  );


  return (
    <div className="h-screen flex flex-col text-slate-800 overflow-hidden bg-slate-100">
      <header className="bg-slate-900 text-white py-3 px-4 shadow-lg flex-shrink-0 z-20 flex justify-between items-center print:hidden">
        <div className="flex items-center space-x-2">
          <div className="bg-yellow-500 p-1.5 rounded-lg">
            <Activity className="h-5 w-5 text-slate-900" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">InsightAgent <span className="text-slate-400 font-normal text-sm ml-2 hidden sm:inline">Research Assistant</span></h1>
        </div>
        <div className="flex items-center space-x-3">
           <button 
             onClick={handleNewSearch}
             className="group px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-semibold rounded-full flex items-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 transform"
             title="Start a new search"
           >
             <RefreshCw className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-180 transition-transform duration-500" /> 
             <span className="hidden sm:inline">New</span>
           </button>
           <button 
             onClick={() => setShowRubric(true)} 
             className="text-xs text-slate-400 hover:text-white flex items-center transition-colors"
           >
             <FileText className="w-3 h-3 mr-1" /> Quality Rubric
           </button>
        </div>
      </header>

      {/* Rubric Modal */}
      {showRubric && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Account Plan Quality Rubric</h2>
                <p className="text-slate-300 text-sm mt-1">Scoring criteria for comprehensive account plans</p>
              </div>
              <button 
                onClick={() => setShowRubric(false)} 
                className="p-2 hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Overall Score */}
              {plan && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-lg text-blue-900 mb-3">Current Plan Score</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-slate-500 uppercase mb-1">Summary</div>
                      <div className="text-2xl font-bold text-slate-800">{Math.round(plan.confidence_by_section.summary * 100)}%</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-slate-500 uppercase mb-1">Financials</div>
                      <div className="text-2xl font-bold text-slate-800">{Math.round(plan.confidence_by_section.financials * 100)}%</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-slate-500 uppercase mb-1">Products</div>
                      <div className="text-2xl font-bold text-slate-800">{Math.round(plan.confidence_by_section.products * 100)}%</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-slate-500 uppercase mb-1">Competitors</div>
                      <div className="text-2xl font-bold text-slate-800">{Math.round(plan.confidence_by_section.competitors * 100)}%</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-slate-500 uppercase mb-1">Risks</div>
                      <div className="text-2xl font-bold text-slate-800">{Math.round(plan.confidence_by_section.risks * 100)}%</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-xs text-slate-500 uppercase mb-1">Overall</div>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((
                          plan.confidence_by_section.summary +
                          plan.confidence_by_section.financials +
                          plan.confidence_by_section.products +
                          plan.confidence_by_section.competitors +
                          plan.confidence_by_section.risks
                        ) / 5 * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rubric Criteria */}
              <div className="space-y-4">
                <RubricSection 
                  title="Executive Summary" 
                  target={80}
                  criteria={[
                    "Clear company overview and mission statement",
                    "Key value propositions identified",
                    "Market position and differentiation",
                    "Strategic importance to your organization"
                  ]}
                />
                <RubricSection 
                  title="Financial Data" 
                  target={90}
                  criteria={[
                    "Revenue figures with time period specified",
                    "Employee count from reliable sources",
                    "Funding/investment data (if applicable)",
                    "All data points include source URLs",
                    "Confidence scores above 0.7 for key metrics"
                  ]}
                />
                <RubricSection 
                  title="Products & Services" 
                  target={75}
                  criteria={[
                    "Core products/services listed",
                    "Recent product launches identified",
                    "Technology stack or platform details",
                    "Target markets for each product"
                  ]}
                />
                <RubricSection 
                  title="Competitive Landscape" 
                  target={75}
                  criteria={[
                    "Top 3-5 direct competitors identified",
                    "Competitive advantages documented",
                    "Market share estimates (if available)",
                    "Differentiation strategy clear"
                  ]}
                />
                <RubricSection 
                  title="Risk Assessment" 
                  target={70}
                  criteria={[
                    "Operational risks identified",
                    "Market/industry risks noted",
                    "Financial or regulatory risks",
                    "Technology or innovation risks"
                  ]}
                />
                <RubricSection 
                  title="Strategic Actions" 
                  target={75}
                  criteria={[
                    "3-5 actionable recommendations",
                    "Recommendations are specific and measurable",
                    "Aligned with discovered insights",
                    "Prioritized or time-bound actions"
                  ]}
                />
                <RubricSection 
                  title="Sources & Citations" 
                  target={85}
                  criteria={[
                    "All claims backed by sources",
                    "Mix of official and press sources",
                    "Recent sources (within 6-12 months)",
                    "No unresolved data conflicts"
                  ]}
                />
              </div>

              {/* Grading Scale */}
              <div className="bg-slate-50 p-5 rounded-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3">Grading Scale</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />Excellent (≥85%)</span>
                    <span className="text-slate-500">Comprehensive, well-sourced data</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-blue-500 mr-2" />Good (70-84%)</span>
                    <span className="text-slate-500">Solid foundation, minor gaps</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center"><AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />Fair (50-69%)</span>
                    <span className="text-slate-500">Needs more research</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center"><AlertCircle className="w-4 h-4 text-red-500 mr-2" />Poor (&lt;50%)</span>
                    <span className="text-slate-500">Insufficient data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        <div className="md:hidden flex bg-white border-b border-slate-200 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('chat')} 
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
          >
            <MessageSquare className="w-4 h-4 mr-2" /> Chat
          </button>
          <button 
            onClick={() => setActiveTab('plan')} 
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${activeTab === 'plan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
          >
            <LayoutTemplate className="w-4 h-4 mr-2" /> Account Plan
          </button>
        </div>

        <div className={`w-full md:w-[400px] lg:w-[450px] flex-shrink-0 flex flex-col h-full absolute md:relative transition-transform duration-300 z-10
          ${activeTab === 'chat' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isProcessing={isProcessing} 
          />
        </div>

        <div className={`flex-grow bg-slate-100 overflow-y-auto p-4 md:p-8 absolute md:relative w-full h-full transition-transform duration-300
           ${activeTab === 'plan' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          
          {!plan ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                <LayoutTemplate className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">Account Plan Preview</p>
                <p className="text-sm">Start chatting to generate a plan.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900">{plan.company}</h2>
                    <p className="text-slate-500 text-xs mt-0.5">Snapshot: {plan.snapshot_date}</p>
                 </div>
                 <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                    <button onClick={exportJSON} className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        <Database className="w-3.5 h-3.5 mr-1.5" /> JSON
                    </button>
                    <button onClick={exportPDF} className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Print
                    </button>
                 </div>
              </div>

              <ConflictPanel conflicts={plan.conflicts} onResolve={resolveConflict} />

              <SectionCard title="Executive Summary" confidence={plan.confidence_by_section.summary} onSave={(val) => handleSendMessage(`Update the summary to: ${val}`)}>
                   <p className="leading-relaxed whitespace-pre-wrap">{plan.summary}</p>
              </SectionCard>

              <SectionCard title="Key Financials" confidence={plan.confidence_by_section.financials} isEditable={false}>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Revenue</div>
                        <div className="font-mono text-lg font-bold text-slate-900">
                           {plan.financials.revenue[0]?.value || "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 truncate">
                            {plan.financials.revenue[0]?.period} • {plan.financials.revenue[0]?.confidence > 0.8 ? 'High Conf.' : 'Est.'}
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Employees</div>
                        <div className="font-mono text-lg font-bold text-slate-900">
                           {plan.financials.employees[0]?.value || "N/A"}
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Funding</div>
                        <div className="font-mono text-lg font-bold text-slate-900">
                           {plan.financials.funding[0]?.value || "N/A"}
                        </div>
                      </div>
                   </div>
              </SectionCard>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SectionCard title="Products" confidence={plan.confidence_by_section.products} onSave={(val) => handleSendMessage(`Update products to include: ${val}`)}>
                      <ul className="list-disc pl-5 space-y-1">
                          {plan.products.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                  </SectionCard>
                  <SectionCard title="Competitors" confidence={plan.confidence_by_section.competitors} onSave={(val) => handleSendMessage(`Update competitors to: ${val}`)}>
                      <div className="flex flex-wrap gap-2">
                          {plan.competitors.map((c, i) => (
                              <span key={i} className="px-3 py-1 bg-white text-slate-700 rounded-full text-xs font-medium border border-slate-200 shadow-sm">
                                  {c}
                              </span>
                          ))}
                      </div>
                  </SectionCard>
              </div>

              <SectionCard title="Recent News" confidence={0.9} isEditable={false}>
                  <div className="space-y-4">
                      {plan.recent_news.map((news, i) => (
                          <div key={i} className="flex items-start group">
                              <div className="flex-shrink-0 mt-1 mr-3">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
                              </div>
                              <div>
                                  <a href={news.url} target="_blank" rel="noreferrer" className="font-medium text-blue-700 hover:underline">
                                      {news.title}
                                  </a>
                                  <p className="text-xs text-slate-500 mt-0.5">{news.date}</p>
                                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{news.snippet}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </SectionCard>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SectionCard title="Risks" confidence={plan.confidence_by_section.risks} className="border-l-4 border-l-red-400" onSave={(val) => handleSendMessage(`Update risks to: ${val}`)}>
                       <ul className="list-disc pl-5 space-y-2 text-slate-700">
                          {plan.risks.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                  </SectionCard>
                  <SectionCard title="Strategic Actions" className="bg-yellow-50/50 border-l-4 border-l-yellow-400" onSave={(val) => handleSendMessage(`Update actions to: ${val}`)}>
                       <ul className="space-y-2">
                          {plan.recommended_actions.map((a, i) => (
                              <li key={i} className="flex items-start">
                                  <span className="mr-2 mt-1 text-green-600 font-bold">✓</span>
                                  <span>{a}</span>
                              </li>
                          ))}
                      </ul>
                  </SectionCard>
              </div>

              <div className="border-t border-slate-200 pt-6 mt-8">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Cited Sources</h3>
                  {renderSourceList()}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
