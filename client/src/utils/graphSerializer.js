export function serializeAndValidateGraph(workflowName, nodes, edges) {
  if (!nodes || nodes.length === 0) {
    throw new Error('Canvas is empty. Add at least one Sensor node and one Action node.');
  }

  const hasSensor = nodes.some((n) => n.type === 'sensorNode');
  const hasAction = nodes.some((n) => n.type === 'actionNode');

  if (!hasSensor || !hasAction) {
    throw new Error('Pipeline must include at least one Data Source and one Action Trigger.');
  }

  const connectedNodeIds = new Set();
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const orphanNodes = nodes.filter((n) => !connectedNodeIds.has(n.id));
  if (orphanNodes.length > 0) {
    throw new Error(`Disconnected node detected: "${orphanNodes[0].id}". Connect or remove it before deploying.`);
  }

  return {
    name: workflowName || 'Untitled Rule Pipeline',
    isActive: true,
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type,
      data: n.data,
      position: n.position,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  };
}