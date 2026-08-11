import { atom } from 'jotai';

/**
 * Renderer-safe Core connection metadata. Credentials remain in the main
 * process and are never part of this type.
 */
export interface CoreConfig {
  ip: string;
  apiSSL: boolean;
  apiPort: string;
  apiPortSSL: string;
  txExpiry?: number;
}

export const defaultConfig: CoreConfig = {
  ip: '127.0.0.1',
  apiSSL: true,
  apiPort: '8080',
  apiPortSSL: '7080',
};

export const coreConfigAtom = atom<CoreConfig | null>(null);
