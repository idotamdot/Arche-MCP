import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// 1. Initialize Server Instance
const server = new Server(
    {
        name: "my-custom-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Define schema for tool parameters
const EchoInputSchema = z.object({
    message: z.string().describe("The text message to echo back"),
});

// 2. Register Available Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "echo_message",
                description: "Echoes back the provided message with a timestamp.",
                inputSchema: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "The text message to echo back",
                        },
                    },
                    required: ["message"],
                },
            },
        ],
    };
});

// 3. Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "echo_message") {
        const { message } = EchoInputSchema.parse(request.params.arguments);

        return {
            content: [
                {
                    type: "text",
                    text: `[${new Date().toISOString()}] Echo: ${message}`,
                },
            ],
        };
    }

    throw new Error(`Tool not found: ${request.params.name}`);
});

// 4. Start Server over Stdio Transport
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});