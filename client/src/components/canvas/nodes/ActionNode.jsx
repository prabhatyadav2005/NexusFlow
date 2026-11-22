import React from 'react';
import { Handle, Position } from 'reactflow';
import { BellRing } from 'lucide-react';

export default function ActionNode({ data, selected }) {
  return (
    <div className={`custom-node action-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="in" className="port-in" />
      <div className="node-header">
        <BellRing size={16} />
        <span>Action Trigger</span>
      </div>
      <div className="node-body">
        <p><strong>Type:</strong> {(data.actionType || 'sms').toUpperCase()}</p>
        <p className="truncate">{data.target || '+91-9876543210'}</p>
      </div>
    </div>
  );
}