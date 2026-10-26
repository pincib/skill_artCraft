# ArtCraft Agent Skills (Antigravity & OpenAI Codex)

Coleção de **Agent Skills** e integração **MCP (Model Context Protocol)** para automatizar a suíte de aplicativos criativos open-source **[ArtCraft](https://getartcraft.com)** (escrita em Rust pela [`storytold`](https://github.com/storytold)).

Projetado para funcionar com 1 comando tanto no **Google Antigravity (Gemini)** quanto no **OpenAI Codex / ChatGPT Desktop**.

---

## 🎨 As 4 Skills Incluídas

| Skill | Aplicativos ArtCraft Integrados | Descrição da Tarefa |
| :--- | :--- | :--- |
| **`artcraft-video`** | `FilmCraft` + `EffectCraft` | Linha do tempo de vídeo, cortes, vinhetas, animação por keyframes, motion graphics e renderização de vídeo. |
| **`artcraft-image`** | `LightCraft` + `PhotoCraft` + `VectorCraft` | Revelação RAW de fotos, edição em camadas PSD/PCRAFT, retoque e ilustração vetorial SVG. |
| **`artcraft-pitchdeck`** | `DeckCraft` + `DesignCraft` + `PdfCraft` | Estruturação de pitch decks, diagramação editorial de relatórios/one-pagers e compilação de PDFs finais. |
| **`artcraft-frontend`** | `FigCraft` + `DesignCraft` | Design de telas e UI, prototipagem, design tokens, exportação de assets SVG/PNG e manuais de handoff. |

---

## 🚀 Como Instalar (NPX / PNPM)

Qualquer pessoa em qualquer projeto pode instalar diretamente via GitHub com **um único comando**, sem precisar clonar manualmente:

### 1. No Projeto Atual (`./.agents/skills/`)
```bash
# Usando npx:
npx github:pincib/skill_artCraft

# Usando pnpm:
pnpm dlx github:pincib/skill_artCraft

# Ou usando a CLI de skills da comunidade:
npx skills add pincib/skill_artCraft
pnpm dlx skills add pincib/skill_artCraft
```

### 2. Globalmente na Máquina (Antigravity e Codex)
```bash
# Usando npx:
npx github:pincib/skill_artCraft --global

# Usando pnpm:
pnpm dlx github:pincib/skill_artCraft --global
```

---

## 📦 Instalação via Git Clone

Se preferir clonar o repositório:

```bash
git clone https://github.com/pincib/skill_artCraft.git
cd skill_artCraft
```

- **No Windows (PowerShell):**
  ```powershell
  .\install.ps1 -All       # Instala globalmente para Antigravity e Codex
  .\install.ps1 -Local     # Instala no projeto atual
  ```
- **No Linux / macOS (Bash):**
  ```bash
  chmod +x install.sh
  ./install.sh             # Instala globalmente
  ./install.sh --local     # Instala no projeto atual
  ```

---

## ⚙️ Configuração dos Servidores MCP

Para que o agente consiga chamar os comandos dos aplicativos em background, configure os servidores MCP nos seus agentes:

### Google Antigravity (`~/.gemini/config/mcp_config.json`)
```json
{
  "mcpServers": {
    "effectcraft": {
      "command": "C:/Program Files/EffectCraft/effectcraft-cli.exe",
      "args": ["mcp", "--automation-read-root", "C:/Users/<seu-usuario>", "--automation-write-root", "C:/Users/<seu-usuario>"]
    },
    "filmcraft": {
      "command": "C:/Program Files/FilmCraft/filmcraft-cli.exe",
      "args": ["mcp", "--automation-read-root", "C:/Users/<seu-usuario>", "--automation-write-root", "C:/Users/<seu-usuario>"]
    },
    "lightcraft": {
      "command": "C:/Program Files/LightCraft/lightcraft-cli.exe",
      "args": ["mcp", "--compact"]
    },
    "photocraft": {
      "command": "C:/Program Files/PhotoCraft/photocraft-cli.exe",
      "args": ["mcp", "--automation-read-root", "C:/Users/<seu-usuario>", "--automation-write-root", "C:/Users/<seu-usuario>"]
    },
    "vectorcraft": {
      "command": "C:/Program Files/VectorCraft/vectorcraft-cli.exe",
      "args": ["mcp", "--headless", "--automation-read-root", "C:/Users/<seu-usuario>", "--automation-write-root", "C:/Users/<seu-usuario>"]
    },
    "deckcraft": {
      "command": "C:/Program Files/DeckCraft/deckcraft-cli.exe",
      "args": ["mcp", "--automation-read-root", "C:/Users/<seu-usuario>", "--automation-write-root", "C:/Users/<seu-usuario>"]
    },
    "designcraft": {
      "command": "C:/Program Files/DesignCraft/designcraft-cli.exe",
      "args": ["mcp", "--automation-read-root", "C:/Users/<seu-usuario>", "--automation-write-root", "C:/Users/<seu-usuario>"]
    },
    "pdfcraft": {
      "command": "C:/Program Files/PdfCraft/pdfcraft-cli.exe",
      "args": ["mcp", "--compact", "--automation-read-root", "C:/Users/<seu-usuario>", "--automation-write-root", "C:/Users/<seu-usuario>"]
    },
    "figcraft": {
      "command": "C:/Program Files/FigCraft/figcraft-cli.exe",
      "args": ["mcp", "--automation-read-root", "C:/Users/<seu-usuario>", "--automation-write-root", "C:/Users/<seu-usuario>"]
    }
  }
}
```

### OpenAI Codex (`~/.codex/config.toml`)
```toml
[mcp_servers.effectcraft]
command = 'C:\Program Files\EffectCraft\effectcraft-cli.exe'
args = ["mcp", "--automation-read-root", 'C:\Users\<seu-usuario>', "--automation-write-root", 'C:\Users\<seu-usuario>']

[mcp_servers.filmcraft]
command = 'C:\Program Files\FilmCraft\filmcraft-cli.exe'
args = ["mcp", "--automation-read-root", 'C:\Users\<seu-usuario>', "--automation-write-root", 'C:\Users\<seu-usuario>']

[mcp_servers.lightcraft]
command = 'C:\Program Files\LightCraft\lightcraft-cli.exe'
args = ["mcp", "--compact"]

[mcp_servers.photocraft]
command = 'C:\Program Files\PhotoCraft\photocraft-cli.exe'
args = ["mcp", "--automation-read-root", 'C:\Users\<seu-usuario>', "--automation-write-root", 'C:\Users\<seu-usuario>']

[mcp_servers.vectorcraft]
command = 'C:\Program Files\VectorCraft\vectorcraft-cli.exe'
args = ["mcp", "--headless", "--automation-read-root", 'C:\Users\<seu-usuario>', "--automation-write-root", 'C:\Users\<seu-usuario>']

[mcp_servers.deckcraft]
command = 'C:\Program Files\DeckCraft\deckcraft-cli.exe'
args = ["mcp", "--automation-read-root", 'C:\Users\<seu-usuario>', "--automation-write-root", 'C:\Users\<seu-usuario>']

[mcp_servers.designcraft]
command = 'C:\Program Files\DesignCraft\designcraft-cli.exe'
args = ["mcp", "--automation-read-root", 'C:\Users\<seu-usuario>', "--automation-write-root", 'C:\Users\<seu-usuario>']

[mcp_servers.pdfcraft]
command = 'C:\Program Files\PdfCraft\pdfcraft-cli.exe'
args = ["mcp", "--compact", "--automation-read-root", 'C:\Users\<seu-usuario>', "--automation-write-root", 'C:\Users\<seu-usuario>']

[mcp_servers.figcraft]
command = 'C:\Program Files\FigCraft\figcraft-cli.exe'
args = ["mcp", "--automation-read-root", 'C:\Users\<seu-usuario>', "--automation-write-root", 'C:\Users\<seu-usuario>']
```

---

## 📄 Licença
Distribuído sob licença MIT. As marcas e aplicativos pertencem ao ecossistema [ArtCraft / storytold](https://github.com/storytold).
