import React from 'react';
import { Handle, Position } from 'reactflow';
import { Cpu } from 'lucide-react';

export default function SensorNode({ data, selected }) {
  return (
    <div className={`custom-node sensor-node ${selected ? 'selected' : ''}`}>
      <div className="node-header">
        <Cpu size={16} />
        <span>Data Source</span>
      </div>
      <div className="node-body">
        <p><strong>Sensor:</strong> {data.sensorId || 'Unassigned'}</p>
        <p><strong>Metric:</strong> {data.metric || 'temperature'}</p>
      </div>
      <Handle type="source" position={Position.Right} id="out" className="port-out" />
    </div>
  );
}