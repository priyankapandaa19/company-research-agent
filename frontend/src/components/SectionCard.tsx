import React, { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface SectionCardProps {
  title: string;
  confidence?: number;
  children: React.ReactNode;
  onSave?: (newContent: string) => void;
  isEditable?: boolean;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  confidence, 
  children, 
  onSave, 
  isEditable = true,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<string>('');

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) onSave(content);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 print-break-inside-avoid ${className}`}>
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">{title}</h3>
          {confidence !== undefined && <StatusBadge value={confidence} size="sm" />}
        </div>
        
        {isEditable && (
          <div className="flex items-center space-x-1 no-print">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Save">
                  <Save className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Cancel">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button onClick={handleEditStart} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Edit Section">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="p-6">
        {isEditing ? (
          <textarea 
            className="w-full min-h-[150px] p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            defaultValue={"Content editing is simulated in this view. In a full implementation, the structured JSON would be converted to Markdown for editing here."}
            onChange={(e) => setContent(e.target.value)}
          />
        ) : (
          <div className="prose prose-sm max-w-none text-slate-600">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
