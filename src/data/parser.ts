import { DataFrame, FieldType } from '@grafana/data';
import { ZabbixHost, ParsedMetrics, CustomMetric } from '../types';

// parse grafana data frames into a host/metric map for the canvas
export const parseDataFrames = (seriesList: DataFrame[]): ParsedMetrics => {
  const hosts: Record<string, ZabbixHost> = {};
  const fieldNames: string[] = [];
  const hostFieldMap: Record<string, string[]> = {};

  if (!seriesList) {
    return { hosts, fieldNames, hostNames: [], hostFieldMap };
  }

  for (const series of seriesList) {
    for (const field of series.fields) {
      if (field.type !== FieldType.number && (field.type as unknown as string) !== 'number') {
        continue;
      }

      let hostName = field.labels?.host || field.labels?.hostname;
      let item = field.labels?.item;

      const fieldName = field.config?.displayName || field.config?.displayNameFromDS || field.name;

      if (!hostName && fieldName) {
        const parts = fieldName.split(':').map((s: string) => s.trim());
        if (parts.length >= 2) {
          hostName = parts[0];
          item = parts.slice(1).join(': ');
        }
      }

      hostName = hostName || 'Unknown Device';
      item = item || fieldName || 'Unknown Metric';

      const qualifiedName = `${hostName}: ${item}`;
      if (!fieldNames.includes(qualifiedName)) {
        fieldNames.push(qualifiedName);
      }

      if (!hostFieldMap[hostName]) {
        hostFieldMap[hostName] = [];
      }
      if (!hostFieldMap[hostName].includes(item)) {
        hostFieldMap[hostName].push(item);
      }

      if (!hosts[hostName]) {
        hosts[hostName] = {
          name: hostName,
          ip: '',
          ping: 1,
          loss: 0,
          latency: 0,
          interfaces: {},
          items: {},
        };
      }

      const vals = field.values;
      let val: number | string = 0;
      for (let i = vals.length - 1; i >= 0; i--) {
        if (vals[i] != null) {
          val = vals[i];
          break;
        }
      }

      const unit = field.config?.unit || '';
      hosts[hostName].items[item] = val;
      hosts[hostName].items[qualifiedName] = val;

      const itemLower = item.toLowerCase();

      if (itemLower.includes('loss') || itemLower.includes('perda')) {
        hosts[hostName].loss = val;
      } else if (itemLower.includes('ping') || itemLower.includes('icmp ping')) {
        hosts[hostName].ping = val;
      } else if (
        itemLower.includes('latency') ||
        itemLower.includes('latência') ||
        itemLower.includes('response time') ||
        itemLower.includes('tempo de resposta')
      ) {
        hosts[hostName].latency = val;
      }

      let ifaceName = 'Default';
      let metricName = item;

      const ifaceMatch = item.match(/Interface\s+([a-zA-Z0-9\-\.\/]+):\s+(.*)/i);
      if (ifaceMatch) {
        ifaceName = ifaceMatch[1].trim();
        metricName = ifaceMatch[2].trim();
      } else if (item.includes(':')) {
        const parts = item.split(':').map((p: string) => p.trim());
        ifaceName = parts[0];
        metricName = parts.slice(1).join(': ');
      }

      if (!hosts[hostName].interfaces[ifaceName]) {
        hosts[hostName].interfaces[ifaceName] = {};
      }

      hosts[hostName].interfaces[ifaceName][metricName] = {
        value: val,
        units: unit === 'bps' ? 'bps' : unit,
        itemid: '',
      };
    }
  }

  if (hosts['Unknown Device']) {
    if (Object.keys(hosts['Unknown Device'].interfaces).length === 0) {
      delete hosts['Unknown Device'];
    }
  }

  const hostNames = Object.keys(hosts).filter((h) => h !== 'Unknown Device');

  return { hosts, fieldNames, hostNames, hostFieldMap };
};

// format bps to human readable (Kbps, Mbps, Gbps)
export const formatTrafficValue = (value: number): string => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)} Gbps`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)} Mbps`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)} Kbps`;
  }
  return `${value.toFixed(2)} bps`;
};

// apply aggregation (mean, sum, max, min, last) to values
export const reduceFieldValues = (values: number[], aggregation: string): number => {
  if (values.length === 0) {
    return 0;
  }

  switch (aggregation) {
    case 'sum':
      return values.reduce((acc, curr) => acc + curr, 0);
    case 'max':
      return Math.max(...values);
    case 'min':
      return Math.min(...values);
    case 'lastNotNull':
      return values[values.length - 1];
    case 'mean':
    default:
      return values.reduce((acc, curr) => acc + curr, 0) / values.length;
  }
};

// evaluate a custom metric for a host — supports regex field matching
export const evaluateCustomMetric = (
  metric: CustomMetric,
  hostName: string,
  hostFieldMap: Record<string, string[]>,
  hosts: Record<string, ZabbixHost>
): number | null => {
  if (!metric.enabled || !metric.field) {
    return null;
  }

  const availableFields = hostFieldMap[hostName] || [];
  let matchedFields: string[] = [];

  const fieldValue = metric.field;
  const regexMatch = fieldValue.match(/^\/(.+)\/([gimsuy]*)$/);

  if (regexMatch) {
    try {
      const regex = new RegExp(regexMatch[1], regexMatch[2] || 'i');
      matchedFields = availableFields.filter((f) => regex.test(f));
    } catch {
      matchedFields = [];
    }
  } else {
    try {
      const regex = new RegExp(fieldValue, 'i');
      matchedFields = availableFields.filter((f) => regex.test(f));
    } catch {
      matchedFields = [];
    }
    if (matchedFields.length === 0) {
      matchedFields = availableFields.indexOf(fieldValue) !== -1 ? [fieldValue] : [];
    }
  }

  if (matchedFields.length === 0) {
    return null;
  }

  const validValues = matchedFields
    .map((f) => hosts[hostName]?.items[f])
    .filter((v): v is number => typeof v === 'number');

  if (validValues.length === 0) {
    return null;
  }

  return reduceFieldValues(validValues, metric.aggregation);
};
