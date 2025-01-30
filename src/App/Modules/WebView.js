// External
import { useRef, useEffect } from 'react';
import { existsSync } from 'fs';
import { URL } from 'url';
import { join } from 'path';
import { ipcRenderer } from 'electron';

// Internal Global
import { setActiveAppModule, unsetActiveAppModule } from 'lib/modules';

const domain = ipcRenderer.sendSync('get-file-server-domain');

const getEntryUrl = (module) => {
  if (module.development) {
    try {
      // Check if entry is a URL itself
      new URL(module.info.entry);
      return module.info.entry;
    } catch (err) {}
  }

  const entry = module.info.entry || 'index.html';
  const entryPath = join(module.path, entry);
  if (!existsSync(entryPath)) return null;
  if (module.development) {
    return `file://${entryPath}`;
  } else {
    return `${domain}/modules/${module.info.name}/${entry}`;
  }
};

export default function WebView({ module, className, style }) {
  const webviewRef = useRef();

  useEffect(() => {
    if (!module.development) {
      const moduleFiles = module.info.files.map((file) =>
        join(module.info.name, file)
      );
      ipcRenderer.invoke('serve-module-files', moduleFiles);
    }
  }, []);

  useEffect(() => {
    const {
      info: { name },
    } = module;
    setActiveAppModule(webviewRef.current, name);

    return () => {
      unsetActiveAppModule();
    };
  }, []);

  const entryUrl = getEntryUrl(module);

  const preloadUrl =
    process.env.NODE_ENV === 'development'
      ? `file://${process.cwd()}/build/module_preload.dev.js`
      : module.development
      ? 'module_preload.dev.js '
      : 'module_preload.prod.js';

  module.development &&
    console.warn(
      'Node Intergration is disabled when modules are built for production.'
    );
  return (
    <webview
      className={className}
      style={style}
      ref={webviewRef}
      src={entryUrl}
      preload={preloadUrl}
      /* Can't enable contextIsolation because it will
      mess with react-dom and emotion */
      webpreferences={`contextIsolation=no${
        module.development ? ', nodeIntegration=yes' : ''
      }`}
    />
  );
}
