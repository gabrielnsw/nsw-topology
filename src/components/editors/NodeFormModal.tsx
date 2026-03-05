import React, { useState, useMemo } from 'react';
import { Modal, Button, Field, Input, Select, ColorPicker } from '@grafana/ui';
import { NodeConfig, CustomMetric } from '../../types';
import { CustomMetricList } from './CustomMetricList';
import {
  ICON_SIZE_OPTIONS,
  TEXT_SIZE_OPTIONS,
  DEFAULT_NODE_WIDTH,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_BG,
  DEFAULT_ICON_COLOR,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_SIZE,
  DEFAULT_ICON_SIZE,
  METRIC_PATTERNS,
  autoDetectField,
} from '../../constants';
import { searchIcons, getIconDataUri } from '../icons';
import { COLORS, FONT, SECTION_HEADER } from '../../styles/tokens';

interface Props {
  node: NodeConfig | null;
  hostNames: string[];
  usedHostNames: string[];
  hostFieldMap: Record<string, string[]>;
  onSave: (n: NodeConfig) => void;
  onCancel: () => void;
}

// node create/edit modal — auto-detects default metrics from host fields
export const NodeFormModal: React.FC<Props> = ({ node, hostNames, usedHostNames, hostFieldMap, onSave, onCancel }) => {
  const [name, setName] = useState(node?.name || '');
  const [hostName, setHostName] = useState(node?.hostName || '');
  const [ip, setIp] = useState(node?.ip || '');
  const [icon, setIcon] = useState(node?.icon || 'server');
  const [iconSearch, setIconSearch] = useState('');
  const [pingField, setPingField] = useState(node?.pingField || '');
  const [pingOnlineValue, setPingOnlineValue] = useState(String(node?.pingOnlineValue ?? 1));
  const [uptimeField, setUptimeField] = useState(node?.uptimeField || '');
  const [textColor, setTextColor] = useState(node?.textColor || DEFAULT_TEXT_COLOR);
  const [iconSize, setIconSize] = useState(String(node?.iconSize || DEFAULT_ICON_SIZE));
  const [iconColor, setIconColor] = useState(node?.iconColor || DEFAULT_ICON_COLOR);
  const [textSize, setTextSize] = useState(String(node?.textSize || DEFAULT_TEXT_SIZE));

  const [customMetrics, setCustomMetrics] = useState(() => {
    if (node?.customMetrics && node.customMetrics.length > 0) {
      return node.customMetrics.map((m) => ({ ...m, decimals: m.decimals ?? 1 }));
    }

    const fields = hostFieldMap[hostName] || [];

    const defaults: CustomMetric[] = [
      {
        id: 'default-cpu',
        name: 'CPU',
        field: node?.cpuMetric?.field || autoDetectField(fields, METRIC_PATTERNS.cpu),
        isRegex: false,
        aggregation: 'lastNotNull',
        unit: 'percent',
        enabled: node?.cpuMetric?.enabled ?? false,
        alertThreshold: node?.cpuMetric?.alertThreshold ?? 80,
        alertColor: node?.cpuMetric?.alertColor || COLORS.warning,
        decimals: 1,
        isDefault: true,
      },
      {
        id: 'default-mem',
        name: 'Memory',
        field: node?.memoryMetric?.field || autoDetectField(fields, METRIC_PATTERNS.memory),
        isRegex: false,
        aggregation: 'lastNotNull',
        unit: 'percent',
        enabled: node?.memoryMetric?.enabled ?? false,
        alertThreshold: node?.memoryMetric?.alertThreshold ?? 85,
        alertColor: node?.memoryMetric?.alertColor || COLORS.warning,
        decimals: 1,
        isDefault: true,
      },
      {
        id: 'default-temp',
        name: 'Temperature',
        field: autoDetectField(fields, METRIC_PATTERNS.temperature),
        isRegex: false,
        aggregation: 'lastNotNull',
        unit: 'celsius',
        enabled: false,
        alertThreshold: 60,
        alertColor: COLORS.warning,
        decimals: 1,
        isDefault: true,
      },
      {
        id: 'default-loss',
        name: 'Packet Loss',
        field: node?.lossMetric?.field || autoDetectField(fields, METRIC_PATTERNS.loss),
        isRegex: false,
        aggregation: 'lastNotNull',
        unit: 'percent',
        enabled: node?.lossMetric?.enabled ?? false,
        alertThreshold: node?.lossMetric?.alertThreshold ?? 5,
        alertColor: node?.lossMetric?.alertColor || COLORS.warning,
        decimals: 1,
        isDefault: true,
      },
      {
        id: 'default-rt',
        name: 'Response Time',
        field: node?.responseTimeMetric?.field || autoDetectField(fields, METRIC_PATTERNS.responseTime),
        isRegex: false,
        aggregation: 'lastNotNull',
        unit: 'ms',
        enabled: node?.responseTimeMetric?.enabled ?? false,
        alertThreshold: node?.responseTimeMetric?.alertThreshold ?? 100,
        alertColor: node?.responseTimeMetric?.alertColor || COLORS.warning,
        decimals: 0,
        isDefault: true,
      },
    ];

    return defaults;
  });

  const availableHosts = useMemo(() => {
    return hostNames.filter((h) => !usedHostNames.includes(h) || h === node?.hostName);
  }, [hostNames, usedHostNames, node]);

  const hostOpts = useMemo(
    () => [{ value: '', label: 'Select...' }, ...availableHosts.map((h) => ({ value: h, label: h }))],
    [availableHosts]
  );

  const fieldOpts = useMemo(() => {
    const items = hostFieldMap[hostName] || [];
    return [{ value: '', label: 'Select...' }, ...items.map((f) => ({ value: f, label: f }))];
  }, [hostFieldMap, hostName]);

  const filteredIcons = useMemo(() => searchIcons(iconSearch), [iconSearch]);

  const handleHostChange = (newHost: string) => {
    setHostName(newHost);
    if (!name || name === hostName) {
      setName(newHost);
    }
    const fields = hostFieldMap[newHost] || [];
    setPingField(autoDetectField(fields, METRIC_PATTERNS.ping));
    setUptimeField(autoDetectField(fields, METRIC_PATTERNS.uptime));
  };

  const save = () => {
    onSave({
      id: node?.id || `node-${Date.now()}`,
      name: name || hostName,
      hostName,
      ip,
      icon,
      positionX: node?.positionX || 200,
      positionY: node?.positionY || 200,
      width: node?.width || DEFAULT_NODE_WIDTH,
      height: node?.height || DEFAULT_NODE_HEIGHT,
      pingField,
      pingOnlineValue: Number(pingOnlineValue) || 1,
      uptimeField,
      bgColor: DEFAULT_NODE_BG,
      iconColor,
      textColor,
      textSize: Number(textSize) || DEFAULT_TEXT_SIZE,
      iconSize: Number(iconSize) || DEFAULT_ICON_SIZE,
      cpuMetric: { field: '', enabled: false, alertThreshold: 80, alertColor: COLORS.warning },
      memoryMetric: { field: '', enabled: false, alertThreshold: 80, alertColor: COLORS.warning },
      lossMetric: { field: '', enabled: false, alertThreshold: 5, alertColor: COLORS.warning },
      responseTimeMetric: { field: '', enabled: false, alertThreshold: 100, alertColor: COLORS.warning },
      customMetrics,
    });
  };

  return (
    <Modal title={`${node ? '✏️' : '➕'} ${node ? 'Edit' : 'Create Node'}`} isOpen={true} onDismiss={onCancel}>
      <div style={SECTION_HEADER}>📡 Host</div>
      <Field label="Host">
        <Select options={hostOpts} value={hostName} onChange={(v) => handleHostChange(v.value || '')} />
      </Field>
      {hostName && (
        <>
          <Field label="Node Name">
            <Input value={name} onChange={(e) => setName(e.currentTarget.value)} />
          </Field>
          <Field label="IP Address">
            <Input value={ip} onChange={(e) => setIp(e.currentTarget.value)} placeholder="192.168.0.1" />
          </Field>

          <div style={SECTION_HEADER}>🖼️ Icon</div>
          <Field label="Search icon...">
            <Input
              value={iconSearch}
              onChange={(e) => setIconSearch(e.currentTarget.value)}
              placeholder="Search icon..."
            />
          </Field>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 4,
              maxHeight: 170,
              overflowY: 'auto' as const,
              marginBottom: 12,
            }}
          >
            {filteredIcons.map((k) => (
              <div
                key={k}
                onClick={() => setIcon(k)}
                style={{
                  padding: 7,
                  textAlign: 'center' as const,
                  cursor: 'pointer',
                  borderRadius: 8,
                  border: icon === k ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                  background: icon === k ? COLORS.surfaceActive : 'transparent',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all 0.12s',
                }}
              >
                <img src={getIconDataUri(k)} alt={k} style={{ width: 22, height: 22 }} draggable={false} />
                <span style={{ fontSize: FONT.xs, color: COLORS.textMuted, lineHeight: 1 }}>{k}</span>
              </div>
            ))}
          </div>

          <div style={SECTION_HEADER}>🔌 Monitoring</div>
          <Field label="Ping Field">
            <Select options={fieldOpts} value={pingField} onChange={(v) => setPingField(v.value || '')} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Online Value">
              <Input
                type="number"
                value={pingOnlineValue}
                onChange={(e) => setPingOnlineValue(e.currentTarget.value)}
              />
            </Field>
            <Field label="Uptime">
              <Select options={fieldOpts} value={uptimeField} onChange={(v) => setUptimeField(v.value || '')} />
            </Field>
          </div>

          <div style={SECTION_HEADER}>📊 Custom Metrics</div>
          <CustomMetricList metrics={customMetrics} onChange={setCustomMetrics} availableFields={fieldOpts} />

          <div style={SECTION_HEADER}>🎨 Node Style</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Icon Color">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ColorPicker color={iconColor} onChange={(c) => setIconColor(c)} />
                <span style={{ fontSize: FONT.body, color: COLORS.textMuted }}>{iconColor}</span>
              </div>
            </Field>
            <Field label="Text Color">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ColorPicker color={textColor} onChange={(c) => setTextColor(c)} />
                <span style={{ fontSize: FONT.body, color: COLORS.textMuted }}>{textColor}</span>
              </div>
            </Field>
            <Field label="Icon Size">
              <Select options={ICON_SIZE_OPTIONS} value={iconSize} onChange={(v) => setIconSize(v.value || '32')} />
            </Field>
            <Field label="Text Size">
              <Select options={TEXT_SIZE_OPTIONS} value={textSize} onChange={(v) => setTextSize(v.value || '12')} />
            </Field>
          </div>
        </>
      )}
      <Modal.ButtonRow>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={save} disabled={!hostName}>
          Save
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};
