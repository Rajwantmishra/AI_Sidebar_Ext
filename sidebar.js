document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedText = urlParams.get('selectedText');
  if (selectedText) {
    document.getElementById("ai-sidebar-chat-context").value = selectedText;
  }

  const apiKeyInput = document.getElementById("ai-sidebar-api-key");
  const saveKeyButton = document.getElementById("ai-sidebar-save-key");
  const summaryDiv = document.getElementById("ai-sidebar-summary");
  const chatHistoryDiv = document.getElementById("ai-sidebar-chat-history");
  const chatInput = document.getElementById("ai-sidebar-chat-input");
  const chatSendBtn = document.getElementById("ai-sidebar-chat-send-btn");
  const loading = document.getElementById("ai-sidebar-loading");
  const loadingSummarization = document.getElementById("ai-sidebar-loading-summarization");

  chrome.storage.local.get("openaiApiKey", (data) => {
    if (data.openaiApiKey) {
      apiKeyInput.value = data.openaiApiKey;
    }
  });

  saveKeyButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value;
    chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
      alert("API key saved!");
    });
  });

  document.getElementById("ai-sidebar-summarize-btn").addEventListener("click", () => {
    const context = document.getElementById("ai-sidebar-chat-context").value;
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
    const context = document.getElementById("ai-sidebar-chat-context").value;
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
        const systemPrompt = "Summarize to the best of your knowledge with key bullets.";
        
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
      } else {
        alert("Please set your OpenAI API key in the sidebar.");
      }
    });
  }

  function chatWithAI(context, userInput, chatHistoryDiv) {
    chrome.storage.local.get("openaiApiKey", (data) => {
      const apiKey = data.openaiApiKey;

      if (apiKey) {
        const messages = [
          { role: "system", content: "You are an assistant that provides helpful information." },
          { role: "user", content: context },
          { role: "user", content: userInput }
        ];

        fetchOpenAI(apiKey, messages)
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
      } else {
        alert("Please set your OpenAI API key in the sidebar.");
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
  const tabButtons = document.getElementsByClassName("ai-sidebar-tab-button");
  for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", function() {
      const activeTab = document.querySelector(".ai-sidebar-tab-button.active");
      const activeContent = document.querySelector(".ai-sidebar-tab-content:not([style='display: none;'])");
      
      if (activeTab) activeTab.classList.remove("active");
      if (activeContent) activeContent.style.display = "none";
      
      this.classList.add("active");
      const tabContent = document.getElementById(this.dataset.tab);
      tabContent.style.display = "flex";
    });
  }

  // Close sidebar functionality
  document.getElementById("ai-sidebar-close-sidebar").addEventListener("click", () => {
    window.parent.document.body.removeChild(window.frameElement.parentNode);
  });

  // Listen for messages from the content script
  window.addEventListener("message", (event) => {
    if (event.data.action === "setContext") {
      document.getElementById("ai-sidebar-chat-context").value = event.data.selectedText;
    }
  });
});
