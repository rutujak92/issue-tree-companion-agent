
import React, { useState, useCallback, useRef } from 'react';
import { TreeData, IssueNode } from './types';
import ProblemSetup from './components/ProblemSetup';
import TreeCanvas, { TreeCanvasHandle } from './components/TreeCanvas';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [tree, setTree] = useState<TreeData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<TreeCanvasHandle>(null);

  const initTree = useCallback((setup: Partial<TreeData>) => {
    const rootId = crypto.randomUUID();
    const rootNode: IssueNode = {
      id: rootId,
      text: setup.problemStatement || '',
      parentId: null,
      children: [],
      isExpanded: true,
      level: 0,
    };

    setTree({
      rootId,
      nodes: { [rootId]: rootNode },
      problemStatement: setup.problemStatement || '',
      problemType: setup.problemType || 'Business',
      successCriteria: setup.successCriteria || '',
      scope: setup.scope || '',
    });
    setSelectedId(rootId);
  }, []);

  const addNode = useCallback((parentId: string, text: string = '') => {
    setTree(prev => {
      if (!prev) return prev;
      const newNodeId = crypto.randomUUID();
      const parentNode = prev.nodes[parentId];
      const newNode: IssueNode = {
        id: newNodeId,
        text,
        parentId,
        children: [],
        isExpanded: true,
        level: parentNode.level + 1,
      };

      return {
        ...prev,
        nodes: {
          ...prev.nodes,
          [parentId]: { ...parentNode, children: [...parentNode.children, newNodeId] },
          [newNodeId]: newNode,
        },
      };
    });
    return true;
  }, []);

  const updateNode = useCallback((id: string, text: string) => {
    setTree(prev => {
      if (!prev || !prev.nodes[id]) return prev;
      return {
        ...prev,
        nodes: {
          ...prev.nodes,
          [id]: { ...prev.nodes[id], text },
        },
      };
    });
  }, []);

  const deleteNode = useCallback((id: string) => {
    setTree(prev => {
      if (!prev || !prev.nodes[id] || !prev.nodes[id].parentId) return prev;
      
      const nodeToDelete = prev.nodes[id];
      const parentId = nodeToDelete.parentId!;
      const parentNode = prev.nodes[parentId];

      // Remove recursively
      const newNodes = { ...prev.nodes };
      const removeRecursive = (targetId: string) => {
        const node = newNodes[targetId];
        node.children.forEach(childId => removeRecursive(childId));
        delete newNodes[targetId];
      };
      
      removeRecursive(id);
      newNodes[parentId] = {
        ...parentNode,
        children: parentNode.children.filter(cid => cid !== id)
      };

      return { ...prev, nodes: newNodes };
    });
    setSelectedId(null);
  }, []);

  const handleExport = () => {
    window.print();
  };

  if (!tree) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <ProblemSetup onComplete={initTree} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">LogicalRoot</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">Issue Tree Builder</p>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-700 max-w-[400px] truncate">{tree.problemStatement}</span>
            <span className="text-[10px] text-slate-400">{tree.problemType} • {Object.keys(tree.nodes).length} Nodes</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTree(null)}
            className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
          >
            New Project
          </button>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print PDF
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden relative">
        <TreeCanvas 
          ref={canvasRef}
          tree={tree}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdate={updateNode}
          onAddChild={(pid) => addNode(pid)}
          onDelete={deleteNode}
        />
        
        <Sidebar 
          tree={tree}
          selectedId={selectedId}
          onAddSuggestion={(pid, text) => addNode(pid, text)}
        />

        {/* Floating Canvas Controls */}
        <div className="absolute left-8 bottom-8 flex flex-col gap-2 z-10">
          <div className="flex bg-white rounded-xl shadow-lg border border-slate-200 p-1">
             <button 
                onClick={() => canvasRef.current?.zoomIn()}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400" title="Zoom In"
              >
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
               </svg>
             </button>
             <button 
                onClick={() => canvasRef.current?.zoomOut()}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400" title="Zoom Out"
              >
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
               </svg>
             </button>
             <div className="w-px h-8 bg-slate-100 mx-1" />
             <button 
                onClick={() => canvasRef.current?.resetView()}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400" title="Recenter View"
              >
               <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
               </svg>
             </button>
          </div>
        </div>
      </main>
      
      {/* Mobile Disclaimer */}
      <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 21h6l-.75-4M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Desktop Experience Optimized</h2>
        <p className="text-slate-500">Structured problem solving requires room to breathe. Please use a larger screen for the best issue tree building experience.</p>
      </div>
    </div>
  );
};

export default App;
