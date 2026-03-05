# Changelog

> 🇧🇷 [Leia em Português](CHANGELOG-pt.md)

## [2.0.1-beta] — 2026-03-04

Full rewrite. Moved from Cytoscape.js to **ReactFlow** and renamed the plugin from `gabrielnsw-noctopology-panel` to `gabrielnsw-nswtopology-panel`.

- New rendering engine (ReactFlow / @xyflow/react)
- Redesigned UI — node cards, edge labels, tooltips, sidebar, modals
- Weathermap links with utilization-based colors
- Sparkline graphs on link hover
- Custom metrics per node and per connection, with regex field matching
- Grafana unit formatting via `@grafana/data`
- Alert thresholds with configurable colors
- Node status detection from any data source field
- Grid snapping, mini-map, legend, search
- Backup/restore with v1 import (converts old Cytoscape topology)
- Welcome screen with guided setup
- Donate card (can be hidden)

**Breaking:** plugin ID changed. Dashboard JSON from v1 needs to be imported via "Import V1 Backup".

---

## [1.0.13-alpha] — 2026-02-23

First public release, built on Cytoscape.js.

- Visual editor with drag-and-drop
- Zabbix integration via DataFrames
- Traffic-based link colors
- JSON backup/restore
- English, Spanish, Portuguese
