import React, { memo, useState, useRef } from 'react';
import { Handle, Position, NodeResizeControl, type NodeProps, type Node } from '@xyflow/react';
import { getIconDataUriColored } from '../icons';
import {
  COLORS,
  FONT,
  tooltipBox,
  tooltipDivider,
  tooltipLabel,
  tooltipRow,
  tooltipTitle,
  statusDot,
} from '../../styles/tokens';

export type MetricDisplay = {
  label: string;
  value: string;
  color: string;
  alerting: boolean;
};

export type ConnectionDisplay = {
  name: string;
  color: string;
};

export type TopologyNodeData = {
  label: string;
  ip: string;
  icon: string;
  statusColor: string;
  status: string;
  uptimeValue: string;
  connections: ConnectionDisplay[];
  metrics: MetricDisplay[];
  bgColor: string;
  iconColor: string;
  textColor: string;
  textSize: number;
  iconSize: number;
  width: number;
  height: number;
};

type TopologyNodeType = Node<TopologyNodeData, 'topology'>;

const handleStyle: React.CSSProperties = {
  width: 10,
  height: 10,
  background: COLORS.accent,
  border: '2px solid rgba(255,255,255,0.3)',
  borderRadius: '50%',
  cursor: 'crosshair',
  zIndex: 10,
  opacity: 0.6,
};

export const TopologyNode = memo(({ data, selected }: NodeProps<TopologyNodeType>) => {
  const { label, icon, statusColor, status, uptimeValue, connections, metrics, textSize, iconSize } = data;
  const [hovered, setHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const iconUri = getIconDataUriColored(icon, COLORS.textWhite);

  return (
    <>
      <NodeResizeControl
        position="bottom-right"
        minWidth={80}
        minHeight={60}
        style={{ background: 'transparent', border: 'none', width: 14, height: 14, cursor: 'se-resize' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" style={{ display: 'block' }}>
          <path
            d="M9 1v8H1"
            fill="none"
            stroke={selected ? COLORS.textWhite : 'rgba(255,255,255,0.4)'}
            strokeWidth="1.5"
          />
          <path
            d="M9 5v4H5"
            fill="none"
            stroke={selected ? COLORS.textWhite : 'rgba(255,255,255,0.4)'}
            strokeWidth="1.5"
          />
        </svg>
      </NodeResizeControl>

      <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="right" style={handleStyle} />

      <div
        ref={nodeRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          height: '100%',
          minWidth: 80,
          minHeight: 60,
          background: statusColor,
          borderRadius: 10,
          border: '2px solid rgba(255,255,255,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 0 18px ${statusColor}44, 0 4px 12px rgba(0,0,0,0.3)`,
          transition: 'background 0.35s ease, box-shadow 0.35s ease',
          position: 'relative',
          gap: 4,
          padding: '8px 6px',
          cursor: 'grab',
        }}
      >
        <img
          src={iconUri}
          alt={label}
          style={{ width: iconSize || 32, height: iconSize || 32, objectFit: 'contain' }}
          draggable={false}
        />

        <div
          style={{
            fontSize: textSize || FONT.label,
            fontWeight: 600,
            color: data.textColor || COLORS.textWhite,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            lineHeight: 1.2,
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          {label}
        </div>
      </div>

      {hovered && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '100%',
            transform: 'translateX(-50%)',
            marginBottom: 8,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div style={tooltipBox}>
            <div style={tooltipTitle}>{label}</div>
            <div style={tooltipDivider} />
            <div style={tooltipRow}>
              <div style={statusDot(data.statusColor)} />
              <span style={tooltipLabel}>Status:</span>
              <span style={{ color: statusColor, fontWeight: 700 }}>{status === 'online' ? 'Online' : 'Offline'}</span>
            </div>
            {uptimeValue && (
              <div style={tooltipRow}>
                <span style={{ width: 8 }} />
                <span style={tooltipLabel}>Uptime:</span>
                <span>{uptimeValue}</span>
              </div>
            )}
            {metrics.length > 0 && (
              <>
                <div style={tooltipDivider} />
                <div style={{ ...tooltipLabel, marginBottom: 2 }}>Metrics:</div>
                {metrics.map((m, i) => (
                  <div key={i} style={tooltipRow}>
                    <div style={statusDot(m.alerting ? m.color : COLORS.green)} />
                    <span style={tooltipLabel}>{m.label}:</span>
                    <span
                      style={{ color: m.alerting ? m.color : COLORS.textSecondary, fontWeight: m.alerting ? 700 : 400 }}
                    >
                      {m.value}
                      {m.alerting && <span style={{ fontSize: FONT.sm, marginLeft: 4, color: m.color }}>⚠</span>}
                    </span>
                  </div>
                ))}
              </>
            )}
            {connections.length > 0 && (
              <>
                <div style={tooltipDivider} />
                <div style={{ ...tooltipLabel, marginBottom: 2 }}>Connections:</div>
                {connections.slice(0, 5).map((c, i) => (
                  <div key={i} style={{ ...tooltipRow, paddingLeft: 2 }}>
                    <div style={statusDot(c.color)} />
                    <span style={{ fontSize: FONT.sm + 1, color: COLORS.textSecondary }}>{c.name}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
});

TopologyNode.displayName = 'TopologyNode';
