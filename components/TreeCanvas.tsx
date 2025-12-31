
import React, { useState, useRef, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react';
import { TreeData, IssueNode } from '../types';
import Node from './Node';

interface TreeCanvasProps {
  tree: TreeData;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
}

export interface TreeCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

const TreeCanvas = forwardRef<TreeCanvasHandle, TreeCanvasProps>(({ 
  tree, 
  selectedId, 
  onSelect, 
  onUpdate,
  onToggleExpand,
  onAddChild, 
  onDelete 
}, ref) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = useCallback(() => setScale(s => Math.min(s + 0.1, 2)), []);
  const zoomOut = useCallback(() => setScale(s => Math.max(s - 0.1, 0.3)), []);
  
  const resetView = useCallback(() => {
    setScale(1);
    // Center the root roughly in the middle of the screen
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setOffset({ x: width / 4, y: height / 2.5 });
    } else {
      setOffset({ x: 100, y: 100 });
    }
  }, []);

  // Initialize position on mount
  useEffect(() => {
    resetView();
  }, [resetView]);

  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
    resetView
  }));

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow panning if clicking the background or non-interactive elements
    const target = e.target as HTMLElement;
    const isNode = target.closest('.node-container');
    const isButton = target.closest('button');
    const isInput = target.closest('input');
    
    if (e.button !== 0 || isNode || isButton || isInput) return; 

    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    
    setOffset(prev => ({ 
      x: prev.x + dx, 
      y: prev.y + dy 
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(s => Math.max(0.2, Math.min(3, s + delta)));
    } else if (!e.shiftKey) {
      // Standard wheel panning
      setOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const renderTree = (nodeId: string): React.ReactElement => {
    const node = tree.nodes[nodeId];
    if (!node) return <React.Fragment />;

    const hasChildren = node.children.length > 0;
    const isExpanded = node.isExpanded;

    return (
      <div key={nodeId} className="flex flex-col items-start gap-12">
        <div className="flex items-center">
          <div className="node-container">
            <Node
              node={node}
              isSelected={selectedId === nodeId}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          </div>
          
          {hasChildren && isExpanded && (
            <div className="relative h-px w-16 bg-slate-300">
               {/* Vertical spine for connectors */}
               <div className="absolute left-full top-1/2 -translate-y-1/2 flex flex-col gap-12">
                  {node.children.map((childId) => (
                    <div key={childId} className="relative flex items-center">
                      {/* Horizontal connector to the child */}
                      <div className="absolute -left-16 w-16 h-px bg-slate-300" />
                      {renderTree(childId)}
                    </div>
                  ))}
               </div>
            </div>
          )}

          {hasChildren && !isExpanded && (
            <div className="ml-4 flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 shadow-sm animate-pulse pointer-events-none">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {node.children.length} {node.children.length === 1 ? 'branch' : 'branches'} hidden
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 relative overflow-hidden canvas-bg min-h-screen select-none cursor-${isDragging ? 'grabbing' : 'grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div 
        className="absolute transition-transform duration-75 ease-out will-change-transform"
        style={{ 
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        <div className="inline-block p-40">
          {renderTree(tree.rootId)}
        </div>
      </div>

      {/* Viewport Info Overlay */}
      <div className="absolute top-4 left-4 flex gap-2 items-center z-10">
        <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none shadow-sm">
          Zoom: {Math.round(scale * 100)}%
        </div>
        <div className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none shadow-sm">
          Drag background to pan
        </div>
      </div>
    </div>
  );
});

export default TreeCanvas;
