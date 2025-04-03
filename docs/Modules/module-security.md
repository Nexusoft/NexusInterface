# Module Security

Since Nexus Wallet Modules can be developed by third-party developers, security is a primary concern in the design of our module system.

This article outlines the main security mechanisms we've implemented to minimize risks that third-party modules may pose to wallet users.

## WebView Security

Modules run inside a WebView, which is isolated in a separate process from the base wallet. This separation ensures that module code cannot directly affect the wallet’s functionality.

The module's entry HTML is served from a local static file server (e.g., `http://localhost:9331/`) that only provides the files listed in the [`files` field of `nxs_package.json`](./nxs_package.json.md#files). This prevents modules from accessing private files on the user's computer through the `file://` protocol.

The only bridge between the module and the base wallet is the [`NEXUS` global variable](./nexus-global-variable.md), injected into modules via WebView’s `preload` script. The `NEXUS` global variable provides the necessary data and functions to modules, while limiting access to sensitive resources. For instance, functions in [`NEXUS.utilities`](./nexus-global-variable.md#utilities) use IPC messages under the hood but wrap them in functions. Modules can only invoke these functions, and they cannot send arbitrary IPC messages or access Electron’s `remote` module.

Additionally, since `NEXUS.utilities` functions rely on IPC messaging, all arguments are serialized in JSON, allowing only plain data (e.g., strings, numbers, objects) to pass through. This prevents modules from injecting malicious code into the wallet.

For more details on what modules can access, see the [`NEXUS` global variable documentation](./nexus-global-variable.md).

### Electron's `<webview>` Tag Warning

You may have seen a warning in [Electron’s `<webview>` documentation](https://electronjs.org/docs/api/webview-tag) regarding the tag’s stability. This warning pertains only to potential future changes in architecture and API, not security. The [Electron team has confirmed](https://github.com/electron/electron/issues/18187) that the warning does not indicate security risks.

Since we control when and how Electron versions are updated, we can hold off on updates until we adapt to any necessary changes. Therefore, it is safe to use the `<webview>` tag.

## SVG Icon Security

Module SVG icons, unlike the module code which runs in a `webview`, are embedded directly into the base wallet. Since SVG files are XML-based and can contain executable code, we use the [DOMPurify](https://github.com/cure53/DOMPurify) library to sanitize module icons before rendering. This ensures no harmful SVG code is injected into the HTML.

## Module Open Source Policy

To further enhance security, we have implemented an open-source policy for all modules.

This policy requires that every module has a publicly accessible source code repository in order to be installed or run on Nexus Wallet. When this policy is enabled (which is the default), Nexus Wallet performs the following checks when loading or installing a module:

- Verifies that the module includes a valid [`repo_info.json`](./repo_info.json.md) file containing repository details, module hash, and an `RSA-SHA256` signature from the Nexus team. This signature ensures that the provided repository matches the compiled module hash. The hash is computed based on the contents of all module files, including `nxs_package.json`.

- Verifies that the provided module hash matches the computed hash.

- Confirms that the repository is publicly accessible via the GitHub API.

If any of these checks fail, the module will be marked as _invalid_, preventing it from being loaded or installed.

This open-source policy ensures that even if a module developer tries to exploit a security vulnerability, the Nexus team can likely detect malicious code during the [repository verification process](./repo-verification-process.md). If the malicious code is missed, the community can still scrutinize the source code because it must remain open source. Should the developer make the repository private or take it down, the module will stop working on users' wallets.

If malicious intent is detected, the community can alert others, and the Nexus team can add the module to a blacklist, preventing future installations.

---

We are also considering additional security mechanisms, such as verifying module authors. This would help identify the responsible party if a module is found to be malicious.
