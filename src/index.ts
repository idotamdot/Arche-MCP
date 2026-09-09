import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getService, protocolVersion, services } from "./registry.js";

const server = new Server(
  {
    name: "arche-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const EchoInputSchema = z.object({
  message: z.string().describe("The text message to echo back"),
});

const GetServiceInputSchema = z.object({
  service_id: z.string().min(1).describe("Canonical Arche ecosystem service ID"),
});

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
      {
        name: "list_services",
        description:
          "Lists registered Arche Coda ecosystem services. This returns registry metadata only and never grants cross-product data access.",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
      {
        name: "get_service",
        description:
          "Returns registry metadata for one Arche Coda ecosystem service by canonical service ID.",
        inputSchema: {
          type: "object",
          properties: {
            service_id: {
              type: "string",
              description: "Canonical service ID such as propertyseer or loc-geist",
            },
          },
          required: ["service_id"],
          additionalProperties: false,
        },
      },
    ],
  };
});

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

  if (request.params.name === "list_services") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              protocol_version: protocolVersion,
              default_cross_product_access: "deny",
              services,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  if (request.params.name === "get_service") {
    const { service_id } = GetServiceInputSchema.parse(request.params.arguments);
    const service = getService(service_id);

    if (!service) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Unknown ecosystem service: ${service_id}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              protocol_version: protocolVersion,
              authorization_note:
                "Registry visibility does not authorize access to another product's private data or actions.",
              service,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Arche MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
