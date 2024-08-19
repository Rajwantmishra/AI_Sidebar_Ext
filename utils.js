// utils.js

function fetchOpenAI(apiKey, messages) {
  const url = localStorage.getItem("fetchUrl") || "https://api.openai.com/v1/chat/completions";
  const model = localStorage.getItem("modelName") || "gpt-4";
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 1,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })
  });
}
