#!/usr/bin/env python3
"""Validate ArtCraft skill metadata and portable package configuration."""

import json
import re
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / ".agents" / "skills"
PLUGIN = ROOT / ".agents" / "plugins" / "artcraft-suite"
EXPECTED = {
    "artcraft-frontend",
    "artcraft-image",
    "artcraft-pitchdeck",
    "artcraft-video",
}


def load_json(path):
    with path.open(encoding="utf-8") as stream:
        return json.load(stream)


def validate_skill(skill_dir):
    skill_file = skill_dir / "SKILL.md"
    text = skill_file.read_text(encoding="utf-8")
    match = re.match(r"\A---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    assert match, f"Missing YAML frontmatter: {skill_file.relative_to(ROOT)}"
    metadata = yaml.safe_load(match.group(1))
    assert metadata["name"] == skill_dir.name, f"Skill name mismatch in {skill_file}"
    assert 40 <= len(metadata["description"]) <= 320, f"Description length is out of bounds: {skill_file}"

    openai_file = skill_dir / "agents" / "openai.yaml"
    openai_text = openai_file.read_text(encoding="utf-8")
    openai = yaml.safe_load(openai_text)
    allowed_top_level = {"interface", "dependencies", "policy"}
    assert set(openai) <= allowed_top_level, f"Unsupported openai.yaml fields in {openai_file}"
    interface = openai["interface"]
    assert 25 <= len(interface["short_description"]) <= 64, f"Short description must be 25-64 chars: {openai_file}"
    assert f"${skill_dir.name}" in interface["default_prompt"], f"Prompt must mention ${skill_dir.name}: {openai_file}"
    for key in ("display_name", "short_description", "default_prompt"):
        value = interface[key]
        assert isinstance(value, str) and value, f"Missing interface.{key}: {openai_file}"
        assert re.search(rf"^\s*{key}:\s*\".*\"\s*$", openai_text, re.MULTILINE), f"Quote interface.{key}: {openai_file}"
    if "dependencies" in openai:
        for tool in openai["dependencies"].get("tools", []):
            assert tool.get("type") == "mcp" and tool.get("url"), f"Only remote MCP URL dependencies are supported: {openai_file}"

    for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", text):
        if target.startswith(("https://", "http://", "#")):
            continue
        local_target = target.split("#", 1)[0]
        if local_target:
            assert (skill_dir / local_target).exists(), f"Broken local link {target} in {skill_file}"


def main():
    yaml.safe_load((ROOT / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8"))
    yaml.safe_load((ROOT / ".markdownlint-cli2.yaml").read_text(encoding="utf-8"))
    package = load_json(ROOT / "package.json")
    assert package["version"] == "1.1.0", "package.json version should be 1.1.0"
    plugin = load_json(PLUGIN / "plugin.json")
    assert plugin["name"] == "artcraft-suite"
    assert plugin["version"] == package["version"]
    assert plugin["license"] == "MIT"
    assert plugin["$schema"].startswith("https://agent-plugins.org/schemas/")
    assert "engine" not in plugin and "capabilities" not in plugin
    assert plugin["extensions"]["com.openai"]["interface"]["capabilities"] == ["Read", "Write"]

    for name in ("mcp_config.json", "mcp.json"):
        mcp = load_json(PLUGIN / name)
        assert mcp["mcpServers"] == {}, f"The checked-in {name} must not contain machine-specific paths"
        assert "$schema" not in mcp or mcp["$schema"].startswith("https://agent-plugins.org/schemas/")

    marketplace = load_json(ROOT / ".agents" / "plugins" / "marketplace.json")
    artcraft_entries = [entry for entry in marketplace["plugins"] if entry["name"] == "artcraft-suite"]
    assert len(artcraft_entries) == 1
    assert artcraft_entries[0]["source"] == {"source": "local", "path": "./.agents/plugins/artcraft-suite"}
    assert not (PLUGIN / "skills").exists(), "Keep one canonical source for skills; the CLI creates the plugin copy"

    found = {entry.name for entry in SKILLS.iterdir() if entry.is_dir()}
    assert found == EXPECTED, f"Expected exactly four canonical skills, found: {sorted(found)}"
    for skill_dir in sorted(SKILLS.iterdir()):
        if skill_dir.is_dir():
            validate_skill(skill_dir)

    for path in [ROOT / "README.md", ROOT / "bin" / "cli.js", PLUGIN / "mcp_config.json", PLUGIN / "mcp.json"]:
        content = path.read_text(encoding="utf-8")
        assert "C:/Users/berna" not in content and "C:\\Users\\berna" not in content, f"Machine-specific path in {path}"

    print("ArtCraft JSON, YAML, skill metadata and portability checks passed.")


if __name__ == "__main__":
    main()
