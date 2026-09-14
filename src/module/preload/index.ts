/**
 * Module WebView preload entry (NEXUS v2).
 *
 * Security constraints:
 * - Do not assign anything other than the documented NEXUS API into the page.
 * - Do not expose ipcRenderer, require, process, or Node/Electron APIs.
 * - Do not bridge React/component libraries.
 */

import { exposeNexusModuleApi } from './bridge';

exposeNexusModuleApi();
