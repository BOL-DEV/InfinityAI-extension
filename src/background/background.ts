const BACKEND_URL = 'https://infinity-ai-backend.vercel.app/api/memory/ingest';

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'INGEST_MEMORY') {
    const { payload } = message;
    
    console.log(`[InfinityAI Background] Sending memory ingestion request for: ${payload.url}`);

    // Call local backend ingestion API
    fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Status code ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('[InfinityAI Background] Memory ingestion succeeded:', data);
        sendResponse({ success: true, data });
      })
      .catch((err) => {
        console.error('[InfinityAI Background] Ingestion request failed:', err);
        sendResponse({
          success: false,
          error: err.message || 'Cannot connect to backend server. Make sure the service is running.'
        });
      });

    // Return true to indicate we will reply asynchronously
    return true;
  }
});
