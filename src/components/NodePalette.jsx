import React, { useEffect, useState } from "react";
import { Square, Diamond, Circle } from "lucide-react";
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
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto h-screen">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Node Palette</h3>

      <div className="space-y-3 mb-6">
        <div
          className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-grab hover:bg-blue-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "task")}
        >
          <Square className="w-6 h-6 text-blue-600" />
          <div>
            <div className="font-medium text-blue-800">Task</div>
            <div className="text-sm text-blue-600">Rectangle node for tasks</div>
          </div>
        </div>

        <div
          className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-grab hover:bg-green-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "event")}
        >
          <Circle className="w-6 h-6 text-green-600" />
          <div>
            <div className="font-medium text-green-800">Event</div>
            <div className="text-sm text-green-600">Circle node for events</div>
          </div>
        </div>

        <div
          className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-grab hover:bg-orange-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart(e, "gateway")}
        >
          <Diamond className="w-6 h-6 text-orange-600" />
          <div>
            <div className="font-medium text-orange-800">Gateway</div>
            <div className="text-sm text-orange-600">Diamond node for decisions</div>
          </div>
        </div>
      </div>

      {/* Workflow Actions */}
      <div className="mb-4 space-y-2">
        <button
          onClick={handleClearCanvas}
          className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear Canvas
        </button>
        {workflowJson && (
          <button
            onClick={handleLoadWorkflow}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Workflow
          </button>
        )}
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Workflows</h3>
        {isLoading && (
          <div className="text-sm text-gray-500 mb-2">Loading workflows...</div>
        )}
        <ul className="space-y-1">
          {workflows.map((name) => (
            <li
              key={name}
              onClick={() => handleWorkflowClick(name)}
              className={`cursor-pointer px-2 py-1 rounded hover:bg-gray-100 ${
                selectedWorkflow === name ? "bg-blue-100 text-blue-800" : "text-gray-700"
              }`}
            >
              {name}
              {selectedWorkflow === name && (
                <span className="ml-2 text-xs text-blue-600">(selected)</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {workflowJson && (
        <div className="bg-gray-50 border border-gray-200 p-3 rounded">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Selected Workflow</h4>
            <span className="text-xs text-gray-500">{selectedWorkflow}</span>
          </div>
          <div className="max-h-48 overflow-y-auto text-xs text-gray-700">
            <pre>{JSON.stringify(workflowJson, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodePalette;
