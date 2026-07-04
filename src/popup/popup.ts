// Elements
const pageTitleEl = document.getElementById('page-title') as HTMLDivElement;
const pageDomainEl = document.getElementById('page-domain') as HTMLDivElement;
const rememberBtn = document.getElementById('remember-btn') as HTMLButtonElement;
const rememberText = document.getElementById('remember-text') as HTMLSpanElement;
const btnLoader = document.getElementById('btn-loader') as HTMLDivElement;
const statusBadge = document.getElementById('status-badge') as HTMLSpanElement;
const dashboardBtn = document.getElementById('dashboard-btn') as HTMLButtonElement;

let currentTab: chrome.tabs.Tab | null = null;

// Initialize popup details
async function initPopup() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs || tabs.length === 0) {
      throw new Error('No active browser tab found');
    }
    
    currentTab = tabs[0];
    const urlStr = currentTab.url || '';
    
    // Set title
    pageTitleEl.textContent = currentTab.title || 'Untitled Page';
    
    // Extract hostname / domain
    if (urlStr) {
      try {
        const urlObj = new URL(urlStr);
        pageDomainEl.textContent = urlObj.hostname;
        
        // Disable on browser internal pages
        if (urlStr.startsWith('chrome://') || urlStr.startsWith('chrome-extension://') || urlStr.startsWith('edge://')) {
          setWarningState('Unsupported Page');
          rememberBtn.disabled = true;
        }
      } catch {
        pageDomainEl.textContent = 'Invalid URL';
        setWarningState('Unsupported Page');
        rememberBtn.disabled = true;
      }
    } else {
      pageDomainEl.textContent = 'Empty URL';
      setWarningState('Unsupported Page');
      rememberBtn.disabled = true;
    }
  } catch (err: any) {
    console.error('[InfinityAI Popup] Initialization failed:', err);
    pageTitleEl.textContent = 'Cannot load page info';
    setWarningState('Error ❌');
  }
}

// Set status warning
function setWarningState(text: string) {
  statusBadge.textContent = text;
  statusBadge.className = 'status-badge status-error';
}

// Remember page handler
rememberBtn.addEventListener('click', () => {
  if (!currentTab || !currentTab.id) return;
  
  // Set UI saving state
  rememberBtn.disabled = true;
  btnLoader.classList.remove('hidden');
  rememberText.textContent = 'Saving...';
  
  statusBadge.textContent = 'Saving...';
  statusBadge.className = 'status-badge status-saving';

  // 1. Send message to Content Script to extract article text
  chrome.tabs.sendMessage(currentTab.id, { action: 'EXTRACT_CONTENT' }, (response) => {
    // Handle message sending errors (e.g. content script not injected yet)
    if (chrome.runtime.lastError || !response) {
      console.warn('[InfinityAI Popup] Content script connection error:', chrome.runtime.lastError);
      setWarningState('Extension not ready. Refresh this page.');
      resetButton();
      return;
    }

    if (!response.success) {
      console.warn('[InfinityAI Popup] In-page extraction failed:', response.error);
      setWarningState(response.error || 'Extraction failed');
      resetButton();
      return;
    }

    // 2. Forward payload to background service worker for ingestion
    chrome.runtime.sendMessage({ action: 'INGEST_MEMORY', payload: response.data }, (bgResponse) => {
      if (chrome.runtime.lastError || !bgResponse) {
        console.warn('[InfinityAI Popup] Background communication failure:', chrome.runtime.lastError);
        setWarningState('Service unavailable');
        resetButton();
        return;
      }

      if (!bgResponse.success) {
        console.warn('[InfinityAI Popup] Ingestion failed:', bgResponse.error);
        setWarningState('Server offline ❌');
        resetButton();
        return;
      }

      // Success state!
      statusBadge.textContent = 'Remembered ✅';
      statusBadge.className = 'status-badge status-remembered';
      
      btnLoader.classList.add('hidden');
      rememberText.textContent = 'Saved!';
    });
  });
});

// Reset remember button to default
function resetButton() {
  rememberBtn.disabled = false;
  btnLoader.classList.add('hidden');
  rememberText.textContent = 'Remember Page';
}

// Open dashboard handler
dashboardBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://infinity-ai-frontend.vercel.app/dashboard' });
});

// Bootstrap
document.addEventListener('DOMContentLoaded', initPopup);
