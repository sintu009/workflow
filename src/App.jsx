import React, { useState, useCallback, useRef } from 'react';
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

  // Helper: Convert workflow JSON to nodes and edges for React Flow
  const loadWorkflowFromJson = useCallback((workflowJson) => {
    if (!workflowJson) return;
    // Example assumes workflowJson has 'nodes' and 'edges' arrays in correct format
    // You may need to adapt this if your JSON structure is different
    if (workflowJson.nodes && workflowJson.edges) {
      setNodes(workflowJson.nodes);
      setEdges(workflowJson.edges);
    } else {
      // Fallback: try to map a simple structure
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    const edgeType = sourceNode?.type === 'gateway' ? 'condition' : 'default';
    
    const newEdge = {
      ...params,
      id: `edge_${params.source}_${params.target}`,
      type: edgeType,
      data: edgeType === 'condition' ? { condition: null } : undefined,
    };
    
    setEdges((eds) => addEdge(newEdge, eds));
  }, [nodes, setEdges]);

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
    },
    [reactFlowInstance, setNodes]
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
  }, [setNodes]);

  const onClosePropertiesPanel = useCallback(() => {
    setShowPropertiesPanel(false);
    setSelectedNode(null);
  }, []);

  const onEdgeUpdate = useCallback((edgeId, condition) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, condition } }
          : edge
      )
    );
  }, [setEdges]);

  // Handler for workflow selection from NodePalette
  const handleWorkflowSelect = (workflowJson) => {
    setSelectedWorkflowJson(workflowJson);
    loadWorkflowFromJson(workflowJson);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <NodePalette onDragStart={onDragStart} onWorkflowSelect={handleWorkflowSelect} />
      
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={{
            condition: (props) => <ConditionEdge {...props} onEdgeUpdate={onEdgeUpdate} />,
          }}
          className="bg-gray-50"
          connectionLineType="smoothstep"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { strokeWidth: 2, stroke: '#6b7280' },
          }}
          fitView
        >
          <Controls className="bg-white border border-gray-200" />
          <MiniMap 
            className="bg-white border border-gray-200"
            nodeColor={(node) => {
              switch (node.type) {
                case 'task': return '#3b82f6';
                case 'gateway': return '#f97316';
                case 'event': return '#10b981';
                default: return '#6b7280';
              }
            }}
          />
          <Background color="#f3f4f6" gap={20} />
        </ReactFlow>
      </div>

      {showPropertiesPanel && (
        <PropertiesPanel
          selectedNode={selectedNode}
          onNodeUpdate={onNodeUpdate}
          onClose={onClosePropertiesPanel}
        />
      )} 

      <JsonViewer nodes={nodes} edges={edges} />
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Show login page if user is not authenticated
  if (!user?.isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <ReactFlowProvider>
      <div className="h-screen">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Workflow Builder</h1>
            <p className="text-sm text-gray-600">Drag nodes from the palette to create your workflow</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>
        <WorkflowBuilder />
      </div>
    </ReactFlowProvider>
  );
}

export default App;