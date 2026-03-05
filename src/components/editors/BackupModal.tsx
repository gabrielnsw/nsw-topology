import React, { useRef, useState } from 'react';
import { Modal, Button } from '@grafana/ui';
import { TopologyOptions, NodeConfig, ConnectionConfig } from '../../types';
import {
  DEFAULT_NODE_BG,
  DEFAULT_ICON_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_SIZE,
  DEFAULT_ICON_SIZE,
  DEFAULT_METRIC,
} from '../../constants';

interface Props {
  options: TopologyOptions;
  onRestore: (patch: Partial<TopologyOptions>) => void;
  onClose: () => void;
}

interface V1Element {
  data: Record<string, any>;
  position?: { x: number; y: number };
  group: string;
  classes?: string;
}

interface V1Backup {
  elements: V1Element[];
  themeSettings?: Record<string, string>;
}

const NODE_SIZE_MAP: Record<string, { w: number; h: number }> = {
  small: { w: 100, h: 70 },
  medium: { w: 130, h: 90 },
  large: { w: 170, h: 120 },
};

const convertV1IconType = (iconType: string): string => {
  const map: Record<string, string> = {
    switch: 'switch',
    router: 'router',
    server: 'server',
    firewall: 'firewall',
    cgnat: 'cgnat',
    olt: 'olt',
    camera: 'camera',
    cloud: 'cloud',
    cpu: 'cpu',
    desktop: 'desktop',
    laptop: 'laptop',
    vm: 'vm',
    wifi: 'wifi',
    globe: 'globe',
    antenna: 'antenna',
    satellite: 'satellite',
    nas: 'nas',
    harddrive: 'harddrive',
    building: 'building',
    datacenter: 'datacenter',
    rack: 'rack',
    shield: 'shield',
    lock: 'lock',
    smartphone: 'smartphone',
    tablet: 'tablet',
    impressora: 'impressora',
    retificadora: 'retificadora',
    battery: 'battery',
    backup: 'backup',
    tool: 'tool',
    cable: 'cable',
    alertTriangle: 'alertTriangle',
    db: 'db',
  };
  return map[iconType] || 'server';
};

const convertV1Backup = (v1: V1Backup): { nodes: NodeConfig[]; connections: ConnectionConfig[] } => {
  const nodes: NodeConfig[] = [];
  const connections: ConnectionConfig[] = [];
  const anchorMap = new Map<string, string>();

  const v1Nodes = v1.elements.filter((el) => el.group === 'nodes' && !(el.classes || '').includes('anchor'));
  const anchors = v1.elements.filter((el) => el.group === 'nodes' && (el.classes || '').includes('anchor'));
  const v1Edges = v1.elements.filter((el) => el.group === 'edges');

  for (const el of anchors) {
    const linkId = v1Edges.find((e) => e.data.source === el.data.id || e.data.target === el.data.id)?.data.linkId;
    if (linkId) {
      anchorMap.set(el.data.id, linkId);
    }
  }

  for (const el of v1Nodes) {
    const d = el.data;
    const size = NODE_SIZE_MAP[d.nodeSize] || NODE_SIZE_MAP.medium;
    nodes.push({
      id: d.id,
      name: d.alias || d.id,
      hostName: d.id,
      icon: convertV1IconType(d.iconType || 'server'),
      ip: '',
      positionX: el.position?.x || 100,
      positionY: el.position?.y || 100,
      width: size.w,
      height: size.h,
      pingField: '',
      pingOnlineValue: 1,
      uptimeField: '',
      bgColor: DEFAULT_NODE_BG,
      iconColor: DEFAULT_ICON_COLOR,
      textColor: DEFAULT_TEXT_COLOR,
      textSize: DEFAULT_TEXT_SIZE,
      iconSize: DEFAULT_ICON_SIZE,
      cpuMetric: { ...DEFAULT_METRIC },
      memoryMetric: { ...DEFAULT_METRIC },
      lossMetric: { ...DEFAULT_METRIC },
      responseTimeMetric: { ...DEFAULT_METRIC },
      customMetrics: [],
    });
  }

  const processedLinks = new Set<string>();

  for (const el of v1Edges) {
    const d = el.data;
    const linkId = d.linkId || d.id;

    if (processedLinks.has(linkId)) {
      continue;
    }

    let sourceId = d.source;
    let targetId = d.target;

    if (anchorMap.has(sourceId)) {
      const relatedEdges = v1Edges.filter((e) => e.data.linkId === linkId);
      const nodeIds = new Set<string>();
      for (const re of relatedEdges) {
        if (!anchorMap.has(re.data.source)) {
          nodeIds.add(re.data.source);
        }
        if (!anchorMap.has(re.data.target)) {
          nodeIds.add(re.data.target);
        }
      }
      const arr = Array.from(nodeIds);
      if (arr.length >= 2) {
        sourceId = arr[0];
        targetId = arr[1];
      } else {
        continue;
      }
    }

    if (anchorMap.has(targetId)) {
      const relatedEdges = v1Edges.filter((e) => e.data.linkId === linkId);
      const nodeIds = new Set<string>();
      for (const re of relatedEdges) {
        if (!anchorMap.has(re.data.source)) {
          nodeIds.add(re.data.source);
        }
        if (!anchorMap.has(re.data.target)) {
          nodeIds.add(re.data.target);
        }
      }
      const arr = Array.from(nodeIds);
      if (arr.length >= 2) {
        sourceId = arr[0];
        targetId = arr[1];
      } else {
        continue;
      }
    }

    if (!v1Nodes.find((n) => n.data.id === sourceId) || !v1Nodes.find((n) => n.data.id === targetId)) {
      continue;
    }

    const lineStyle = d.eStyle === 'dotted' ? 'dotted' : d.eStyle === 'dashed' ? 'dashed' : 'solid';

    connections.push({
      id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sourceId,
      targetId,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      capacity: 1000,
      interfaceName: d.eInterface || '',
      alias: d.eInterface || '',
      lineStyle,
      animated: false,
      showTraffic: d.eMonitored === true,
      downloadField: '',
      uploadField: '',
      customMetrics: [],
    });

    processedLinks.add(linkId);
  }

  return { nodes, connections };
};

const isV1Format = (data: any): boolean => {
  return data && Array.isArray(data.elements) && data.elements.length > 0 && data.elements[0].group !== undefined;
};

const isV2Format = (data: any): boolean => {
  return data && Array.isArray(data.nodes) && Array.isArray(data.connections);
};

export const BackupModal: React.FC<Props> = ({ options, onRestore, onClose }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'v2' | 'v1' | null>(null);
  const [status, setStatus] = useState('');
  const [pendingImport, setPendingImport] = useState<{ patch: Partial<TopologyOptions>; summary: string } | null>(null);

  const handleExport = () => {
    const backup = {
      nodes: options.nodes || [],
      connections: options.connections || [],
      appearance: options.appearance,
      colors: options.colors,
      general: options.general,
      interaction: options.interaction,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `topology-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Backup exported successfully.');
  };

  const triggerImport = (mode: 'v2' | 'v1') => {
    setImportMode(mode);
    setStatus('');
    setTimeout(() => fileRef.current?.click(), 50);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);

        if (importMode === 'v1') {
          if (!isV1Format(data)) {
            setStatus('Error: this file does not appear to be a valid V1 backup.');
            return;
          }
          const { nodes, connections } = convertV1Backup(data as V1Backup);
          setPendingImport({
            patch: { nodes, connections },
            summary: `${nodes.length} nodes and ${connections.length} connections from V1`,
          });
        } else {
          if (isV1Format(data) && !isV2Format(data)) {
            setStatus('Error: this looks like a V1 backup. Use "Import V1 Backup" instead.');
            return;
          }
          if (!isV2Format(data)) {
            setStatus('Error: invalid backup format.');
            return;
          }
          const patch: Partial<TopologyOptions> = {
            nodes: data.nodes,
            connections: data.connections,
          };
          if (data.appearance) {
            patch.appearance = data.appearance;
          }
          if (data.colors) {
            patch.colors = data.colors;
          }
          if (data.general) {
            patch.general = data.general;
          }
          if (data.interaction) {
            patch.interaction = data.interaction;
          }
          setPendingImport({
            patch,
            summary: `${data.nodes.length} nodes and ${data.connections.length} connections`,
          });
        }
      } catch {
        setStatus('Error: failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (pendingImport) {
    return (
      <Modal title="⚠️ Confirm Import" isOpen={true} onDismiss={() => setPendingImport(null)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              fontSize: 13,
              color: '#fbbf24',
              lineHeight: 1.6,
            }}
          >
            This will <strong>replace all current topology data</strong> (nodes, connections, and settings) with the
            imported backup. This action cannot be undone.
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            Ready to import: <strong style={{ color: '#e0e0f0' }}>{pendingImport.summary}</strong>
          </div>
        </div>
        <Modal.ButtonRow>
          <Button variant="secondary" onClick={() => setPendingImport(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onRestore(pendingImport.patch);
              setStatus(`Imported ${pendingImport.summary}.`);
              setPendingImport(null);
            }}
          >
            Confirm Import
          </Button>
        </Modal.ButtonRow>
      </Modal>
    );
  }

  return (
    <Modal title="💾 Manage Backups" isOpen={true} onDismiss={onClose}>
      <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFile} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ActionCard
          icon="⬇️"
          title="Export Backup"
          description="Download a backup of your current topology configuration."
          btnLabel="Export"
          btnVariant="primary"
          onClick={handleExport}
        />

        <ActionCard
          icon="⬆️"
          title="Import Backup"
          description="Restore topology from a previously exported backup file."
          btnLabel="Import"
          btnVariant="secondary"
          onClick={() => triggerImport('v2')}
        />

        <ActionCard
          icon="🔄"
          title="Import V1 Backup"
          description="Import a backup from the legacy V1 plugin format."
          btnLabel="Import V1"
          btnVariant="secondary"
          onClick={() => triggerImport('v1')}
        />

        {status && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12,
              background: status.startsWith('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(74, 222, 128, 0.1)',
              color: status.startsWith('Error') ? '#f87171' : '#4ade80',
              border: status.startsWith('Error')
                ? '1px solid rgba(239, 68, 68, 0.2)'
                : '1px solid rgba(74, 222, 128, 0.2)',
            }}
          >
            {status}
          </div>
        )}
      </div>

      <Modal.ButtonRow>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  btnLabel: string;
  btnVariant: 'primary' | 'secondary';
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, btnLabel, btnVariant, onClick }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 16px',
      borderRadius: 10,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0f0', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: '#888' }}>{description}</div>
    </div>
    <Button variant={btnVariant} size="sm" onClick={onClick}>
      {btnLabel}
    </Button>
  </div>
);
