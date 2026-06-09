const SYSTEM_PROMPT = `You are an ELI5 (Explain Like I'm Five) assistant.
The user will give you a piece of text they don't understand.
Explain it in the simplest possible way, as if you're talking to a five-year-old.
Use short sentences, everyday analogies, and avoid jargon.
Keep it under 100 words. Reply in the same language as the input text.`;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const OLLAMA_API_URL = "http://localhost:11434/api/chat";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_OLLAMA_MODEL = "llama3.2";

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      { groqApiKey: "", groqModel: DEFAULT_GROQ_MODEL, ollamaModel: DEFAULT_OLLAMA_MODEL },
      resolve
    );
  });
}

async function callGroq(text, apiKey, model) {
  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
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
    throw new Error(`Groq API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

async function callOllama(text, model) {
  const res = await fetch(OLLAMA_API_URL, {
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "eli5") return;

  (async () => {
    const settings = await getSettings();
    const { groqApiKey, groqModel, ollamaModel } = settings;

    // Try Groq first if API key is available
    if (groqApiKey) {
      try {
        const result = await callGroq(message.text, groqApiKey, groqModel);
        sendResponse({ result, source: `Groq (${groqModel})` });
        return;
      } catch (e) {
        console.warn("ELI5: Groq failed, falling back to Ollama:", e.message);
      }
    }

    // Fallback to Ollama
    try {
      const result = await callOllama(message.text, ollamaModel);
      sendResponse({ result, source: `Ollama (${ollamaModel})` });
    } catch (e) {
      sendResponse({
        error: groqApiKey
          ? "Both Groq and Ollama failed. Check your settings."
          : "No API key set and Ollama is not running. Go to extension options to configure.",
      });
    }
  })();

  return true; // keep message channel open for async response
});
