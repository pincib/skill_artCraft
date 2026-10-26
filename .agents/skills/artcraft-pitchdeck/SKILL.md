---
name: artcraft-pitchdeck
description: >-
  Criação de apresentações, pitch decks, relatórios editoriais e PDFs com DeckCraft, DesignCraft e
  PdfCraft. Use quando o principal resultado for um deck ou documento paginado, não uma tela de produto.
---

# ArtCraft Pitch Deck

Use DeckCraft para apresentações, DesignCraft para anexos ou documentos editoriais e PdfCraft quando for necessário inspecionar ou combinar PDFs. Mantenha uma única tese narrativa e use cada ferramenta apenas quando ela acrescentar valor ao entregável.

## Fluxo

1. Confirme público, objetivo, formato, conteúdo factual e arquivos de origem. Preserve números e afirmações fornecidos pelo usuário; não invente dados.
2. Estruture a narrativa e a sequência de slides antes da diagramação. Defina a proporção e o destino de apresentação; use o tamanho padrão 16:9 do DeckCraft quando não houver requisito diferente.
3. Produza slides com hierarquia clara, gráficos legíveis e fontes de dados verificáveis. Para anexos, crie estilos e quadros no DesignCraft e mantenha texto editável.
4. Inspecione cada slide e cada história editorial. Resolva `overset` antes de exportar: aumente ou divida quadros e, se necessário, ajuste tipografia sem comprometer a legibilidade.
5. Renderize uma amostra visual dos slides/páginas e confira cortes, alinhamento, consistência e leitura em tamanho de apresentação.
6. Exporte o arquivo editável e os formatos finais pedidos. Combine PDFs somente quando necessário; use otimização apenas se o PdfCraft expuser um comando compatível e houver um limite de tamanho a cumprir.

## Regras práticas

- Slides do DeckCraft usam pontos; o padrão 16:9 é 960 × 540 pt. A nitidez de imagens raster depende da resolução/escala de exportação, não de ampliar artificialmente as dimensões lógicas do slide.
- Não assuma que existe um comando de compressão, `doc_optimize` ou `doc_reduce`: pesquise as ferramentas disponíveis com `tool_search`/`command_list`.
- Não imponha um limite universal de megabytes. Siga o limite de entrega informado e confira o arquivo exportado.
- Salve apresentações, PDFs e cópias editáveis em `exports/`, dentro das raízes de escrita MCP.
- Salve intermediários próprios em `.tmp/artcraft-<tarefa>/` e remova apenas os que você criou, após verificar os arquivos finais.

## Referência

- [Revisão de texto, slides e PDFs](references/quality-checks.md)
