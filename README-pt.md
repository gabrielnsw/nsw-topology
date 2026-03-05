# NSW Topology — Topologia de Rede pro Grafana

> 🇺🇸 [Read in English](README.md)

Plugin de painel pro Grafana que renderiza mapas de rede interativos com dados em tempo real.

![Topology View](src/img/topology_view.png)

---

<div align="center">

### ☕ Curtiu o plugin?

Manter um projeto open-source dá um trabalho danado. Se o NSW Topology te ajudou de alguma forma, qualquer contribuição é bem-vinda e me ajuda a continuar evoluindo o projeto.

[![Doar via PayPal](https://img.shields.io/badge/Doar-PayPal-blue?style=for-the-badge&logo=paypal)](https://www.paypal.com/donate/?business=Z9USFAAMBJ29S&no_recurring=0&item_name=Developing+the+Network+Topology+plugin+for+Grafana+to+solve+real+monitoring+issues.+Help+me+keep+the+project+evolving%21&currency_code=BRL)

**Valeu! ❤️**

</div>

---

## Pra que serve

Basicamente, ele transforma um painel do Grafana num mapa de rede onde você arrasta os nós, conecta com links e tudo atualiza ao vivo com os dados do Zabbix (ou outro data source que retorne time series).

O que dá pra fazer:

- Arrastar e soltar nós com hosts detectados automaticamente do data source
- Links estilo weathermap — muda de cor conforme a utilização (verde → amarelo → vermelho)
- Gráfico de tráfego ao passar o mouse nos links
- Métricas customizadas por nó e por conexão (CPU, memória, sinal, latência, o que quiser)
- Regex pra buscar campos de métrica
- Alertas com cor configurável
- Status do nó (online/offline) baseado em qualquer campo
- Backup e restore, com importação de backup da v1
- Aparência 100% customizável — ícones, cores, tamanhos, grid

## Prints

### Adicionando um nó

Seleciona o host, e o plugin já detecta as métricas disponíveis e pré-preenche.

![Adicionar Nó](src/img/add_node.png)

### Configurando uma conexão

Escolhe a interface, define download/upload, capacidade, e estilo da linha.

![Configurar Conexão](src/img/configure_conection.png)

### Tooltip do nó

Passar o mouse em cima de um nó mostra status, uptime, métricas e conexões.

![Info do Nó](src/img/node_info.png)

### Tooltip da conexão

Passar o mouse no link mostra tráfego, métricas e o gráfico do histórico.

![Info da Conexão](src/img/connection_info.png)

- **Instalação de plugin não assinado**: Certifique-se de que sua instância do Grafana permite plugins customizados, descomentando `allow_loading_unsigned_plugins` e adicionando `gabrielnsw-nswtopology-panel` no `grafana.ini` se necessário.

## Instalação

> 💡 **Documentação de instalação contribuída por [@marcelobaptista](https://github.com/marcelobaptista)**

### Catálogo do Grafana

> ⏳ **Em breve** — ainda não aprovado no catálogo do Grafana.\
> Por enquanto, use os métodos alternativos abaixo.

```bash
# Quando disponível:
grafana cli plugins install gabrielnsw-nswtopology-panel
sudo systemctl restart grafana-server
```

### Usando o Grafana CLI (Recomendado)

```bash
sudo grafana cli \
  --homepath /usr/share/grafana \
  --pluginUrl https://github.com/gabrielnsw/nsw-topology/releases/download/v2.0.1-beta/gabrielnsw-nswtopology-panel-2.0.1-beta.zip \
  plugins install gabrielnsw-nswtopology-panel

# Reinicie o Grafana para carregar o novo plugin
sudo systemctl restart grafana-server
```

Ou, sua URL customizada para o arquivo zip do plugin previamente baixado:

```bash
sudo grafana cli \
  --homepath /usr/share/grafana \
  --pluginUrl <https://sua-url-do-plugin-customizada.com/plugin.zip>\
  plugins install gabrielnsw-nswtopology-panel

# Reinicie o Grafana para carregar o novo plugin
sudo systemctl restart grafana-server
```

### Instalação Manual

- Baixe a versão mais recente na nossa [página de releases do GitHub](https://github.com/gabrielnsw/nsw-topology/releases).
- Descompacte o arquivo baixado e coloque a pasta extraída no diretório de plugins do Grafana, normalmente em `/var/lib/grafana/plugins/`
  ou onde quer que os plugins customizados fiquem no seu servidor Grafana.
- Reinicie o servidor Grafana para carregar o novo plugin:

```bash
sudo systemctl restart grafana-server
```

### Docker

#### Com `docker run`:

```bash
docker run -d -p 3000:3000 --name=grafana \
  -e "GF_PLUGINS_PREINSTALL=custom-plugin@@https://github.com/gabrielnsw/nsw-topology/releases/download/v2.0.1-beta/gabrielnsw-nswtopology-panel-2.0.1-beta.zip" \
  -e "GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=gabrielnsw-nswtopology-panel" \
  grafana/grafana
```

#### Com `docker compose`:

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
docker compose config   # valida
docker compose up -d    # sobe
```

> **Nota:** Estes exemplos usam a versão `v2.0.1-beta`. Lembre-se sempre de checar a tag da versão mais recente nas próximas instalações!

## Configuração do data source

Funciona melhor com **Zabbix** (via [plugin do Alexander Zobnin](https://github.com/alexanderzobnin/grafana-zabbix)), mas qualquer data source que retorne time series com labels de host/campo serve.

### Exemplos de queries Zabbix

![Exemplo 1](src/img/example_zabbix_query1.png)

![Exemplo 2](src/img/example_zabbix_query2.png)

![Exemplo 3](src/img/example_zabbix_query3.png)

## Como usar

1. Cria uma visualização e seleciona **NSW Topology**
2. Configura as queries do data source (veja os exemplos acima)
3. Clica no **+** na sidebar pra adicionar nós
4. Arrasta de um handle até outro nó pra criar conexões
5. Botão direito em qualquer nó ou conexão pra editar/deletar
6. Sidebar tem backup, busca e configurações

## Requisitos

- Grafana **10.0+**
- Node.js **22+** (só pra desenvolvimento)

## Build

```bash
git clone https://github.com/gabrielnsw/nsw-topology.git
cd nsw-topology
npm install
npm run dev    # watch mode
npm run build  # produção
```

## Licença

[Apache 2.0](LICENSE)

## Agradecimentos

- [@marcelobaptista](https://github.com/marcelobaptista) — documentação da instalação
