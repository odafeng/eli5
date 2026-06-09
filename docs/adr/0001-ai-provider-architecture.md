# ADR 0001: AI Provider Architecture

## Status
Superseded (v1.1.0 — replaced Groq-only with multi-provider)

## Context
This Chrome extension needs a language model to generate ELI5 explanations. Requirements:
- Should support mainstream cloud AI providers
- Should fallback to local model when no API key or cloud is unavailable
- Must be simple to configure

Options considered:
1. **Anthropic Claude API** - High quality, paid
2. **OpenAI API** - Widely adopted, paid
3. **Groq API** - Free tier but API key issues encountered in practice
4. **Ollama** - Runs open-source models locally, no cost, requires local setup

Initially chose Groq for free access, but Groq API keys proved unreliable. Pivoted to letting users choose their preferred paid provider.

## Decision
Let users **choose between Anthropic (Claude) and OpenAI (GPT)** as cloud providers, with **Ollama as the local fallback**.

- Users select their provider in the options page and supply their own API key
- Default models: `claude-sonnet-4-20250514` (Anthropic) / `gpt-4o-mini` (OpenAI)
- If cloud call fails or no API key is set, automatically fallback to Ollama (localhost:11434)

## Consequences

### Positive
- Users get to pick the provider they already have an account with
- Both Claude and GPT are high-quality for ELI5 explanations
- Ollama fallback still provides a zero-cost offline option
- Easy to add more providers in the future (provider dispatch pattern)

### Negative
- Cloud providers require paid API keys (no free tier for casual users)
- Ollama requires separate installation and model download (~2-4 GB)
- Users must manage their own API keys
