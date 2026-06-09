# ELI5 - Explain Like I'm Five (Chrome Extension)

A Chrome extension that lets you select any text on a webpage and instantly get a simple, jargon-free explanation — as if you were five years old.

## Features

- **Select & Explain** — Highlight any text, click the "ELI5?" button, and get a plain-language explanation in a tooltip
- **Groq Cloud (Default)** — Uses Groq's free API with Llama 3.3 70B for fast, high-quality explanations
- **Ollama Fallback** — No API key? No problem. Falls back to a local Ollama model automatically
- **Multilingual** — Replies in the same language as the selected text
- **Zero Cost** — Both Groq (free tier) and Ollama (local) are free

## How It Works

```
Select text → "ELI5?" button appears → Click → AI explains it simply
```

```
┌─────────────────────────────────┐
│  User selects text on any page  │
└──────────────┬──────────────────┘
               ▼
       ┌──────────────┐
       │  "ELI5?" btn │
       └──────┬───────┘
              ▼
    ┌───────────────────┐    Yes    ┌────────────────┐
    │  Groq API Key set? ├─────────►│  Call Groq API  │
    └────────┬──────────┘           └───────┬────────┘
             │ No                            │
             ▼                               ▼
    ┌─────────────────┐            ┌─────────────────┐
    │  Call Ollama     │            │  Show tooltip    │
    │  (localhost)     │            │  with result     │
    └────────┬────────┘            └─────────────────┘
             │
             ▼
    ┌─────────────────┐
    │  Show tooltip    │
    │  with result     │
    └─────────────────┘
```

## Installation

1. Clone this repo:
   ```bash
   git clone https://github.com/odafeng/eli5.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → select the `eli5/` folder
5. (Optional) Click the extension's options to set your Groq API key

## Configuration

Open the extension's **Options** page to configure:

| Setting | Description | Default |
|---------|-------------|---------|
| Groq API Key | Free at [console.groq.com/keys](https://console.groq.com/keys) | (none) |
| Groq Model | Cloud model to use | `llama-3.3-70b-versatile` |
| Ollama Model | Local fallback model | `llama3.2` |

### Using Ollama (no API key needed)

1. Install Ollama from [ollama.com](https://ollama.com)
2. Pull a model:
   ```bash
   ollama pull llama3.2
   ```
3. Make sure Ollama is running (`ollama serve`)
4. The extension will automatically use it when no Groq API key is set

## Tech Stack

- Chrome Extension Manifest V3
- Groq API (Llama 3.3 70B) — cloud
- Ollama — local fallback
- Vanilla JavaScript (no frameworks)

## License

MIT

---

# ELI5 - 用五歲小孩聽得懂的話解釋（Chrome 擴充套件）

一個 Chrome 擴充套件，讓你在任何網頁上反白選取看不懂的文字，一鍵獲得簡單易懂的解釋——就像在跟五歲小孩說話一樣。

## 功能特色

- **選取即解釋** — 反白任何文字，點擊「ELI5?」按鈕，tooltip 中即時顯示白話解釋
- **Groq 雲端（預設）** — 使用 Groq 的免費 API 搭配 Llama 3.3 70B，快速且高品質
- **Ollama 地端備援** — 沒有 API key？沒關係，自動切換到本地 Ollama 模型
- **多語言支援** — 回覆語言與選取文字相同
- **完全免費** — Groq（免費方案）和 Ollama（本地）都不用錢

## 運作原理

```
反白選取文字 → 出現「ELI5?」按鈕 → 點擊 → AI 用白話解釋
```

## 安裝方式

1. Clone 這個 repo：
   ```bash
   git clone https://github.com/odafeng/eli5.git
   ```
2. 打開 Chrome，前往 `chrome://extensions/`
3. 開啟右上角的**開發人員模式**
4. 點擊**載入未封裝項目** → 選擇 `eli5/` 資料夾
5. （選用）點擊擴充套件的選項頁面設定 Groq API key

## 設定說明

開啟擴充套件的**選項**頁面進行設定：

| 設定項目 | 說明 | 預設值 |
|---------|------|--------|
| Groq API Key | 在 [console.groq.com/keys](https://console.groq.com/keys) 免費申請 | （無） |
| Groq Model | 雲端使用的模型 | `llama-3.3-70b-versatile` |
| Ollama Model | 本地備援模型 | `llama3.2` |

### 使用 Ollama（不需要 API key）

1. 從 [ollama.com](https://ollama.com) 安裝 Ollama
2. 下載模型：
   ```bash
   ollama pull llama3.2
   ```
3. 確保 Ollama 正在執行（`ollama serve`）
4. 擴充套件會在沒有設定 Groq API key 時自動使用它

## 技術架構

- Chrome Extension Manifest V3
- Groq API（Llama 3.3 70B）— 雲端
- Ollama — 地端備援
- 純 JavaScript（無框架）
