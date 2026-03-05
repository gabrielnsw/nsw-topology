import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Button, Field, Input, Select, ColorPicker, IconButton, UnitPicker } from '@grafana/ui';
import { CustomMetric } from '../../types';
import { COLORS, FONT } from '../../styles/tokens';
import { REDUCER_OPTIONS, ICON_EMOJI_OPTIONS } from '../../constants';

// check if it looks like a regex (starts with /)
function isRegexValue(v: string): boolean {
  return v.startsWith('/') && v.length > 1;
}

// try to parse /pattern/flags into a RegExp
function extractRegex(v: string): RegExp | null {
  const match = v.match(/^\/(.+)\/([gimsuy]*)$/);
  if (match) {
    try {
      return new RegExp(match[1], match[2] || 'i');
    } catch {
      return null;
    }
  }
  if (v.startsWith('/')) {
    try {
      return new RegExp(v.slice(1), 'i');
    } catch {
      return null;
    }
  }
  return null;
}

interface RegexFieldSelectProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}

// field selector that also supports typing /regex/ to filter
const RegexFieldSelect: React.FC<RegexFieldSelectProps> = ({ value, options, onChange }) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRegex = isRegexValue(inputValue);

  useEffect(() => {
    queueMicrotask(() => setInputValue(value));
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!inputValue) {
      return options.filter((o) => o.value !== '');
    }
    if (isRegex) {
      const regex = extractRegex(inputValue);
      if (regex) {
        return options.filter((o) => o.value && regex.test(o.value));
      }
    }
    const lower = inputValue.toLowerCase();
    return options.filter((o) => o.value && o.label.toLowerCase().indexOf(lower) !== -1);
  }, [inputValue, options, isRegex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputValue(v);
    setIsOpen(true);
    if (isRegexValue(v) && v.endsWith('/') && v.length > 2) {
      onChange(v);
    }
  };

  const handleSelect = (val: string) => {
    setInputValue(val);
    onChange(val);
    setIsOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onChange(inputValue);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Select field or type /regex/..."
        style={{
          width: '100%',
          padding: '6px 8px',
          background: '#1a1b20',
          border: `1px solid ${isRegex ? '#FF9830' : COLORS.border}`,
          borderRadius: 4,
          color: isRegex ? '#FF9830' : COLORS.text,
          fontFamily: isRegex ? 'monospace' : 'inherit',
          fontSize: 14,
          outline: 'none',
          boxSizing: 'border-box' as const,
        }}
      />
      {isOpen && filteredOptions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: 200,
            overflowY: 'auto',
            background: '#1e1f25',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 4,
            zIndex: 999,
            marginTop: 2,
          }}
        >
          {filteredOptions.map((opt) => (
            <div
              key={opt.value}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt.value);
              }}
              style={{
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: 13,
                color: COLORS.text,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(59,130,246,0.15)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'transparent';
              }}
            >
              {isRegex ? (
                <>
                  <span style={{ color: '#FF9830', marginRight: 6 }}>●</span>
                  {opt.label}
                </>
              ) : (
                opt.label
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface Props {
  metrics: CustomMetric[];
  onChange: (m: CustomMetric[]) => void;
  availableFields: Array<{ value: string; label: string }>;
  showIconPicker?: boolean;
}

export const CustomMetricList: React.FC<Props> = ({ metrics, onChange, availableFields, showIconPicker = false }) => {
  const addMetric = () => {
    onChange([
      ...metrics,
      {
        id: `m-${Date.now()}`,
        name: 'New Metric',
        icon: showIconPicker ? '📊' : undefined,
        field: '',
        isRegex: false,
        aggregation: 'lastNotNull',
        unit: 'none',
        enabled: true,
        alertThreshold: 80,
        alertColor: COLORS.warning,
        decimals: 1,
      },
    ]);
  };

  const updateMetric = (index: number, partial: Partial<CustomMetric>) => {
    const updated = [...metrics];
    updated[index] = { ...updated[index], ...partial };
    onChange(updated);
  };

  const removeMetric = (index: number) => {
    onChange(metrics.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {metrics.map((metric, idx) => (
        <div
          key={metric.id}
          style={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: '12px',
            background: metric.enabled ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
            position: 'relative',
          }}
        >
          {!metric.isDefault && (
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <IconButton name="trash-alt" variant="destructive" onClick={() => removeMetric(idx)} tooltip="Remove" />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontSize: FONT.label,
                fontWeight: 600,
                color: metric.enabled ? COLORS.text : COLORS.textMuted,
              }}
            >
              <input
                type="checkbox"
                checked={metric.enabled}
                onChange={(e) => updateMetric(idx, { enabled: e.target.checked })}
                style={{ accentColor: COLORS.accent }}
              />
              {metric.name}
            </label>
          </div>

          {metric.enabled && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Row 1: Name and Icon */}
              <div style={{ display: 'grid', gridTemplateColumns: showIconPicker ? '2fr 1fr' : '1fr', gap: 8 }}>
                <Field label="Metric Name">
                  <Input value={metric.name} onChange={(e) => updateMetric(idx, { name: e.currentTarget.value })} />
                </Field>
                {showIconPicker && (
                  <Field label="Icon">
                    <Select
                      options={ICON_EMOJI_OPTIONS}
                      value={metric.icon}
                      onChange={(v) => updateMetric(idx, { icon: v.value })}
                    />
                  </Field>
                )}
              </div>

              {/* Row 2: Field Selection */}
              <div>
                <Field
                  label="Field"
                  description="Select a field or type /regex/ to match multiple (e.g. /CPU.*/ or /Memory|Swap/)"
                >
                  <RegexFieldSelect
                    value={metric.field}
                    options={availableFields}
                    onChange={(v) => updateMetric(idx, { field: v })}
                  />
                </Field>
              </div>

              {/* Row 3: Aggregation, Unit, Decimals */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: 8 }}>
                <Field label="Aggregation">
                  <Select
                    options={REDUCER_OPTIONS}
                    value={metric.aggregation}
                    onChange={(v) => updateMetric(idx, { aggregation: v.value || 'lastNotNull' })}
                  />
                </Field>
                <Field label="Unit">
                  <UnitPicker value={metric.unit} onChange={(v) => updateMetric(idx, { unit: v })} />
                </Field>
                <Field label="Decimals">
                  <Input
                    type="number"
                    value={metric.decimals ?? 1}
                    onChange={(e) => updateMetric(idx, { decimals: Number(e.currentTarget.value) })}
                    min={0}
                    max={6}
                  />
                </Field>
              </div>

              {/* Row 4: Alerts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label="Alert when above (>)">
                  <Input
                    type="number"
                    value={metric.alertThreshold}
                    onChange={(e) => updateMetric(idx, { alertThreshold: Number(e.currentTarget.value) })}
                  />
                </Field>
                <Field label="Alert Color">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ColorPicker color={metric.alertColor} onChange={(c) => updateMetric(idx, { alertColor: c })} />
                    <span style={{ fontSize: FONT.body, color: COLORS.textMuted }}>{metric.alertColor}</span>
                  </div>
                </Field>
              </div>
            </div>
          )}
        </div>
      ))}

      <Button variant="secondary" icon="plus" onClick={addMetric} fullWidth>
        Add Custom Metric
      </Button>
    </div>
  );
};
