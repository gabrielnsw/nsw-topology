import React, { useCallback, useMemo, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { TopologyOptions, NodeConfig, ConnectionConfig } from '../types';
import { parseDataFrames } from '../data/parser';
import { DEFAULT_APPEARANCE, DEFAULT_COLORS, DEFAULT_INTERACTION, DEFAULT_METRIC } from '../constants';
import { CanvasRenderer } from './canvas/CanvasRenderer';
import { TopologySidebar } from './sidebar/TopologySidebar';
import { WelcomeModal } from './WelcomeModal';
import { BackupModal } from './editors/BackupModal';

type Props = PanelProps<TopologyOptions>;

// main panel — state management + layout
const InnerPanel: React.FC<Props> = ({ options, data, width, height, onOptionsChange }) => {
  const appearance = useMemo(() => ({ ...DEFAULT_APPEARANCE, ...options.appearance }), [options.appearance]);
  const colorsConfig = useMemo(() => ({ ...DEFAULT_COLORS, ...options.colors }), [options.colors]);
  const interaction = useMemo(() => ({ ...DEFAULT_INTERACTION, ...options.interaction }), [options.interaction]);
  const nodes: NodeConfig[] = useMemo(
    () =>
      (options.nodes || []).map((n) => ({
        ...n,
        cpuMetric: n.cpuMetric || { ...DEFAULT_METRIC },
        memoryMetric: n.memoryMetric || { ...DEFAULT_METRIC },
        lossMetric: n.lossMetric || { ...DEFAULT_METRIC },
        responseTimeMetric: n.responseTimeMetric || { ...DEFAULT_METRIC },
      })),
    [options.nodes]
  );
  const connections = options.connections || [];
  const parsedData = useMemo(() => parseDataFrames(data.series), [data.series]);

  const [zoomEnabled, setZoomEnabled] = useState(interaction.enableZoom);
  const [searchOpen, setSearchOpen] = useState(false);
  const [addNodeTrigger, setAddNodeTrigger] = useState(0);
  const [showWelcome, setShowWelcome] = useState(interaction.showWelcome !== false);
  const [showBackup, setShowBackup] = useState(false);
  const reactFlow = useReactFlow();

  const title = options.general?.title || '';
  const titleSize = options.general?.titleSize || 18;

  const updateOptions = useCallback(
    (patch: Partial<TopologyOptions>) => {
      onOptionsChange({ ...options, ...patch });
    },
    [options, onOptionsChange]
  );

  const handleNodePositionChange = useCallback(
    (nodeId: string, x: number, y: number) => {
      updateOptions({
        nodes: (options.nodes || []).map((n) => (n.id === nodeId ? { ...n, positionX: x, positionY: y } : n)),
      });
    },
    [options.nodes, updateOptions]
  );

  const handleNodeResize = useCallback(
    (nodeId: string, w: number, h: number) => {
      updateOptions({
        nodes: (options.nodes || []).map((n) =>
          n.id === nodeId ? { ...n, width: Math.round(w), height: Math.round(h) } : n
        ),
      });
    },
    [options.nodes, updateOptions]
  );

  const handleAddNode = useCallback(
    (node: NodeConfig) => updateOptions({ nodes: [...(options.nodes || []), node] }),
    [options.nodes, updateOptions]
  );

  const handleUpdateNode = useCallback(
    (node: NodeConfig) => updateOptions({ nodes: (options.nodes || []).map((n) => (n.id === node.id ? node : n)) }),
    [options.nodes, updateOptions]
  );

  const handleDeleteNode = useCallback(
    (id: string) =>
      updateOptions({
        nodes: (options.nodes || []).filter((n) => n.id !== id),
        connections: (options.connections || []).filter((c) => c.sourceId !== id && c.targetId !== id),
      }),
    [options.nodes, options.connections, updateOptions]
  );

  const handleAddConnection = useCallback(
    (conn: ConnectionConfig) => updateOptions({ connections: [...(options.connections || []), conn] }),
    [options.connections, updateOptions]
  );

  const handleUpdateConnection = useCallback(
    (conn: ConnectionConfig) =>
      updateOptions({ connections: (options.connections || []).map((c) => (c.id === conn.id ? conn : c)) }),
    [options.connections, updateOptions]
  );

  const handleDeleteConnection = useCallback(
    (id: string) => updateOptions({ connections: (options.connections || []).filter((c) => c.id !== id) }),
    [options.connections, updateOptions]
  );

  const handleCenterMap = useCallback(() => {
    reactFlow.fitView({ padding: 0.2, duration: 300 });
  }, [reactFlow]);

  const handleToggleZoom = useCallback(() => setZoomEnabled((prev) => !prev), []);

  const handleCloseWelcome = useCallback(() => {
    setShowWelcome(false);
    onOptionsChange({
      ...options,
      interaction: { ...interaction, showWelcome: false },
    });
  }, [options, interaction, onOptionsChange]);

  const titleBarHeight = title ? 40 : 0;
  const canvasHeight = height - titleBarHeight;

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      {title && (
        <div
          style={{
            width: '100%',
            height: titleBarHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: titleSize || 18,
            fontWeight: 700,
            color: '#e0e0f0',
            background: 'rgba(15, 15, 28, 0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
            position: 'relative',
            zIndex: 25,
          }}
        >
          {title}
        </div>
      )}
      <div style={{ position: 'relative', height: canvasHeight }}>
        <TopologySidebar
          onAddNode={() => setAddNodeTrigger((prev) => prev + 1)}
          onCenterMap={handleCenterMap}
          onToggleZoom={handleToggleZoom}
          onToggleSearch={() => setSearchOpen((prev) => !prev)}
          onBackup={() => setShowBackup(true)}
          zoomEnabled={zoomEnabled}
          searchOpen={searchOpen}
          showDonateHeart={appearance.showDonateCard === false}
        />
        <div style={{ marginLeft: 48, width: width - 48, height: canvasHeight }}>
          <CanvasRenderer
            nodes={nodes}
            connections={connections}
            appearance={appearance}
            colors={colorsConfig}
            hosts={parsedData.hosts}
            hostNames={parsedData.hostNames}
            hostFieldMap={parsedData.hostFieldMap}
            dataSeries={data.series}
            width={width - 48}
            height={canvasHeight}
            enableZoom={zoomEnabled}
            enablePan={interaction.enablePan}
            showMiniMap={interaction.showMiniMap}
            showLegend={interaction.showLegend}
            title={title}
            titleSize={titleSize}
            addNodeTrigger={addNodeTrigger}
            searchOpen={searchOpen}
            onNodePositionChange={handleNodePositionChange}
            onNodeResize={handleNodeResize}
            onAddNode={handleAddNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onAddConnection={handleAddConnection}
            onUpdateConnection={handleUpdateConnection}
            onDeleteConnection={handleDeleteConnection}
          />
        </div>
      </div>
      {showBackup && (
        <BackupModal
          options={options}
          onRestore={(patch) => updateOptions(patch)}
          onClose={() => setShowBackup(false)}
        />
      )}
    </div>
  );
};

export const TopologyPanel: React.FC<Props> = (props) => (
  <ReactFlowProvider>
    <InnerPanel {...props} />
  </ReactFlowProvider>
);
