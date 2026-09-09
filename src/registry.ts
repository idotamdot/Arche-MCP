export type ServiceRole =
  | 'registry-governance'
  | 'trust-control-plane'
  | 'builder-tooling'
  | 'product'
  | 'protected-sanctuary';

export interface EcosystemService {
  id: string;
  repo: string;
  role: ServiceRole;
  exposure?: string;
}

export const protocolVersion = '1.0.0';

export const services: EcosystemService[] = [
  { id: 'arche-coda', repo: 'idotamdot/arche-coda', role: 'registry-governance' },
  { id: 'symbiont-protocol', repo: 'idotamdot/Symbiont-Protocol', role: 'trust-control-plane' },
  { id: 'archescriber', repo: 'idotamdot/ArcheScriber', role: 'builder-tooling' },
  { id: 'prompt-genie', repo: 'idotamdot/Prompt-Genie', role: 'builder-tooling' },
  { id: 'loc-geist', repo: 'idotamdot/loc-geist', role: 'product' },
  { id: 'propertyseer', repo: 'idotamdot/Propertyseer', role: 'product' },
  { id: 'soulmate-finder', repo: 'idotamdot/SoulMateFinder', role: 'product' },
  { id: 'enter-sanctum', repo: 'idotamdot/Enter-Sanctum', role: 'product' },
  { id: 'mycelium-station', repo: 'idotamdot/Mycelium-Station', role: 'product' },
  { id: 'austin-ai-software', repo: 'idotamdot/austin-ai-software', role: 'product' },
  { id: 'pocket-business', repo: 'idotamdot/Pocket-Business', role: 'product' },
  { id: 'common-ground', repo: 'idotamdot/Common-Ground', role: 'product' },
  { id: 'block-party', repo: 'idotamdot/Block-Party', role: 'product' },
  { id: 'random-epic-hero', repo: 'idotamdot/RandomEpicHero', role: 'product' },
  { id: 'community-seed', repo: 'idotamdot/Community-Seed', role: 'product' },
  {
    id: 'sanctuary',
    repo: 'idotamdot/SANCTUARY-TANGELICAS_CASTLE',
    role: 'protected-sanctuary',
    exposure: 'none-by-default',
  },
];

export function getService(id: string): EcosystemService | undefined {
  return services.find((service) => service.id === id);
}
