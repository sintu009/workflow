import React, { useState } from 'react';
import { Code, Save, AlertCircle, CheckCircle, Settings } from 'lucide-react';

const JsonViewer = ({ nodes, edges, currentWorkflowName = '', isModified = false }) => {
  const [clientId, setClientId] = useState('client61');
  const [workflowName, setWorkflowName] = useState(currentWorkflowName);
  const [isSaving, setIsSaving] = useState(false);

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

      setIsSaving(true);
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
        console.log('Non-JSON API response:', responseText);
      }
      
      alert('Workflow successfully generated!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow: ' + error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-96 bg-white/95 backdrop-blur-sm border-l border-slate-200/50 shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
            <Code className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Workflow JSON</h3>
        </div>
        {isModified && (
          <div className="flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">Unsaved changes</span>
          </div>
        )}
      </div>

      {/* Configuration */}
      <div className="p-6 space-y-4 border-b border-slate-200/50">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Configuration</h4>
        </div>
        
        <div>
          <label htmlFor="clientId" className="block text-sm font-semibold text-slate-700 mb-2">
            Client ID
          </label>
          <input
            type="text"
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter client ID"
          />
        </div>
        
        <div>
          <label htmlFor="workflowName" className="block text-sm font-semibold text-slate-700 mb-2">
            Workflow Name
          </label>
          <input
            type="text"
            id="workflowName"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)} 
            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter workflow name"
          />
        </div>
        
        {currentWorkflowName && (
          <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium text-blue-900">Currently Editing</div>
                <div className="text-blue-700">{currentWorkflowName}</div>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full flex items-center justify-center gap-3 p-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            isModified 
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isModified ? 'Save Changes' : 'Save Workflow'}
            </>
          )}
        </button>
      </div>
      
      {/* JSON Preview */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">JSON Preview</h4>
        <div className="bg-slate-900 rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="ml-2 text-xs text-slate-400 font-mono">workflow.json</span>
            </div>
          </div>
          <pre className="text-xs text-green-400 p-4 overflow-auto max-h-96 font-mono leading-relaxed">
            {JSON.stringify(workflowData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;