import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
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
import { Braces } from 'lucide-react';

import SensorNode from './nodes/SensorNode';
import MathNode from './nodes/MathNode';
import ActionNode from './nodes/ActionNode';
import GlowEdge from './edges/GlowEdge';
import NodeSidebar from './NodeSidebar';
import PropertiesPanel from './PropertiesPanel';
import WorkflowToolbar from './WorkflowToolbar';
import RulePreviewDrawer from './RulePreviewDrawer';
import {
  serializeAndValidateGraph,
  parseImportedGraph,
  compileRulePreview,
} from '../../utils/graphSerializer';
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
const getNextId = () => `node_${Date.now()}_${idCounter++}`;

export default function FlowCanvas({ activeEdgeIds = new Set() }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState('');
  const [workflowName, setWorkflowName] = useState('Turbine Overheat Rule');
  const [isActive, setIsActive] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [simulatedEdgeIds, setSimulatedEdgeIds] = useState(new Set());
  const [showPreviewDrawer, setShowPreviewDrawer] = useState(false);
  const [autoStream, setAutoStream] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await axios.get('/api/workflows');
      if (Array.isArray(res.data)) {
        setSavedWorkflows(res.data);
      }
    } catch {
      // Standalone frontend dev fallback
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

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

  const handleDeleteNode = (nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
    setStatusMsg(`Removed ${nodeId}`);
  };

  const handleLoadDemoPreset = () => {
    const demoNodes = [
      { id: 'node_1', type: 'sensorNode', position: { x: 60, y: 160 }, data: { sensorId: 'turbine-01', metric: 'temperature' } },
      { id: 'node_2', type: 'mathNode', position: { x: 320, y: 160 }, data: { operation: 'movingAverage', windowSize: 5 } },
      { id: 'node_3', type: 'mathNode', position: { x: 580, y: 160 }, data: { operation: 'threshold', operator: '>', threshold: 80 } },
      { id: 'node_4', type: 'actionNode', position: { x: 840, y: 160 }, data: { actionType: 'sms', target: '+919999999999' } },
    ];
    const demoEdges = [
      { id: 'edge_node_1_to_node_2', source: 'node_1', target: 'node_2', type: 'glowEdge' },
      { id: 'edge_node_2_to_node_3', source: 'node_2', target: 'node_3', type: 'glowEdge' },
      { id: 'edge_node_3_to_node_4', source: 'node_3', target: 'node_4', type: 'glowEdge' },
    ];

    setActiveWorkflowId('');
    setWorkflowName('Turbine Overheat Protection');
    setNodes(demoNodes);
    setEdges(demoEdges);
    setSelectedNodeId(null);
    setStatusMsg('Loaded Turbine Overheat demo pipeline');
  };

  const handleExportJson = () => {
    try {
      const payload = serializeAndValidateGraph(workflowName, nodes, edges);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const slug = (workflowName || 'nexusflow-rule').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.href = url;
      link.download = `${slug}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatusMsg(`Exported ${slug}.json`);
    } catch (err) {
      setStatusMsg(`Export failed: ${err.message}`);
    }
  };

  const handleImportJson = (rawText) => {
    try {
      const restored = parseImportedGraph(rawText);
      setActiveWorkflowId('');
      setWorkflowName(restored.name);
      setIsActive(restored.isActive);
      setNodes(restored.nodes);
      setEdges(restored.edges);
      setSelectedNodeId(null);
      setStatusMsg(`Imported "${restored.name}" (${restored.nodes.length} nodes)`);
    } catch (err) {
      setStatusMsg(`Import failed: ${err.message}`);
    }
  };

  const handleSelectWorkflow = (wfId) => {
    if (!wfId) {
      handleNewWorkflow();
      return;
    }
    const found = savedWorkflows.find((w) => (w._id || w.workflowId) === wfId);
    if (!found) return;

    setActiveWorkflowId(wfId);
    setWorkflowName(found.name);
    setIsActive(found.isActive ?? true);
    setNodes(found.nodes || []);
    setEdges(
      (found.edges || []).map((e) => ({
        ...e,
        type: 'glowEdge',
      }))
    );
    setSelectedNodeId(null);
    setStatusMsg(`Loaded "${found.name}"`);
  };

  const handleNewWorkflow = () => {
    setActiveWorkflowId('');
    setWorkflowName('New IoT Rule');
    setIsActive(true);
    setAutoStream(false);
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setStatusMsg('');
  };

  const handleToggleActive = async () => {
    if (!activeWorkflowId) return;
    try {
      const nextState = !isActive;
      await axios.put(`/api/workflows/${activeWorkflowId}/toggle`, { isActive: nextState });
      setIsActive(nextState);
      setStatusMsg(nextState ? 'Rule Activated' : 'Rule Paused');
      fetchWorkflows();
    } catch (err) {
      setStatusMsg(`Toggle failed: ${err.message}`);
    }
  };

  const handleDeployPipeline = async () => {
    try {
      setStatusMsg('Validating & deploying...');
      const payload = serializeAndValidateGraph(workflowName, nodes, edges);
      console.log('Serialized Graph JSON:', JSON.stringify(payload, null, 2));
      const res = await axios.post('/api/workflows', payload);
      const newId = res.data._id || res.data.workflowId;
      setActiveWorkflowId(newId);
      setStatusMsg(`Deployed! ID: ${newId}`);
      fetchWorkflows();
    } catch (err) {
      setStatusMsg(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const triggerPulseOnce = useCallback(() => {
    if (edges.length === 0) return;
    edges.forEach((edge, index) => {
      setTimeout(() => {
        setSimulatedEdgeIds((prev) => new Set(prev).add(edge.id));
        setTimeout(() => {
          setSimulatedEdgeIds((prev) => {
            const copy = new Set(prev);
            copy.delete(edge.id);
            return copy;
          });
        }, 700);
      }, index * 350);
    });
  }, [edges]);

  const handleSimulatePulse = () => {
    if (edges.length === 0) {
      setStatusMsg('Connect at least two nodes to test wire glow.');
      return;
    }
    setStatusMsg('Simulating live telemetry stream...');
    triggerPulseOnce();
  };

  // Optional periodic pulse stream for live demos
  useEffect(() => {
    if (!autoStream || edges.length === 0) return;
    triggerPulseOnce();
    const interval = setInterval(triggerPulseOnce, 2200);
    return () => clearInterval(interval);
  }, [autoStream, edges, triggerPulseOnce]);

  const compiledPreview = useMemo(
    () => compileRulePreview(workflowName, nodes, edges),
    [workflowName, nodes, edges]
  );

  const renderedEdges = useMemo(() => {
    return edges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        isGlowing: activeEdgeIds.has(edge.id) || simulatedEdgeIds.has(edge.id),
      },
    }));
  }, [edges, activeEdgeIds, simulatedEdgeIds]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <WorkflowToolbar
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        savedWorkflows={savedWorkflows}
        activeWorkflowId={activeWorkflowId}
        isActive={isActive}
        onSelectWorkflow={handleSelectWorkflow}
        onNewWorkflow={handleNewWorkflow}
        onToggleActive={handleToggleActive}
        onDeploy={handleDeployPipeline}
        onSimulatePulse={handleSimulatePulse}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        statusMsg={statusMsg}
      />

      <div className="flex flex-1 overflow-hidden">
        <NodeSidebar onLoadDemoPreset={handleLoadDemoPreset} />

        <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
          <button
            onClick={() => setShowPreviewDrawer((prev) => !prev)}
            className="absolute bottom-4 left-16 z-10 flex items-center gap-1.5 bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-teal-300 text-xs font-medium px-3 py-1.5 rounded shadow"
          >
            <Braces size={14} />
            {showPreviewDrawer ? 'Hide Rule JSON' : 'Inspect Rule JSON'}
          </button>

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
              deleteKeyCode={['Backspace', 'Delete']}
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

        <PropertiesPanel
          selectedNode={selectedNode}
          updateNodeData={updateNodeData}
          onDeleteNode={handleDeleteNode}
        />
      </div>

      <RulePreviewDrawer
        isOpen={showPreviewDrawer}
        onClose={() => setShowPreviewDrawer(false)}
        compiledPreview={compiledPreview}
        autoStream={autoStream}
        onToggleAutoStream={() => setAutoStream((prev) => !prev)}
      />
    </div>
  );
}