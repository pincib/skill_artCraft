---
name: artcraft-frontend
description: >-
  Prototipagem e revisão de interfaces digitais, componentes, design tokens, responsividade e handoff
  com FigCraft e DesignCraft. Use quando o resultado principal for uma tela, um sistema de interface ou
  uma especificação de design; não use para tarefas apenas de backend.
---

# ArtCraft Frontend

Use FigCraft para estruturar e revisar interfaces e DesignCraft para diagramar especificações de handoff. Essas ferramentas produzem artefatos de design; elas não geram automaticamente código React, HTML ou CSS.

## Fluxo

1. Inspecione o projeto, as instruções locais, a identidade visual existente e as telas relacionadas. Preserve os padrões atuais quando a tarefa for uma extensão.
2. Defina plataforma, conteúdo, estados necessários, tamanhos de tela e tokens. Pergunte apenas o que for indispensável para uma decisão de produto.
3. Descubra as ferramentas disponíveis e os parâmetros atuais com a busca/listagem de comandos do FigCraft ou DesignCraft. Use os nomes apresentados pelo runtime; o namespace pode variar entre clientes.
4. Monte componentes e telas em frames com auto-layout quando disponível. Defina variantes para larguras relevantes e estados interativos; não dependa de coordenadas fixas dentro de um auto-layout.
5. Inspecione a árvore e renderize os frames. Revise hierarquia, alinhamento, contraste, estados, conteúdo longo e variantes responsivas antes de exportar.
6. Exporte somente os assets necessários. Para handoff, documente tokens, medidas, estados, breakpoints e comportamento. Se também pedirem implementação, traduza o design para os padrões e a stack já usados no repositório.

## Regras práticas

- Use coordenadas FigCraft em unidades de página, com origem no canto superior esquerdo; confirme no runtime se as coordenadas são relativas ao frame pai.
- Trate tokens como dados reutilizáveis. Quando o projeto precisar de um arquivo interoperável, use o formato DTCG com `$type` e `$value`; um exemplo está em [references/tokens-responsive-handoff.md](references/tokens-responsive-handoff.md).
- Compare pelo menos uma variante estreita e uma larga quando a interface for responsiva. Breakpoints são decisões do produto, não valores universais.
- Não invente propriedades MCP nem suponha que uma ferramenta de exportação gere código de produção. Consulte `list_commands`, `command_list`, `run_command` ou `execute` conforme exposto pelo app.
- Preserve a cópia e o conteúdo aprovados. Antes de exportar, renderize e confira o resultado visual.
- Para arquivos MCP, grave somente em `.tmp/`, `renders/` ou `exports/`; salve projetos editados como cópias derivadas em `exports/`, salvo se o usuário configurar outra raiz de escrita.

## Referência

- [Tokens, responsividade e handoff para código](references/tokens-responsive-handoff.md)
