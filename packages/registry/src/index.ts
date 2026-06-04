/**
 * @saferkeys/registry — typed access to the Saferkeys provider registry.
 *
 * Usage:
 *   import { getProvider, getProvidersByGroup, providers } from '@saferkeys/registry'
 *
 *   const p = getProvider('anthropic')
 *   p.get_key_url   // "https://console.anthropic.com/settings/keys"
 *   p.free_tier     // null
 *   p.requires_card // true
 *
 *   const llms = getProvidersByGroup('llm')
 */

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CapabilityGroup =
  | 'llm'
  | 'search'
  | 'embeddings'
  | 'tts'
  | 'stt'
  | 'image'
  | 'storage'
  | 'code'
  | 'scraping'
  | 'data'
  | 'communication'

export interface Provider {
  name: string
  capability_group: CapabilityGroup
  category_label: string
  capability: string
  env_var: string
  env_var_secondary?: string[]
  format_hint: string | null
  format_regex: string | null
  get_key_url: string
  docs_url: string
  health_check_url: string | null
  health_check_method: 'GET' | 'POST' | null
  health_check_headers: Record<string, string>
  free_tier: string | null
  free_tier_limit: number | null
  free_tier_unit: string | null
  free_tier_resets: 'monthly' | 'daily' | 'never' | null
  pricing_note: string | null
  requires_card: boolean
  expires: boolean
  alternatives: string[]
  tags?: string[]
  // Chinese provider fields
  accessible_outside_china?: boolean
  english_portal?: boolean
  // Internal
  _research_note?: string
}

export type ProviderSlug = string

export type ProviderMap = Record<ProviderSlug, Provider>

// ── Load registry ─────────────────────────────────────────────────────────────

function loadRegistry(): ProviderMap {
  // Walk up from packages/registry to find providers.json at the repo root
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const repoRoot = path.resolve(__dirname, '..', '..', '..')
  const registryPath = path.join(repoRoot, 'providers.json')

  try {
    const raw = fs.readFileSync(registryPath, 'utf-8')
    const data = JSON.parse(raw) as Record<string, unknown>
    // Filter out internal keys (prefixed with _)
    const result: ProviderMap = {}
    for (const [key, value] of Object.entries(data)) {
      if (!key.startsWith('_') && value && typeof value === 'object') {
        result[key] = value as Provider
      }
    }
    return result
  } catch (err) {
    throw new Error(`@saferkeys/registry: could not load providers.json — ${err}`)
  }
}

// ── Exports ───────────────────────────────────────────────────────────────────

/** All providers keyed by slug. */
export const providers: ProviderMap = loadRegistry()

/** All provider slugs. */
export const providerSlugs: ProviderSlug[] = Object.keys(providers)

/**
 * Get a single provider by slug.
 * Throws if the slug is not found.
 */
export function getProvider(slug: ProviderSlug): Provider {
  const p = providers[slug]
  if (!p) throw new Error(`@saferkeys/registry: unknown provider slug "${slug}"`)
  return p
}

/**
 * Get all providers for a capability group.
 * Returns an empty array if the group has no providers yet.
 */
export function getProvidersByGroup(group: CapabilityGroup): Array<Provider & { slug: ProviderSlug }> {
  return Object.entries(providers)
    .filter(([, p]) => p.capability_group === group)
    .map(([slug, p]) => ({ ...p, slug }))
}

/**
 * Get all unique capability groups that have at least one provider.
 */
export function getCapabilityGroups(): CapabilityGroup[] {
  return [...new Set(Object.values(providers).map((p) => p.capability_group))]
}

/**
 * Get the environment variable name for a provider slug.
 */
export function getEnvVar(slug: ProviderSlug): string {
  return getProvider(slug).env_var
}

/**
 * Get providers with a free tier (no credit card required).
 */
export function getFreeProviders(): Array<Provider & { slug: ProviderSlug }> {
  return Object.entries(providers)
    .filter(([, p]) => p.free_tier !== null && !p.requires_card)
    .map(([slug, p]) => ({ ...p, slug }))
}
