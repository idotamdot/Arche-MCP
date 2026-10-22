# Arche-MCP

**Canonical custom domain:** https://mcp.arche-coda.com

Cloudflare confirms `mcp.arche-coda.com` is attached and enabled for the `arche-mcp` Worker. Vercel also reports this hostname attached to its `arche-mcp` project, so the registry records that second association as a routing ambiguity to resolve—not as proof of traffic destination. Confirm the active DNS target and live requests before declaring routing healthy. The remote MCP endpoint is `/mcp` and requires a bearer token; `GET /health` is the health/status route. The automated request to `GET /health` returned a Cloudflare challenge page (HTTP 403), so it did not reach a verifiable health response. Live health, unauthenticated rejection, and authenticated MCP operation remain unverified. The hostname is also still associated with a separate Vercel project named `arche-mcp`; the Worker domain and Cloudflare DNS are configured for the intended MCP runtime, but that unused Vercel association remains a cleanup item.

Arche-MCP is the protected interoperability gateway for the Arche Coda ecosystem.

## Current deployment model

This repository is a Cloudflare Worker that exposes a remote MCP endpoint over Streamable HTTP.

- Health/status: `GET /health`
- MCP endpoint: `/mcp`
- Authentication: bearer token required for `/mcp`
- Default access: read-only registry
- Cross-product access: deny by default
- Consequential actions: not exposed
- Sanctuary access: none by default

The initial remote tool surface is intentionally narrow:

- `list_services`
- `get_service`
- `get_gateway_policy`

Registry visibility never grants access to private product data or authority to perform actions in another service.

## Cloudflare secret

Set `ARCHE_MCP_TOKEN` as a Cloudflare Worker secret. Do not commit it to GitHub or place it in `wrangler.jsonc`.

With Wrangler:

```bash
npx wrangler secret put ARCHE_MCP_TOKEN
```

Or create the secret in the Cloudflare Worker dashboard under Settings / Variables and Secrets.

## Local development

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

After deployment, verify `/health` first. Then connect an MCP client to the Worker URL ending in `/mcp` and provide the bearer token through the client's supported authorization configuration.

## Security direction

Write tools, product-private-data access, memory access, and consequential actions must not be added until Arche Coda authorization, audit, correction/rollback, and verification controls are implemented and reviewed.
