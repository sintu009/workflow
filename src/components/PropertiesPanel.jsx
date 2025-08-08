import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { X, Save, Trash2 } from "lucide-react";

const PropertiesPanel = ({ selectedNode, onNodeUpdate, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [events, setEvents] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [event, setEvent] = useState({});
  const [showConditionModal, setShowConditionModal] = useState(false);

  // Add onNodeDelete prop
  const onNodeDelete = () => {
    if (selectedNode && window.confirm(`Are you sure you want to delete this ${selectedNode.type} node?`)) {
      // Emit a custom event that the parent can listen to
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
      <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Node Type
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-sm">
              {selectedNode.type.charAt(0).toUpperCase() +
                selectedNode.type.slice(1)}
            </div>
          </div>

          {/* Show button to open Condition Modal for all node types, or restrict as needed */}
          {/* <button
            onClick={() => setShowConditionModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Show Condition Modal
          </button> */}

          <hr></hr>

          {selectedNode.type === "task" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Task
              </label>
              <select
                value={selectedTask?.key || ""}
                onChange={(e) => {
                  const task = tasks.find((t) => t.key === e.target.value);
                  setSelectedTask(task || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a task...</option>
                {tasks.map((task) => (
                  <option key={task.key} value={task.key}>
                    {task.name} ({task.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedNode.type === "gateway" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Gateway
              </label>
              <select
                value={selectedGateway?.key || ""}
                onChange={(e) => {
                  const gateway = gateways.find(
                    (g) => g.key === e.target.value
                  );
                  setSelectedGateway(gateway || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a gateway...</option>
                {gateways.map((gateway) => (
                  <option key={gateway.key} value={gateway.key}>
                    {gateway.name} ({gateway.type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedNode.type === "event" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  value={event?.key || ""}
                  onChange={(e) => {
                    const selected = events.find((g) => g.key === e.target.value);
                    setEvent(selected || {});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={event.eventName || ""}
                  onChange={(e) =>
                    handleFieldChange("eventName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter event name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time condition
                </label>
                <input
                  type="text"
                  value={event.timeDuration || ""}
                  onChange={(e) =>
                    handleFieldChange("timeDuration", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter PT1M"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>

          <button
            onClick={onNodeDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Node
          </button>
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
            {/* Modal content goes here */}
            <div>
              <p className="text-gray-700">
                This is the Condition Modal. Add your condition form or content
                here.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertiesPanel;
