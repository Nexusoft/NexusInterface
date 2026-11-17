/* global NEXUS */
(function () {
  const results = {};
  results.hasRequire = typeof require !== 'undefined';
  results.hasProcess = typeof process !== 'undefined';
  results.hasIpcRenderer = !!(
    typeof window !== 'undefined' && window.ipcRenderer
  );
  results.hasElectron = typeof electron !== 'undefined';
  results.nexusApiVersion = NEXUS && NEXUS.apiVersion;
  results.hasLibraries = !!(NEXUS && NEXUS.libraries);
  results.hasComponents = !!(NEXUS && NEXUS.components);
  results.hasApiCall = !!(NEXUS && NEXUS.utilities && NEXUS.utilities.apiCall);
  results.hasProxy =
    !!(NEXUS && NEXUS.utilities && NEXUS.utilities.proxyRequest);

  try {
    // Attempt file URL navigation (should be blocked by guest policy).
    results.fileNavAttempted = true;
    window.location.href = 'file:///etc/passwd';
  } catch (error) {
    results.fileNavError = String(error);
  }

  document.getElementById('out').textContent = JSON.stringify(results, null, 2);
})();
