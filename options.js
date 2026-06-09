const PROVIDER_INFO = {
  anthropic: {
    keyPlaceholder: "sk-ant-...",
    keyHint: 'Get your key at <a href="https://console.anthropic.com/settings/keys" target="_blank">console.anthropic.com</a>',
    modelPlaceholder: "claude-sonnet-4-20250514",
    modelHint: "Default: claude-sonnet-4-20250514",
  },
  openai: {
    keyPlaceholder: "sk-...",
    keyHint: 'Get your key at <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com</a>',
    modelPlaceholder: "gpt-4o-mini",
    modelHint: "Default: gpt-4o-mini",
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

function updateProviderUI() {
  const provider = $("provider").value;
  const info = PROVIDER_INFO[provider];
  $("apiKey").placeholder = info.keyPlaceholder;
  $("apiKeyHint").innerHTML = info.keyHint;
  $("model").placeholder = info.modelPlaceholder;
  $("modelHint").textContent = info.modelHint;
}

// Load saved settings
chrome.storage.sync.get(defaults, (items) => {
  $("provider").value = items.provider;
  $("apiKey").value = items.apiKey;
  $("model").value = items.model;
  $("ollamaModel").value = items.ollamaModel;
  updateProviderUI();
});

$("provider").addEventListener("change", updateProviderUI);

// Save settings
$("save").addEventListener("click", () => {
  const settings = {
    provider: $("provider").value,
    apiKey: $("apiKey").value.trim(),
    model: $("model").value.trim(),
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
