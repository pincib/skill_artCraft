#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cli="$script_dir/bin/cli.js"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node.js and run this script again." >&2
  exit 1
fi
if [[ ! -f "$cli" ]]; then
  echo "ArtCraft CLI not found: $cli" >&2
  exit 1
fi

args=("$@")
has_target=false
for arg in "${args[@]}"; do
  case "$arg" in
    --antigravity|--codex|--local|--global|--all) has_target=true ;;
  esac
done
if [[ "$has_target" == false ]]; then
  args+=(--global)
fi

exec node "$cli" "${args[@]}"
