import { useEffect, useRef } from 'react';

const DEFAULT_ORDFRAME_URL = 'https://ordinals.com/content/33064f05445f5c4d97d6a70585e70cdabb0b52690e61d611afb2b4091aca614bi0';

export default function OrdframeViewer(props) {
  const {
    html,
    viewerUrl = DEFAULT_ORDFRAME_URL,
    title = 'Ordframe Viewer',
    className,
    style
  } = props;
  const iframeRef = useRef(null);
  const htmlRef = useRef(html || '');

  useEffect(function () {
    htmlRef.current = html || '';
  }, [html]);

  useEffect(function () {
    const iframe = iframeRef.current;
    let isReady = false;
    let retryTimer = 0;
    let retryCount = 0;

    if (!iframe) {
      return undefined;
    }

    function clearRetryTimer() {
      clearInterval(retryTimer);
      retryTimer = 0;
    }

    function postHtml() {
      if (!isReady || !iframe.contentWindow || !htmlRef.current) {
        return false;
      }

      iframe.contentWindow.postMessage({
        type: 'html-view:render',
        html: htmlRef.current
      }, '*');

      return true;
    }

    function startRetries() {
      clearRetryTimer();
      retryCount = 0;

      retryTimer = setInterval(function () {
        retryCount += 1;

        if (postHtml() || retryCount > 20) {
          clearRetryTimer();
        }
      }, 400);
    }

    function handleMessage(event) {
      const data = event.data;

      if (event.source !== iframe.contentWindow || !data || typeof data !== 'object') {
        return;
      }

      if (data.type === 'html-view-ready') {
        isReady = true;
        postHtml();
      }
    }

    function handleLoad() {
      isReady = false;
      startRetries();
    }

    window.addEventListener('message', handleMessage);
    iframe.addEventListener('load', handleLoad);
    iframe.src = viewerUrl;

    return function () {
      clearRetryTimer();
      window.removeEventListener('message', handleMessage);
      iframe.removeEventListener('load', handleLoad);
    };
  }, [viewerUrl]);

  useEffect(function () {
    const iframe = iframeRef.current;

    if (iframe && iframe.contentWindow && html) {
      iframe.contentWindow.postMessage({
        type: 'html-view:render',
        html: html
      }, '*');
    }
  }, [html]);

  return <iframe ref={iframeRef} title={title} className={className} style={style} />;
}