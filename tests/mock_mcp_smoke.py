#!/usr/bin/env python3
"""Send an MCP initialize/list/call sequence to the local mock server."""

import json
import subprocess
import sys
from pathlib import Path


def main():
    server = Path(__file__).with_name("mock_artcraft_mcp.py")
    requests = [
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "artcraft-ci", "version": "1.0.0"},
            },
        },
        {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}},
        {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {"name": "render_preview", "arguments": {}},
        },
    ]
    completed = subprocess.run(
        [sys.executable, str(server)],
        input="".join(json.dumps(request) + "\n" for request in requests),
        text=True,
        capture_output=True,
        check=True,
    )
    responses = [json.loads(line) for line in completed.stdout.splitlines()]
    assert [response["id"] for response in responses] == [1, 2, 3]
    assert responses[0]["result"]["serverInfo"]["name"] == "mock-artcraft"
    assert {tool["name"] for tool in responses[1]["result"]["tools"]} == {
        "inspect_document",
        "render_preview",
    }
    assert responses[2]["result"]["content"][0]["text"] == "OK - mock"
    print("Mock MCP initialize/list/call handshake passed.")


if __name__ == "__main__":
    main()
