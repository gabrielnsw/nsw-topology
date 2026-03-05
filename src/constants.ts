import {
  AppearanceConfig,
  ColorsConfig,
  InteractionConfig,
  GeneralConfig,
  TopologyOptions,
  MetricConfig,
} from './types';

export const DEFAULT_GENERAL: GeneralConfig = {
  title: '',
  titleSize: 18,
};

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  bgColor: '#111217',
  showGrid: true,
  gridSize: 20,
  gridColor: '#1e2130',
  showDonateCard: true,
};

export const DEFAULT_COLORS: ColorsConfig = {
  online: '#4ade80',
  offline: '#f24955',
  alert: '#f59e0b',
};

export const DEFAULT_INTERACTION: InteractionConfig = {
  enableZoom: true,
  enablePan: true,
  showMiniMap: true,
  showLegend: true,
  showWelcome: true,
};

export const DEFAULT_OPTIONS: TopologyOptions = {
  general: DEFAULT_GENERAL,
  nodes: [],
  connections: [],
  appearance: DEFAULT_APPEARANCE,
  colors: DEFAULT_COLORS,
  interaction: DEFAULT_INTERACTION,
};

export const DEFAULT_NODE_WIDTH = 130;
export const DEFAULT_NODE_HEIGHT = 90;
export const DEFAULT_NODE_BG = '#1a1a2e';
export const DEFAULT_ICON_COLOR = '#ffffff';
export const DEFAULT_TEXT_COLOR = '#e0e0f0';
export const DEFAULT_TEXT_SIZE = 12;
export const DEFAULT_ICON_SIZE = 32;

// grafana named colors -> hex
const GRAFANA_COLOR_MAP: Record<string, string> = {
  green: '#73BF69',
  'dark-green': '#37872D',
  'semi-dark-green': '#56A64B',
  'light-green': '#96D98D',
  'super-light-green': '#C8F2C2',
  yellow: '#FADE2A',
  'dark-yellow': '#E0B400',
  'semi-dark-yellow': '#F2CC0C',
  'light-yellow': '#FFEE52',
  'super-light-yellow': '#FFF899',
  red: '#F2495C',
  'dark-red': '#C4162A',
  'semi-dark-red': '#E02F44',
  'light-red': '#FF7383',
  'super-light-red': '#FFA6B0',
  blue: '#5794F2',
  'dark-blue': '#1F60C4',
  'semi-dark-blue': '#3274D9',
  'light-blue': '#8AB8FF',
  'super-light-blue': '#C0D8FF',
  orange: '#FF9830',
  'dark-orange': '#FA6400',
  'semi-dark-orange': '#FF780A',
  'light-orange': '#FFB357',
  'super-light-orange': '#FFCB7D',
  purple: '#B877D9',
  'dark-purple': '#8F3BB8',
  'semi-dark-purple': '#A352CC',
  'light-purple': '#CA95E5',
  'super-light-purple': '#DEB6F2',
  white: '#FFFFFF',
  transparent: 'transparent',
};

// resolve grafana color name or hex to a usable hex value
export const resolveGrafanaColor = (color: string): string => {
  if (!color) {
    return '#4b5563';
  }
  if (color.startsWith('#') || color.startsWith('rgb')) {
    return color;
  }
  return GRAFANA_COLOR_MAP[color] || color;
};

export const DEFAULT_METRIC: MetricConfig = {
  field: '',
  enabled: false,
  alertThreshold: 80,
  alertColor: '#f59e0b',
};

// weathermap thresholds — color based on link usage %
export const WEATHERMAP_THRESHOLDS = [
  { max: 85, color: '#4ade80' },
  { max: 90, color: '#facc15' },
  { max: 95, color: '#fb923c' },
  { max: Number.POSITIVE_INFINITY, color: '#ef4444' },
];

export const LINE_STYLE_OPTIONS = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

export const CAPACITY_OPTIONS = [
  { value: 10, label: '10 Mb' },
  { value: 100, label: '100 Mb' },
  { value: 1000, label: '1 Gb' },
  { value: 10000, label: '10 Gb' },
  { value: 20000, label: '20 Gb' },
  { value: 40000, label: '40 Gb' },
  { value: 60000, label: '60 Gb' },
  { value: 100000, label: '100 Gb' },
];

export const ICON_SIZE_OPTIONS = [
  { value: '16', label: '16' },
  { value: '32', label: '32' },
  { value: '64', label: '64' },
  { value: '96', label: '96' },
  { value: '128', label: '128' },
];

export const TEXT_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '12', label: '12' },
  { value: '14', label: '14' },
  { value: '16', label: '16' },
  { value: '18', label: '18' },
  { value: '20', label: '20' },
  { value: '24', label: '24' },
];

export const REDUCER_OPTIONS = [
  { value: 'mean', label: 'Mean' },
  { value: 'sum', label: 'Sum' },
  { value: 'max', label: 'Max' },
  { value: 'min', label: 'Min' },
  { value: 'lastNotNull', label: 'Last' },
];

export const ICON_EMOJI_OPTIONS = [
  { value: '🚀', label: '🚀 Speed' },
  { value: '🌡', label: '🌡 Temperature' },
  { value: '⚡', label: '⚡ Power' },
  { value: '💻', label: '💻 CPU' },
  { value: '🧠', label: '🧠 Memory' },
  { value: 'TX', label: 'TX Signal' },
  { value: 'RX', label: 'RX Signal' },
  { value: '🔋', label: '🔋 Battery' },
  { value: '💾', label: '💾 Disk' },
  { value: '🔄', label: '🔄 Sync' },
  { value: '⏱', label: '⏱ Latency' },
  { value: '📉', label: '📉 Loss' },
  { value: '🌐', label: '🌐 Network' },
  { value: '🔌', label: '🔌 Interface' },
  { value: '📡', label: '📡 Antenna' },
  { value: '🖥', label: '🖥 Server' },
  { value: '⬆', label: '⬆ Upload' },
  { value: '⬇', label: '⬇ Download' },
  { value: '🔥', label: '🔥 Hot' },
  { value: '❄', label: '❄ Cold' },
  { value: '⚙', label: '⚙ Config' },
  { value: '📊', label: '📊 Chart' },
];

// patterns for auto-detecting zabbix metric fields
export const METRIC_PATTERNS: Record<string, string[]> = {
  cpu: ['cpu', 'processor', 'processador', 'utilização do processador'],
  memory: ['memory', 'memória', 'memoria', 'ram'],
  temperature: ['temperature', 'temperatura', 'temp', 'thermal'],
  loss: ['loss', 'perda', 'packet loss', 'perda de pacotes'],
  responseTime: ['response time', 'tempo de resposta', 'latency', 'latência', 'latencia'],
  ping: ['ping', 'icmp'],
  uptime: ['uptime', 'tempo de atividade', 'system uptime'],
};

// tries to match a field name against known patterns
export const autoDetectField = (fields: string[], patterns: string[]): string => {
  for (const field of fields) {
    const lower = field.toLowerCase();
    for (const pattern of patterns) {
      if (lower.includes(pattern)) {
        return field;
      }
    }
  }
  return '';
};
