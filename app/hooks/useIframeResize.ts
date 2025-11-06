import { useEffect } from "react";

export function useIframeResize() {
  useEffect(() => {
    if (window.self === window.top) {
      return;
    }

    function sendHeight() {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: "iframe-resize", height: height }, "*");
    }

    sendHeight();

    const resizeObserver = new ResizeObserver(() => {
      sendHeight();
    });
    resizeObserver.observe(document.body);

    const mutationObserver = new MutationObserver(() => {
      sendHeight();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    window.addEventListener("resize", sendHeight);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", sendHeight);
    };
  }, []);
}
