import { Readability } from '@mozilla/readability';

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'EXTRACT_CONTENT') {
    try {
      console.log('[InfinityAI Assistant] Extracting article content via Readability...');

      // Clone the document to preserve active page state/events
      const docClone = document.cloneNode(true) as Document;
      const reader = new Readability(docClone);
      const article = reader.parse();

      if (!article) {
        throw new Error('Could not parse clean article content from this page.');
      }

      sendResponse({
        success: true,
        data: {
          title: article.title || document.title || 'Untitled Page',
          url: window.location.href,
          content: article.textContent ? article.textContent.trim() : '',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[InfinityAI Assistant] Content extraction error:', err);
      sendResponse({
        success: false,
        error: err.message || 'Page content extraction failed',
      });
    }
  }
  // Return true to indicate that response will be sent asynchronously
  return true;
});
