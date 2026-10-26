#!/usr/bin/env bash
set -e

SKILLS=("artcraft-video" "artcraft-image" "artcraft-pitchdeck" "artcraft-frontend")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR/.agents/skills"

if [ ! -d "$SRC_DIR" ]; then
  SRC_DIR="$SCRIPT_DIR/package-artcraft-skills/skills"
fi

TARGETS=()

if [[ "$1" == "--antigravity" ]]; then
  TARGETS+=("$HOME/.gemini/config/skills")
elif [[ "$1" == "--codex" ]]; then
  TARGETS+=("$HOME/.agents/skills")
elif [[ "$1" == "--local" ]]; then
  TARGETS+=("$PWD/.agents/skills")
else
  TARGETS+=("$HOME/.gemini/config/skills" "$HOME/.agents/skills")
fi

for TARGET in "${TARGETS[@]}"; do
  echo "📁 Instalando em: $TARGET"
  mkdir -p "$TARGET"
  for SKILL in "${SKILLS[@]}"; do
    if [ -d "$SRC_DIR/$SKILL" ]; then
      cp -r "$SRC_DIR/$SKILL" "$TARGET/"
      echo "  ✅ $SKILL instalado com sucesso!"
    fi
  done
done

echo ""
echo "🎉 Instalação concluída com sucesso!"
