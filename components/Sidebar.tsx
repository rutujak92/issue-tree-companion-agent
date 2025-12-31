
import React, { useState } from 'react';
import { TreeData, Suggestion, MeceFeedback } from '../types';
import { MECE_GUIDELINES } from '../constants';
import { getBranchSuggestions, checkMECE } from '../geminiService';

interface SidebarProps {
  tree: TreeData;
  selectedId: string | null;
  onAddSuggestion: (parentId: string, suggestionText: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ tree, selectedId, onAddSuggestion }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [feedback, setFeedback] = useState<MeceFeedback[]>([]);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'guidelines' | 'check'>('suggestions');

  const selectedNode = selectedId ? tree.nodes[selectedId] : null;

  const handleGetSuggestions = async () => {
    if (!selectedNode) return;
    setLoading(true);
    const existingTexts = selectedNode.children.map(id => tree.nodes[id].text);
    const results = await getBranchSuggestions(tree.problemStatement, tree.problemType, selectedNode.text, existingTexts);
    setSuggestions(results);
    setLoading(false);
  };

  const handleCheckMECE = async () => {
    setLoading(true);
    const results = await checkMECE(tree);
    setFeedback(results);
    setLoading(false);
  };

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-hidden h-screen sticky top-0">
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'suggestions' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Suggestions
        </button>
        <button 
          onClick={() => setActiveTab('check')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'check' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Audit
        </button>
        <button 
          onClick={() => setActiveTab('guidelines')}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === 'guidelines' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          Rules
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {!selectedId ? (
              <div className="text-center py-10 px-4">
                <div className="mb-4 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <h3 className="text-slate-900 font-semibold mb-2">Select a Node</h3>
                <p className="text-slate-500 text-sm">Select any issue on the canvas to get smart branch suggestions from AI.</p>
              </div>
            ) : (
              <>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Focusing On</p>
                  <p className="text-sm text-slate-800 font-medium truncate">{selectedNode?.text}</p>
                </div>
                <button 
                  disabled={loading}
                  onClick={handleGetSuggestions}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Thinking...' : 'Generate Branches'}
                </button>

                <div className="space-y-3 pt-4">
                  {suggestions.map((s, idx) => (
                    <div 
                      key={idx} 
                      className="group p-3 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer"
                      onClick={() => onAddSuggestion(selectedId!, s.text)}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-bold text-slate-800">{s.text}</h4>
                        <span className="opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                           </svg>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                    </div>
                  ))}
                  {suggestions.length === 0 && !loading && (
                    <p className="text-xs text-slate-400 italic text-center">Click the button above to see AI suggestions.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'check' && (
          <div className="space-y-4">
            <button 
              disabled={loading}
              onClick={handleCheckMECE}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-bold shadow-md hover:bg-emerald-700 disabled:bg-slate-300 transition-all"
            >
              {loading ? 'Analyzing...' : 'Run MECE Audit'}
            </button>

            <div className="space-y-3 pt-2">
              {feedback.map((f) => (
                <div key={f.id} className={`p-3 rounded-lg border flex gap-3 ${
                  f.type === 'overlap' ? 'bg-red-50 border-red-100 text-red-800' :
                  f.type === 'gap' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                  'bg-blue-50 border-blue-100 text-blue-800'
                }`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {f.type === 'overlap' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs font-medium">{f.message}</p>
                </div>
              ))}
              {feedback.length === 0 && !loading && (
                <div className="text-center py-10 opacity-50">
                   <p className="text-xs">No issues found yet. Run an audit to verify your logic.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'guidelines' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                MECE Principles
              </h3>
              <ul className="space-y-3">
                {MECE_GUIDELINES.map((g, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">{i+1}</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{g}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Pro Tip</h4>
              <p className="text-xs text-slate-600 italic">"The power of a tree isn't in its depth, but in its ability to isolate the specific branch where the root cause lives."</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
