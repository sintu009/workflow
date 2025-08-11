import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Diamond, GitBranch, Merge, Split } from 'lucide-react';

const GatewayNode = ({ data, selected }) => {
  const getGatewayIcon = () => {
    if (data.selectedGateway?.type === 'exclusive') return <GitBranch className="w-3 h-3 text-white" />;
    if (data.selectedGateway?.type === 'parallel') return <Split className="w-3 h-3 text-white" />;
    if (data.selectedGateway?.type === 'inclusive') return <Merge className="w-3 h-3 text-white" />;
    return <Diamond className="w-3 h-3 text-white" />;
  };

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-110' : 'hover:scale-105'
    }`}>
      <div className={`w-16 h-16 transform rotate-45 shadow-lg bg-orange-50 border-2 transition-all duration-200 ${
        selected 
          ? 'border-orange-500 shadow-xl' 
          : 'border-orange-300 hover:border-orange-400 hover:shadow-xl'
      } flex items-center justify-center relative`}>
        
        {/* Top Handles - both input and output */}
        <Handle
          type="target"
          position={Position.Top}
          id="top-target"
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316', 
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Top}
          id="top-source"
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316', 
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          isConnectable={true}
        />
        
        {/* Left Handles - both input and output */}
        <Handle
          type="target"
          position={Position.Left}
          id="left-target"
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316',
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Left}
          id="left-source"
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316',
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          isConnectable={true}
        />
        
        {/* Right Handles - both input and output */}
        <Handle
          type="target"
          position={Position.Right}
          id="right-target"
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316',
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right-source"
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316',
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
          isConnectable={true}
        />
        
        {/* Bottom Handles - both input and output */}
        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom-target"
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom-source"
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          isConnectable={true}
        />
        
        <div className="transform -rotate-45 flex flex-col items-center">
          <div className="w-6 h-6 bg-orange-600 border border-orange-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            {getGatewayIcon()}
          </div>
          {data.selectedGateway && (
            <div className="text-xs text-orange-800 font-bold text-center whitespace-nowrap max-w-12 truncate mt-1">
              {data.selectedGateway.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GatewayNode;