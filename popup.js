document.addEventListener('DOMContentLoaded', function() {
  const extensionEnabledCheckbox = document.getElementById('extensionEnabled');
  const ctaDestinationSelect = document.getElementById('ctaDestination');
  const saveButton = document.getElementById('saveSettings');

  // Load saved settings
  chrome.storage.sync.get(['extensionEnabled', 'ctaDestination'], function(result) {
    extensionEnabledCheckbox.checked = result.extensionEnabled !== false;
    ctaDestinationSelect.value = result.ctaDestination || 'jobs';
  });

  // Save settings
  saveButton.addEventListener('click', function() {
    const extensionEnabled = extensionEnabledCheckbox.checked;
    const ctaDestination = ctaDestinationSelect.value;

    chrome.storage.sync.set({ extensionEnabled, ctaDestination }, function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: "updateSettings", 
          extensionEnabled: extensionEnabled,
          ctaDestination: ctaDestination
        });
      });
      window.close();
    });
  });
});