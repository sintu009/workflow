import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Diamond, GitBranch, Merge, Split } from 'lucide-react';

const GatewayNode = ({ data, selected }) => {
  const getGatewayIcon = () => {
    if (data.selectedGateway?.type === 'exclusive') return <GitBranch className="w-4 h-4 text-white" />;
    if (data.selectedGateway?.type === 'parallel') return <Split className="w-4 h-4 text-white" />;
    if (data.selectedGateway?.type === 'inclusive') return <Merge className="w-4 h-4 text-white" />;
    return <Diamond className="w-4 h-4 text-white" />;
  };

  return (
    <div className={`group relative transition-all duration-200 ${
      selected ? 'scale-110' : 'hover:scale-105'
    }`}>
      <div className={`w-24 h-24 transform rotate-45 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 border-4 transition-all duration-200 ${
        selected 
          ? 'border-orange-500 shadow-xl' 
          : 'border-orange-200 hover:border-orange-400 hover:shadow-xl'
      } flex items-center justify-center relative`}>
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316', 
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        
        <div className="transform -rotate-45 flex flex-col items-center">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow mb-1">
            {getGatewayIcon()}
          </div>
          {data.selectedGateway && (
            <div className="text-xs text-orange-800 font-bold text-center whitespace-nowrap max-w-20 truncate">
              {data.selectedGateway.name}
            </div>
          )}
          {data.selectedGateway?.type && (
            <div className="text-xs text-orange-600 font-medium">
              {data.selectedGateway.type}
            </div>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        <Handle
          type="source"
          position={Position.Left}
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316',
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute shadow-md transition-all duration-200 hover:scale-125"
          style={{ 
            background: '#f97316',
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        />
      </div>
    </div>
  );
};

export default GatewayNode;