import type { NexusModuleWalletContext, Unsubscribe } from '../../shared/modules/nexusApiV2';
import { assertFunction } from './validation';

type ContextListener = (context: NexusModuleWalletContext) => void;

const contextListeners = new Set<ContextListener>();

export function addContextListener(listener: ContextListener): Unsubscribe {
  assertFunction(listener, 'listener');
  contextListeners.add(listener);
  return () => {
    contextListeners.delete(listener);
  };
}

export function emitContextChanged(context: NexusModuleWalletContext): void {
  for (const listener of [...contextListeners]) {
    try {
      listener(context);
    } catch (error) {
      console.error('NEXUS context listener failed', error);
    }
  }
}

export function clearContextListeners(): void {
  contextListeners.clear();
}
