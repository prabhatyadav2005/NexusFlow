import React from 'react';
import { Handle, Position } from 'reactflow';
import { Activity } from 'lucide-react';

export default function MathNode({ data, selected }) {
  return (
    <div className={`custom-node math-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="in" className="port-in" />
      <div className="node-header">
        <Activity size={16} />
        <span>{data.operation === 'threshold' ? 'Condition Rule' : 'Math Filter'}</span>
      </div>
      <div className="node-body">
        {data.operation === 'movingAverage' ? (
          <p>Moving Avg ({data.windowSize || 5} samples)</p>
        ) : (
          <p>If Value {data.operator || '>'} {data.threshold ?? 80}</p>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="out" className="port-out" />
    </div>
  );
}