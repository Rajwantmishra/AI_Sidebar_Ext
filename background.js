chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  chrome.contextMenus.create({
    id: "summarize",
    title: "Summarize with AI",
    contexts: ["selection", "page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarize") {
    const selectedText = info.selectionText || '';
    chrome.tabs.sendMessage(tab.id, { action: "injectSidebar", selectedText: selectedText });
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
  sidebar.style.width = "300px";
  sidebar.style.height = "100%";
  sidebar.style.backgroundColor = "#f1f1f1";
  sidebar.style.borderLeft = "1px solid #ccc";
  sidebar.style.overflowY = "auto";
  sidebar.style.padding = "10px";
  sidebar.style.boxShadow = "-2px 0 5px rgba(0,0,0,0.1)";
  sidebar.style.zIndex = "9999";
  sidebar.style.boxSizing = "border-box";
  sidebar.innerHTML = `
    <button id="close-sidebar" style="float: right;">&times;</button>
    <h2>AI Sidebar</h2>
    <div>
      <label for="api-key">OpenAI API Key:</label>
      <input type="text" id="api-key" style="display:none;" placeholder="Enter your API key" />
      <span id="api-key-display" style="display:none;"></span>
      <button id="edit-key">Edit</button>
      <button id="save-key" style="display:none;">Save Key</button>
    </div>
    <div>
      <label for="chat-context">Context:</label>
      <textarea id="chat-context" rows="4" cols="30">${selectedText}</textarea>
      <button id="summarize-btn">Summarize</button>
    </div>
    <div id="summary">Select text to summarize.</div>
    <div>
      <label for="chat-input">Chat:</label>
      <textarea id="chat-input" rows="4" cols="30"></textarea>
      <button id="chat-send-btn">Send</button>
    </div>
    <div id="chat-response"></div>
  `;

  document.body.appendChild(sidebar);

  document.getElementById("close-sidebar").addEventListener("click", () => {
    document.body.removeChild(sidebar);
  });

  const apiKeyInput = document.getElementById("api-key");
  const apiKeyDisplay = document.getElementById("api-key-display");
  const editKeyButton = document.getElementById("edit-key");
  const saveKeyButton = document.getElementById("save-key");
  const summaryDiv = document.getElementById("summary");
  const chatResponseDiv = document.getElementById("chat-response");

  chrome.storage.local.get("openaiApiKey", (data) => {
    if (data.openaiApiKey) {
      apiKeyDisplay.innerText = "********";
      apiKeyDisplay.style.display = "inline";
    }
  });

  editKeyButton.addEventListener("click", () => {
    chrome.storage.local.get("openaiApiKey", (data) => {
      if (data.openaiApiKey) {
        apiKeyInput.value = data.openaiApiKey;
      }
    });
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

  document.getElementById("summarize-btn").addEventListener("click", () => {
    const context = document.getElementById("chat-context").value;
    summarizeText(context, summaryDiv);
  });

  document.getElementById("chat-send-btn").addEventListener("click", () => {
    const context = document.getElementById("chat-context").value;
    const userInput = document.getElementById("chat-input").value;
    chatWithAI(context, userInput, chatResponseDiv);
  });

  function summarizeText(text, outputDiv) {
    chrome.storage.local.get("openaiApiKey", (data) => {
      const apiKey = data.openaiApiKey;

      if (apiKey) {
        const systemPrompt = "Summarize to the best of your knowledge with key bullets.";
        
        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text }
            ],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          const summary = data.choices && data.choices[0] ? data.choices[0].message.content.trim() : "No summary available.";
          outputDiv.innerText = summary;
        })
        .catch(error => console.error("Error:", error));
      } else {
        alert("Please set your OpenAI API key in the sidebar.");
      }
    });
  }

  function chatWithAI(context, userInput, outputDiv) {
    chrome.storage.local.get("openaiApiKey", (data) => {
      const apiKey = data.openaiApiKey;

      if (apiKey) {
        const messages = [
          { role: "system", content: "You are an assistant that provides helpful information." },
          { role: "user", content: context },
          { role: "user", content: userInput }
        ];

        fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: messages,
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          const response = data.choices && data.choices[0] ? data.choices[0].message.content.trim() : "No response available.";
          outputDiv.innerText = response;
        })
        .catch(error => console.error("Error:", error));
      } else {
        alert("Please set your OpenAI API key in the sidebar.");
      }
    });
  }
}
