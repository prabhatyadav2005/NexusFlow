import React from 'react';
import { Radio, Code2, X } from 'lucide-react';

export default function RulePreviewDrawer({
  isOpen,
  onClose,
  compiledPreview,
  autoStream,
  onToggleAutoStream,
}) {
  if (!isOpen) return null;

  return (
    <div className="h-56 bg-slate-900 border-t border-slate-800 px-4 py-3 text-white flex flex-col">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
          <Code2 size={15} />
          <span>Compiled Rule &amp; Stream Inspector</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAutoStream}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded border transition ${
              autoStream
                ? 'bg-teal-950 border-teal-500 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Radio size={13} className={autoStream ? 'animate-pulse' : ''} />
            {autoStream ? 'Auto-Stream: ON' : 'Auto-Stream: OFF'}
          </button>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Close Inspector"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2.5 overflow-hidden text-xs">
        {/* Left: Human-readable execution hops */}
        <div className="overflow-y-auto pr-2 space-y-1.5">
          <p className="text-slate-400 font-medium">
            Execution Hops ({compiledPreview.pipelineSteps.length})
          </p>
          {compiledPreview.pipelineSteps.length === 0 ? (
            <p className="text-slate-500 italic">
              Connect nodes on the canvas to inspect signal flow hops.
            </p>
          ) : (
            compiledPreview.pipelineSteps.map((hop) => (
              <div
                key={hop.edgeId}
                className="bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 flex items-center justify-between gap-2"
              >
                <span className="text-teal-300 truncate">{hop.from.summary}</span>
                <span className="text-slate-500">→</span>
                <span className="text-sky-300 truncate">{hop.to.summary}</span>
              </div>
            ))
          )}
        </div>

        {/* Right: Raw JSON preview */}
        <div className="overflow-y-auto bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-[11px] text-slate-300">
          <pre>{JSON.stringify(compiledPreview, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}