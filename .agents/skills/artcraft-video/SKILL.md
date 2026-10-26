---
name: artcraft-video
description: >-
  Edição de vídeo, composição, motion graphics, títulos animados e finalização com EffectCraft e FilmCraft
  quando conectado. Use para timelines e vídeo; para imagens estáticas use artcraft-image.
---

# ArtCraft Vídeo

Use EffectCraft para composição e animação. Use FilmCraft para edição de timeline somente se o runtime apresentar ferramentas FilmCraft e o escopo de arquivos servir à tarefa. A CLI MCP do FilmCraft não oferece confinamento de arquivos; não envie arquivos do usuário sem que ele tenha escolhido essa conexão. A disponibilidade muda por máquina e versão; não invente ferramentas ausentes.

## Fluxo

1. Confirme destino, proporção, resolução, duração, taxa de quadros, materiais, trilha e formato de entrega. Inspecione os arquivos de origem e preserve os originais.
2. Descubra as ferramentas disponíveis. Em EffectCraft, consulte `command_list` e use `command_run`, `set_property`, `add_keyframe`, `render_frame`/`render_preview`, `doc_inspect` e `save_project` conforme expostos.
3. Se FilmCraft estiver conectado, descubra suas ferramentas e parâmetros antes de importar, cortar, mixar ou exportar. Não use assinaturas `filmcraft:import`, `exec` ou `export` sem confirmar que existem.
4. Se FilmCraft não estiver conectado, use EffectCraft apenas para os grafismos que ele suporta. Para cortes, use FFmpeg somente se estiver instalado e o fluxo couber no escopo solicitado; não instale ferramentas por conta própria. Caso contrário, explique o requisito e prepare um plano de edição.
5. Renderize quadros de prévia e verifique texto, sincronismo, safe areas, transições e áudio antes de exportações longas. Para tarefas longas, use jobs assíncronos somente quando o app ativo oferecer esse recurso.
6. Meça loudness integrado (LUFS) e true peak para as entregas que exigirem especificação de áudio. Siga a meta do destino informado; não trate níveis de pico dBFS como substitutos de LUFS.
7. Mantenha prévias renderizadas em `renders/` e intermediários próprios em `.tmp/artcraft-<tarefa>/`. Salve masters e arquivos finais em `exports/`, dentro das raízes de escrita MCP. Depois de validar a entrega final, remova somente os temporários criados para esta tarefa, salvo pedido para preservá-los.

## Referência

- [Disponibilidade, áudio e exportação](references/video-workflow.md)
