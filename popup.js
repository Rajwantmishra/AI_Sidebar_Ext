document.getElementById("open-sidebar").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "injectSidebar", selectedText: "" });
    });
  });
  