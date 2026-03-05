import React from 'react';
import { getBezierPath, Position, ConnectionLineComponentProps } from '@xyflow/react';

type FloatingConnectionLineProps = ConnectionLineComponentProps;

function getTargetPosition(fromX: number, fromY: number, toX: number, toY: number): Position {
  const dx = toX - fromX;
  const dy = toY - fromY;
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? Position.Left : Position.Right;
  }
  return dy > 0 ? Position.Top : Position.Bottom;
}

export const FloatingConnectionLine = ({ toX, toY, fromX, fromY, fromPosition }: FloatingConnectionLineProps) => {
  const targetPos = getTargetPosition(fromX, fromY, toX, toY);

  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetPosition: targetPos,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path fill="none" stroke="#3b82f6" strokeWidth={2} d={edgePath} strokeDasharray="6 3" opacity={0.7} />
      <circle cx={toX} cy={toY} fill="#3b82f6" r={4} opacity={0.8} />
    </g>
  );
};

