import React, { useEffect, useState } from "react";
import { Square, Diamond, Circle, Workflow, RefreshCw, Trash2, FolderOpen } from "lucide-react";
import { api } from "../services/api";

const NodePalette = ({ onDragStart, onWorkflowSelect }) => {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowJson, setWorkflowJson] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setIsLoading(true);
      const data = await api.getAllWorkflows();
      setWorkflows(data);
      setIsLoading(false);
    };
    fetchWorkflows();
  }, []);

  const handleWorkflowClick = async (workflowName) => {
    if (selectedWorkflow === workflowName) {
      // If clicking the same workflow, deselect it
      setSelectedWorkflow(null);
      setWorkflowJson(null);
      if (onWorkflowSelect) {
        onWorkflowSelect(null);
      }
      return;
    }

    setIsLoading(true);
    setSelectedWorkflow(workflowName);
    const data = await api.getWorkflowJson(workflowName);
    
    // Add workflow name to the data if it's missing
    if (data && !data.workflowName) {
      data.workflowName = workflowName;
    }
    
    setWorkflowJson(data);
    if (onWorkflowSelect) {
      onWorkflowSelect(data);
    }
    console.log("Workflow JSON:", data);
    setIsLoading(false);
  };

  const handleLoadWorkflow = () => {
    if (workflowJson && onWorkflowSelect) {
      onWorkflowSelect(workflowJson);
    }
  };

  const handleClearCanvas = () => {
    if (onWorkflowSelect) {
      onWorkflowSelect({ nodes: [], edges: [] });
    }
    setSelectedWorkflow(null);
    setWorkflowJson(null);
  };

  return (
    <div className="w-full bg-white border-r-2 border-slate-300 shadow-lg overflow-y-auto h-screen">
      {/* Header */}
      <div className="p-4 border-b-2 border-slate-300 bg-slate-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 border-2 border-blue-700 flex items-center justify-center">
            <Square className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Nodes</h3>
        </div>
        <p className="text-xs text-slate-600">Drag to canvas</p>
      </div>

      {/* Node Types */}
      <div className="p-4 space-y-3">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Components</h4>
        
        <div className="space-y-2">
          <div
            className="group flex items-center gap-2 p-2 bg-blue-50 border-2 border-blue-200 cursor-grab hover:bg-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
            draggable
            onDragStart={(e) => onDragStart(e, "task")}
          >
            <div className="w-6 h-6 bg-blue-600 border-2 border-blue-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Square className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-blue-900">Task</div>
            </div>
          </div>

          <div
            className="group flex items-center gap-2 p-2 bg-green-50 border-2 border-green-200 cursor-grab hover:bg-green-100 hover:border-green-300 hover:shadow-lg transition-all duration-200"
            draggable
            onDragStart={(e) => onDragStart(e, "event")}
          >
            <div className="w-6 h-6 bg-green-600 border-2 border-green-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Circle className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-green-900">Event</div>
            </div>
          </div>

          <div
            className="group flex items-center gap-2 p-2 bg-orange-50 border-2 border-orange-200 cursor-grab hover:bg-orange-100 hover:border-orange-300 hover:shadow-lg transition-all duration-200"
            draggable
            onDragStart={(e) => onDragStart(e, "gateway")}
          >
            <div className="w-6 h-6 bg-orange-600 border-2 border-orange-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Diamond className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-orange-900">Gateway</div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Actions */}
      <div className="p-4 border-t-2 border-slate-300">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Actions</h4>
        <div className="space-y-2">
          <button
            onClick={handleClearCanvas}
            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 border-2 border-slate-300 hover:bg-slate-200 transition-all duration-200"
          >
            <Trash2 className="w-3 h-3" />
            <span className="text-xs font-medium">Clear</span>
          </button>
          {workflowJson && (
            <button
              onClick={handleLoadWorkflow}
              className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="text-xs font-medium">Reload</span>
            </button>
          )}
        </div>
      </div>

      {/* Workflows List */}
      <div className="p-4 border-t-2 border-slate-300">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-4 h-4 text-slate-600" />
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Workflows</h4>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
            Loading workflows...
          </div>
        )}
        
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {workflows.map((name) => (
            <div
              key={name}
              onClick={() => handleWorkflowClick(name)}
              className={`group cursor-pointer px-4 py-3 border-2 transition-all duration-200 ${
                selectedWorkflow === name 
                  ? "bg-blue-100 border-blue-300 text-blue-900" 
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Workflow className={`w-3 h-3 ${selectedWorkflow === name ? 'text-blue-600' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{name}</div>
                  {selectedWorkflow === name && (
                    <div className="text-xs text-blue-600 mt-1">Selected</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {workflows.length === 0 && !isLoading && (
            <div className="text-center py-8 text-slate-500">
              <Workflow className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No workflows</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Workflow Preview */}
      {workflowJson && (
        <div className="p-4 border-t-2 border-slate-300 bg-slate-50">
          <div className="bg-white border-2 border-slate-300 p-3">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-semibold text-slate-700">Preview</h5>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 border border-slate-300">
                {selectedWorkflow}
              </span>
            </div>
            <div className="max-h-24 overflow-y-auto">
              <pre className="text-xs text-slate-600 whitespace-pre-wrap">
                {JSON.stringify(workflowJson, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodePalette;