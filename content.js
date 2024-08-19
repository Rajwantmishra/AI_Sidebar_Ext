chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectSidebar") {
    injectSidebar(request.selectedText);
  }
});

function injectSidebar(selectedText) {
  if (document.getElementById("ai-sidebar")) {
    document.getElementById("chat-context").value = selectedText;
    return;
  }

  const sidebar = document.createElement("div");
  sidebar.id = "ai-sidebar";
  sidebar.style.position = "fixed";
  sidebar.style.top = "0";
  sidebar.style.right = "0";
  sidebar.style.width = "320px";
  sidebar.style.height = "100%";
  sidebar.style.backgroundColor = "#ffffff";
  sidebar.style.borderLeft = "1px solid #ccc";
  sidebar.style.overflow = "hidden"; // Changed from overflowY to overflow to allow full control
  sidebar.style.boxShadow = "-2px 0 5px rgba(0,0,0,0.1)";
  sidebar.style.zIndex = "9999";
  sidebar.style.boxSizing = "border-box";
  sidebar.style.display = "flex";
  sidebar.style.flexDirection = "column";
  sidebar.innerHTML = `
    <style>
      #ai-sidebar .tab-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      #ai-sidebar .tab-buttons {
        display: flex;
        border-bottom: 1px solid #ccc;
        background-color: #f1f1f1;
      }
      #ai-sidebar .tab-buttons button {
        flex: 1;
        padding: 10px;
        cursor: pointer;
        background-color: #ffffff;
        color: black;
        border: none;
        outline: none;
        transition: background-color 0.3s;
        border-right: 1px solid #ccc;
      }
      #ai-sidebar .tab-buttons button:last-child {
        border-right: none;
      }
      #ai-sidebar .tab-buttons button:hover, #ai-sidebar .tab-buttons button.active {
        background-color: #e0e0e0;
      }
      #ai-sidebar .tab-content {
        flex-grow: 1;
        display: none;
        flex-direction: column;
        overflow: auto;
        padding: 10px;
        background-color: #ffffff;
        max-height: 85%;
      }
      #ai-sidebar .tab-content.active {
        display: flex;
      }
      #ai-sidebar #chat-history {
        flex-grow: 1;
        padding: 10px;
        overflow-y: auto;
        background-color: #fafafa;
        border-top: 1px solid #e0e0e0;
        border-bottom: 1px solid #e0e0e0;
      }
      #ai-sidebar #chat-input-container {
        padding: 10px;
        border-top: 1px solid #e0e0e0;
        background-color: #f9f9f9;
        display: flex;
        align-items: center;
        justify-content: center;
        position: sticky;
        bottom: 0;
        background-color: white;
      }
      #ai-sidebar #chat-input-container textarea {
        flex-grow: 1;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
        resize: none;
        margin-right: 10px;
        min-height: 40px;
      }
      #ai-sidebar #chat-input-container button {
        padding: 10px 15px;
        background-color: #007bff;
        border: none;
        color: white;
        cursor: pointer;
        border-radius: 4px;
        font-size: 14px;
      }
      #ai-sidebar #chat-input-container button:hover {
        background-color: #0056b3;
      }
      #ai-sidebar #loading, #ai-sidebar #loading-summarization {
        display: none;
        margin: 10px 0;
        text-align: center;
      }
      #ai-sidebar #loading span, #ai-sidebar #loading-summarization span {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin: 2px;
        background-color: #007bff;
        border-radius: 50%;
        animation: bounce 1s infinite;
      }
      #ai-sidebar #loading span:nth-child(2), #ai-sidebar #loading-summarization span:nth-child(2) {
        animation-delay: 0.2s;
      }
      #ai-sidebar #loading span:nth-child(3), #ai-sidebar #loading-summarization span:nth-child(3) {
        animation-delay: 0.4s;
      }
      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }
    </style>
    <button id="close-sidebar">&times;</button>
    <h2>AI Sidebar</h2>
    <div class="tab-container">
      <div class="tab-buttons">
        <button class="tab-button active" data-tab="summarization">Summarization</button>
        <button class="tab-button" data-tab="chat">Chat</button>
        <button class="tab-button" data-tab="settings">Settings</button>
      </div>
      <div class="tab-content active" id="tab-summarization">
        <div class="section">
          <label for="chat-context">Context:</label>
          <textarea id="chat-context" rows="4">${selectedText}</textarea>
          <button id="summarize-btn">Summarize</button>
          <div id="loading-summarization">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div id="summary" class="section">Select text to summarize.</div>
      </div>
      <div class="tab-content" id="tab-chat">
        <div class="panel" style="flex-grow: 1; display: flex; flex-direction: column;">
          <div id="chat-history" style="flex-grow: 1; overflow-y: auto;"></div>
          <div id="loading">
            <span></span><span></span><span></span>
          </div>
          <div id="chat-input-container">
            <textarea id="chat-input" rows="2" placeholder="Type a message..."></textarea>
            <button id="chat-send-btn">Send</button>
          </div>
        </div>
      </div>
      <div class="tab-content" id="tab-settings">
        <div class="section">
          <label for="api-key">OpenAI API Key:</label>
          <input type="text" id="api-key" placeholder="Enter your API key" style="display: none;" />
          <span id="api-key-display">********</span>
          <button id="edit-key">Edit</button>
          <button id="save-key" style="display: none;">Save Key</button>
        </div>
        <div class="section">
          <label for="fetch-url">Fetch URL:</label>
          <input type="text" id="fetch-url" placeholder="Enter the fetch URL" />
        </div>
        <div class="section">
          <label for="model-name">Model Name:</label>
          <input type="text" id="model-name" placeholder="Enter the model name" />
        </div>
        <div class="section">
          <label for="system-prompt">System Prompt:</label>
          <input type="text" id="system-prompt" placeholder="Enter the system prompt" />
        </div>
        <button id="save-settings">Save Settings</button>
      </div>
    </div>
  `;

  document.body.appendChild(sidebar);

  document.getElementById("close-sidebar").addEventListener("click", () => {
    document.body.removeChild(sidebar);
  });

  const apiKeyInput = document.getElementById("api-key");
  const apiKeyDisplay = document.getElementById("api-key-display");
  const editKeyButton = document.getElementById("edit-key");
  const saveKeyButton = document.getElementById("save-key");
  const fetchUrlInput = document.getElementById("fetch-url");
  const modelNameInput = document.getElementById("model-name");
  const systemPromptInput = document.getElementById("system-prompt");
  const saveSettingsButton = document.getElementById("save-settings");
  const summaryDiv = document.getElementById("summary");
  const chatHistoryDiv = document.getElementById("chat-history");
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const loading = document.getElementById("loading");
  const loadingSummarization = document.getElementById("loading-summarization");

  chrome.storage.local.get(["openaiApiKey", "fetchUrl", "modelName", "systemPrompt"], (data) => {
    if (data.openaiApiKey) {
      apiKeyDisplay.innerText = "********";
      apiKeyInput.value = data.openaiApiKey;
    }
    fetchUrlInput.value = data.fetchUrl || "https://api.openai.com/v1/chat/completions";
    modelNameInput.value = data.modelName || "gpt-4";
    systemPromptInput.value = data.systemPrompt || "You are an assistant that provides helpful information.";
  });

  editKeyButton.addEventListener("click", () => {
    apiKeyInput.style.display = "inline";
    apiKeyDisplay.style.display = "none";
    saveKeyButton.style.display = "inline";
    editKeyButton.style.display = "none";
  });

  saveKeyButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value;
    chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
      alert("API key saved!");
      apiKeyDisplay.innerText = "********";
      apiKeyInput.style.display = "none";
      apiKeyDisplay.style.display = "inline";
      saveKeyButton.style.display = "none";
      editKeyButton.style.display = "inline";
    });
  });

  saveSettingsButton.addEventListener("click", () => {
    const fetchUrl = fetchUrlInput.value;
    const modelName = modelNameInput.value;
    const systemPrompt = systemPromptInput.value;
    chrome.storage.local.set({
      fetchUrl: fetchUrl,
      modelName: modelName,
      systemPrompt: systemPrompt
    }, () => {
      alert("Settings saved!");
    });
  });

  document.getElementById("summarize-btn").addEventListener("click", () => {
    const context = document.getElementById("chat-context").value;
    summarizeText(context, summaryDiv);
  });

  chatSendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  function sendMessage() {
    const context = document.getElementById("chat-context").value;
    const userInput = chatInput.value.trim();
    if (userInput) {
      appendMessage("User", userInput, chatHistoryDiv);
      chatInput.value = "";
      loading.style.display = "block";
      chatWithAI(context, userInput, chatHistoryDiv);
    }
  }

  function summarizeText(text, outputDiv) {
    chrome.storage.local.get("openaiApiKey", (data) => {
      const apiKey = data.openaiApiKey;

      if (apiKey) {
        chrome.storage.local.get("systemPrompt", (data) => {
          const systemPrompt = data.systemPrompt || "Summarize to the best of your knowledge with key bullets.";
          loadingSummarization.style.display = "block";
          fetchOpenAI(apiKey, [
            { role: "system", content: systemPrompt },
            { role: "user", content: text }
          ])
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            const summary = data.choices && data.choices[0] ? data.choices[0].message.content.trim() : "No summary available.";
            outputDiv.innerText = summary;
            loadingSummarization.style.display = "none";
          })
          .catch(error => {
            console.error("Error:", error);
            loadingSummarization.style.display = "none";
          });
        });
      } else {
        alert("Please set your OpenAI API key in the settings.");
      }
    });
  }

  function chatWithAI(context, userInput, chatHistoryDiv) {
    chrome.storage.local.get("openaiApiKey", (data) => {
      const apiKey = data.openaiApiKey;
      
      if (apiKey) {
        chrome.storage.local.get("systemPrompt", (data) => {
          const systemPrompt = data.systemPrompt || "You are an assistant that provides helpful information.";
          fetchOpenAI(apiKey, [
            { role: "system", content: systemPrompt + context },
            { role: "user", content: context },
            { role: "user", content: userInput }
          ])
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            const response = data.choices && data.choices[0] ? data.choices[0].message.content.trim() : "No response available.";
            appendMessage("AI", response, chatHistoryDiv);
            loading.style.display = "none";
          })
          .catch(error => {
            console.error("Error:", error);
            loading.style.display = "none";
          });
        });
      } else {
        alert("Please set your OpenAI API key in the settings.");
      }
    });
  }

  function appendMessage(sender, message, chatHistoryDiv) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message");

    const senderSpan = document.createElement("span");
    senderSpan.classList.add("chat-sender");
    senderSpan.textContent = `${sender}: `;

    const messageSpan = document.createElement("span");
    messageSpan.classList.add("chat-content");
    messageSpan.textContent = message;

    messageDiv.appendChild(senderSpan);
    messageDiv.appendChild(messageSpan);
    chatHistoryDiv.appendChild(messageDiv);
    chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
  }

  // Add functionality to the tabs
  const tabButtons = document.querySelectorAll('#ai-sidebar .tab-buttons .tab-button');
  const tabContents = document.querySelectorAll('#ai-sidebar .tab-content');
  
  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      tabContents.forEach(content => content.classList.remove('active'));
      tabContents[index].classList.add('active');
    });
  });
} 

// Function to create and show the floating button
function createFloatingButton() {
  const button = document.createElement("button");
  button.id = "summarize-button";
  button.textContent = "...";
  button.style.position = "absolute";
  button.style.display = "none";
  button.style.padding = "10px";
  button.style.backgroundColor = "#007bff";
  button.style.color = "white";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.cursor = "pointer";
  button.style.zIndex = "9999";
  button.addEventListener("click", () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      injectSidebar(selectedText);
    }
    button.style.display = "none"; // Hide the button after clicking
  });
  document.body.appendChild(button);
}

// Function to position the floating button near the selected text
function positionFloatingButton() {
  const selection = window.getSelection();
  if (!selection.rangeCount) {
    return;
  }
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const button = document.getElementById("summarize-button");
  if (!button) {
    return;
  }
  button.style.top = `${window.scrollY + rect.top - 40}px`;
  button.style.left = `${window.scrollX + rect.left}px`;
  button.style.display = "block";
}

// Inject the floating button into the page
createFloatingButton();

// Listen for text selection changes to show the floating button
document.addEventListener("mouseup", () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    positionFloatingButton();
  } else {
    document.getElementById("summarize-button").style.display = "none";
  }
});
