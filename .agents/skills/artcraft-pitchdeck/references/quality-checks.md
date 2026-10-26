# Revisão de texto, slides e PDFs

## Overset no DesignCraft

`inspect_document` retorna histórias e o estado `overset`; `get_story` mostra o conteúdo e a posição excedente. Se houver texto excedente:

1. Confira se o texto pode fluir para um quadro seguinte ou se a página pode crescer.
2. Redimensione ou divida os quadros, preserve a hierarquia e inspecione novamente.
3. Reduza o corpo tipográfico apenas quando isso continuar legível no tamanho de entrega. Não apague nem reescreva conteúdo factual para esconder o problema.

## Slides DeckCraft

- Use `new_presentation`, `add_slide`, `run_command`/`batch`, `inspect_slide` e `render_slide` conforme disponíveis.
- O slide padrão 16:9 mede 960 × 540 pontos. Para exportar raster, escolha `scale`/`dpi` com base no uso; exporte para PPTX/PDF quando for necessária uma apresentação vetorial/editável.
- Confira dados e rótulos de cada gráfico contra a fonte original. Verifique contraste, tamanho de texto, margens e consistência entre slides.
- Salve PDFs finais, apresentações e cópias editáveis em `exports/`, dentro das raízes de escrita MCP.

## PDFs

- Procure as ferramentas reais de PdfCraft com `tool_search`; use `doc_info` e `page_render` para inspecionar, e `doc_combine` quando a união for necessária.
- Não presuma suporte a compressão. Se houver um limite de tamanho, use a operação de otimização que o servidor realmente listar ou ajuste a resolução das imagens antes da composição.
- Confira contagem, ordem, orientação, texto pesquisável e peso do PDF final.
