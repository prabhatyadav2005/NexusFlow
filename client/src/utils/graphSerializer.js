export function compileRulePreview(workflowName, nodes, edges) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const orderedEdges = edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    return {
      edgeId: edge.id,
      from: {
        id: edge.source,
        type: sourceNode?.type || 'unknown',
        summary: summarizeNode(sourceNode),
      },
      to: {
        id: edge.target,
        type: targetNode?.type || 'unknown',
        summary: summarizeNode(targetNode),
      },
    };
  });

  return {
    ruleName: workflowName || 'Untitled Rule Pipeline',
    totalNodes: nodes.length,
    totalConnections: edges.length,
    pipelineSteps: orderedEdges,
  };
}

function summarizeNode(node) {
  if (!node) return 'Missing node';
  const d = node.data || {};
  if (node.type === 'sensorNode') {
    return `Sensor(${d.sensorId || 'unassigned'} : ${d.metric || 'temperature'})`;
  }
  if (node.type === 'mathNode') {
    if (d.operation === 'movingAverage') {
      return `MovingAvg(window=${d.windowSize || 5})`;
    }
    return `Condition(${d.operator || '>'} ${d.threshold ?? 80})`;
  }
  if (node.type === 'actionNode') {
    return `Action(${(d.actionType || 'sms').toUpperCase()} -> ${d.target || 'n/a'})`;
  }
  return node.type;
}