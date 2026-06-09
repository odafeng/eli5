# ADR 0001: AI Provider Architecture

## Status
Accepted

## Context
This Chrome extension needs a language model to generate ELI5 explanations. Requirements:
- Should work with a free cloud API (no cost barrier)
- Should fallback to local model when no API key or cloud is unavailable
- Must be simple to configure

Options considered:
1. **Anthropic Claude API** - High quality but paid, closed-source
2. **OpenAI API** - Paid, closed-source
3. **Groq API** - Free tier, runs open-source models (Llama 3.3 70B), extremely fast inference
4. **Ollama** - Runs open-source models locally, no cost, requires local setup

## Decision
Use **Groq as the default cloud provider** and **Ollama as the local fallback**.

- Groq provides free access to Llama 3.3 70B with fast inference via their LPU hardware
- Ollama provides a zero-cost, privacy-first fallback that works offline
- The extension auto-detects: if Groq API key exists, use Groq; otherwise, try Ollama

## Consequences

### Positive
- Zero cost for users (Groq free tier + Ollama)
- Open-source models only (Llama 3.3 / Llama 3.2)
- Works offline via Ollama fallback
- Groq's speed makes the UX feel responsive

### Negative
- Groq free tier has rate limits (~30 req/min) - may hit limits with heavy use
- Ollama requires separate installation and model download (~2-4 GB)
- Open-source model quality may be lower than Claude/GPT-4 for nuanced explanations
- Groq API availability depends on a third-party service
