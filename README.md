# NSW Topology — Network Topology for Grafana

> 🇧🇷 [Leia em Português](README-pt.md)

A Grafana panel plugin for building interactive network maps with live data.

![Topology View](src/img/topology_view.png)

---

<div align="center">

### ☕ Like the plugin? Buy me a coffee

Keeping an open-source project going takes real effort. If NSW Topology has helped you out, any contribution helps me keep working on it.

[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue?style=for-the-badge&logo=paypal)](https://www.paypal.com/donate/?business=Z9USFAAMBJ29S&no_recurring=0&item_name=Developing+the+Network+Topology+plugin+for+Grafana+to+solve+real+monitoring+issues.+Help+me+keep+the+project+evolving%21&currency_code=BRL)

**Thanks! ❤️**

</div>

---

## What it does

It turns a Grafana panel into a drag-and-drop network map. You place nodes, connect them, and everything updates in real time from Zabbix (or any data source that returns time-series with host/field labels).

What you get:

- Drag-and-drop nodes with auto-detected hosts
- Weathermap links — color changes based on utilization (green → yellow → red)
- Sparkline graph on link hover showing traffic history
- Custom metrics per node and connection (CPU, memory, signal, latency, whatever)
- Regex-based field matching for flexible metric setup
- Alert thresholds with configurable colors
- Node status (online/offline) based on any field
- Backup & restore, including v1 import
- Fully customizable look — icons, colors, sizes, grid snapping

## Screenshots

### Adding a node

Pick a host and the plugin auto-detects available metrics.

![Add Node](src/img/add_node.png)

### Configuring a connection

Select the interface, set download/upload fields, capacity, and line style.

![Configure Connection](src/img/configure_conection.png)

### Node tooltip

Hover a node to see status, uptime, metrics, and connections.

![Node Info](src/img/node_info.png)

### Connection tooltip

Hover a link to see traffic, metrics, and a sparkline of recent history.

![Connection info](src/img/connection_info.png)

## Installation

### Grafana CLI

> ⏳ **Coming soon** — not submitted to the Grafana catalog yet.\
> Use manual install or Docker for now.

```bash
# Once available:
grafana cli plugins install gabrielnsw-nswtopology-panel
sudo systemctl restart grafana-server
```

### Manual

1. Grab the latest release from [GitHub Releases](https://github.com/gabrielnsw/nsw-topology/releases)
2. Extract to your Grafana plugins folder (`/var/lib/grafana/plugins/`)
3. Restart Grafana

### Docker

> Docker docs by [@marcelobaptista](https://github.com/marcelobaptista)

#### With `docker run`:

```bash
docker run -d -p 3000:3000 --name=grafana \
  -e "GF_PLUGINS_PREINSTALL=custom-plugin@@https://github.com/gabrielnsw/nsw-topology/releases/download/v2.0.1-beta/gabrielnsw-nswtopology-panel-2.0.1-beta.zip" \
  -e "GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=gabrielnsw-nswtopology-panel" \
  grafana/grafana
```

#### With `docker compose`:

```yaml
services:
  grafana:
    container_name: grafana
    image: grafana/grafana
    restart: unless-stopped
    environment:
      - GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=gabrielnsw-nswtopology-panel
      - 'GF_PLUGINS_PREINSTALL=custom-plugin@@https://github.com/gabrielnsw/nsw-topology/releases/download/v2.0.1-beta/gabrielnsw-nswtopology-panel-2.0.1-beta.zip'
    ports:
      - '3000:3000'
    volumes:
      - 'grafana_storage:/var/lib/grafana'
volumes:
  grafana_storage: {}
```

```bash
docker compose config   # validate
docker compose up -d    # start
```

> **Note:** These examples use `v2.0.1-beta`. You should always check for the latest release tag.

## Data source

Works best with **Zabbix** through [Alexander Zobnin's plugin](https://github.com/alexanderzobnin/grafana-zabbix), but anything that returns time-series with host/field labels will work.

### Zabbix query examples

![Query example 1](src/img/example_zabbix_query1.png)

![Query example 2](src/img/example_zabbix_query2.png)

![Query example 3](src/img/example_zabbix_query3.png)

## Getting started

1. Create a panel and pick **NSW Topology** as the visualization
2. Set up your data source queries (see examples above)
3. Hit the **+** in the sidebar to add nodes
4. Drag from one node handle to another to connect them
5. Right-click any node or connection to edit/delete
6. Use the sidebar for backups, search, and settings

## Requirements

- Grafana **10.0+**
- Node.js **22+** (dev only)

## Building from source

```bash
git clone https://github.com/gabrielnsw/nsw-topology.git
cd nsw-topology
npm install
npm run dev    # watch mode
npm run build  # production
```

## License

[Apache 2.0](LICENSE)

## Thanks

- [@marcelobaptista](https://github.com/marcelobaptista) — Docker installation docs
