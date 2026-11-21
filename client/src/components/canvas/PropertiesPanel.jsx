import React from 'react';

export default function PropertiesPanel({ selectedNode, updateNodeData }) {
  if (!selectedNode) {
    return (
      <aside className="w-72 bg-slate-900 text-slate-400 p-4 border-l border-slate-800 text-sm">
        Click any node on the canvas to configure its parameters.
      </aside>
    );
  }

  const { id, type, data } = selectedNode;

  const handleChange = (key, value) => {
    updateNodeData(id, { ...data, [key]: value });
  };

  return (
    <aside className="w-72 bg-slate-900 text-white p-4 border-l border-slate-800 space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400">
        Configure Node ({id})
      </h3>

      {type === 'sensorNode' && (
        <>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Sensor ID</label>
            <input
              type="text"
              value={data.sensorId || ''}
              onChange={(e) => handleChange('sensorId', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Metric</label>
            <select
              value={data.metric || 'temperature'}
              onChange={(e) => handleChange('metric', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
            >
              <option value="temperature">Temperature (°C)</option>
              <option value="vibration">Vibration (Hz)</option>
              <option value="pressure">Pressure (PSI)</option>
            </select>
          </div>
        </>
      )}

      {type === 'mathNode' && data.operation === 'movingAverage' && (
        <div>
          <label className="block text-xs text-slate-400 mb-1">Window Size (N packets)</label>
          <input
            type="number"
            min="2"
            max="100"
            value={data.windowSize || 5}
            onChange={(e) => handleChange('windowSize', Number(e.target.value))}
            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
          />
        </div>
      )}

      {type === 'mathNode' && data.operation === 'threshold' && (
        <>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Operator</label>
            <select
              value={data.operator || '>'}
              onChange={(e) => handleChange('operator', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
            >
              <option value=">">Greater Than (&gt;)</option>
              <option value="<">Less Than (&lt;)</option>
              <option value=">=">Greater or Equal (&gt;=)</option>
              <option value="==">Equal (==)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Threshold Value</label>
            <input
              type="number"
              value={data.threshold ?? 80}
              onChange={(e) => handleChange('threshold', Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
            />
          </div>
        </>
      )}

      {type === 'actionNode' && (
        <>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Action Channel</label>
            <select
              value={data.actionType || 'sms'}
              onChange={(e) => handleChange('actionType', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
            >
              <option value="sms">SMS Alert</option>
              <option value="webhook">HTTP Webhook POST</option>
              <option value="dashboard">Dashboard Banner Only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              {data.actionType === 'webhook' ? 'Webhook URL' : 'Phone Number'}
            </label>
            <input
              type="text"
              value={data.target || ''}
              onChange={(e) => handleChange('target', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm"
            />
          </div>
        </>
      )}
    </aside>
  );
}