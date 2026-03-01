# Network Topology

[![Donate with PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/donate?business=Z9USFAAMBJ29S&no_recurring=0&item_name=Developing+the+Network+Topology+plugin+for+Grafana+to+solve+real+monitoring+issues.+Help+me+keep+the+project+evolving!&currency_code=USD)

_(🇧🇷 Brazilian or Portuguese speaker? [Click here to read this documentation in Portuguese](README-pt.md))_

## Overview / Introduction

Network Topology is a Grafana panel plugin built to display interactive network maps using Cytoscape.js, natively integrated with Grafana's Zabbix Data Source responses.

![Topology View](https://raw.githubusercontent.com/gabrielnsw/network-topology-plugin/main/src/img/topology-view.png)

Instead of relying on external servers or intermediate APIs, this panel leverages the raw data (DataFrames) pulled by Grafana from the official Zabbix plugin. This allows accurate, real-time visualization of interface traffic, packet loss, latency, and status (UP/DOWN) mapped directly onto your drawn devices.

**Key features:**

- **Interactive visual editor:** Add routers, switches, servers, antennas, and customize links and sizes entirely via drag-and-drop within the panel.
- **Full Zabbix integration:** Captures topology element history and metrics strictly from configured queries using correct tracking IDs.
- **Dynamic link inspection:** Edges (connection lines) dynamically shift colors as traffic passes (e.g. gigabits/megabits), visually identifying bottlenecks and physical threshold issues.
- **Built-in local backup:** Native tools allow your entire mapped topology and theme customizations to be exported as a JSON safely or ported into new dashboards seamlessly.
- **Native translation:** Built-in dashboard interface support accommodating English, Spanish, and Portuguese out of the box.

### Gallery

**Add Device & Metrics Setup:**
![Add Device](https://raw.githubusercontent.com/gabrielnsw/network-topology-plugin/main/src/img/add-device.png)

**Link Configuration:**
![Configure Connection](https://raw.githubusercontent.com/gabrielnsw/network-topology-plugin/main/src/img/configure-connection.png)

**Connection Details & Inspector:**
![Connection Details](https://raw.githubusercontent.com/gabrielnsw/network-topology-plugin/main/src/img/connection-details.png)

**Panel Settings & Theming:**
![Settings](https://raw.githubusercontent.com/gabrielnsw/network-topology-plugin/main/src/img/settings.png)

## Requirements

To run this plugin successfully, you must have:

- **Grafana** version 10.0+
- **Zabbix Plugin for Grafana** (Alexander Zobnin's app) installed and configured as a Data Source.
- **Allowed usigned plugin installation**: Ensure your Grafana instance permits custom plugins, uncommenting `allow_loading_unsigned_plugins` and adding `gabrielnsw-noctopology-panel` in `grafana.ini` if necessary.

## Installation

### Using the Grafana CLI (Recommended)

```bash
sudo grafana cli \
    --homepath /usr/share/grafana \
    --pluginUrl https://github.com/gabrielnsw/network-topology-plugin/releases/download/v1.0.13-alpha/gabrielnsw-noctopology-panel-1.0.13-alpha.zip \
    plugins install gabrielnsw-noctopology-panel

# Restart Grafana to load the new plugin
sudo systemctl restart grafana-server
```

Or, your custom url for the plugin zip file previously downloaded:

```bash
sudo grafana cli \
    --homepath /usr/share/grafana \
    --pluginUrl <https://your-custom-plugin-url.com/plugin.zip>\
    plugins install gabrielnsw-noctopology-panel

# Restart Grafana to load the new plugin
sudo systemctl restart grafana-server
```

---

### Manual Installation

- Download the latest release from our [GitHub releases page](https://github.com/gabrielnsw/network-topology-plugin/releases/tag/v1.0.13-alpha).
- Unzip the downloaded file and place the extracted folder into your Grafana plugins directory normally in `/var/lib/grafana/plugins/` or wherever custom plugins reside in your Grafana server.
- Restart the Grafana server to load the new plugin:

```bash
sudo systemctl restart grafana-server
```

---

### Docker Installation

#### Using docker run command with environment variables:

```bash
docker run -d -p 3000:3000 --name=grafana \
  -e "GF_PLUGINS_PREINSTALL=custom-plugin@@https://github.com/gabrielnsw/network-topology-plugin/releases/download/v1.0.13-alpha/gabrielnsw-noctopology-panel-1.0.13-alpha.zip " \
  -e "GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=gabrielnsw-noctopology-panel" \
  grafana/grafana
```

#### Or using docker compose:

- Create create a docker-compose.yaml with the following content:

```yaml
services:
  grafana:
    container_name: grafana
    image: grafana/grafana
    restart: unless-stopped
    environment:
      - GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=gabrielnsw-noctopology-panel
      - 'GF_PLUGINS_PREINSTALL=custom-plugin@@https://github.com/gabrielnsw/network-topology-plugin/releases/download/v1.0.13-alpha/gabrielnsw-noctopology-panel-1.0.13-alpha.zip '
    ports:
        - '3000:3000'
    volumes:
      - 'grafana_storage:/var/lib/grafana'
volumes:
  grafana_storage: {}
```

- Run the validation command to ensure your `docker-compose.yaml` is correctly configured:

```bash
docker compose config
```

- Run docker compose to start the Grafana container:

```bash
docker compose up -d
```

## Getting Started

1. Open or create a dashboard and insert the **Network Topology** panel.
2. In the query section, define standard triggers targeting the Zabbix Data Source.
3. Fetch historical items you require (e.g., `net.if.in`, `net.if.out`, `icmpping`) using the **Metrics** query mode.
4. Open the visual configuration interface on the panel. Start inserting your devices mapping against active hosts found in DataFrames, and connect their tracked interfaces via links.
5. Simply save your Grafana dashboard locally. The plugin natively commits mapped topology JSON definitions securely over Grafana options data.

## Documentation

For comprehensive instructions, Portuguese guides, and advanced configurations (such as custom metrics mapping), please visit our [GitHub repository](https://github.com/gabrielnsw/network-topology-plugin).

_(PT-BR: O guia de uso completo e detalhado 100% em português se encontra em nosso repositório oficial no GitHub)._

## Contributing

Feedback and contributions are highly welcome!
If you want folks to contribute to the plugin or report any issues, please submit a pull request or open an issue on the [Network Topology GitHub page](https://github.com/gabrielnsw/network-topology-plugin).
