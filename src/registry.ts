import { RegistryServicesSchema } from "./contracts";

export type ServiceRole =
  | "registry-governance"
  | "trust-control-plane"
  | "interoperability-gateway"
  | "operational-intelligence"
  | "builder-tooling"
  | "product"
  | "protected-sanctuary";

export interface EcosystemService {
  id: string;
  repo: string;
  role: ServiceRole;
  exposure?: string;
}

export interface RegistrySnapshot {
  services: EcosystemService[];
  source: "arche-coda-live" | "local-fallback";
  checked_at: string;
  schema_version: string | null;
  warning?: string;
}

export const protocolVersion = "1.1.0";

/** Last-resort metadata only. The authoritative registry is Arche Coda's public manifest. */
export const services: EcosystemService[] = [
  { id: "arche-coda", repo: "idotamdot/arche-coda", role: "registry-governance" },
  { id: "arche-mcp", repo: "idotamdot/Arche-MCP", role: "interoperability-gateway" },
  { id: "arche-control-center", repo: "idotamdot/Arche-Control-Center", role: "operational-intelligence" },
  { id: "symbiont-protocol", repo: "idotamdot/Symbiont-Protocol", role: "trust-control-plane" },
  { id: "archescriber", repo: "idotamdot/ArcheScriber", role: "builder-tooling" },
  { id: "sanctuary", repo: "idotamdot/SANCTUARY-TANGELICAS_CASTLE", role: "protected-sanctuary", exposure: "none-by-default" },
];

RegistryServicesSchema.parse(services);

function roleFor(service: Record<string, unknown>): ServiceRole {
  if (service.id === "sanctuary" || service.tier === "protected" || service.kind === "sanctuary") return "protected-sanctuary";
  if (service.kind === "registry-governance") return "registry-governance";
  if (service.kind === "trust-control-plane") return "trust-control-plane";
  if (service.kind === "interoperability-gateway") return "interoperability-gateway";
  if (service.kind === "operational-intelligence") return "operational-intelligence";
  if (service.kind === "making-layer" || service.kind === "builder-tooling") return "builder-tooling";
  return "product";
}

function normalizeCanonicalServices(value: unknown): { services: EcosystemService[]; schemaVersion: string | null } {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Registry root must be an object.");
  const manifest = value as Record<string, unknown>;
  if (!Array.isArray(manifest.services)) throw new Error("Registry services array is missing.");

  const normalized = manifest.services.flatMap((item): EcosystemService[] => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const service = item as Record<string, unknown>;
    if (typeof service.id !== "string" || typeof service.repo !== "string" || !/^[^/]+\/[^/]+$/.test(service.repo)) return [];
    const entry: EcosystemService = {
      id: service.id,
      repo: service.repo,
      role: roleFor(service),
    };
    if (entry.role === "protected-sanctuary") entry.exposure = "none-by-default";
    return [entry];
  });

  const parsed = RegistryServicesSchema.parse(normalized);
  const ids = new Set(parsed.map((service) => service.id));
  for (const requiredId of ["arche-coda", "arche-mcp", "arche-control-center", "archescriber"]) {
    if (!ids.has(requiredId)) throw new Error(`Canonical registry is missing required service: ${requiredId}`);
  }
  return {
    services: parsed,
    schemaVersion: typeof manifest.schema_version === "string" ? manifest.schema_version : null,
  };
}

/** Read only public registry metadata. On upstream failure, clearly mark the local fallback as stale/unverified. */
export async function loadRegistry(): Promise<RegistrySnapshot> {
  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/idotamdot/arche-coda/main/ecosystem.manifest.json",
      {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(4500),
      },
    );
    if (!response.ok) throw new Error(`Canonical registry returned HTTP ${response.status}`);
    const normalized = normalizeCanonicalServices(await response.json());
    return {
      services: normalized.services,
      source: "arche-coda-live",
      checked_at: checkedAt,
      schema_version: normalized.schemaVersion,
    };
  } catch (error) {
    return {
      services,
      source: "local-fallback",
      checked_at: checkedAt,
      schema_version: null,
      warning: error instanceof Error ? error.message : "Canonical registry could not be read.",
    };
  }
}

export function getService(id: string, registryServices: EcosystemService[] = services): EcosystemService | undefined {
  return registryServices.find((service) => service.id === id);
}
