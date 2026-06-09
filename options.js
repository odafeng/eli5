const PROVIDER_INFO = {
  anthropic: {
    keyPlaceholder: "sk-ant-...",
    keyHint: 'Get your key at <a href="https://console.anthropic.com/settings/keys" target="_blank">console.anthropic.com</a>',
    defaultModel: "claude-sonnet-4-20250514",
    modelsUrl: "https://api.anthropic.com/v1/models?limit=100",
    headers: (key) => ({
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    }),
    parseModels: (data) =>
      (data.data || [])
        .map((m) => m.id)
        .filter((id) => id.startsWith("claude-"))
        .sort()
        .reverse(),
  },
  openai: {
    keyPlaceholder: "sk-...",
    keyHint: 'Get your key at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>',
    defaultModel: "gpt-4o-mini",
    modelsUrl: "https://api.openai.com/v1/models",
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
    parseModels: (data) =>
      (data.data || [])
        .map((m) => m.id)
        .filter((id) => /^(gpt-|o[1-9]|chatgpt-)/.test(id))
        .sort()
        .reverse(),
  },
};

const defaults = {
  provider: "anthropic",
  apiKey: "",
  model: "",
  ollamaModel: "llama3.2",
};

function $(id) {
  return document.getElementById(id);
}

function setModelDropdown(models, selectedModel) {
  const select = $("model");
  select.innerHTML = "";
  if (models.length === 0) {
    select.innerHTML = '<option value="">No models found</option>';
    select.disabled = true;
    return;
  }
  models.forEach((id) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = id;
    select.appendChild(opt);
  });
  select.disabled = false;
  if (selectedModel && models.includes(selectedModel)) {
    select.value = selectedModel;
  }
}

let fetchController = null;

async function fetchModels(provider, apiKey, selectedModel) {
  const select = $("model");
  const hint = $("modelHint");
  const refreshBtn = $("refreshModels");

  if (!apiKey) {
    select.innerHTML = '<option value="">Enter API key to load models...</option>';
    select.disabled = true;
    refreshBtn.disabled = true;
    hint.textContent = "";
    return;
  }

  // Abort any in-flight request
  if (fetchController) fetchController.abort();
  fetchController = new AbortController();

  select.innerHTML = '<option value="">Loading models...</option>';
  select.disabled = true;
  refreshBtn.disabled = true;
  hint.textContent = "";

  const info = PROVIDER_INFO[provider];
  try {
    const res = await fetch(info.modelsUrl, {
      headers: info.headers(apiKey),
      signal: fetchController.signal,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${res.status}: ${err.slice(0, 100)}`);
    }
    const data = await res.json();
    const models = info.parseModels(data);
    setModelDropdown(models, selectedModel || info.defaultModel);
    hint.textContent = `${models.length} models loaded`;
    hint.style.color = "#27ae60";
  } catch (e) {
    if (e.name === "AbortError") return;
    select.innerHTML = `<option value="">${info.defaultModel} (fallback)</option>`;
    select.disabled = false;
    select.value = "";
    hint.textContent = `Failed to load models: ${e.message}`;
    hint.style.color = "#e74c3c";
  } finally {
    refreshBtn.disabled = false;
  }
}

function updateProviderUI(fetchNewModels = true) {
  const provider = $("provider").value;
  const info = PROVIDER_INFO[provider];
  $("apiKey").placeholder = info.keyPlaceholder;
  $("apiKeyHint").innerHTML = info.keyHint;
  if (fetchNewModels) {
    fetchModels(provider, $("apiKey").value.trim());
  }
}

// Debounce API key input to avoid fetching on every keystroke
let debounceTimer = null;
$("apiKey").addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchModels($("provider").value, $("apiKey").value.trim());
  }, 600);
});

$("provider").addEventListener("change", () => updateProviderUI(true));

$("refreshModels").addEventListener("click", () => {
  fetchModels($("provider").value, $("apiKey").value.trim(), $("model").value);
});

// Load saved settings
chrome.storage.sync.get(defaults, (items) => {
  $("provider").value = items.provider;
  $("apiKey").value = items.apiKey;
  $("ollamaModel").value = items.ollamaModel;
  updateProviderUI(false);
  fetchModels(items.provider, items.apiKey, items.model);
});

// Save settings
$("save").addEventListener("click", () => {
  const settings = {
    provider: $("provider").value,
    apiKey: $("apiKey").value.trim(),
    model: $("model").value,
    ollamaModel: $("ollamaModel").value.trim() || defaults.ollamaModel,
  };

  chrome.storage.sync.set(settings, () => {
    const status = $("status");
    status.textContent = "Settings saved!";
    status.className = "status";
    status.style.display = "block";
    setTimeout(() => { status.style.display = "none"; }, 2000);
  });
});
