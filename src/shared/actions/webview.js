import * as TYPE from 'consts/actionTypes';

export const setActiveWebView = webview => ({
  type: TYPE.SET_ACTIVE_WEBVIEW,
  payload: webview,
});

export const toggleWebViewDevTools = () => (dispatch, getState) => {
  const { webview } = getState();
  if (webview) {
    if (webview.isDevToolsOpened()) {
      webview.closeDevTools();
    } else {
      webview.openDevTools();
    }
  }
};
