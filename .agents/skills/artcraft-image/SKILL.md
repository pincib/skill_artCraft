---
name: artcraft-image
description: >-
  Revelação RAW, edição raster, retoque, composição e ilustração vetorial de imagens estáticas com
  LightCraft, PhotoCraft e VectorCraft. Use para fotografia, banners, ícones e logotipos; para timeline,
  cortes ou motion graphics use artcraft-video.
---

# ArtCraft Imagem

Combine LightCraft para revelar fotografias, VectorCraft para arte vetorial e PhotoCraft para composição raster quando a tarefa exigir mais de uma etapa. Não force o uso dos três aplicativos quando um só resolver.

## Fluxo

1. Inspecione os arquivos e confirme dimensões, formato, transparência, espaço de cor e resultado esperado. Preserve os originais.
2. Descubra as ferramentas e parâmetros disponíveis no app antes de editar. Prefira os comandos headless para operações estruturadas; use ferramentas de interface apenas quando a tarefa depender da aplicação aberta.
3. Faça a revelação não destrutiva no LightCraft, se aplicável. Use VectorCraft para formas e lettering vetorial e PhotoCraft para camadas, máscaras, retoque e montagem.
4. Converta coordenadas entre pontos e pixels com o DPI definido para o destino. Mantenha escala, proporção e alinhamento ao transferir assets.
5. Renderize uma prévia, inspecione camadas e cores, e corrija problemas antes de exportar. Salve o projeto editável e a versão final quando solicitados.
6. Guarde intermediários próprios em `.tmp/artcraft-<tarefa>/`. Depois de verificar a entrega, remova apenas os temporários criados para esta tarefa, salvo se o usuário pedir para preservá-los.

## Regras práticas

- Use PNG ou TIFF sem perdas como intermediário quando houver transparência, edição posterior ou preservação tonal. JPEG é uma opção de entrega com perdas, não um intermediário adequado para esse fluxo.
- Para converter pontos vetoriais em pixels, use `px = pt × DPI / 72`; defina o DPI pelo destino, não por suposição.
- Não afirme que um formato preserva camadas, profundidade ou perfil de cor sem conferir os avisos da ferramenta de exportação.
- Use caminhos dentro das raízes de leitura/escrita concedidas pelo servidor MCP. Não amplie essas raízes para a pasta pessoal do usuário.
- Salve entregas de imagem em `exports/`, prévias em `renders/` e intermediários em `.tmp/artcraft-<tarefa>/`, dentro das raízes de escrita MCP.
- LightCraft pode estar conectado sem confinamento de arquivos. Confirme o escopo ativo antes de importar ou exportar arquivos do usuário; prefira PhotoCraft ou VectorCraft confinado quando o escopo não estiver claro.

## Referência

- [Formatos, escala e conversão](references/formats-and-scale.md)
