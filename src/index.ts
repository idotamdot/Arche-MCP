import { McpServer } from "@modelcontextprotocol/server";
import { createMcpHandler } from "agents/mcp/server";
import { z } from "zod";
import { getService, loadRegistry, protocolVersion } from "./registry";

interface Env {
  ARCHE_MCP_TOKEN?: string;
}

const jsonText = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

function createServer() {
  const server = new McpServer({ name: "arche-mcp", version: "2.0.0" });

  server.registerTool("list_services", {
    description: "List registered Arche Coda ecosystem services. Registry visibility never grants private-data or cross-product action access.",
    inputSchema: {},
  }, async () => {
    const registry = await loadRegistry();
    return jsonText({
      protocol_version: protocolVersion,
      gateway: "arche-mcp",
      access_mode: "read-only-registry",
      default_cross_product_access: "deny",
      sanctuary_access: "none-by-default",
      registry_source: registry.source,
      registry_checked_at: registry.checked_at,
      registry_schema_version: registry.schema_version,
      ...(registry.warning ? { registry_warning: registry.warning } : {}),
      services: registry.services,
    });
  });

  server.registerTool("get_service", {
    description: "Return registry metadata for one Arche ecosystem service by canonical service ID.",
    inputSchema: {
      service_id: z.string().min(1).describe("Canonical service ID such as propertyseer or loc-geist"),
    },
  }, async ({ service_id }) => {
    const registry = await loadRegistry();
    const service = getService(service_id, registry.services);
    if (!service) {
      return {
        isError: true,
        content: [{ type: "text" as const, text: `Unknown ecosystem service: ${service_id}` }],
      };
    }
    return jsonText({
      protocol_version: protocolVersion,
      registry_source: registry.source,
      registry_checked_at: registry.checked_at,
      registry_schema_version: registry.schema_version,
      ...(registry.warning ? { registry_warning: registry.warning } : {}),
      authorization_note: "Registry visibility does not authorize access to another product's private data or actions.",
      service,
    });
  });

  server.registerTool("get_gateway_policy", {
    description: "Return the Arche MCP gateway's enforced high-level access policy.",
    inputSchema: {},
  }, async () => jsonText({
    mode: "read-only-registry",
    protocol_version: protocolVersion,
    authentication: "bearer-token-required",
    default_cross_product_access: "deny",
    consequential_actions: "not-exposed",
    memory_access: "not-exposed",
    sanctuary_access: "none-by-default",
    contract_status: {
      service_registry: "live-read-from-arche-coda-with-explicit-local-fallback",
      consent_receipt: "schema-defined; not accepted as a gateway action",
      authorization_decision: "schema-defined; not accepted as a gateway action",
      provenance_record: "schema-defined; not accepted as a gateway action",
      memory_record: "schema-defined; memory access remains disabled",
      audit_event: "schema-defined; action audit pipeline not exposed",
      service_manifest: "schema-defined; per-product manifests are declarations, not proof of integration",
    },
    note: "Registry visibility does not grant authority. Write/action tools require separately reviewed authorization, audit, rollback, and verification controls before exposure.",
  }));

  return server;
}

function unauthorized(): Response {
  return new Response(JSON.stringify({
    error: "unauthorized",
    message: "A valid Arche MCP bearer token is required.",
  }), {
    status: 401,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "www-authenticate": "Bearer",
      "cache-control": "no-store",
    },
  });
}

function authorized(request: Request, env: Env): boolean {
  if (!env.ARCHE_MCP_TOKEN) return false;
  return request.headers.get("authorization") === `Bearer ${env.ARCHE_MCP_TOKEN}`;
}

const securityHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "cache-control": "no-store",
};

const landingPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#080d0c">
<meta name="description" content="Arche-MCP is the governed connection layer for the Arche Coda ecosystem. Discover services, inspect declared capabilities, and keep access permission-bound.">
<title>Arche-MCP — The governed connection layer</title>
<style>
:root{color-scheme:dark;--bg:#080d0c;--panel:#101917;--line:#263b34;--muted:#a0b5ac;--text:#f1f7f3;--green:#8ef0b5;--cyan:#8ce7e6;--gold:#e5c98b}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(ellipse at 75% 0%,#16352b 0,transparent 42%),var(--bg);color:var(--text);font:16px/1.65 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}a{color:var(--green);text-underline-offset:4px}.wrap{width:min(1120px,calc(100% - 40px));margin:auto}.nav{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 0;border-bottom:1px solid #ffffff16}.brand{display:flex;align-items:center;gap:12px;color:var(--text);text-decoration:none;font-weight:750;letter-spacing:.04em}.mark{display:grid;place-items:center;width:38px;height:38px;border:1px solid #6bcf9a;border-radius:12px;color:var(--green);font-size:20px}.navlinks{display:flex;gap:22px;flex-wrap:wrap;font-size:14px}.navlinks a{color:var(--muted);text-decoration:none}.navlinks a:hover{color:var(--green)}.eyebrow{color:var(--green);font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.hero{padding:92px 0 76px;max-width:900px}.hero h1{font-size:clamp(42px,7vw,76px);line-height:1.04;letter-spacing:-.055em;margin:18px 0 24px;max-width:850px}.hero h1 span{color:var(--green)}.lead{font-size:clamp(18px,2.2vw,22px);color:#c1d2c9;max-width:720px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:32px}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:11px 17px;border-radius:9px;border:1px solid #467b61;text-decoration:none;font-weight:700}.primary{background:var(--green);color:#07130c;border-color:var(--green)}.secondary{color:var(--text);background:#ffffff08}.meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:34px}.pill{border:1px solid var(--line);border-radius:999px;padding:5px 11px;color:#c4d8cd;font-size:12px}.section{padding:55px 0}.section h2{font-size:clamp(27px,4vw,40px);line-height:1.15;letter-spacing:-.035em;margin:10px 0 12px}.section-intro{max-width:700px;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:28px}.card{border:1px solid var(--line);border-radius:16px;padding:24px;background:linear-gradient(145deg,#14221d,#0c1311 70%);min-width:0}.num{color:var(--gold);font-size:12px;letter-spacing:.14em;font-weight:800}.card h3{font-size:19px;margin:12px 0 8px}.card p{color:var(--muted);margin:0}.policy{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:28px}.policy .card{padding:20px}.status{display:inline-flex;align-items:center;gap:8px;color:var(--green);font-size:13px;font-weight:750}.dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 12px #8ef0b588}.endpoint{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;background:#060a09;border:1px solid var(--line);border-radius:10px;padding:14px 16px;overflow-wrap:anywhere;color:var(--cyan)}.fine{font-size:13px;color:var(--muted)}.callout{border-left:2px solid var(--gold);padding:5px 0 5px 18px;color:#c5d1c9;margin-top:22px}footer{border-top:1px solid #ffffff16;padding:28px 0 42px;color:var(--muted);font-size:13px;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}
@media(max-width:760px){.nav{align-items:flex-start;flex-direction:column}.hero{padding:64px 0 46px}.grid{grid-template-columns:1fr}.policy{grid-template-columns:1fr}.section{padding:40px 0}}
</style>
</head>
<body>
<header class="wrap nav"><a class="brand" href="/" aria-label="Arche-MCP home"><span class="mark" aria-hidden="true">A</span><span>ARCHE-MCP</span></a><nav class="navlinks" aria-label="Main navigation"><a href="#how">How it works</a><a href="#trust">Access & trust</a><a href="#connect">Connect</a><a href="https://arche-coda.com">Arche Coda</a></nav></header>
<main>
<section class="wrap hero"><div class="eyebrow">Arche Coda · Interoperability gateway</div><h1>Connect systems.<br><span>Keep authority where it belongs.</span></h1><p class="lead">Arche-MCP gives compatible AI assistants and applications a governed way to discover services in the Arche Coda ecosystem. Each product keeps control of its own data, permissions, and actions.</p><div class="actions"><a class="btn primary" href="#connect">How to connect</a><a class="btn secondary" href="#trust">Understand the safeguards</a></div><div class="meta"><span class="pill">Read-only registry</span><span class="pill">Token-protected MCP endpoint</span><span class="pill">Deny by default</span></div></section>
<section id="how" class="wrap section"><div class="eyebrow">A clear division of responsibility</div><h2>Discovery is not permission.</h2><p class="section-intro">Arche-MCP is the connection layer, not the owner of every service it can describe. It helps a compatible client learn what is registered while keeping authorization boundaries intact.</p><div class="grid"><article class="card"><div class="num">01 / GOVERN</div><h3>Arche Coda</h3><p>Defines ecosystem identity, shared commitments, and the source of truth for registered services.</p></article><article class="card"><div class="num">02 / CONNECT</div><h3>Arche-MCP</h3><p>Exposes a narrow, authenticated interface for discovering service metadata and reading gateway policy.</p></article><article class="card"><div class="num">03 / RETAIN CONTROL</div><h3>Each product</h3><p>Retains responsibility for its own information, access rules, and consequential operations.</p></article></div></section>
<section id="trust" class="wrap section"><div class="eyebrow">Current safeguards</div><h2>Designed to start with less access.</h2><p class="section-intro">The current gateway intentionally exposes a small read-only tool set. Planned capabilities are not presented as working features.</p><div class="policy"><article class="card"><div class="status"><span class="dot"></span> Enabled by design</div><h3>Service discovery</h3><p>List registered services and retrieve a service's published registry metadata.</p></article><article class="card"><div class="status"><span class="dot"></span> Protected</div><h3>Authenticated connection</h3><p>The MCP endpoint requires a bearer token. Keep that token private and configure it in your client or secret manager.</p></article><article class="card"><div class="status"><span class="dot"></span> Denied by default</div><h3>Cross-product access</h3><p>Seeing a service in the registry does not grant access to its private data or let a client act on its behalf.</p></article><article class="card"><div class="status"><span class="dot"></span> Not exposed</div><h3>High-impact operations</h3><p>Write actions, memory access, and Sanctuary access are not exposed by the current gateway.</p></article></div><div class="callout">Consent, authorization, provenance, and audit contracts may describe the intended governance model; their existence alone does not mean an end-to-end enforcement workflow is already live.</div></section>
<section id="connect" class="wrap section"><div class="eyebrow">For developers and AI clients</div><h2>Connect through the MCP endpoint.</h2><p class="section-intro">Use an MCP-compatible client that supports remote Streamable HTTP and bearer-token authorization. Obtain access credentials from the system administrator through an approved channel.</p><div class="endpoint">https://mcp.arche-coda.com/mcp</div><p class="fine">Transport: MCP Streamable HTTP · Authentication: Bearer token · Access: read-only registry</p><h3 style="margin-top:28px">Available tools</h3><div class="grid"><article class="card"><h3><code>list_services</code></h3><p>Returns the registered service directory and registry metadata.</p></article><article class="card"><h3><code>get_service</code></h3><p>Returns published metadata for one canonical service ID.</p></article><article class="card"><h3><code>get_gateway_policy</code></h3><p>Explains the gateway's current access limits and contract status.</p></article></div><p class="fine" style="margin-top:18px">Health/status endpoint: <a href="/health">/health</a>. It reports service metadata; it is not a guarantee that every downstream dependency or client connection has been verified.</p></section>
<section class="wrap section"><div class="card"><div class="eyebrow">The principle</div><h2>Useful connections, explicit boundaries.</h2><p class="section-intro">Arche-MCP is being built so systems can work together without treating visibility as consent or interoperability as unlimited authority.</p><div class="actions"><a class="btn primary" href="https://github.com/idotamdot/Arche-MCP">Explore the source on GitHub</a><a class="btn secondary" href="https://arche-coda.com">Visit Arche Coda</a></div></div></section>
</main>
<footer class="wrap"><span>© Arche Coda · Arche-MCP</span><span>Clear purpose. Limited access. Accountable boundaries.</span></footer>
</body></html>`;

function jsonResponse(value: unknown): Response {
  return new Response(JSON.stringify(value), {
    headers: { "content-type": "application/json; charset=utf-8", ...securityHeaders },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return new Response(landingPage, {
        headers: { "content-type": "text/html; charset=utf-8", ...securityHeaders },
      });
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return jsonResponse({
        service: "arche-mcp",
        status: "ok",
        protocol: "MCP Streamable HTTP",
        endpoint: "/mcp",
        authentication: "required",
        access_mode: "read-only-registry",
      });
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
