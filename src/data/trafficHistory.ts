import { NodeConfig, ConnectionConfig } from '../types';

export type TrafficHistoryPoint = { time: number; dl: number; ul: number };

function fieldMatches(field: any, targetField: string, hostName: string): boolean {
  const fName = field.config?.displayName || field.config?.displayNameFromDS || field.name || '';
  const fHost = field.labels?.host || field.labels?.hostname || '';
  const hostMatch = fHost === hostName || fName.indexOf(hostName) >= 0 || !fHost;
  const nameMatch = fName.indexOf(targetField) >= 0 || fName === targetField;
  return hostMatch && nameMatch;
}

function extractFieldValues(field: any): number[] {
  return field.values.toArray ? field.values.toArray() : field.values;
}

export function getTrafficHistory(
  dataSeries: any[],
  srcNode: NodeConfig | undefined,
  conn: ConnectionConfig
): TrafficHistoryPoint[] {
  if (!dataSeries || !srcNode || !conn.downloadField) {
    return [];
  }

  const hostName = srcNode.hostName || srcNode.name;
  let dlTimes: number[] = [];
  let dlVals: number[] = [];
  let ulVals: number[] = [];

  for (const series of dataSeries) {
    if (!series.fields) {
      continue;
    }

    let timeField = series.fields.find((f: any) => f.type === 'time');
    if (!timeField) {
      continue;
    }

    for (const field of series.fields) {
      if (field.type === 'time') {
        continue;
      }
      if (dlVals.length === 0 && fieldMatches(field, conn.downloadField, hostName)) {
        dlTimes = extractFieldValues(timeField);
        dlVals = extractFieldValues(field);
      }
      if (conn.uploadField && ulVals.length === 0 && fieldMatches(field, conn.uploadField, hostName)) {
        ulVals = extractFieldValues(field);
      }
    }
  }

  if (dlVals.length === 0) {
    return [];
  }

  const history: TrafficHistoryPoint[] = [];
  const len = dlTimes.length;

  for (let i = 0; i < len; i++) {
    if (dlTimes[i] == null || dlVals[i] == null) {
      continue;
    }
    history.push({
      time: Number(dlTimes[i]),
      dl: Number(dlVals[i]) || 0,
      ul: Number(ulVals[i]) || 0,
    });
  }

  return history;
}
