import React, { useState, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import axios from 'axios';

import SensorNode from './nodes/SensorNode';
import MathNode from './nodes/MathNode';
import ActionNode from './nodes/ActionNode';
import GlowEdge from './edges/GlowEdge';
import NodeSidebar from './NodeSidebar';
import PropertiesPanel from './PropertiesPanel';
import { serializeAndValidateGraph } from '../../utils/graphSerializer';
import '../../styles/canvas.css';

const nodeTypes = {
  sensorNode: SensorNode,
  mathNode: MathNode,
  actionNode: ActionNode,
};

const edgeTypes = {
  glowEdge: GlowEdge,
};

let idCounter = 1;
const getNextId = () => `node_${idCounter++}`;

export default function FlowCanvas({ activeEdgeIds = new Set() }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [workflowName, setWorkflowName] = useState('Turbine Overheat Rule');
  const [statusMsg, setStatusMsg] = useState('');

  const isValidConnection = useCallback((connection) => {
    return connection.source !== connection.target;
  }, []);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: `edge_${params.source}_to_${params.target}`,
            type: 'glowEdge',
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData || !reactFlowInstance) return;

      const template = JSON.parse(rawData);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getNextId(),
        type: template.type,
        position,
        data: { ...template.defaultData },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const updateNodeData = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === nodeId ? { ...node, data: newData } : node))
    );
  };

  const renderedEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      data: { ...edge.data, isGlowing: activeEdgeIds.has(edge.id) },
    }));
  }, [edges, activeEdgeIds]);

  const handleDeployPipeline = async () => {
    try {
      setStatusMsg('Validating & deploying...');
      const payload = serializeAndValidateGraph(workflowName, nodes, edges);
      console.log('Serialized Graph JSON:', JSON.stringify(payload, null, 2));
      const res = await axios.post('/api/workflows', payload);
      setStatusMsg(`Deployed! Workflow ID: ${res.data._id || res.data.workflowId}`);
    } catch (err) {
      setStatusMsg(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <span className="font-bold text-teal-400 tracking-wide">NEXUSFLOW</span>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          {statusMsg && <span className="text-xs text-amber-300">{statusMsg}</span>}
          <button
            onClick={handleDeployPipeline}
            className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-1.5 rounded shadow"
          >
            Deploy Live Rule
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <NodeSidebar />

        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={renderedEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              onPaneClick={() => setSelectedNodeId(null)}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
            >
              <Background color="#334155" gap={18} />
              <Controls />
              <MiniMap nodeColor="#0f766e" maskColor="rgba(15, 23, 42, 0.7)" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        <PropertiesPanel selectedNode={selectedNode} updateNodeData={updateNodeData} />
      </div>
    </div>
  );
}