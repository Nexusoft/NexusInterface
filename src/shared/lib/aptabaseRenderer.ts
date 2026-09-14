const bridge = window.nexusElectron;

if (!bridge) {
  throw new Error('Nexus Electron bridge is not available');
}

export function trackEvent(eventName: string, props?: Record<string, unknown>) {
  return bridge.aptabase.trackEvent(eventName, props);
}
