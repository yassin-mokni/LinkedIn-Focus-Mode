(function() {
  let overlayShown = false;
  let ctaDestination = 'jobs'; // Default destination
  let extensionEnabled = true; // Default to enabled
  let defaultTitle = "LinkedIn"; // Fallback title

  document.addEventListener('DOMContentLoaded', () => {
    defaultTitle = document.title || "LinkedIn"; // Store the default title or fallback to "LinkedIn"
  });

  chrome.storage.sync.get(['extensionEnabled', 'ctaDestination'], function(result) {
    extensionEnabled = result.extensionEnabled !== false;
    ctaDestination = result.ctaDestination || 'jobs';
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showAlert" && !overlayShown && extensionEnabled) {
      createOverlay();
      overlayShown = true;
    } else if (request.action === "updateSettings") {
      extensionEnabled = request.extensionEnabled;
      ctaDestination = request.ctaDestination;
      if (!extensionEnabled) {
        const overlay = document.querySelector('div[style*="position: fixed"]');
        if (overlay) {
          document.body.removeChild(overlay);
          enableScroll();
          overlayShown = false;
          document.title = defaultTitle; // Reset tab title
        }
      } else if (extensionEnabled && !overlayShown && (window.location.href === "https://www.linkedin.com/" || window.location.href === "https://www.linkedin.com/feed/")) {
        createOverlay();
        overlayShown = true;
      } else if (extensionEnabled && overlayShown) {
        updateCTAButton();
      }
    } else if (request.action === "navigate") {
      if (request.destination === "jobs") {
        window.location.href = 'https://www.linkedin.com/jobs/';
      } else if (request.destination === "messaging") {
        window.location.href = 'https://www.linkedin.com/messaging/';
      }
    }
  });

  // Check URL on initial load
  if (window.location.href === "https://www.linkedin.com/" || window.location.href === "https://www.linkedin.com/feed/") {
    chrome.storage.sync.get(['extensionEnabled'], function(result) {
      extensionEnabled = result.extensionEnabled !== false;
      if (extensionEnabled) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', createOverlay);
        } else {
          createOverlay();
        }
        overlayShown = true;
      }
    });
  }

  function createOverlay() {
    document.title = "LinkedIn Focus Mode";

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #f1f3f4;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      max-width: 600px;
      padding: 0 20px;
      margin-bottom: 100px;
    `;

    const headerContainer = document.createElement('div');
    headerContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-bottom: 20px;
    `;

    const emojiIcon = document.createElement('div');
    emojiIcon.textContent = '🧘‍♂️';
    emojiIcon.style.cssText = `
      font-size: 50px;
      margin-bottom: 10px;
    `;

    const heading = document.createElement('h1');
    heading.textContent = 'LinkedIn Focus Mode';
    heading.style.cssText = `
      color: #202124;
      font-size: 24px;
      font-weight: 400;
      margin: 0;
    `;

    headerContainer.appendChild(emojiIcon);
    headerContainer.appendChild(heading);

    const message = document.createElement('p');
    message.innerHTML = 'Accessing LinkedIn can be overwhelming. Consider focusing on your career goals by going directly to the Jobs section, skipping the feed and other distractions.<br><br>Remember: Your mental health is important. Take breaks when needed.';
    message.style.cssText = `
      color: #5f6368;
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 30px;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: space-between;
    `;
    
    const goBackButton = createButton('Go back', '#1a73e8', () => {
      history.back();
    });

    const continueButton = createButton(`Go to ${ctaDestination.charAt(0).toUpperCase() + ctaDestination.slice(1)}`, '#5f6368', () => {
      window.location.href = `https://www.linkedin.com/${ctaDestination}/`;
      document.body.removeChild(overlay);
      document.title = defaultTitle; // Reset tab title
    });

    buttonContainer.appendChild(goBackButton);
    buttonContainer.appendChild(continueButton);

    content.appendChild(headerContainer);
    content.appendChild(message);
    content.appendChild(buttonContainer);
    overlay.appendChild(content);

    document.body.appendChild(overlay);
    disableScroll();
  }

  function createButton(text, color, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      padding: 10px 24px;
      font-size: 14px;
      color: ${color === '#5f6368' ? '#3c4043' : 'white'};
      background-color: ${color === '#5f6368' ? 'transparent' : color};
      border: ${color === '#5f6368' ? '1px solid #dadce0' : 'none'};
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      text-transform: uppercase;
    `;
    button.addEventListener('click', () => {
      const overlay = document.querySelector('div[style*="position: fixed"]');
      if (overlay) {
        document.body.removeChild(overlay);
        enableScroll();
      }
      overlayShown = false;
      onClick();
    });
    return button;
  }

  function updateCTAButton() {
    const continueButton = document.querySelector('button:last-child');
    if (continueButton) {
      continueButton.textContent = `Go to ${ctaDestination.charAt(0).toUpperCase() + ctaDestination.slice(1)}`;
      continueButton.onclick = () => {
        window.location.href = `https://www.linkedin.com/${ctaDestination}/`;
        document.body.removeChild(overlay);
      };
    }
  }

  function disableScroll() {
    document.body.style.overflow = 'hidden';
  }

  function enableScroll() {
    document.body.style.overflow = '';
  }
})();