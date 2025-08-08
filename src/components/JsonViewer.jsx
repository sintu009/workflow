import React, { useState } from 'react';
import { Code, Save, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { api } from '../services/api';

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
      
      const result = await api.generateBPMN(workflowData);
      
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-white border-l-2 border-slate-300 shadow-lg overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b-2 border-slate-300 bg-slate-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-purple-600 border-2 border-purple-700 flex items-center justify-center">
            <Code className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">JSON</h3>
        </div>
        {isModified && (
          <div className="flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">Unsaved</span>
          </div>
        )}
      </div>

      {/* Configuration */}
      <div className="p-4 space-y-3 border-b-2 border-slate-300">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-slate-600" />
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Config</h4>
        </div>
        
        <div>
          <label htmlFor="clientId" className="block text-xs font-semibold text-slate-700 mb-2">
            Client ID
          </label>
          <input
            type="text"
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full p-2 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs"
            placeholder="Enter client ID"
          />
        </div>
        
        <div>
          <label htmlFor="workflowName" className="block text-xs font-semibold text-slate-700 mb-2">
            Workflow Name
          </label>
          <input
            type="text"
            id="workflowName"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)} 
            className="w-full p-2 border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs"
            placeholder="Enter workflow name"
          />
        </div>
        
        {currentWorkflowName && (
          <div className="p-2 bg-blue-50 border-2 border-blue-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <div className="text-xs">
                <div className="font-medium text-blue-900">Editing</div>
                <div className="text-blue-700 truncate">{currentWorkflowName}</div>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full flex items-center justify-center gap-2 p-2 border-2 font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-xs ${
            isModified 
              ? 'bg-amber-500 border-amber-600 hover:bg-amber-600 text-white' 
              : 'bg-blue-600 border-blue-700 hover:bg-blue-700 text-white'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3 h-3" />
              {isModified ? 'Save Changes' : 'Save Workflow'}
            </>
          )}
        </button>
      </div>
      
      {/* JSON Preview */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Preview</h4>
        <div className="bg-slate-900 border-2 border-slate-300 overflow-hidden">
          <div className="p-2 bg-slate-800 border-b-2 border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500"></div>
              <div className="w-2 h-2 bg-yellow-500"></div>
              <div className="w-2 h-2 bg-green-500"></div>
              <span className="ml-2 text-xs text-slate-400 font-mono">workflow.json</span>
            </div>
          </div>
          <pre className="text-xs text-green-400 p-3 overflow-auto max-h-64 font-mono leading-relaxed">
            {JSON.stringify(workflowData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;