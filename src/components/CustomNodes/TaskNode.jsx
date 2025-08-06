import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';

const TaskNode = ({ data, selected }) => {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-blue-50 border-2 min-w-[150px] ${
      selected ? 'border-blue-500' : 'border-blue-200'
    } hover:border-blue-400 transition-colors`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
        style={{ background: '#3b82f6' }}
      />
      
      <div className="flex items-center gap-2">
        <Square className="w-4 h-4 text-blue-600" />
        <div className="text-sm font-medium text-blue-800">
          {data.selectedTask?.name || data.label || 'Task'}
        </div>
      </div>
      
      {data.selectedTask && (
        <div className="text-xs text-blue-600 mt-1">
          {data.selectedTask.type}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
        style={{ background: '#3b82f6' }}
      />
    </div>
  );
};

export default TaskNode;