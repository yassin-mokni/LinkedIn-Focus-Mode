chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && 
      (tab.url === "https://www.linkedin.com/" || tab.url === "https://www.linkedin.com/feed/")) {
    chrome.tabs.sendMessage(tabId, { action: "showAlert" });
  }
});