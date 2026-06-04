# Saferkeys Registry

A community-maintained registry of AI and developer API key providers.

Every entry includes: where to get the key, what it costs, free tier details, the environment variable name, and a health check endpoint for validation.

Used by [Saferkeys](https://github.com/saferkeys/saferkeys) to power the **Keys** setup page — so users see a guided, plain-English list of providers instead of hunting through docs.

## Install

```bash
npm install @saferkeys/registry
```

```typescript
import { getProvider, getProvidersByGroup, getFreeProviders } from '@saferkeys/registry'

// Get a specific provider
const anthropic = getProvider('anthropic')
console.log(anthropic.get_key_url)   // https://console.anthropic.com/settings/keys
console.log(anthropic.requires_card) // true
console.log(anthropic.free_tier)     // null

// Get all LLM providers
const llms = getProvidersByGroup('llm')

// Get all providers with a free tier and no credit card required
const free = getFreeProviders()
```

## Providers

| Group | Providers |
|---|---|
| 🤖 AI & Language Models | Anthropic, OpenAI, xAI, Groq, Mistral, Cohere, Google Gemini, Together, Fireworks, Replicate, Hugging Face, Perplexity, DeepSeek, AWS Bedrock, AI21 Labs |
| 🔍 Search | _(coming soon)_ |
| 🎙️ Speech | _(coming soon)_ |
| 🖼️ Image | _(coming soon)_ |

More groups arriving as research PRs land. See [open issues](https://github.com/saferkeys/registry/issues) to contribute.

## Add a provider

1. Fork this repo
2. Add your entry to `providers.json` following the schema below
3. Run `node scripts/validate.js` to check your entry
4. Open a PR using the **Add Provider** template

One provider per PR. CI validates the schema automatically.

### Required fields

```json
{
  "provider-slug": {
    "name": "Provider Name",
    "capability_group": "llm",
    "category_label": "AI & Language Models",
    "capability": "One sentence — what does this do for an AI app?",
    "env_var": "PROVIDER_API_KEY",
    "format_hint": "prefix-...",
    "format_regex": "^prefix-[A-Za-z0-9]+$",
    "get_key_url": "https://console.provider.com/api-keys",
    "docs_url": "https://docs.provider.com/authentication",
    "health_check_url": "https://api.provider.com/v1/models",
    "health_check_method": "GET",
    "health_check_headers": { "Authorization": "Bearer {key}" },
    "free_tier": "1,000 requests/month free",
    "free_tier_limit": 1000,
    "free_tier_unit": "requests",
    "free_tier_resets": "monthly",
    "pricing_note": "Then $0.001/request.",
    "requires_card": false,
    "expires": false,
    "alternatives": ["other-slug"]
  }
}
```

`get_key_url` must link directly to the key creation page — not the homepage.
`health_check_url` should be a cheap or free endpoint (e.g. list models).
If a field is genuinely unknown, use `null` — don't guess.

## Capability groups

| Value | Label |
|---|---|
| `llm` | AI & Language Models |
| `search` | Search & Research |
| `embeddings` | Embeddings |
| `tts` | Text to Speech |
| `stt` | Speech to Text |
| `image` | Image Generation |
| `storage` | Storage & Data |
| `code` | Code & DevTools |
| `scraping` | Web Scraping |
| `data` | Data & Analytics |
| `communication` | Communication |

## License

MIT
