import React, { useEffect, useState } from "react";
import { Square, Diamond, Circle } from "lucide-react";
import { api } from "../services/api";

const NodePalette = ({ onDragStart, onWorkflowSelect }) => {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowJson, setWorkflowJson] = useState(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      const data = await api.getAllWorkflows();
      setWorkflows(data);
    };
    fetchWorkflows();
  }, []);

  const handleWorkflowClick = async (workflowName) => {
    setSelectedWorkflow(workflowName);
    const data = await api.getWorkflowJson(workflowName);
    setWorkflowJson(data);
    if (onWorkflowSelect) {
      onWorkflowSelect(data);
    }
    console.log("Workflow JSON:", data);
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

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Workflows</h3>
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
            </li>
          ))}
        </ul>
      </div>

      {workflowJson && (
        <div className="bg-gray-50 border border-gray-200 p-2 rounded max-h-48 overflow-y-auto text-xs text-gray-700">
          <pre>{JSON.stringify(workflowJson, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default NodePalette;
