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
            r="14"
            className="fill-orange-500 cursor-pointer hover:fill-orange-600 transition-colors duration-200 drop-shadow-md"
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
            x={labelX - 60}
            y={labelY - 14}
            width="120"
            height="28"
            rx="14"
            className="fill-orange-500 cursor-pointer hover:fill-orange-600 transition-colors duration-200 drop-shadow-md"
            onClick={handleAddCondition}
            style={{ pointerEvents: 'all' }}
          />
          <text
            x={labelX}
            y={labelY + 5}
            textAnchor="middle"
            fill="white"
            fontSize="12"
            className="pointer-events-none font-semibold"
          >
            {selectedCondition.conditionName || 'Condition'}
          </text>
        </g>
      )}

      {showConditionModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-black/50 backdrop-blur-sm absolute inset-0" onClick={() => setShowConditionModal(false)} />
          <div
            className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-2xl p-6 relative max-w-md w-full"
            style={{ zIndex: 9999 }}
            role="dialog"
            aria-labelledby="condition-modal-title"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <h4 id="condition-modal-title" className="text-lg font-bold text-slate-800">
                Configure Condition
              </h4>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Condition
                </label>
                <select
                  value={selectedCondition?.conditionKey || ''}
                  onChange={(e) => {
                    const condition = conditions.find((c) => c.conditionKey === e.target.value);
                    setSelectedCondition(condition || null);
                  }}
                  className="w-full px-4 py-3 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
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
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-1">Expression</div>
                      <div className="text-sm text-slate-600 font-mono bg-white p-2 rounded border">
                        {selectedCondition.conditionExpression || 'No expression defined'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700 mb-1">Description</div>
                      <div className="text-sm text-slate-600">
                        {selectedCondition.description || 'No description available'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveCondition}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 font-semibold"
                >
                  <Check className="w-4 h-4" />
                  Apply
                </button>
                {selectedCondition && (
                  <button
                    onClick={handleRemoveCondition}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
                  >
                    Remove
                  </button>
                )}
                <button
                  onClick={() => setShowConditionModal(false)}
                  className="px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors duration-200 font-semibold"
                >
                  <X className="w-4 h-4" />
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