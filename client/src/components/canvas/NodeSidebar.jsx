import React from 'react';

const NODE_TEMPLATES = [
  { type: 'sensorNode', label: 'Turbine / IoT Sensor', defaultData: { sensorId: 'turbine-01', metric: 'temperature' } },
  { type: 'mathNode', label: 'Moving Average Filter', defaultData: { operation: 'movingAverage', windowSize: 5 } },
  { type: 'mathNode', label: 'Threshold Condition', defaultData: { operation: 'threshold', operator: '>', threshold: 80 } },
  { type: 'actionNode', label: 'SMS / Webhook Alert', defaultData: { actionType: 'sms', target: '+919999999999' } },
];

export default function NodeSidebar() {
  const onDragStart = (event, template) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 bg-slate-900 text-white p-4 border-r border-slate-800">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
        Node Library
      </h3>
      <div className="space-y-3">
        {NODE_TEMPLATES.map((item, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded cursor-grab text-sm font-medium"
          >
            {item.label}
          </div>
        ))}
      </div>
    </aside>
  );
}