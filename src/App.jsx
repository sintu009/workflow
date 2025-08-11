import React, { useState, useCallback, useRef, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import NodePalette from './components/NodePalette';
import JsonViewer from './components/JsonViewer';
import PropertiesPanel from './components/PropertiesPanel';
import TaskNode from './components/CustomNodes/TaskNode';
import GatewayNode from './components/CustomNodes/GatewayNode';
import EventNode from './components/CustomNodes/EventNode';
import ConditionEdge from './components/ConditionEdge';
import { User, LogOut, Workflow, Save, Undo, Settings } from 'lucide-react';

const nodeTypes = {
  task: TaskNode,
  gateway: GatewayNode,
  event: EventNode,
};

const edgeTypes = {
  condition: ConditionEdge,
};

let nodeId = 0;
const getId = () => `node_${nodeId++}`;

const initialNodes = [];
const initialEdges = [];

function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedWorkflowJson, setSelectedWorkflowJson] = useState(null);
  const [currentWorkflowName, setCurrentWorkflowName] = useState('');
  const [isWorkflowModified, setIsWorkflowModified] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Track modifications to the workflow
  const markAsModified = useCallback(() => {
    setIsWorkflowModified(true);
  }, []);

  // Save state to history for undo functionality
  const saveToHistory = useCallback((nodes, edges) => {
    const newState = { nodes: [...nodes], edges: [...edges] };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      // Keep only last 50 states to prevent memory issues
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(prev => prev - 1);
      markAsModified();
    }
  }, [history, historyIndex, setNodes, setEdges, markAsModified]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo]);

  // Listen for delete node events from PropertiesPanel
  useEffect(() => {
    const handleDeleteNode = (event) => {
      const nodeId = event.detail;
      // Save current state before deletion
      saveToHistory(nodes, edges);
      
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      markAsModified();
    };

    window.addEventListener('deleteNode', handleDeleteNode);
    return () => {
      window.removeEventListener('deleteNode', handleDeleteNode);
    };
  }, [nodes, edges, saveToHistory, setNodes, setEdges, markAsModified]);

  // Helper: Convert workflow JSON to nodes and edges for React Flow
  const loadWorkflowFromJson = useCallback((workflowJson) => {
    if (!workflowJson) {
      setNodes([]);
      setEdges([]);
      setCurrentWorkflowName('');
      setIsWorkflowModified(false);
      return;
    }

    // Handle different JSON structures and ensure proper node ID generation
    let loadedNodes = [];
    let loadedEdges = [];
    let workflowName = '';

    if (workflowJson.nodes && workflowJson.edges) {
      // Direct nodes/edges format
      loadedNodes = workflowJson.nodes.map(node => ({
        ...node,
        id: node.id || getId(), // Ensure each node has an ID
      }));
      loadedEdges = workflowJson.edges.map(edge => ({
        ...edge,
        id: edge.id || `edge_${edge.source}_${edge.target}`, // Ensure each edge has an ID
      }));
      workflowName = workflowJson.workflowName || '';
    } else if (workflowJson.clientId && workflowJson.workflowName) {
      // Full workflow format with clientId
      loadedNodes = (workflowJson.nodes || []).map(node => ({
        ...node,
        id: node.id || getId(),
      }));
      loadedEdges = (workflowJson.edges || []).map(edge => ({
        ...edge,
        id: edge.id || `edge_${edge.source}_${edge.target}`,
      }));
      workflowName = workflowJson.workflowName;
    }

    // Update node counter to prevent ID conflicts
    const maxNodeId = loadedNodes.reduce((max, node) => {
      const nodeNum = parseInt(node.id.replace('node_', ''));
      return isNaN(nodeNum) ? max : Math.max(max, nodeNum);
    }, nodeId);
    nodeId = maxNodeId + 1;

    setNodes(loadedNodes);
    setEdges(loadedEdges);
    setCurrentWorkflowName(workflowName);
    setIsWorkflowModified(false);
    
    // Reset history when loading new workflow
    const initialState = { nodes: loadedNodes, edges: loadedEdges };
    setHistory([initialState]);
    setHistoryIndex(0);
  }, [setNodes, setEdges]);

  // Enhanced onNodesChange to track modifications
  const handleNodesChange = useCallback((changes) => {
    // Save state before changes for undo
    if (changes.some(change => change.type === 'remove')) {
      saveToHistory(nodes, edges);
    }
    onNodesChange(changes);
    markAsModified();
  }, [onNodesChange, markAsModified, nodes, edges, saveToHistory]);

  // Enhanced onEdgesChange to track modifications
  const handleEdgesChange = useCallback((changes) => {
    // Save state before changes for undo
    if (changes.some(change => change.type === 'remove')) {
      saveToHistory(nodes, edges);
    }
    onEdgesChange(changes);
    markAsModified();
  }, [onEdgesChange, markAsModified, nodes, edges, saveToHistory]);

  const onConnect = useCallback((params) => {
    // Save state before adding new edge
    saveToHistory(nodes, edges);
    
    const sourceNode = nodes.find(node => node.id === params.source);
    const edgeType = sourceNode?.type === 'gateway' ? 'condition' : 'default';
    
    const newEdge = {
      ...params,
      id: `edge_${params.source}_${params.target}`,
      type: edgeType,
      data: edgeType === 'condition' ? { condition: null } : undefined,
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
    markAsModified();
  }, [nodes, setEdges, edges, saveToHistory, markAsModified]);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      // Save state before adding new node
      saveToHistory(nodes, edges);

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      markAsModified();
    },
    [reactFlowInstance, setNodes, markAsModified, nodes, edges, saveToHistory]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowPropertiesPanel(true);
  }, []);

  const onNodeUpdate = useCallback((nodeId, data) => {
    // Save state before updating node
    saveToHistory(nodes, edges);
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                ...data,
                label: data.selectedTask?.name || data.selectedGateway?.name || node.data.label
              }
            }
          : node
      )
    );
    setShowPropertiesPanel(false);
    markAsModified();
  }, [setNodes, nodes, edges, saveToHistory, markAsModified]);

  const onClosePropertiesPanel = useCallback(() => {
    setShowPropertiesPanel(false);
    setSelectedNode(null);
  }, []);

  const onEdgeUpdate = useCallback((edgeId, condition) => {
    // Save state before updating edge
    saveToHistory(nodes, edges);
    
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, condition } }
          : edge
      )
    );
    markAsModified();
  }, [setEdges, nodes, edges, saveToHistory, markAsModified]);

  // Handler for workflow selection from NodePalette
  const handleWorkflowSelect = (workflowJson) => {
    setSelectedWorkflowJson(workflowJson);
    loadWorkflowFromJson(workflowJson);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-64">
        <NodePalette onDragStart={onDragStart} onWorkflowSelect={handleWorkflowSelect} />
      </div>
      
      <div className="flex-1 relative max-w-2xll" ref={reactFlowWrapper}>
        {/* Enhanced Workflow Status Bar */}
        {currentWorkflowName && (
          <div className="absolute top-4 left-4 z-10 bg-white px-3 py-2 shadow-lg border-2 border-slate-300">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-slate-700">
                  {currentWorkflowName}
                </span>
              </div>
              {isWorkflowModified && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 animate-pulse" />
                  <span className="text-xs text-amber-600 font-medium">*</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="flex items-center gap-1 px-2 py-1 bg-white text-slate-700 shadow-md border-2 border-slate-300 hover:bg-slate-50 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3 h-3" />
            <span className="text-xs font-medium">Undo</span>
          </button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={{
            condition: (props) => <ConditionEdge {...props} onEdgeUpdate={onEdgeUpdate} />,
          }}
          className="bg-gradient-to-br from-slate-50 to-slate-100"
          connectionLineType="smoothstep"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { strokeWidth: 2, stroke: '#64748b' },
          }}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls 
            className="bg-white border-2 border-slate-300 shadow-lg"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
            position="bottom-left"
          />
          <MiniMap 
            className="bg-white border-2 border-slate-300 shadow-lg !w-32 !h-24"
            nodeColor={(node) => {
              switch (node.type) {
                case 'task': return '#3b82f6';
                case 'gateway': return '#f97316';
                case 'event': return '#10b981';
                default: return '#64748b';
              }
            }}
            nodeClassName={(node) => {
              return node.type === 'event' ? 'rounded-full' : '';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          <Background 
            color="#e2e8f0" 
            gap={24} 
            size={1}
            variant="dots"
          />
        </ReactFlow>
      </div>

      {showPropertiesPanel && (
        <PropertiesPanel
          selectedNode={selectedNode}
          onNodeUpdate={onNodeUpdate}
          onClose={onClosePropertiesPanel}
        />
      )} 

      <div className="w-80">
        <JsonViewer 
          nodes={nodes} 
          edges={edges} 
          currentWorkflowName={currentWorkflowName}
          isModified={isWorkflowModified}
        />
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLogin(false);
  };

  const handleShowLogin = () => {
    setShowLogin(true);
  };

  return (
    <ReactFlowProvider>
      {showLogin && <LoginPage onLogin={handleLogin} />}
      <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Enhanced Header */}
        <header className="bg-white border-b-2 border-slate-300 shadow-md">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 border-2 border-blue-700 flex items-center justify-center shadow-md">
                  <Workflow className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Workflow Builder
                  </h1>
                  <p className="text-sm text-slate-500">Design and manage your business processes</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user?.isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-2 border-slate-300">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Welcome, {user.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border-2 border-slate-300 hover:bg-slate-200 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleShowLogin}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white border-2 border-blue-700 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Login</span>
                </button>
              )}
            </div>
          </div>
        </header>
        {user?.isAuthenticated && <WorkflowBuilder />}
      </div>
    </ReactFlowProvider>
  );
}

export default App;