import { type InternalNode, Position } from '@xyflow/react';

export function getNodeIntersection(
  node: InternalNode,
  target: InternalNode
): { x: number; y: number } {
  const w = (node.measured?.width ?? 100) / 2;
  const h = (node.measured?.height ?? 80) / 2;

  const cx = node.position.x + w;
  const cy = node.position.y + h;
  const tx = target.position.x + (target.measured?.width ?? 100) / 2;
  const ty = target.position.y + (target.measured?.height ?? 80) / 2;

  const dx = tx - cx;
  const dy = ty - cy;

  if (dx === 0 && dy === 0) {
    return { x: cx, y: cy - h };
  }

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDx * h > absDy * w) {
    const t = w / absDx;
    return { x: cx + t * dx, y: cy + t * dy };
  }

  const t = h / absDy;
  return { x: cx + t * dx, y: cy + t * dy };
}

export function getEdgePosition(
  node: InternalNode,
  intersectionPoint: { x: number; y: number }
): Position {
  const nw = node.measured?.width ?? 100;
  const nh = node.measured?.height ?? 80;
  const nx = Math.round(node.position.x);
  const ny = Math.round(node.position.y);
  const px = Math.round(intersectionPoint.x);
  const py = Math.round(intersectionPoint.y);

  if (px <= nx + 1) {
    return Position.Left;
  }
  if (px >= nx + nw - 1) {
    return Position.Right;
  }
  if (py <= ny + 1) {
    return Position.Top;
  }
  if (py >= ny + nh - 1) {
    return Position.Bottom;
  }
  return Position.Bottom;
}

export function getEdgeParams(source: InternalNode, target: InternalNode) {
  const sourceIntersectionPoint = getNodeIntersection(source, target);
  const targetIntersectionPoint = getNodeIntersection(target, source);

  const sourcePos = getEdgePosition(source, sourceIntersectionPoint);
  const targetPos = getEdgePosition(target, targetIntersectionPoint);

  return {
    sx: sourceIntersectionPoint.x,
    sy: sourceIntersectionPoint.y,
    tx: targetIntersectionPoint.x,
    ty: targetIntersectionPoint.y,
    sourcePos,
    targetPos,
  };
}
