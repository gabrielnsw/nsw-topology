# Changelog

## [2.0.1-beta] — 2026-03-04

Reescrita total. Saiu o Cytoscape.js, entrou o **ReactFlow**. Plugin renomeado de `gabrielnsw-noctopology-panel` pra `gabrielnsw-nswtopology-panel`.

- Novo motor de renderização (ReactFlow / @xyflow/react)
- Interface refeita do zero — cards, labels, tooltips, sidebar, modais
- Links weathermap com cores por utilização
- Sparkline de tráfego no hover dos links
- Métricas customizadas por nó e por conexão, com regex
- Formatação de unidades do Grafana via `@grafana/data`
- Alertas com threshold e cor configurável
- Detecção de status do nó por qualquer campo
- Grid, mini-mapa, legenda, busca
- Backup/restore com importação de backup da v1 (converte topologia antiga)
- Tela de boas-vindas
- Card de doação (dá pra esconder)

**Quebra compatibilidade:** ID do plugin mudou. JSON da v1 precisa ser importado via "Importar Backup V1".

---

## [1.0.13-alpha] — 2026-02-23

Primeira release pública, feita com Cytoscape.js.

- Editor visual drag-and-drop
- Integração Zabbix via DataFrames
- Cores nos links baseadas no tráfego
- Backup/restore em JSON
- Inglês, espanhol, português
