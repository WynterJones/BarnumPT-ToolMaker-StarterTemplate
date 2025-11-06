import { useEffect } from 'react';

export function useIframeResize() {
  useEffect(() => {
    // Check if we're inside an iframe
    if (window.self === window.top) {
      return; // Not in iframe, skip
    }

    function sendHeight() {
      const height = document.body.scrollHeight;
      window.parent.postMessage(
        { type: 'iframe-resize', height: height },
        '*'
      );
    }

    // Send initial height
    sendHeight();

    // Watch for content size changes
    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });
    resizeObserver.observe(document.body);

    // Watch for DOM changes
    const mutationObserver = new MutationObserver(() => {
      sendHeight();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Send on window resize
    window.addEventListener('resize', sendHeight);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', sendHeight);
    };
  }, []);
}
