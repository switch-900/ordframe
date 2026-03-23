export const DEFAULT_ORDFRAME_URL = 'https://ordinals.com/content/33064f05445f5c4d97d6a70585e70cdabb0b52690e61d611afb2b4091aca614bi0';

export function createOrdframeLoader(options) {
  var iframe = options && options.iframe;
  var viewerUrl = options && options.viewerUrl ? options.viewerUrl : DEFAULT_ORDFRAME_URL;
  var html = options && typeof options.html === 'string' ? options.html : '';
  var retryDelay = options && typeof options.retryDelay === 'number' ? options.retryDelay : 400;
  var maxRetries = options && typeof options.maxRetries === 'number' ? options.maxRetries : 20;
  var onReady = options && typeof options.onReady === 'function' ? options.onReady : null;
  var onPost = options && typeof options.onPost === 'function' ? options.onPost : null;
  var retryTimer = 0;
  var retryCount = 0;
  var isReady = false;

  if (!iframe) {
    throw new Error('Ordframe loader requires an iframe element.');
  }

  function clearRetryTimer() {
    clearInterval(retryTimer);
    retryTimer = 0;
  }

  function postHtml() {
    if (!html || !isReady || !iframe.contentWindow) {
      return false;
    }

    iframe.contentWindow.postMessage({
      type: 'html-view:render',
      html: html
    }, '*');

    if (onPost) {
      onPost(html);
    }

    return true;
  }

  function startRetries() {
    clearRetryTimer();
    retryCount = 0;

    retryTimer = setInterval(function () {
      retryCount += 1;

      if (postHtml()) {
        clearRetryTimer();
        return;
      }

      if (retryCount > maxRetries) {
        clearRetryTimer();
      }
    }, retryDelay);
  }

  function handleMessage(event) {
    var data = event.data;

    if (event.source !== iframe.contentWindow || !data || typeof data !== 'object') {
      return;
    }

    if (data.type === 'html-view-ready') {
      isReady = true;

      if (onReady) {
        onReady();
      }

      postHtml();
    }
  }

  function handleLoad() {
    isReady = false;
    startRetries();
  }

  function load(nextUrl) {
    if (nextUrl) {
      viewerUrl = nextUrl;
    }

    isReady = false;
    iframe.src = viewerUrl;
  }

  function setHtml(nextHtml) {
    html = typeof nextHtml === 'string' ? nextHtml : '';
    postHtml();
  }

  function destroy() {
    clearRetryTimer();
    window.removeEventListener('message', handleMessage);
    iframe.removeEventListener('load', handleLoad);
  }

  window.addEventListener('message', handleMessage);
  iframe.addEventListener('load', handleLoad);

  if (options && options.autoLoad !== false) {
    load(viewerUrl);
  }

  return {
    destroy: destroy,
    iframe: iframe,
    load: load,
    postHtml: postHtml,
    setHtml: setHtml
  };
}

export function loadOrdframeById(iframeId, html, options) {
  var iframe = document.getElementById(iframeId);

  return createOrdframeLoader(Object.assign({}, options, {
    iframe: iframe,
    html: html
  }));
}