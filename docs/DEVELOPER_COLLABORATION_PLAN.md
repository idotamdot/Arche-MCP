# Arche MCP — Developer Collaboration Integration Plan

**Status:** Proposed roadmap, not an implemented capability. **Reviewed:** November 2, 2026.  
**Current surface:** Cloudflare Worker remote MCP at `/mcp`, bearer-token authentication, read-only `list_services`, `get_service`, `get_gateway_policy`. See [README](../README.md). The remote endpoint and authorization still require live protocol verification before declaring client readiness.

## Purpose

Make AI coding collaborators such as Codex and ChatGPT better at understanding *existing projects* before proposing code. The gateway should improve repository discovery, explicit project boundaries, source-of-truth documentation and change preparation—not become a second code editor or a broad privileged action proxy.

**Do not merge the igivegreatweb product suite into the Arche Coda portfolio merely because this gateway can discover it.** Cross-portfolio discovery must be explicitly authorized and labeled, with separate owner/repository permissions. Registered metadata is not proof of access to a repository's private files.

## First planned capability: read-only development context

Proposed tools, subject to identity and permission design:

1. `list_project_docs`: discover repository README, PRODUCT/WORK_PLAN/ENGINEERING_AUDIT and typed contracts for an authorized repository. Return paths and latest source revisions.
2. `get_project_contract`: return a bounded, versioned product specification, ownership boundary and active task plan with provenance. Mark requirements as intended versus implemented.
3. `get_implementation_status`: return verifiable compiler/test/build results and source revisions, with timestamp. Do not infer deployment readiness from passing CI.
4. `resolve_existing_capability`: locate the current code implementing a requested behavior (for example, Prompt Genie's handoff) before any replacement is proposed. Return file paths and source revisions, not unverified conclusions.
5. `get_change_constraints`: disclose source ownership, approved editing scope, dependency contracts, sensitive boundaries and any required user approval.

These are proposals: **none of these five tools are exposed by Arche MCP today.** Never claim that reading the registry already gives Codex repository content, context memory, or a live editing capability.

## Codex/assistant workflow after adding authorized read access

- Identify the correct project and repository; discover its real source of truth.
- Read `README.md` for verified behavior; `docs/PRODUCT_SPECIFICATION.md` for target behavior; `docs/WORK_PLAN.md` for current task, boundaries and sequence; and `docs/ENGINEERING_AUDIT.md` for evidence.
- Inspect the actual feature implementation and tests *before* changing code. Prefer a targeted fix when it fully resolves the issue.
- Permit a deliberate rewrite only with a documented benefit, migration/compatibility plan, regression tests and rollback approach. Never silently overwrite user-authored artifacts.
- Build with strict explicit TypeScript contracts and verify with repository commands. Report commit, check result and unverified production behavior separately.
- Never use a registry entry as authorization to read secrets, private customer data or perform a cross-product operation.

## Security gates before implementation

Require per-caller identity, scoped repository grants, tenant and project boundaries, least-privilege credential handling, bounded result sizes and provenance. If source is private, fetch it only through an authorized code-host connector; never expose raw credentials through MCP. Add audit records for reads of sensitive metadata, timeouts/retries and secret redaction. The existing single gateway bearer token is not a substitute for individual per-project authorization.

**Keep writes disabled initially.** Any future create/update/commit tool would require distinct authorization, human confirmation for consequential operations, version/ETag checks, idempotency, an audit trail and rollback procedures. Explicitly preserve the existing default-deny cross-product policy.

## Initial integration test

Given a request to improve Prompt Genie's transfer to UX Designer Studio, a connected assistant must correctly report that `idotamdot/Prompt-Genie` already sends an authenticated structured `postMessage` handoff and `idotamdot/user-experience-designer-studio` already receives it. The assistant must propose downstream orchestration changes without creating a duplicate handoff protocol. Test missing access, stale documentation, unauthorized repo, outdated CI and conflicting file changes.

## Near-term decision

Keep the gateway as an optional, securely connected **read-only collaboration map**. First confirm `/health` and `/mcp` through an authorized MCP client, then implement and verify a narrow repository-context contract. Do not change the actual studio code or deploy new gateway permissions until the integration is reviewed.
