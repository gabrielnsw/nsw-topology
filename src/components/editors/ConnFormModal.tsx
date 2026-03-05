import React, { useState, useMemo } from 'react';
import { Modal, Button, Field, Input, Select, UnitPicker } from '@grafana/ui';
import { NodeConfig, ConnectionConfig, ZabbixHost } from '../../types';
import { CAPACITY_OPTIONS, LINE_STYLE_OPTIONS } from '../../constants';
import { COLORS, FONT, SECTION_HEADER } from '../../styles/tokens';
import { CustomMetricList } from './CustomMetricList';

function extractInterfaceBaseName(fieldName: string): string {
  const m = fieldName.match(/^(Interface\s+[^:]+?)(?:\(\))?\s*:/i);
  if (m) {
    return m[1].trim();
  }
  const idx = fieldName.lastIndexOf(':');
  if (idx > 0) {
    return fieldName.substring(0, idx).trim();
  }
  return fieldName;
}

interface Props {
  conn: ConnectionConfig | null;
  pendingConn: { sourceId: string; targetId: string; sourceHandle: string; targetHandle: string } | null;
  nodes: NodeConfig[];
  hostFieldMap: Record<string, string[]>;
  hosts: Record<string, ZabbixHost>;
  onSave: (c: ConnectionConfig) => void;
  onCancel: () => void;
}

export const ConnFormModal: React.FC<Props> = ({ conn, pendingConn, nodes, hostFieldMap, hosts, onSave, onCancel }) => {
  const [sourceId, setSourceId] = useState(conn?.sourceId || pendingConn?.sourceId || '');
  const [targetId, setTargetId] = useState(conn?.targetId || pendingConn?.targetId || '');
  const [interfaceName, setInterfaceName] = useState(conn?.interfaceName || '');
  const [alias, setAlias] = useState(conn?.alias || '');
  const [capacity, setCapacity] = useState(String(conn?.capacity || 1000));
  const [lineStyle, setLineStyle] = useState(conn?.lineStyle || 'solid');
  const [animated, setAnimated] = useState(conn?.animated ?? true);
  const [showTraffic, setShowTraffic] = useState(conn?.showTraffic ?? false);
  const [downloadField, setDownloadField] = useState(conn?.downloadField || '');
  const [uploadField, setUploadField] = useState(conn?.uploadField || '');
  const [unit, setUnit] = useState(conn?.unit || 'bps');
  const [customMetrics, setCustomMetrics] = useState(
    (conn?.customMetrics || []).map((m) => ({ ...m, decimals: m.decimals ?? 1 }))
  );

  const nodeOpts = nodes.map((n) => ({ value: n.id, label: n.name }));
  const isFromDrag = !!pendingConn;

  const interfaceOpts = useMemo(() => {
    const src = nodes.find((n) => n.id === sourceId);
    if (!src) {
      return [];
    }
    const fields = hostFieldMap[src.hostName] || hostFieldMap[src.name] || [];
    const basesObj: Record<string, boolean> = {};
    for (const f of fields) {
      if (f.toLowerCase().indexOf('interface') >= 0 || f.indexOf(':') >= 0) {
        basesObj[extractInterfaceBaseName(f)] = true;
      }
    }
    const bases = Object.keys(basesObj);
    return [{ value: '', label: 'Select...' }, ...bases.map((b) => ({ value: b, label: b }))];
  }, [sourceId, nodes, hostFieldMap]);

  const allFields = useMemo(() => {
    const src = nodes.find((n) => n.id === sourceId);
    if (!src) {
      return [{ value: '', label: 'Select...' }];
    }
    const fields = hostFieldMap[src.hostName] || hostFieldMap[src.name] || [];

    let filteredFields = fields;
    if (interfaceName) {
      filteredFields = fields.filter(
        (f) => f.startsWith(interfaceName) || extractInterfaceBaseName(f) === interfaceName
      );
    }
    return [{ value: '', label: 'Select...' }, ...filteredFields.map((f) => ({ value: f, label: f }))];
  }, [hostFieldMap, sourceId, nodes, interfaceName]);

  const handleInterfaceSelect = (baseName: string) => {
    setInterfaceName(baseName);
    if (!baseName) {
      return;
    }
    const src = nodes.find((n) => n.id === sourceId);
    if (!src) {
      return;
    }
    const fields = hostFieldMap[src.hostName] || hostFieldMap[src.name] || [];
    const matching = fields.filter((f) => f.startsWith(baseName) || extractInterfaceBaseName(f) === baseName);

    const dlPatterns = [`${baseName}: Bits received`, `${baseName}: Bits recebidos`];
    const ulPatterns = [`${baseName}: Bits sent`, `${baseName}: Bits enviados`];

    const dl = matching.find((f) => dlPatterns.includes(f)) || '';
    const ul = matching.find((f) => ulPatterns.includes(f)) || '';

    if (dl) {
      setDownloadField(dl);
    }
    if (ul) {
      setUploadField(ul);
    }
  };

  const save = () => {
    onSave({
      id: conn?.id || `conn-${Date.now()}`,
      sourceId,
      targetId,
      sourceHandle: conn?.sourceHandle || pendingConn?.sourceHandle || 'bottom',
      targetHandle: conn?.targetHandle || pendingConn?.targetHandle || 'top',
      capacity: Number(capacity) || 1000,
      interfaceName,
      alias,
      lineStyle,
      animated,
      showTraffic,
      downloadField,
      uploadField,
      unit,
      customMetrics,
    });
  };

  return (
    <Modal title={`🔗 ${conn ? 'Edit Connection' : 'Add Connection'}`} isOpen={true} onDismiss={onCancel}>
      <div style={SECTION_HEADER}>📌 Endpoints</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field label="From">
          <Select
            options={nodeOpts}
            value={sourceId}
            onChange={(v) => setSourceId(v.value || '')}
            isDisabled={isFromDrag}
          />
        </Field>
        <Field label="To">
          <Select
            options={nodeOpts}
            value={targetId}
            onChange={(v) => setTargetId(v.value || '')}
            isDisabled={isFromDrag}
          />
        </Field>
      </div>

      <div style={SECTION_HEADER}>🔌 Interface</div>
      <Field label="Interface Name">
        <Select options={interfaceOpts} value={interfaceName} onChange={(v) => handleInterfaceSelect(v.value || '')} />
      </Field>
      <Field label="Alias (label on line)">
        <Input value={alias} onChange={(e) => setAlias(e.currentTarget.value)} placeholder="e.g. OLT-SW01" />
      </Field>

      <div style={SECTION_HEADER}>📊 Traffic</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field label="Download">
          <Select options={allFields} value={downloadField} onChange={(v) => setDownloadField(v.value || '')} />
        </Field>
        <Field label="Upload">
          <Select options={allFields} value={uploadField} onChange={(v) => setUploadField(v.value || '')} />
        </Field>
      </div>
      <Field label="Capacity">
        <Select
          options={CAPACITY_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
          value={capacity}
          onChange={(v) => setCapacity(v.value || '1000')}
        />
      </Field>
      <Field label="Unit">
        <UnitPicker value={unit} onChange={(v) => setUnit(v || 'none')} />
      </Field>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '4px 0 8px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            fontSize: FONT.label,
            color: COLORS.textSecondary,
          }}
        >
          <input
            type="checkbox"
            checked={showTraffic}
            onChange={(e) => setShowTraffic(e.target.checked)}
            style={{ accentColor: COLORS.accent }}
          />
          Show Download/Upload on line
        </label>
      </div>

      <div style={SECTION_HEADER}>📊 Custom Metrics</div>
      <CustomMetricList
        metrics={customMetrics}
        onChange={setCustomMetrics}
        availableFields={allFields}
        showIconPicker={true}
      />

      <div style={{ marginTop: 24, ...SECTION_HEADER }}>🎨 Style</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field label="Line Style">
          <Select options={LINE_STYLE_OPTIONS} value={lineStyle} onChange={(v) => setLineStyle(v.value || 'solid')} />
        </Field>
        <Field label="Animation">
          <Select
            options={[
              { value: 'true', label: 'Enabled' },
              { value: 'false', label: 'Disabled' },
            ]}
            value={animated ? 'true' : 'false'}
            onChange={(v) => setAnimated(v.value === 'true')}
          />
        </Field>
      </div>

      <Modal.ButtonRow>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={save} disabled={!sourceId || !targetId || sourceId === targetId}>
          Save
        </Button>
      </Modal.ButtonRow>
    </Modal>
  );
};
