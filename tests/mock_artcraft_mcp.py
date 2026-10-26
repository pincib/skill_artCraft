#!/usr/bin/env python3
"""Minimal newline-delimited JSON-RPC MCP server used only by CI smoke checks."""

import json
import sys

TOOLS = [
    {
        "name": "inspect_document",
        "description": "Return a mock document state.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "render_preview",
        "description": "Return a mock preview result.",
        "inputSchema": {"type": "object", "properties": {}},
    },
]


def reply(request):
    method = request.get("method")
    request_id = request.get("id")
    if method == "initialize":
        result = {
            "protocolVersion": request.get("params", {}).get("protocolVersion", "2024-11-05"),
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "mock-artcraft", "version": "1.0.0"},
        }
        return {"jsonrpc": "2.0", "id": request_id, "result": result}
    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": request_id, "result": {"tools": TOOLS}}
    if method == "tools/call":
        name = request.get("params", {}).get("name")
        if not any(tool["name"] == name for tool in TOOLS):
            return {
                "jsonrpc": "2.0",
                "id": request_id,
                "error": {"code": -32602, "message": "Unknown mock tool"},
            }
        return {
            "jsonrpc": "2.0",
            "id": request_id,
            "result": {"content": [{"type": "text", "text": "OK - mock"}]},
        }
    if method == "notifications/initialized":
        return None
    return {
        "jsonrpc": "2.0",
        "id": request_id,
        "error": {"code": -32601, "message": "Method not found"},
    }


def main():
    for line in sys.stdin:
        try:
            response = reply(json.loads(line))
            if response is not None:
                sys.stdout.write(json.dumps(response, separators=(",", ":")) + "\n")
                sys.stdout.flush()
        except (json.JSONDecodeError, TypeError) as error:
            sys.stderr.write(f"Invalid mock request: {error}\n")


if __name__ == "__main__":
    main()
