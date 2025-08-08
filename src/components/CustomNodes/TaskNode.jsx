import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square, CheckCircle } from 'lucide-react';

const TaskNode = ({ data, selected }) => {
  return (
    <div className={`group px-6 py-4 shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 min-w-[180px] transition-all duration-200 ${
      selected 
        ? 'border-blue-500 shadow-xl scale-105' 
        : 'border-blue-200 hover:border-blue-400 hover:shadow-xl hover:scale-102'
    }`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white shadow-md transition-all duration-200 hover:scale-125"
        style={{ background: '#3b82f6' }}
      />
      
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
          <Square className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-blue-900 leading-tight">
            {data.selectedTask?.name || data.label || 'Task'}
          </div>
          {data.selectedTask && (
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">
                {data.selectedTask.type}
              </span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white shadow-md transition-all duration-200 hover:scale-125"
        style={{ background: '#3b82f6' }}
      />
    </div>
  );
};

export default TaskNode;