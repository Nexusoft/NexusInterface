/* global NEXUS */
(async function main() {
  const out = document.getElementById('out');
  try {
    const ctx = await NEXUS.wallet.getContext();
    out.textContent = JSON.stringify(
      {
        apiVersion: NEXUS.apiVersion,
        walletVersion: NEXUS.walletVersion,
        locale: ctx.settings?.locale,
        loggedIn: ctx.session?.loggedIn,
      },
      null,
      2
    );
    await NEXUS.state.set({ smoke: true });
    await NEXUS.storage.set({ smokeAt: Date.now() });
    NEXUS.wallet.onContextChanged((next) => {
      out.dataset.locale = next.settings?.locale || '';
    });
  } catch (error) {
    out.textContent = String(error && error.message ? error.message : error);
  }

  document.getElementById('notify').onclick = () => {
    NEXUS.ui.notify({ content: 'Smoke notification', type: 'info' });
  };
  document.getElementById('link').onclick = () => {
    NEXUS.ui.openExternal('https://nexus.io');
  };
})();
