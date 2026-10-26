# Formatos e escala

## Conversão entre pontos e pixels

`px = pt × DPI / 72`

Exemplo: um objeto de 72 pt exportado a 300 DPI ocupa 300 px. Para a conversão inversa, `pt = px × 72 / DPI`. A escala final também depende das opções de exportação do app; confira o tamanho renderizado.

## Escolha de formatos

- **Projeto editável:** use o formato nativo (`.pcraft`, `.vectorcraft` ou outro formato listado pelo app) e confira os avisos de perda ao salvar.
- **Raster intermediário:** prefira PNG ou TIFF quando transparência, qualidade sem perdas ou novas edições forem necessárias. Evite JPEG em etapas entre LightCraft, VectorCraft e PhotoCraft.
- **Entrega raster:** PNG para transparência e bordas nítidas; WebP ou JPEG quando tamanho de arquivo e compatibilidade permitirem. JPEG não carrega alfa.
- **Entrega vetorial:** SVG ou PDF quando suportados pelo consumidor. Texto convertido em contornos melhora portabilidade visual, mas perde editabilidade tipográfica.
- Preserve profundidade de bits e perfil de cor somente quando o formato e o app confirmarem suporte. Use sRGB para destinos de tela quando não houver perfil de marca ou requisito diferente.
- Mantenha entregas finais em `exports/`, prévias em `renders/` e intermediários em `.tmp/`, quando essas forem as raízes de escrita MCP configuradas.

## Comandos e diagnóstico

Os nomes de comandos variam por versão. Consulte `command_list`/`list_commands` e as ferramentas `doc_inspect`, `render_preview`, `export` ou `doc_save` expostas pelo app. Em PhotoCraft, os caminhos de importação e exportação precisam permanecer sob as raízes MCP concedidas. Trabalhos longos podem oferecer `jobs_list` e `jobs_cancel`; use-os apenas se o servidor ativo expuser essas ferramentas.

LightCraft não oferece raízes de arquivo na CLI MCP atual. Confirme se a conexão e a biblioteca selecionada são apropriadas antes de importar ou exportar arquivos do usuário.
