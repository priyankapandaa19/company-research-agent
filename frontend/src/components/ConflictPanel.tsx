import React from 'react';
import { Conflict } from '../types';
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface ConflictPanelProps {
  conflicts: Conflict[];
  onResolve: (conflictId: string, chosenValue: string) => void;
}

export const ConflictPanel: React.FC<ConflictPanelProps> = ({ conflicts, onResolve }) => {
  if (!conflicts || conflicts.length === 0) return null;

  const activeConflicts = conflicts.filter(c => !c.resolved);
  
  if (activeConflicts.length === 0) {
     return (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 no-print">
            <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">All data conflicts resolved.</span>
            </div>
        </div>
     )
  }

  const getDisplaySource = (source: string) => {
    try {
      return new URL(source).hostname;
    } catch (e) {
      return source;
    }
  };

  return (
    <div className="mb-8 rounded-lg bg-amber-50 border border-amber-200 overflow-hidden shadow-sm no-print">
      <div className="bg-amber-100/50 px-4 py-3 border-b border-amber-200 flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
          <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">Data Conflicts Detected ({activeConflicts.length})</h3>
        </div>
        <span className="text-xs text-amber-700 bg-amber-200 px-2 py-1 rounded">Action Required</span>
      </div>
      
      <div className="divide-y divide-amber-200/50">
        {activeConflicts.map((conflict) => (
          <div key={conflict.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-amber-900 capitalize">{conflict.fact_type} Discrepancy</h4>
              <span className="text-xs text-amber-600 italic">{conflict.recommendation}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {conflict.values.map((val, idx) => (
                <div key={idx} className="relative border border-amber-200 bg-white rounded-md p-3 hover:border-amber-400 transition-colors">
                  <div className="font-mono text-lg font-bold text-slate-800">{val.value}</div>
                  <a 
                    href={val.source} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-blue-600 hover:underline flex items-center mt-1 truncate"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Source: {getDisplaySource(val.source)}
                  </a>
                  <button
                    onClick={() => onResolve(conflict.id, val.value)}
                    className="mt-3 w-full py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded transition-colors"
                  >
                    Select This Value
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
