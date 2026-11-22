import React, { useState } from 'react';
import { GitFork, LineChart } from 'lucide-react';
import FlowCanvas from './components/canvas/FlowCanvas';

export default function App() {
  const [activeTab, setActiveTab] = useState('builder');
  // Member 4 will populate this Set via Socket.io 'edge:active' events
  const [activeEdgeIds] = useState(new Set());

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* Navigation Bar */}
      <nav className="h-10 bg-slate-950 border-b border-slate-800 px-4 flex items-center gap-2 text-xs">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition ${
            activeTab === 'builder'
              ? 'bg-teal-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <GitFork size={14} />
          Visual Rule Builder
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition ${
            activeTab === 'telemetry'
              ? 'bg-teal-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LineChart size={14} />
          Live Telemetry & Alerts
        </button>
      </nav>

      {/* Active View */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'builder' ? (
          <FlowCanvas activeEdgeIds={activeEdgeIds} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
            <LineChart size={36} className="text-teal-500" />
            <h2 className="text-lg font-semibold text-slate-200">
              Live Telemetry Dashboard
            </h2>
            <p className="text-sm">
              Ready for Member 4&apos;s Recharts &amp; Socket.io telemetry stream integration.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}