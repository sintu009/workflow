import React, { useState } from 'react';

const JsonViewer = ({ nodes, edges }) => {
  const [clientId, setClientId] = useState('client61');
  const [workflowName, setWorkflowName] = useState('');
  const [showPopup, setShowPopup] = useState(false);

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
      const response = await fetch('http://10.10.10.34:8081/workflows/generateBPMN', {
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
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Workflow JSON</h3>
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
      <button
        onClick={handleSave}
        className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors mb-4"
      >
        Save Workflow
      </button>
      <pre className="text-xs bg-white p-3 rounded-lg border border-gray-200 overflow-auto">
        {JSON.stringify(workflowData, null, 2)}
      </pre>
      {/* Confirmation popup removed, now using alert */}
    </div>
  );
};

export default JsonViewer;