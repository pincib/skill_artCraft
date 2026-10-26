# ArtCraft Agent Skills

Quatro skills para orientar trabalhos com a suíte ArtCraft em clientes compatíveis com Agent Skills. O plugin Antigravity adiciona os servidores MCP dos aplicativos instalados e encontrados pela CLI.

| Skill | Aplicativos | Uso principal |
| --- | --- | --- |
| `artcraft-frontend` | FigCraft, DesignCraft | Interfaces, componentes, tokens, responsividade e handoff |
| `artcraft-image` | LightCraft, PhotoCraft, VectorCraft | Revelação RAW, edição raster e ilustração vetorial |
| `artcraft-pitchdeck` | DeckCraft, DesignCraft, PdfCraft | Apresentações, documentos editoriais e PDFs |
| `artcraft-video` | EffectCraft; FilmCraft quando conectado | Motion graphics, edição e finalização de vídeo |

## Instalar

Requer Node.js 18 ou superior.

### Skills no projeto atual

```bash
npx github:pincib/skill_artCraft --local
```

Sem opções de destino, a CLI faz essa instalação local em `.agents/skills/`.

### Plugin Antigravity

```bash
# Global: ~/.gemini/config/plugins/artcraft-suite/
npx github:pincib/skill_artCraft --antigravity

# Local ao workspace: .agents/plugins/artcraft-suite/
npx github:pincib/skill_artCraft --antigravity --local
```

A CLI monta o plugin a partir das skills canônicas de `.agents/skills/` e detecta executáveis ArtCraft em diretórios de instalação comuns no Windows/macOS e no `PATH`. Ela inclui somente os aplicativos encontrados e grava o `mcp_config.json` no plugin. Se nenhum binário for encontrado, as skills são instaladas e a lista MCP fica vazia; instale os aplicativos e execute novamente para atualizar.

Por segurança, FilmCraft e LightCraft não entram na configuração padrão: suas CLIs MCP não oferecem confinamento de arquivos. Para incluí-las conscientemente, passe `--allow-unconfined`; a CLI registra essa exceção no diagnóstico. Os demais servidores com raízes de automação usam a configuração restrita descrita abaixo.

Para instalações em diretórios personalizados, passe `--app-dir DIR` (repita a opção para mais de um diretório). Quando usada, a CLI busca exclusivamente nesses diretórios.

### Codex

```bash
# Instala skills, plugin MCP em ~/.codex/plugins/ e marketplace pessoal
npx github:pincib/skill_artCraft --codex

# Instala no projeto indicado; as raízes MCP usam este workspace
npx github:pincib/skill_artCraft --codex --local

# Seleciona explicitamente o workspace, mesmo ao executar de outra pasta
npx github:pincib/skill_artCraft --codex --local --workspace ./meu-projeto
```

A CLI instala as quatro skills, gera `mcp.json` com os executáveis detectados e registra o plugin em `.agents/plugins/marketplace.json` (ou `~/.agents/plugins/marketplace.json` na instalação global). A instalação do plugin é ativada na interface do Codex, selecionando o marketplace local ArtCraft. A CLI não altera `config.toml`. O arquivo MCP gerado limita as raízes de leitura e gravação ao workspace selecionado; use `--workspace DIR` para escolher esse escopo.

### Ambos os clientes

```bash
npx github:pincib/skill_artCraft --global
```

Isso instala o plugin Antigravity, as skills globais do Codex e o plugin MCP do Codex nos destinos próprios de cada cliente.

Para selecionar apenas um cliente:

```bash
npx github:pincib/skill_artCraft --global --antigravity
npx github:pincib/skill_artCraft --global --codex
```

## Atualizar e remover

```bash
npx github:pincib/skill_artCraft --local --update
npx github:pincib/skill_artCraft --local --uninstall
```

Use `--global`, `--antigravity` ou `--codex` junto das opções para escolher os destinos correspondentes. A remoção apaga apenas a pasta do plugin ArtCraft ou as quatro pastas `artcraft-*` selecionadas.

## Instalação por script

No Windows, `install.ps1` encaminha as opções para a mesma CLI:

```powershell
.\install.ps1 -All
.\install.ps1 -Antigravity -Local
.\install.ps1 -Codex -Uninstall
.\install.ps1 -Codex -Local -Workspace 'C:\projetos\meu-projeto' -AppDir 'C:\Program Files\ArtCraft'
.\install.ps1 -Antigravity -AllowUnconfined
```

No macOS/Linux:

```bash
bash ./install.sh
bash ./install.sh --antigravity --local
bash ./install.sh --codex --uninstall
```

No Windows, o assistente de configuração também pode detectar os apps para um workspace escolhido:

```powershell
.\setup-artcraft.ps1 -ConfigureMcp -WorkspaceRoot 'C:\projetos\meu-projeto'
```

## MCP e escopo de arquivos

- `plugin.json` contém metadados portáveis de Agent Plugins. As skills ficam em uma única fonte; a CLI as copia quando o cliente exige essa estrutura.
- `mcp_config.json` (Antigravity) e `mcp.json` (Codex) são gerados por máquina. Caminhos de executáveis não ficam versionados no repositório.
- Nos servidores que aceitam raízes de automação, a leitura fica limitada a `--workspace`; a gravação fica limitada a `.tmp/`, `renders/` e `exports/` dentro dele. A CLI cria essas pastas ao detectar servidores compatíveis. Os argumentos usam caminhos absolutos no MCP gerado e não dependem do diretório de inicialização do cliente.
- FilmCraft e LightCraft não oferecem esse confinamento em suas CLIs MCP atuais. A opção explícita `--allow-unconfined` os registra sem alegar que as raízes de arquivo estão protegidas.
- `FilmCraft` é opcional. Se o executável não for detectado ou as ferramentas não aparecerem no runtime, `artcraft-video` usa EffectCraft para composição e só indica FFmpeg quando ele está instalado e cabe no escopo solicitado.
- A configuração Antigravity, os metadados do Codex e as ferramentas disponíveis diferem entre clientes. As skills pedem a descoberta de ferramentas em tempo de execução e não assumem assinaturas que não estejam expostas.

## Desenvolvimento e validação

```bash
python -m pip install -r requirements-dev.txt
npm test
python scripts/validate_repo.py
python tests/mock_mcp_smoke.py
npm pack --dry-run
```

O CI executa validação de JSON/YAML, testes da CLI, verificação do pacote e handshake contra um servidor MCP simulado. Nenhum executável ArtCraft é necessário para essas verificações.

## Licença

MIT. As marcas e os aplicativos ArtCraft pertencem aos respetivos mantenedores.
