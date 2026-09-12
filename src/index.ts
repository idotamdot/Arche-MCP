import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import { getService, protocolVersion, services } from "./registry";

interface Env {
  ARCHE_MCP_TOKEN?: string;
}

const jsonText = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

function createServer() {
  const server = new McpServer({
    name: "arche-mcp",
    version: "2.0.0",
  });

  server.registerTool(
    "list_services",
    {
      description:
        "List registered Arche Coda ecosystem services. Registry visibility never grants private-data or cross-product action access.",
      inputSchema: {},
    },
    async () =>
      jsonText({
        protocol_version: protocolVersion,
        gateway: "arche-mcp",
        access_mode: "read-only-registry",
        default_cross_product_access: "deny",
        sanctuary_access: "none-by-default",
        services,
      }),
  );

  server.registerTool(
    "get_service",
    {
      description:
        "Return registry metadata for one Arche ecosystem service by canonical service ID.",
      inputSchema: {
        service_id: z.string().min(1).describe("Canonical service ID such as propertyseer or loc-geist"),
      },
    },
    async ({ service_id }) => {
      const service = getService(service_id);
      if (!service) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Unknown ecosystem service: ${service_id}` }],
        };
      }

      return jsonText({
        protocol_version: protocolVersion,
        authorization_note:
          "Registry visibility does not authorize access to another product's private data or actions.",
        service,
      });
    },
  );

  server.registerTool(
    "get_gateway_policy",
    {
      description: "Return the Arche MCP gateway's enforced high-level access policy.",
      inputSchema: {},
    },
    async () =>
      jsonText({
        mode: "read-only-registry",
        authentication: "bearer-token-required",
        default_cross_product_access: "deny",
        consequential_actions: "not-exposed",
        memory_access: "not-exposed",
        sanctuary_access: "none-by-default",
        note: "Write/action tools require a separately reviewed authorization and audit design before exposure.",
      }),
  );

  return server;
}

function unauthorized(): Response {
  return new Response(
    JSON.stringify({
      error: "unauthorized",
      message: "A valid Arche MCP bearer token is required.",
    }),
    {
      status: 401,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "www-authenticate": "Bearer",
        "cache-control": "no-store",
      },
    },
  );
}

function authorized(request: Request, env: Env): boolean {
  if (!env.ARCHE_MCP_TOKEN) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${env.ARCHE_MCP_TOKEN}`;
}

const securityHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "cache-control": "no-store",
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          service: "arche-mcp",
          status: "ok",
          protocol: "MCP Streamable HTTP",
          endpoint: "/mcp",
          authentication: "required",
          access_mode: "read-only-registry",
        }),
        {
          headers: {
            "content-type": "application/json; charset=utf-8",
            ...securityHeaders,
          },
        },
      );
    }

    if (url.pathname !== "/mcp") {
      return new Response("Not found", { status: 404, headers: securityHeaders });
    }

    if (!authorized(request, env)) return unauthorized();

    const response = await createMcpHandler(createServer)(request, env, ctx);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(securityHeaders)) headers.set(key, value);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;
