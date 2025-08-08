import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getBezierPath } from '@xyflow/react';
import { Plus, Settings, X, Check } from 'lucide-react';
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
        className={`react-flow__edge-path transition-all duration-200 ${selected ? 'stroke-2' : 'stroke-1'}`}
        d={edgePath}
        stroke={selectedCondition ? '#f97316' : '#64748b'}
        strokeWidth={selected ? 3 : 2}
        fill="none"
      />

      {!selectedCondition && (
        <g style={{ overflow: 'visible' }}>
          <circle
            cx={labelX}
            cy={labelY}
            r="12"
            className="fill-orange-500 cursor-pointer hover:fill-orange-600 transition-colors duration-200 drop-shadow-md"
            onClick={handleAddCondition}
            style={{ pointerEvents: 'all' }}
          />
          <foreignObject x={labelX - 5} y={labelY - 5} width="10" height="10">
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
            className="fill-orange-500 cursor-pointer hover:fill-orange-600 transition-colors duration-200 drop-shadow-md"
            onClick={handleAddCondition}
            style={{ pointerEvents: 'all' }}
          />
          <text
            x={labelX}
            y={labelY + 5}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            className="pointer-events-none font-semibold"
          >
            {selectedCondition.conditionName || 'Condition'}
          </text>
        </g>
      )}

      {showConditionModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowConditionModal(false)}>
          <div className="bg-black/50 absolute inset-0" onClick={() => setShowConditionModal(false)} />
          <div
            className="bg-white border-2 border-slate-300 shadow-2xl p-4 relative max-w-xs w-full"
            style={{ zIndex: 9999 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="condition-modal-title"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-orange-600 border-2 border-orange-700 flex items-center justify-center">
                <Settings className="w-3 h-3 text-white" />
              </div>
              <h4 id="condition-modal-title" className="text-sm font-bold text-slate-800">
                Configure Condition
              </h4>
            </div>
            
            {error && (
              <div className="mb-3 p-2 bg-red-50 border-2 border-red-300">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Condition
                </label>
                <select
                  value={selectedCondition?.conditionKey || ''}
                  onChange={(e) => {
                    const condition = conditions.find((c) => c.conditionKey === e.target.value);
                    setSelectedCondition(condition || null);
                  }}
                  className="w-full px-2 py-2 text-xs border-2 border-slate-300 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                >
                  <option value="">Choose a condition...</option>
                  {conditions.map((condition) => (
                    <option key={condition.conditionKey || Math.random()} value={condition.conditionKey}>
                      {condition.conditionName || 'Unnamed Condition'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCondition && (
                <div className="p-2 bg-slate-50 border-2 border-slate-300">
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1">Expression</div>
                      <div className="text-xs text-slate-600 font-mono bg-white p-1 border-2 border-slate-300">
                        {selectedCondition.conditionExpression || 'No expression defined'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1">Description</div>
                      <div className="text-xs text-slate-600">
                        {selectedCondition.description || 'No description available'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  onClick={handleSaveCondition}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-orange-600 text-white border-2 border-orange-700 hover:bg-orange-700 transition-colors duration-200 font-semibold text-xs"
                >
                  <Check className="w-3 h-3" />
                  Apply
                </button>
                {selectedCondition && (
                  <button
                    onClick={handleRemoveCondition}
                    className="px-2 py-2 bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 transition-colors duration-200 font-semibold text-xs"
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={() => setShowConditionModal(false)}
                  className="px-2 py-2 bg-slate-200 text-slate-700 border-2 border-slate-300 hover:bg-slate-300 transition-colors duration-200 font-semibold text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ConditionEdge;