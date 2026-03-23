import { CSSProperties, useEffect, useRef } from 'react';

const DEFAULT_ORDFRAME_URL = 'https://ordinals.com/content/33064f05445f5c4d97d6a70585e70cdabb0b52690e61d611afb2b4091aca614bi0';

type OrdframeViewerProps = {
  html: string;
  viewerUrl?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
};

export default function OrdframeViewer({
  html,
  viewerUrl = DEFAULT_ORDFRAME_URL,
  title = 'Ordframe Viewer',
  className,
  style
}: OrdframeViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const htmlRef = useRef<string>(html);

  useEffect(() => {
    htmlRef.current = html;
  }, [html]);

  useEffect(() => {
    const iframe = iframeRef.current;
    let isReady = false;
    let retryTimer: ReturnType<typeof setInterval> | 0 = 0;
    let retryCount = 0;

    if (!iframe) {
      return undefined;
    }

    const frame = iframe;

    function clearRetryTimer() {
      clearInterval(retryTimer);
      retryTimer = 0;
    }

    function postHtml(): boolean {
      if (!isReady || !frame.contentWindow || !htmlRef.current) {
        return false;
      }

      frame.contentWindow.postMessage({
        type: 'html-view:render',
        html: htmlRef.current
      }, '*');

      return true;
    }

    function startRetries() {
      clearRetryTimer();
      retryCount = 0;

      retryTimer = setInterval(() => {
        retryCount += 1;

        if (postHtml() || retryCount > 20) {
          clearRetryTimer();
        }
      }, 400);
    }

    function handleMessage(event: MessageEvent) {
      const data = event.data;

      if (event.source !== frame.contentWindow || !data || typeof data !== 'object') {
        return;
      }

      if ((data as { type?: string }).type === 'html-view-ready') {
        isReady = true;
        postHtml();
      }
    }

    function handleLoad() {
      isReady = false;
      startRetries();
    }

    window.addEventListener('message', handleMessage);
    frame.addEventListener('load', handleLoad);
    frame.src = viewerUrl;

    return () => {
      clearRetryTimer();
      window.removeEventListener('message', handleMessage);
      frame.removeEventListener('load', handleLoad);
    };
  }, [viewerUrl]);

  useEffect(() => {
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