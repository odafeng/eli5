const defaults = {
  groqApiKey: "",
  groqModel: "llama-3.3-70b-versatile",
  ollamaModel: "llama3.2",
};

function $(id) {
  return document.getElementById(id);
}

// Load saved settings
chrome.storage.sync.get(defaults, (items) => {
  $("groqApiKey").value = items.groqApiKey;
  $("groqModel").value = items.groqModel;
  $("ollamaModel").value = items.ollamaModel;
});

// Save settings
$("save").addEventListener("click", () => {
  const settings = {
    groqApiKey: $("groqApiKey").value.trim(),
    groqModel: $("groqModel").value.trim() || defaults.groqModel,
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
