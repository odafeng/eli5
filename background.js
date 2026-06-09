const SYSTEM_PROMPT = `You are an ELI5 (Explain Like I'm Five) assistant.
The user will give you a piece of text they don't understand.
Explain it in the simplest possible way, as if you're talking to a five-year-old.
Use short sentences, everyday analogies, and avoid jargon.
Keep it under 100 words. Reply in the same language as the input text.`;

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OLLAMA_API_URL = "http://localhost:11434/api/chat";

const DEFAULT_MODELS = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o-mini",
  ollama: "llama3.2",
};

const REQUEST_TIMEOUT = 30000;

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      {
        provider: "anthropic",
        apiKey: "",
        model: "",
        ollamaModel: DEFAULT_MODELS.ollama,
      },
      resolve
    );
  });
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callAnthropic(text, apiKey, model) {
  const res = await fetchWithTimeout(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODELS.anthropic,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.content[0].text.trim();
}

async function callOpenAI(text, apiKey, model) {
  const res = await fetchWithTimeout(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODELS.openai,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      temperature: 0.7,
      max_tokens: 256,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function callOllama(text, model) {
  const res = await fetchWithTimeout(OLLAMA_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      stream: false,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.message.content.trim();
}

const PROVIDERS = {
  anthropic: { call: callAnthropic, label: "Claude" },
  openai: { call: callOpenAI, label: "OpenAI" },
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "eli5") return;

  (async () => {
    try {
      const settings = await getSettings();
      const { provider, apiKey, model, ollamaModel } = settings;
      const effectiveModel = model || DEFAULT_MODELS[provider] || "";

      // Try cloud provider first if API key is available
      if (apiKey && PROVIDERS[provider]) {
        try {
          const result = await PROVIDERS[provider].call(message.text, apiKey, effectiveModel);
          sendResponse({ result, source: `${PROVIDERS[provider].label} (${effectiveModel})` });
          return;
        } catch (e) {
          console.warn(`ELI5: ${provider} failed, falling back to Ollama:`, e.message);
        }
      }

      // Fallback to Ollama
      try {
        const result = await callOllama(message.text, ollamaModel);
        sendResponse({ result, source: `Ollama (${ollamaModel})` });
      } catch (e) {
        sendResponse({
          error: apiKey
            ? `${PROVIDERS[provider]?.label || provider} and Ollama both failed. Check your settings.`
            : "No API key set and Ollama is not running. Go to extension options to configure.",
        });
      }
    } catch (e) {
      console.error("ELI5: unexpected error:", e);
      sendResponse({ error: `Unexpected error: ${e.message}` });
    }
  })();

  return true;
});
