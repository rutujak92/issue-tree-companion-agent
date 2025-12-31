
import React, { useState, useRef, useEffect } from 'react';
import { IssueNode } from '../types';

interface NodeProps {
  node: IssueNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
}

const Node: React.FC<NodeProps> = ({ node, isSelected, onSelect, onUpdate, onAddChild, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(node.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (text !== node.text) {
      onUpdate(node.id, text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
  };

  return (
    <div 
      className={`relative group p-4 rounded-xl border-2 transition-all cursor-pointer min-w-[220px] max-w-[280px] bg-white shadow-sm node-container ${
        isSelected 
          ? 'border-blue-500 ring-4 ring-blue-50/50' 
          : 'border-slate-200 hover:border-slate-300'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onDoubleClick={() => setIsEditing(true)}
    >
      <div className="flex flex-col gap-1">
        {isEditing ? (
          <input
            ref={inputRef}
            className="w-full outline-none text-slate-800 font-medium bg-transparent"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <p className={`text-slate-800 font-medium leading-tight select-none ${!node.text && 'text-slate-400 italic'}`}>
            {node.text || 'Untitled Issue...'}
          </p>
        )}
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 select-none">
          Level {node.level}
        </span>
      </div>

      {/* Floating Action Buttons */}
      <div className={`absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 translate-x-1`}>
        <button 
          onClick={(e) => { e.stopPropagation(); onAddChild(node.id); }}
          className="p-1.5 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform"
          title="Add Child"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        {node.parentId && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            className="p-1.5 bg-red-100 text-red-600 rounded-full shadow-md hover:scale-110 transition-transform border border-red-200"
            title="Delete Branch"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Visual Level Marker */}
      <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full ${
        node.level === 0 ? 'bg-indigo-500' :
        node.level === 1 ? 'bg-blue-400' :
        node.level === 2 ? 'bg-emerald-400' : 'bg-slate-300'
      }`} />
    </div>
  );
};

export default Node;
