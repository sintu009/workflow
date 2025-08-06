import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getBezierPath } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { api } from '../services/api';

const ConditionEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  onEdgeUpdate,
}) => {
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState(data?.condition || null);
  const [error, setError] = useState(null);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  useEffect(() => {
    fetchConditions();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowConditionModal(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchConditions = async () => {
    try {
      const conditionsData = await api.getAllConditions();
      setConditions(conditionsData || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching conditions:', error);
      setError('Failed to load conditions. Please try again.');
    }
  };

  const handleAddCondition = (e) => {
    e.stopPropagation();
    setShowConditionModal(true);
  };

  const handleSaveCondition = () => {
    if (onEdgeUpdate) {
      onEdgeUpdate(id, selectedCondition);
    }
    setShowConditionModal(false);
  };

  const handleRemoveCondition = () => {
    setSelectedCondition(null);
    if (onEdgeUpdate) {
      onEdgeUpdate(id, null);
    }
    setShowConditionModal(false);
  };

  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path ${selected ? 'stroke-2' : 'stroke-1'}`}
        d={edgePath}
        stroke={selectedCondition ? '#f97316' : '#6b7280'}
        strokeWidth={selected ? 3 : 2}
      />

      {!selectedCondition && (
        <g style={{ overflow: 'visible' }}>
          <circle
            cx={labelX}
            cy={labelY}
            r="12"
            className="fill-orange-500 cursor-pointer hover:fill-orange-600"
            onClick={handleAddCondition}
            style={{ pointerEvents: 'all' }}
          />
          <foreignObject x={labelX - 6} y={labelY - 6} width="12" height="12">
            <Plus className="w-3 h-3 text-white pointer-events-none" />
          </foreignObject>
        </g>
      )}

      {selectedCondition && (
        <g style={{ overflow: 'visible' }}>
          <rect
            x={labelX - 50}
            y={labelY - 12}
            width="100"
            height="24"
            rx="12"
            className="fill-orange-500 cursor-pointer hover:fill-orange-600"
            onClick={handleAddCondition}
            style={{ pointerEvents: 'all' }}
          />
          <text
            x={labelX}
            y={labelY + 4}
            textAnchor="middle"
            fill="white"
            fontSize="11"
            className="pointer-events-none font-medium"
          >
            {selectedCondition.conditionName || 'Unnamed Condition'}
          </text>
        </g>
      )}

      {showConditionModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-black bg-opacity-30 absolute inset-0" onClick={() => setShowConditionModal(false)} />
          <div
            className="bg-white border border-gray-300 rounded-lg shadow-xl p-4 relative modal-container"
            style={{ zIndex: 9999, minWidth: 320, maxWidth: 400 }}
            role="dialog"
            aria-labelledby="condition-modal-title"
          >
            <h4 id="condition-modal-title" className="text-sm font-semibold mb-3 text-gray-800">
              Select Condition
            </h4>
            {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
            <select
              value={selectedCondition?.conditionKey || ''}
              onChange={(e) => {
                const condition = conditions.find((c) => c.conditionKey === e.target.value);
                setSelectedCondition(condition || null);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select condition...</option>
              {conditions.map((condition) => (
                <option key={condition.conditionKey || Math.random()} value={condition.conditionKey}>
                  {condition.conditionName || 'Unnamed Condition'}
                </option>
              ))}
            </select>

            {selectedCondition && (
              <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                <div className="font-medium text-gray-700">Expression:</div>
                <div className="text-gray-600 font-mono">
                  {selectedCondition.conditionExpression || 'No expression'}
                </div>
                <div className="font-medium text-gray-700 mt-1">Description:</div>
                <div className="text-gray-600">{selectedCondition.description || 'No description'}</div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSaveCondition}
                className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              >
                Save
              </button>
              {selectedCondition && (
                <button
                  onClick={handleRemoveCondition}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => setShowConditionModal(false)}
                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ConditionEdge;