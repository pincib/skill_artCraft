# Tokens, responsividade e handoff

## Tokens DTCG

Use JSON com `$type` e `$value` quando os tokens precisarem circular entre design e código. Mantenha nomes semânticos e valores baseados no produto:

```json
{
  "color": {
    "text": {
      "primary": { "$type": "color", "$value": "#202124" }
    },
    "surface": {
      "default": { "$type": "color", "$value": "#FFFFFF" }
    }
  },
  "spacing": {
    "control": { "$type": "dimension", "$value": "12px" }
  }
}
```

Use referências/aliases somente quando o consumidor suportar a sintaxe adotada. Gere ou atualize variáveis CSS a partir dos tokens quando solicitado, preservando a fonte de verdade do projeto.

## Revisão responsiva

- Selecione larguras que representem os dispositivos de destino; 390 px, 768 px e 1440 px são pontos de partida, não requisitos fixos.
- Confira navegação, colunas, texto longo, imagens, formulários, estados vazios/erro e alvos de toque em cada variante.
- Use constraints e auto-layout para descrever comportamento. Só fixe dimensões quando o componente realmente exigir isso.
- Anote como o layout muda entre variantes. Uma captura de uma única largura não demonstra responsividade.

## Verificação e handoff

1. Use `inspect_document`/`get_node` para confirmar hierarquia, dimensões, nomes e estados.
2. Renderize ou capture os frames com a ferramenta disponível e examine o resultado; não exporte só com base na árvore de nós.
3. Exporte SVG para vetores e PNG/WebP para raster conforme os requisitos do consumidor.
4. Para código, leia os padrões existentes do repositório, associe cada token e componente ao equivalente real da stack e indique diferenças que o arquivo de design não representa. Não prometa geração automática de JSX/CSS pelo FigCraft.
5. Em documentos DesignCraft, inspecione `overset` e resolva o conteúdo excedente antes da entrega.
