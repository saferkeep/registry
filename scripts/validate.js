#!/usr/bin/env node
/**
 * Validates providers.json beyond what JSON Schema can check:
 * - No citation artifacts from AI research tools
 * - All alternative refs point to real slugs
 * - get_key_url is not a homepage (must have a path)
 * - All capability_group values are in the allowed set
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const data = JSON.parse(readFileSync(path.join(__dirname, '../providers.json'), 'utf-8'))

const ALLOWED_GROUPS = new Set([
  'llm', 'search', 'embeddings', 'tts', 'stt',
  'image', 'storage', 'code', 'scraping', 'data', 'communication'
])

const providers = Object.keys(data).filter(k => !k.startsWith('_'))
let errors = 0

function fail(msg) {
  console.error(`❌ ${msg}`)
  errors++
}

for (const slug of providers) {
  const p = data[slug]
  const str = JSON.stringify(p)

  // Citation artifacts from ChatGPT deep research
  if (str.includes('†') || str.includes('【') || str.includes('†L')) {
    fail(`${slug}: contains citation artifacts — strip 【...†...】 from fields`)
  }

  // Broken alternative refs
  for (const alt of (p.alternatives ?? [])) {
    if (!data[alt]) {
      fail(`${slug}: alternatives references unknown slug "${alt}"`)
    }
  }

  // get_key_url should be a deep link, not just a domain
  try {
    const url = new URL(p.get_key_url)
    if (url.pathname === '/' || url.pathname === '') {
      fail(`${slug}: get_key_url "${p.get_key_url}" looks like a homepage — link directly to the key creation page`)
    }
  } catch {
    fail(`${slug}: get_key_url "${p.get_key_url}" is not a valid URL`)
  }

  // Valid capability group
  if (!ALLOWED_GROUPS.has(p.capability_group)) {
    fail(`${slug}: unknown capability_group "${p.capability_group}"`)
  }

  // capability should be a single sentence (no double periods, not empty)
  if (!p.capability || p.capability.trim().length < 10) {
    fail(`${slug}: capability is too short or empty`)
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s) found in providers.json`)
  process.exit(1)
} else {
  console.log(`✅ providers.json valid — ${providers.length} providers checked`)
}
