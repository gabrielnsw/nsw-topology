import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { getValueFormat, formattedValueToString } from '@grafana/data';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodePositionChange,
  type NodeDimensionChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeConfig, ConnectionConfig, AppearanceConfig, ColorsConfig, MetricConfig, ZabbixHost } from '../../types';
import { getUtilizationPercent, getUtilizationColor, getUtilizationThickness } from '../../engine/weathermap';
import { formatTrafficValue, evaluateCustomMetric } from '../../data/parser';
import { getTrafficHistory } from '../../data/trafficHistory';
import {
  DEFAULT_NODE_WIDTH,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_BG,
  DEFAULT_ICON_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_SIZE,
  DEFAULT_ICON_SIZE,
  resolveGrafanaColor,
} from '../../constants';
import { COLORS, RADIUS, BLUR, FONT } from '../../styles/tokens';
import { TopologyNode, type TopologyNodeData, type MetricDisplay, type ConnectionDisplay } from './TopologyNode';
import { WeathermapEdge, type WeathermapEdgeData } from './WeathermapEdge';
import { FloatingConnectionLine } from './FloatingConnectionLine';
import { SearchBar } from './SearchBar';
import { ContextMenu } from './ContextMenu';
import { DeleteConfirmation } from '../editors/DeleteConfirmation';
import { NodeFormModal } from '../editors/NodeFormModal';
import { ConnFormModal } from '../editors/ConnFormModal';

type TopologyNodeType = Node<TopologyNodeData>;
type WeathermapEdgeType = Edge<WeathermapEdgeData>;

const nodeTypes = { topology: TopologyNode };
const edgeTypes = { weathermap: WeathermapEdge };

interface Props {
  nodes: NodeConfig[];
  connections: ConnectionConfig[];
  appearance: AppearanceConfig;
  colors: ColorsConfig;
  hosts: Record<string, ZabbixHost>;
  hostNames: string[];
  hostFieldMap: Record<string, string[]>;
  dataSeries: any[];
  width: number;
  height: number;
  enableZoom: boolean;
  enablePan: boolean;
  showMiniMap: boolean;
  showLegend: boolean;
  title: string;
  titleSize: number;
  addNodeTrigger: number;
  searchOpen: boolean;
  onNodePositionChange: (nodeId: string, x: number, y: number) => void;
  onNodeResize: (nodeId: string, w: number, h: number) => void;
  onAddNode: (node: NodeConfig) => void;
  onUpdateNode: (node: NodeConfig) => void;
  onDeleteNode: (id: string) => void;
  onAddConnection: (conn: ConnectionConfig) => void;
  onUpdateConnection: (conn: ConnectionConfig) => void;
  onDeleteConnection: (id: string) => void;
}

export const CanvasRenderer: React.FC<Props> = ({
  nodes: nodeConfigs,
  connections,
  appearance,
  colors,
  hosts,
  hostNames,
  hostFieldMap,
  dataSeries,
  width,
  height,
  enableZoom,
  enablePan,
  showMiniMap,
  showLegend,
  title,
  titleSize,
  addNodeTrigger,
  searchOpen,
  onNodePositionChange,
  onNodeResize,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  onAddConnection,
  onUpdateConnection,
  onDeleteConnection,
}) => {
  const resolvedColors = useMemo(
    () => ({
      online: resolveGrafanaColor(colors.online),
      offline: resolveGrafanaColor(colors.offline),
      alert: resolveGrafanaColor(colors.alert),
    }),
    [colors]
  );

  const [ctxMenu, setCtxMenu] = useState<{ type: 'node' | 'edge'; id: string; x: number; y: number } | null>(null);
  const [editingNode, setEditingNode] = useState<NodeConfig | null>(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [editingConn, setEditingConn] = useState<ConnectionConfig | null>(null);
  const [showConnModal, setShowConnModal] = useState(false);
  const [pendingConn, setPendingConn] = useState<{
    sourceId: string;
    targetId: string;
    sourceHandle: string;
    targetHandle: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'node' | 'edge'; id: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef(addNodeTrigger);

  useEffect(() => {
    if (addNodeTrigger !== lastTrigger.current) {
      lastTrigger.current = addNodeTrigger;
      queueMicrotask(() => {
        setEditingNode(null);
        setShowNodeModal(true);
      });
    }
  }, [addNodeTrigger]);

  const getMetricValue = useCallback(
    (node: NodeConfig, field: string): number | null => {
      if (!field) {
        return null;
      }
      const host = hosts[node.hostName] || hosts[node.name];
      if (!host) {
        return null;
      }
      const val = host.items[field];
      if (val === undefined || val === null) {
        return null;
      }
      const num = typeof val === 'number' ? val : Number(val);
      return isNaN(num) ? null : num;
    },
    [hosts]
  );

  const getNodeStatus = useCallback(
    (node: NodeConfig): string => {
      if (!node.pingField) {
        return 'online';
      }
      const val = getMetricValue(node, node.pingField);
      if (val === null) {
        return 'offline';
      }
      return val === (node.pingOnlineValue ?? 1) ? 'online' : 'offline';
    },
    [getMetricValue]
  );

  const getNodeAlertColor = useCallback(
    (node: NodeConfig, baseStatus: string): string => {
      if (baseStatus === 'offline') {
        return resolvedColors.offline;
      }

      const legacyMetrics: MetricConfig[] = [
        node.cpuMetric,
        node.memoryMetric,
        node.lossMetric,
        node.responseTimeMetric,
      ];

      for (const m of legacyMetrics) {
        if (m && m.enabled && m.field) {
          const val = getMetricValue(node, m.field);
          if (val !== null && val > m.alertThreshold) {
            return resolveGrafanaColor(m.alertColor || '') || resolvedColors.alert;
          }
        }
      }

      if (node.customMetrics) {
        for (const m of node.customMetrics) {
          if (m.enabled) {
            const val = evaluateCustomMetric(m, node.hostName, hostFieldMap, hosts);
            if (val !== null && val > m.alertThreshold) {
              return resolveGrafanaColor(m.alertColor || '') || resolvedColors.alert;
            }
          }
        }
      }

      return baseStatus === 'online' ? resolvedColors.online : resolvedColors.alert;
    },
    [resolvedColors, getMetricValue, hostFieldMap, hosts]
  );

  const nodeHasZeroTraffic = useCallback(
    (nodeId: string): boolean => {
      return connections.some((conn) => {
        if (conn.sourceId !== nodeId && conn.targetId !== nodeId) {
          return false;
        }
        if (!conn.downloadField) {
          return false;
        }
        const srcNode = nodeConfigs.find((n) => n.id === conn.sourceId);
        if (!srcNode) {
          return false;
        }
        const host = hosts[srcNode.hostName] || hosts[srcNode.name];
        if (!host) {
          return false;
        }
        const dl = typeof host.items[conn.downloadField] === 'number' ? (host.items[conn.downloadField] as number) : 0;
        const ul =
          conn.uploadField && typeof host.items[conn.uploadField] === 'number'
            ? (host.items[conn.uploadField] as number)
            : 0;
        return dl === 0 && ul === 0;
      });
    },
    [connections, nodeConfigs, hosts]
  );

  const getNodeMetrics = useCallback(
    (node: NodeConfig): MetricDisplay[] => {
      const result: MetricDisplay[] = [];
      const checkLegacy = (m: MetricConfig | undefined, label: string, suffix: string) => {
        if (!m || !m.enabled || !m.field) {
          return;
        }
        const val = getMetricValue(node, m.field);
        if (val === null) {
          return;
        }
        const alerting = val > m.alertThreshold;
        result.push({
          label,
          value:
            m.field.toLowerCase().includes('time') ||
            m.field.toLowerCase().includes('tempo') ||
            m.field.toLowerCase().includes('latency') ||
            suffix === 'ms'
              ? `${val.toFixed(0)}${suffix}`
              : `${val.toFixed(1)}${suffix}`,
          color: alerting ? resolveGrafanaColor(m.alertColor || '') || resolvedColors.alert : resolvedColors.online,
          alerting,
        });
      };

      checkLegacy(node.cpuMetric, 'CPU', '%');
      checkLegacy(node.memoryMetric, 'Memory', '%');
      checkLegacy(node.lossMetric, 'Packet Loss', '%');
      checkLegacy(node.responseTimeMetric, 'Response Time', 'ms');

      if (node.customMetrics) {
        for (const m of node.customMetrics) {
          if (m.enabled) {
            const val = evaluateCustomMetric(m, node.hostName, hostFieldMap, hosts);
            if (val !== null) {
              const decimals = m.decimals ?? 1;
              const alerting = val > m.alertThreshold;
              let formattedVal: string;
              if (m.unit && m.unit !== 'none') {
                const fmt = getValueFormat(m.unit);
                formattedVal = formattedValueToString(fmt(val, decimals));
              } else {
                formattedVal = val.toFixed(decimals);
              }
              result.push({
                label: m.name,
                value: formattedVal,
                color: alerting ? m.alertColor || resolvedColors.alert : resolvedColors.online,
                alerting,
              });
            }
          }
        }
      }

      return result;
    },
    [getMetricValue, resolvedColors, hostFieldMap, hosts]
  );

  const getUptimeValue = useCallback(
    (node: NodeConfig): string => {
      if (!node.uptimeField) {
        return '';
      }
      const val = getMetricValue(node, node.uptimeField);
      if (val === null) {
        return '';
      }
      const days = Math.floor(val / 86400);
      const hrs = Math.floor((val % 86400) / 3600);
      return `${days}d ${hrs}h`;
    },
    [getMetricValue]
  );

  const getEdgeTrafficState = useCallback(
    (conn: ConnectionConfig, srcNode?: NodeConfig, tgtNode?: NodeConfig) => {
      const srcStatus = srcNode ? getNodeStatus(srcNode) : 'offline';
      const tgtStatus = tgtNode ? getNodeStatus(tgtNode) : 'offline';

      let color = '#4b5563';
      let width = 2;
      let dlVal = 0;
      let ulVal = 0;

      if (srcStatus === 'offline' || tgtStatus === 'offline') {
        color = resolvedColors.offline;
      } else if (srcNode && conn.downloadField) {
        const host = hosts[srcNode.hostName] || hosts[srcNode.name];
        if (host) {
          dlVal = typeof host.items[conn.downloadField] === 'number' ? (host.items[conn.downloadField] as number) : 0;
          if (conn.uploadField) {
            ulVal = typeof host.items[conn.uploadField] === 'number' ? (host.items[conn.uploadField] as number) : 0;
          }
          if (dlVal === 0 && ulVal === 0) {
            color = COLORS.red;
          } else {
            const pct = getUtilizationPercent(Math.max(dlVal, ulVal), conn.capacity);
            color = getUtilizationColor(pct);
            width = getUtilizationThickness(pct, 2);
          }
        }
      }

      return { color, width, dlVal, ulVal, srcStatus, tgtStatus };
    },
    [getNodeStatus, hosts, resolvedColors]
  );

  const getNodeConnections = useCallback(
    (nodeId: string): ConnectionDisplay[] => {
      return connections
        .filter((c) => c.sourceId === nodeId || c.targetId === nodeId)
        .map((c) => {
          const oid = c.sourceId === nodeId ? c.targetId : c.sourceId;
          const otherNode = nodeConfigs.find((n) => n.id === oid);
          const name = otherNode?.name || oid;

          const srcNode = nodeConfigs.find((n) => n.id === c.sourceId);
          const tgtNode = nodeConfigs.find((n) => n.id === c.targetId);
          const { color } = getEdgeTrafficState(c, srcNode, tgtNode);

          return { name, color };
        })
        .slice(0, 5);
    },
    [connections, nodeConfigs, getEdgeTrafficState]
  );

  const initialNodes: TopologyNodeType[] = useMemo(
    () =>
      nodeConfigs.map((node) => {
        const status = getNodeStatus(node);
        let statusColor = getNodeAlertColor(node, status);
        if (status === 'online' && nodeHasZeroTraffic(node.id)) {
          statusColor = resolvedColors.alert;
        }
        const isMatch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());
        return {
          id: node.id,
          type: 'topology' as const,
          position: { x: node.positionX || 100, y: node.positionY || 100 },
          style: {
            width: node.width || DEFAULT_NODE_WIDTH,
            height: node.height || DEFAULT_NODE_HEIGHT,
            ...(isMatch ? { boxShadow: `0 0 20px 4px rgba(59, 130, 246, 0.6)`, borderRadius: 10 } : {}),
          },
          data: {
            label: node.name,
            ip: node.ip || '',
            icon: node.icon,
            statusColor,
            status,
            uptimeValue: getUptimeValue(node),
            connections: getNodeConnections(node.id),
            metrics: getNodeMetrics(node),
            bgColor: node.bgColor || DEFAULT_NODE_BG,
            iconColor: node.iconColor || DEFAULT_ICON_COLOR,
            textColor: node.textColor || DEFAULT_TEXT_COLOR,
            textSize: node.textSize || DEFAULT_TEXT_SIZE,
            iconSize: node.iconSize || DEFAULT_ICON_SIZE,
            width: node.width || DEFAULT_NODE_WIDTH,
            height: node.height || DEFAULT_NODE_HEIGHT,
          },
        };
      }),
    [
      nodeConfigs,
      getNodeStatus,
      getNodeAlertColor,
      getUptimeValue,
      getNodeConnections,
      getNodeMetrics,
      nodeHasZeroTraffic,
      resolvedColors,
      searchQuery,
    ]
  );

  const initialEdges: WeathermapEdgeType[] = useMemo(
    () =>
      connections.map((conn) => {
        const srcNode = nodeConfigs.find((n) => n.id === conn.sourceId);
        const tgtNode = nodeConfigs.find((n) => n.id === conn.targetId);
        const {
          color: edgeColor,
          width: edgeWidth,
          dlVal,
          ulVal,
          srcStatus,
          tgtStatus,
        } = getEdgeTrafficState(conn, srcNode, tgtNode);

        const dlDisplay = dlVal > 0 ? formatTrafficValue(dlVal) : '';
        const ulDisplay = ulVal > 0 ? formatTrafficValue(ulVal) : '';

        const edgeIsRed = edgeColor === resolvedColors.offline || edgeColor === COLORS.red;
        const trafficHistory = getTrafficHistory(dataSeries, srcNode, conn);

        const evaluatedMetrics = [];
        if (conn.customMetrics) {
          for (const m of conn.customMetrics) {
            if (m.enabled) {
              const val = evaluateCustomMetric(m, srcNode?.hostName || srcNode?.name || '', hostFieldMap, hosts);
              if (val !== null) {
                evaluatedMetrics.push({
                  ...m,
                  computedValue: val,
                });
              }
            }
          }
        }

        return {
          id: conn.id,
          source: conn.sourceId,
          target: conn.targetId,
          sourceHandle: conn.sourceHandle || 'bottom',
          targetHandle: conn.targetHandle || 'top',
          type: 'weathermap' as const,
          data: {
            label: conn.alias || conn.interfaceName || '',
            edgeColor,
            edgeWidth,
            lineStyle: conn.lineStyle || 'solid',
            hasTraffic: true,
            animated: edgeIsRed ? false : (conn.animated ?? false),
            showTraffic: conn.showTraffic ?? false,
            sourceName: srcNode?.name || conn.sourceId,
            targetName: tgtNode?.name || conn.targetId,
            sourceStatus: srcStatus,
            targetStatus: tgtStatus,
            downloadValue: dlDisplay,
            uploadValue: ulDisplay,
            interfaceName: conn.interfaceName || '',
            trafficHistory,
            isRed: edgeIsRed,
            capacity: conn.capacity || 1000,
            customMetrics: evaluatedMetrics,
          },
        };
      }),
    [connections, nodeConfigs, getEdgeTrafficState, resolvedColors, dataSeries, hostFieldMap, hosts]
  );

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(initialNodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(initialEdges);
  useEffect(() => {
    queueMicrotask(() => setRfNodes(initialNodes));
  }, [initialNodes, setRfNodes]);
  useEffect(() => {
    queueMicrotask(() => setRfEdges(initialEdges));
  }, [initialEdges, setRfEdges]);

  const handleNodesChange: OnNodesChange<TopologyNodeType> = useCallback(
    (changes) => {
      onNodesChange(changes);
      for (const c of changes) {
        if (c.type === 'position') {
          const p = c as NodePositionChange;
          if (p.position && p.dragging === false) {
            let x = p.position.x;
            let y = p.position.y;
            if (appearance.showGrid && appearance.gridSize > 0) {
              x = Math.round(x / appearance.gridSize) * appearance.gridSize;
              y = Math.round(y / appearance.gridSize) * appearance.gridSize;
            }
            onNodePositionChange(c.id, x, y);
          }
        }
        if (c.type === 'dimensions' && (c as any).resizing === false) {
          const d = c as NodeDimensionChange;
          if (d.dimensions) {
            onNodeResize(c.id, d.dimensions.width, d.dimensions.height);
          }
        }
      }
    },
    [onNodesChange, onNodePositionChange, onNodeResize, appearance.showGrid, appearance.gridSize]
  );

  const handleEdgesChange: OnEdgesChange<WeathermapEdgeType> = useCallback((c) => onEdgesChange(c), [onEdgesChange]);

  const handleConnect: OnConnect = useCallback((params) => {
    if (params.source && params.target && params.source !== params.target) {
      setPendingConn({
        sourceId: params.source,
        targetId: params.target,
        sourceHandle: params.sourceHandle || 'bottom',
        targetHandle: params.targetHandle || 'top',
      });
      setEditingConn(null);
      setShowConnModal(true);
    }
  }, []);

  const handleNodeContextMenu = useCallback((e: React.MouseEvent, node: TopologyNodeType) => {
    e.preventDefault();
    const b = containerRef.current?.getBoundingClientRect();
    setCtxMenu({ type: 'node', id: node.id, x: e.clientX - (b?.left || 0), y: e.clientY - (b?.top || 0) });
  }, []);

  const handleEdgeContextMenu = useCallback((e: React.MouseEvent, edge: WeathermapEdgeType) => {
    e.preventDefault();
    const b = containerRef.current?.getBoundingClientRect();
    setCtxMenu({ type: 'edge', id: edge.id, x: e.clientX - (b?.left || 0), y: e.clientY - (b?.top || 0) });
  }, []);

  const handlePaneClick = useCallback(() => {
    setCtxMenu(null);
  }, []);

  const handleCtxEdit = useCallback(() => {
    if (!ctxMenu) {
      return;
    }
    if (ctxMenu.type === 'node') {
      const n = nodeConfigs.find((x) => x.id === ctxMenu.id);
      if (n) {
        setEditingNode(n);
        setShowNodeModal(true);
      }
    } else {
      const c = connections.find((x) => x.id === ctxMenu.id);
      if (c) {
        setEditingConn(c);
        setPendingConn(null);
        setShowConnModal(true);
      }
    }
    setCtxMenu(null);
  }, [ctxMenu, nodeConfigs, connections]);

  const handleCtxDelete = useCallback(() => {
    if (!ctxMenu) {
      return;
    }
    setDeleteTarget({ type: ctxMenu.type, id: ctxMenu.id });
    setCtxMenu(null);
  }, [ctxMenu]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) {
      return;
    }
    if (deleteTarget.type === 'node') {
      onDeleteNode(deleteTarget.id);
    } else {
      onDeleteConnection(deleteTarget.id);
    }
    setDeleteTarget(null);
  }, [deleteTarget, onDeleteNode, onDeleteConnection]);

  const handleSaveNode = useCallback(
    (node: NodeConfig) => {
      if (editingNode) {
        onUpdateNode(node);
      } else {
        onAddNode(node);
      }
      setShowNodeModal(false);
      setEditingNode(null);
    },
    [editingNode, onUpdateNode, onAddNode]
  );

  const handleSaveConn = useCallback(
    (conn: ConnectionConfig) => {
      if (editingConn && !pendingConn) {
        onUpdateConnection(conn);
      } else {
        onAddConnection(conn);
      }
      setShowConnModal(false);
      setEditingConn(null);
      setPendingConn(null);
    },
    [editingConn, pendingConn, onUpdateConnection, onAddConnection]
  );

  const bgColor = resolveGrafanaColor(appearance.bgColor || '#111217');
  const usedHostNames = useMemo(() => nodeConfigs.map((n) => n.hostName), [nodeConfigs]);

  return (
    <div ref={containerRef} style={{ width, height, position: 'relative' }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>
      <style>{`
        .react-flow__edge-animated-dash { animation: dashWalk 0.6s linear infinite; }
        @keyframes dashWalk { to { stroke-dashoffset: -15; } }
        .react-flow__handle { opacity: 0.5; transition: opacity 0.2s; }
        .react-flow__handle:hover { opacity: 1; }
        .react-flow__node:hover .react-flow__handle { opacity: 0.8; }
        .react-flow__node.selected .react-flow__handle { opacity: 1; }
        .react-flow__resize-control { opacity: 0; transition: opacity 0.15s; }
        .react-flow__node:hover .react-flow__resize-control,
        .react-flow__node.selected .react-flow__resize-control { opacity: 1; }
        .react-flow__controls { display: none !important; }
      `}</style>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeContextMenu={handleNodeContextMenu}
        onEdgeContextMenu={handleEdgeContextMenu}
        onPaneClick={handlePaneClick}
        connectionLineComponent={FloatingConnectionLine}
        connectionMode={ConnectionMode.Loose}
        zoomOnScroll={enableZoom}
        zoomOnPinch={enableZoom}
        zoomOnDoubleClick={false}
        panOnDrag={enablePan}
        panOnScroll={false}
        minZoom={0.15}
        maxZoom={4}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ background: bgColor }}
        snapToGrid={appearance.showGrid}
        snapGrid={[appearance.gridSize, appearance.gridSize]}
      >
        <Background
          variant={BackgroundVariant.Lines}
          gap={appearance.showGrid ? appearance.gridSize : 0}
          color={appearance.showGrid ? resolveGrafanaColor(appearance.gridColor || '#1e2130') : 'transparent'}
          size={1}
        />
        {showMiniMap && (
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(n) => (n.data as TopologyNodeData)?.statusColor || COLORS.green}
            maskColor="rgba(0,0,0,0.7)"
            style={{ background: '#0d0d1a', border: '1px solid #1e2130', borderRadius: RADIUS.medium }}
          />
        )}
        {showLegend && (
          <Panel position="top-right">
            <div
              style={{
                background: COLORS.surfaceLight,
                backdropFilter: BLUR,
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS.large,
                padding: '10px 16px',
                display: 'flex',
                flexDirection: 'column' as const,
                gap: 7,
                fontSize: FONT.body,
                color: '#aaa',
              }}
            >
              {[
                { label: 'Online', color: resolvedColors.online || COLORS.green },
                { label: 'Offline', color: resolvedColors.offline || COLORS.danger },
                { label: 'Alert', color: resolvedColors.alert || COLORS.warning },
              ].map((entry) => (
                <div key={entry.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      background: entry.color,
                      flexShrink: 0,
                      boxShadow: `0 0 6px ${entry.color}`,
                    }}
                  />
                  <span style={{ color: entry.color, fontWeight: 600 }}>{entry.label}</span>
                </div>
              ))}
            </div>
          </Panel>
        )}
        {appearance.showDonateCard !== false && (
          <Panel position="top-left">
            <div
              style={{
                background: COLORS.surfaceLight,
                backdropFilter: BLUR,
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS.large,
                padding: '10px 14px',
                fontSize: 10,
                color: COLORS.textMuted,
                textAlign: 'center',
                maxWidth: 200,
              }}
            >
              <div style={{ fontSize: FONT.body, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 4 }}>
                NSW Topology by{' '}
                <a
                  href="https://github.com/gabrielnsw"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: COLORS.accentLight, textDecoration: 'none' }}
                >
                  @gabrielnsw
                </a>
              </div>
              <div style={{ marginBottom: 4 }}>Thank you for being part of this!</div>
              <div style={{ marginBottom: 8 }}>Any donation is welcome</div>
              <a
                href="https://www.paypal.com/donate/?business=Z9USFAAMBJ29S&no_recurring=0&item_name=Developing+the+Network+Topology+plugin+for+Grafana+to+solve+real+monitoring+issues.+Help+me+keep+the+project+evolving%21&currency_code=BRL"
                target="_blank"
                rel="noopener noreferrer"
                className="nsw-donate-btn"
                style={{
                  display: 'inline-block',
                  padding: '5px 16px',
                  fontSize: FONT.body,
                  fontWeight: 700,
                  color: COLORS.textWhite,
                  background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.red})`,
                  borderRadius: RADIUS.medium,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  animation: 'nswGlow 2s ease-in-out infinite',
                }}
              >
                ❤️ Donate
              </a>
            </div>
          </Panel>
        )}
        <style>{`
          @keyframes nswGlow {
            0%, 100% { box-shadow: 0 0 8px rgba(245,158,11,0.3); }
            50% { box-shadow: 0 0 18px rgba(245,158,11,0.6), 0 0 30px rgba(239,68,68,0.3); }
          }
        `}</style>
        {searchOpen && (
          <Panel position="top-center">
            <SearchBar query={searchQuery} onChange={setSearchQuery} />
          </Panel>
        )}
      </ReactFlow>

      {ctxMenu && <ContextMenu x={ctxMenu.x} y={ctxMenu.y} onEdit={handleCtxEdit} onDelete={handleCtxDelete} />}

      {deleteTarget && (
        <DeleteConfirmation
          type={deleteTarget.type}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showNodeModal && (
        <NodeFormModal
          node={editingNode}
          hostNames={hostNames}
          usedHostNames={usedHostNames}
          hostFieldMap={hostFieldMap}
          onSave={handleSaveNode}
          onCancel={() => {
            setShowNodeModal(false);
            setEditingNode(null);
          }}
        />
      )}

      {showConnModal && (
        <ConnFormModal
          conn={editingConn}
          pendingConn={pendingConn}
          nodes={nodeConfigs}
          hostFieldMap={hostFieldMap}
          hosts={hosts}
          onSave={handleSaveConn}
          onCancel={() => {
            setShowConnModal(false);
            setEditingConn(null);
            setPendingConn(null);
          }}
        />
      )}
    </div>
  );
};
