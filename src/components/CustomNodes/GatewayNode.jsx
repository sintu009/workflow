import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Diamond } from 'lucide-react';

const GatewayNode = ({ data, selected }) => {
  return (
    <div className={`w-20 h-20 transform rotate-45 shadow-lg bg-orange-50 border-2 ${
      selected ? 'border-orange-500' : 'border-orange-200'
    } hover:border-orange-400 transition-colors flex items-center justify-center relative`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute"
        style={{ 
          background: '#f97316', 
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      />
      
      <div className="transform -rotate-45 flex flex-col items-center">
        <Diamond className="w-4 h-4 text-orange-600" />
        {data.selectedGateway && (
          <div className="text-xs text-orange-600 mt-1 text-center whitespace-nowrap max-w-16 truncate">
            {data.selectedGateway.name}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute"
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
        className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute"
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
        className="w-3 h-3 !bg-orange-500 !border-2 !border-white absolute"
        style={{ 
          background: '#f97316',
          right: '-6px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />
    </div>
  );
};

export default GatewayNode;