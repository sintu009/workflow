import React, { useState } from 'react';

const JsonViewer = ({ nodes, edges, currentWorkflowName = '', isModified = false }) => {
  const [clientId, setClientId] = useState('client61');
  const [workflowName, setWorkflowName] = useState(currentWorkflowName);
  const [showPopup, setShowPopup] = useState(false);

  // Update workflow name when currentWorkflowName changes
  React.useEffect(() => {
    if (currentWorkflowName && !workflowName) {
      setWorkflowName(currentWorkflowName);
    }
  }, [currentWorkflowName, workflowName]);
  const workflowData = {
    clientId,
    workflowName,
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.data.label,
        ...(node.data.selectedTask && {
          task: {
            key: node.data.selectedTask.key,
            name: node.data.selectedTask.name,
            type: node.data.selectedTask.type
          }
        }),
        ...(node.data.selectedGateway && {
          gateway: {
            key: node.data.selectedGateway.key,
            name: node.data.selectedGateway.name,
            type: node.data.selectedGateway.type
          }
        }),
        ...(node.data.event && Object.keys(node.data.event).length > 0 && {
          event: {
            eventType: node.data.event.eventType,
            // name: node.data.event.name,
            eventType: node.data.event.type,
            eventName: node.data.event.eventName,
            timeDuration: node.data.event.timeDuration
          }
        })
      }
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      ...(edge.data?.condition && {
        condition: edge.data.condition
      })
    }))
  };

  const handleSave = async () => {
    try {
      if (!clientId || !workflowName) {
        alert('Client ID and Workflow Name are required.');
        return;
      }

      console.log('Sending workflowData:', JSON.stringify(workflowData, null, 2));
      const response = await fetch('/workflow-api/generateBPMN', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData)
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}${responseText ? ` - ${responseText}` : ''}`);
      }

       try {
        const result = JSON.parse(responseText);
        console.log('API response:', result);
      } catch (jsonErr) {
        debugger
        console.log('Non-JSON API response:', responseText);
      
      }
      alert('Workflow successfully generated!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow: ' + error);
      // Do not show alert, just log error
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Workflow JSON</h3>
        {isModified && (
          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
            Modified
          </span>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
          Client ID
        </label>
        <input
          type="text"
          id="clientId"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter client id"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="workflowName" className="block text-sm font-medium text-gray-700 mb-1">
          Workflow Name
        </label>
        <input
          type="text"
          id="workflowName"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter workflow name"
        />
      </div>
      
      {currentWorkflowName && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-600">
            Currently editing: <span className="font-medium">{currentWorkflowName}</span>
          </div>
        </div>
      )}
      
      <button
        onClick={handleSave}
        className={`w-full p-2 rounded-lg transition-colors mb-4 ${
          isModified 
            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isModified ? 'Save Changes' : 'Save Workflow'}
      </button>
      
      <pre className="text-xs bg-white p-3 rounded-lg border border-gray-200 overflow-auto">
        {JSON.stringify(workflowData, null, 2)}
      </pre>
      {/* Confirmation popup removed, now using alert */}
    </div>
  );
};

export default JsonViewer;