(() => {
  const selectedText = window.getSelection().toString();
  console.log("Selected text:", selectedText);

  if (selectedText) {
    chrome.storage.local.get("openaiApiKey", (data) => {
      const apiKey = data.openaiApiKey;
      console.log("API Key:", apiKey);  // Debug log to check API key

      if (apiKey) {
        const systemPrompt = "Summarize to the best of your knowledge with key bullets.";
        console.log("System prompt:", systemPrompt);  // Debug log for system prompt
        console.log("User text:", selectedText);  // Debug log for user text

        // Clear previous summary
        chrome.storage.local.set({ summary: "" }, () => {
          console.log("Cleared previous summary");

          fetch("https://api.openai.com/v1/chat/completions", {  // Correct API endpoint
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: selectedText }
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
            console.log("AI summary:", summary);

            chrome.storage.local.set({ summary: summary }, () => {
              console.log("Summary stored successfully");
              chrome.runtime.sendMessage({ action: "updateSidebar" }, () => {
                console.log("Message sent to background script");
              });
            });
          })
          .catch(error => console.error("Error:", error));
        });
      } else {
        alert("Please set your OpenAI API key in the sidebar.");
      }
    });
  }
})();
