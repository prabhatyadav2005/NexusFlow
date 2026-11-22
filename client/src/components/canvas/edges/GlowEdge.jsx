import React from 'react';
import { BaseEdge, getSmoothStepPath } from 'reactflow';

export default function GlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isGlowing = data?.isGlowing || false;

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      className={isGlowing ? 'edge-wire-glow' : 'edge-wire-idle'}
    />
  );
}