# MCP (Model Context Protocol) Setup for Glass UI

This project is configured to use **Glass UI** components via MCP. This allows AI assistants like Claude, Cursor, and Windsurf to directly access and add components to your project.

## Local Configuration

The project includes a `mcp.json` file in the root directory for reference.

## Setup Instructions

To enable Glass UI in your AI assistant, add the following to your global MCP configuration file:

### MCP Configuration JSON

```json
{
  "mcpServers": {
    "crenspire-glass": {
      "command": "npx",
      "args": [
        "-y",
        "@shadcn/mcp-server",
        "--registry",
        "https://glass-ui.crenspire.com/r/registry.json"
      ]
    }
  }
}
```

### Configuration Locations

- **Claude Desktop**:
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Cursor**: Settings -> Features -> MCP
- **Windsurf**: ~/.codeium/config/mcp.json

## Usage

Once configured, you can ask your AI assistant:

- "Add the Glass UI button component"
- "Show me Glass UI components available in the registry"
- "Install the Glass UI navigation bar"
