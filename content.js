(() => {
  let triggerBtn = null;
  let tooltip = null;

  function removeTriggerBtn() {
    if (triggerBtn) {
      triggerBtn.remove();
      triggerBtn = null;
    }
  }

  function removeTooltip() {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  }

  function createTooltip(x, y) {
    removeTooltip();
    tooltip = document.createElement("div");
    tooltip.id = "eli5-tooltip";
    tooltip.innerHTML = `
      <div class="eli5-header">
        <span class="eli5-title">ELI5</span>
        <button class="eli5-close">&times;</button>
      </div>
      <div class="eli5-body">
        <span class="eli5-loading">Thinking...</span>
      </div>
    `;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    document.body.appendChild(tooltip);

    tooltip.querySelector(".eli5-close").addEventListener("click", removeTooltip);

    // Keep tooltip within viewport
    requestAnimationFrame(() => {
      if (!tooltip) return;
      const rect = tooltip.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        tooltip.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > window.innerHeight) {
        tooltip.style.top = `${y - rect.height - 10}px`;
      }
    });

    return tooltip;
  }

  function setTooltipContent(html) {
    if (!tooltip) return;
    const body = tooltip.querySelector(".eli5-body");
    if (body) body.innerHTML = html;
  }

  document.addEventListener("mouseup", (e) => {
    // Ignore clicks on our own UI
    if (e.target.closest("#eli5-trigger-btn") || e.target.closest("#eli5-tooltip")) return;

    removeTriggerBtn();

    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (!text || text.length < 2) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    triggerBtn = document.createElement("button");
    triggerBtn.id = "eli5-trigger-btn";
    triggerBtn.textContent = "ELI5?";
    triggerBtn.style.left = `${window.scrollX + rect.left + rect.width / 2 - 25}px`;
    triggerBtn.style.top = `${window.scrollY + rect.top - 35}px`;
    document.body.appendChild(triggerBtn);

    triggerBtn.addEventListener("click", () => {
      const selectedText = text;
      removeTriggerBtn();

      const ttip = createTooltip(
        window.scrollX + rect.left,
        window.scrollY + rect.bottom + 8
      );

      chrome.runtime.sendMessage(
        { type: "eli5", text: selectedText },
        (response) => {
          if (chrome.runtime.lastError) {
            setTooltipContent(`<span class="eli5-error">Extension error. Try reloading the page.</span>`);
            return;
          }
          if (response.error) {
            setTooltipContent(`<span class="eli5-error">${escapeHtml(response.error)}</span>`);
          } else {
            setTooltipContent(
              `${escapeHtml(response.result)}` +
              `<div class="eli5-source">via ${escapeHtml(response.source)}</div>`
            );
          }
        }
      );
    });
  });

  // Dismiss trigger button when clicking elsewhere
  document.addEventListener("mousedown", (e) => {
    if (e.target.closest("#eli5-trigger-btn") || e.target.closest("#eli5-tooltip")) return;
    removeTriggerBtn();
  });

  // Dismiss tooltip on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      removeTriggerBtn();
      removeTooltip();
    }
  });

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
