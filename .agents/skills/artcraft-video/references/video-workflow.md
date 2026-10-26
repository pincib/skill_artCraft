# Disponibilidade, áudio e exportação

## Verificar o runtime

- Use apenas as ferramentas listadas pelo cliente atual. No runtime ArtCraft desta distribuição, EffectCraft oferece `command_list`, `command_run`, `command_batch`, `set_property`, `add_keyframe`, `render_frame` e `save_project`.
- FilmCraft não é garantido. Se o namespace ou as ferramentas não aparecerem, não tente chamar APIs presumidas. Verifique também se `ffmpeg` está instalado antes de propor um fluxo auxiliar.
- A CLI MCP do FilmCraft atualmente não oferece raízes de leitura/escrita. Não passe arquivos do usuário a essa conexão sem autorização explícita; use EffectCraft para grafismos confinados ou prepare instruções para a edição linear.
- `jobs_list`/`jobs_cancel` são específicos dos servidores que os expõem (por exemplo, PhotoCraft nesta versão); não os atribua ao FilmCraft ou EffectCraft sem confirmação.

## Áudio

- LUFS integrado descreve loudness percebido ao longo do programa; true peak mede picos intersample. Use medidor compatível quando a entrega exigir esses dados e siga os limites do destino.
- Os níveis de faixa em dBFS podem servir como ponto inicial de mixagem, mas não substituem a medição de loudness final. Evite clipping e confira voz e música em conjunto.
- Se o usuário não informar o destino nem uma meta de loudness, pergunte antes de normalizar o master; preserve a mixagem na prévia.

## Safe areas e exportação

- Use proporção, codec, taxa de quadros, bitrate e área segura exigidos pela plataforma/cliente. Sobreposições de interface mudam; prefira um guia atualizado do destino a margens fixas em pixels.
- Revise frames no começo, meio e fim, incluindo transições, títulos, legendas e o último quadro.
- Exporte uma prévia curta antes de um master longo quando isso estiver disponível. Confirme o caminho e a existência do arquivo final.
- Use `renders/` para prévias, `.tmp/` para intermediários descartáveis e `exports/` para arquivos finais, dentro das raízes de escrita MCP.
