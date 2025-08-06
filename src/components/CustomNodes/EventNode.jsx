import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Circle } from 'lucide-react';

const EventNode = ({ data, selected }) => {
  return (
    <div className={`w-20 h-20 rounded-full shadow-lg bg-green-50 border-2 ${
      selected ? 'border-green-500' : 'border-green-200'
    } hover:border-green-400 transition-colors flex items-center justify-center relative`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white absolute"
        style={{ 
          background: '#10b981',
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      />
      
      <div className="flex flex-col items-center">
        <Circle className="w-4 h-4 text-green-600" />
        <div className="text-xs text-green-600 mt-1 text-center">
          {data.label || 'Event'}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-green-500 !border-2 !border-white absolute"
        style={{ 
          background: '#10b981',
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      />
    </div>
  );
};

export default EventNode;