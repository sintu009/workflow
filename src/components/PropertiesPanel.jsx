import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { X, Save, Trash2, Settings, Tag, Clock, Type } from "lucide-react";

const PropertiesPanel = ({ selectedNode, onNodeUpdate, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [events, setEvents] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [event, setEvent] = useState({});
  const [showConditionModal, setShowConditionModal] = useState(false);

  const onNodeDelete = () => {
    if (selectedNode && window.confirm(`Are you sure you want to delete this ${selectedNode.type} node?`)) {
      window.dispatchEvent(new CustomEvent('deleteNode', { detail: selectedNode.id }));
      onClose();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedNode) {
      setSelectedTask(selectedNode.data.selectedTask || null);
      setSelectedGateway(selectedNode.data.selectedGateway || null);
      setEvent(selectedNode.data.event || {});
    }
  }, [selectedNode]);

  const fetchData = async () => {
    try {
      const [nodeDetails, conditionsData] = await Promise.all([
        api.getNodeDetails(),
        api.getAllConditions(),
      ]);

      setTasks(nodeDetails.tasks);
      setGateways(nodeDetails.gateways);
      setEvents(nodeDetails.events || []);
      setConditions(conditionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSave = () => {
    if (!selectedNode) return;

    const updatedData = {
      ...selectedNode.data,
      selectedTask,
      selectedGateway,
      event,
    };

    onNodeUpdate(selectedNode.id, updatedData);
  };

  const handleFieldChange = (key, value) => {
    setEvent((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!selectedNode) return null;

  return (
    <>
      <div className="w-96 bg-white border-l-2 border-slate-300 shadow-lg overflow-y-auto relative">
        {/* Header */}
        <div className="p-6 border-b-2 border-slate-300 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 border-2 border-indigo-700 flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Properties</h3>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-200 border border-slate-300 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <p className="text-sm text-slate-600">Configure node settings and behavior</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Node Type */}
          <div className="p-4 bg-slate-50 border-2 border-slate-300">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-slate-600" />
              <label className="text-sm font-semibold text-slate-700">Node Type</label>
            </div>
            <div className="px-3 py-2 bg-white text-sm font-medium text-slate-800 border-2 border-slate-300">
              {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)} Node
            </div>
          </div>

          {/* Task Configuration */}
          {selectedNode.type === "task" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Task Configuration</h4>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Task
                </label>
                <select
                  value={selectedTask?.key || ""}
                  onChange={(e) => {
                    const task = tasks.find((t) => t.key === e.target.value);
                    setSelectedTask(task || null);
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Select a task...</option>
                  {tasks.map((task) => (
                    <option key={task.key} value={task.key}>
                      {task.name} ({task.type})
                    </option>
                  ))}
                </select>
                {selectedTask && (
                  <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-300">
                    <div className="text-sm">
                      <div className="font-medium text-blue-900 mb-1">Selected Task</div>
                      <div className="text-blue-700">{selectedTask.name}</div>
                      <div className="text-xs text-blue-600 mt-1">Type: {selectedTask.type}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Gateway Configuration */}
          {selectedNode.type === "gateway" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-orange-600" />
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Gateway Configuration</h4>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Gateway
                </label>
                <select
                  value={selectedGateway?.key || ""}
                  onChange={(e) => {
                    const gateway = gateways.find((g) => g.key === e.target.value);
                    setSelectedGateway(gateway || null);
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="">Select a gateway...</option>
                  {gateways.map((gateway) => (
                    <option key={gateway.key} value={gateway.key}>
                      {gateway.name} ({gateway.type})
                    </option>
                  ))}
                </select>
                {selectedGateway && (
                  <div className="mt-3 p-3 bg-orange-50 border-2 border-orange-300">
                    <div className="text-sm">
                      <div className="font-medium text-orange-900 mb-1">Selected Gateway</div>
                      <div className="text-orange-700">{selectedGateway.name}</div>
                      <div className="text-xs text-orange-600 mt-1">Type: {selectedGateway.type}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event Configuration */}
          {selectedNode.type === "event" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Event Configuration</h4>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Event Type
                </label>
                <select
                  value={event?.key || ""}
                  onChange={(e) => {
                    const selected = events.find((g) => g.key === e.target.value);
                    setEvent(selected || {});
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                >
                  <option value="">Select an event...</option>
                  {events.map((ev) => (
                    <option key={ev.key} value={ev.key}>
                      {ev.name} ({ev.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={event.eventName || ""}
                  onChange={(e) => handleFieldChange("eventName", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="Enter event name..."
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <label className="block text-sm font-semibold text-slate-700">
                    Time Duration
                  </label>
                </div>
                <input
                  type="text"
                  value={event.timeDuration || ""}
                  onChange={(e) => handleFieldChange("timeDuration", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                  placeholder="e.g., PT1M, PT5S, PT1H"
                />
                <div className="mt-2 text-xs text-slate-500">
                  Use ISO 8601 duration format (PT1M = 1 minute, PT5S = 5 seconds)
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t-2 border-slate-300 space-y-3">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>

            <button
              onClick={onNodeDelete}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              Delete Node
            </button>
          </div>
        </div>
      </div>

      {/* Condition Modal Overlay */}
      {showConditionModal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="bg-black bg-opacity-30 absolute inset-0"
            onClick={() => setShowConditionModal(false)}
          />
          <div className="relative w-96 h-full bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Condition Modal</h4>
              <button
                onClick={() => setShowConditionModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-gray-700">
                This is the Condition Modal. Add your condition form or content here.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertiesPanel;