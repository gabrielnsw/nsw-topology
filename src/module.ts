import { PanelPlugin } from '@grafana/data';
import { TopologyOptions } from './types';
import { TopologyPanel } from './components/TopologyPanel';
import {
  DEFAULT_GENERAL,
  DEFAULT_APPEARANCE,
  DEFAULT_COLORS,
  DEFAULT_INTERACTION,
} from './constants';

export const plugin = new PanelPlugin<TopologyOptions>(TopologyPanel)
  .setNoPadding()
  .setPanelOptions((builder) => {
    builder
      .addTextInput({
        path: 'general.title',
        name: 'Title',
        defaultValue: DEFAULT_GENERAL.title,
        category: ['General'],
      })
      .addSliderInput({
        path: 'general.titleSize',
        name: 'Title Font Size',
        defaultValue: DEFAULT_GENERAL.titleSize,
        settings: { min: 10, max: 32, step: 1 },
        category: ['General'],
      })
      .addColorPicker({
        path: 'appearance.bgColor',
        name: 'Background Color',
        defaultValue: DEFAULT_APPEARANCE.bgColor,
        category: ['Appearance'],
      })
      .addBooleanSwitch({
        path: 'appearance.showGrid',
        name: 'Show Grid',
        defaultValue: DEFAULT_APPEARANCE.showGrid,
        category: ['Appearance'],
      })
      .addSliderInput({
        path: 'appearance.gridSize',
        name: 'Grid Size',
        defaultValue: DEFAULT_APPEARANCE.gridSize,
        settings: { min: 5, max: 50, step: 5 },
        category: ['Appearance'],
        showIf: (opts) => opts.appearance?.showGrid === true,
      })
      .addColorPicker({
        path: 'appearance.gridColor',
        name: 'Grid Color',
        defaultValue: DEFAULT_APPEARANCE.gridColor,
        category: ['Appearance'],
        showIf: (opts) => opts.appearance?.showGrid === true,
      })

      .addColorPicker({
        path: 'colors.online',
        name: 'Online',
        defaultValue: DEFAULT_COLORS.online,
        category: ['Colors'],
      })
      .addColorPicker({
        path: 'colors.offline',
        name: 'Offline',
        defaultValue: DEFAULT_COLORS.offline,
        category: ['Colors'],
      })
      .addColorPicker({
        path: 'colors.alert',
        name: 'Alert',
        defaultValue: DEFAULT_COLORS.alert,
        category: ['Colors'],
      })
      .addBooleanSwitch({
        path: 'interaction.enablePan',
        name: 'Enable Pan',
        defaultValue: DEFAULT_INTERACTION.enablePan,
        category: ['Interaction'],
      })
      .addBooleanSwitch({
        path: 'interaction.showMiniMap',
        name: 'Show Mini-map',
        defaultValue: DEFAULT_INTERACTION.showMiniMap,
        category: ['Interaction'],
      })
      .addBooleanSwitch({
        path: 'interaction.showLegend',
        name: 'Show Legend',
        defaultValue: DEFAULT_INTERACTION.showLegend,
        category: ['Interaction'],
      })
      .addBooleanSwitch({
        path: 'interaction.showWelcome',
        name: 'Show Welcome Screen',
        defaultValue: DEFAULT_INTERACTION.showWelcome,
        category: ['Interaction'],
      })
      .addBooleanSwitch({
        path: 'appearance.showDonateCard',
        name: 'Show Donate Card',
        description: 'Show or hide the donate card in the topology view. If hidden, a donate icon will appear in the sidebar.',
        defaultValue: DEFAULT_APPEARANCE.showDonateCard,
        category: ['Appearance'],
      });

    return builder;
  });

