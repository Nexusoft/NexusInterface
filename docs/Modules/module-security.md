# Module security

Nexus Wallet Modules can be written by any third-party developers, therefore security is one of our primary concerns when we design the module system.

In this article, we will talk about the main security mechanisms that we have employed to minimize the security risks that third-party modules can bring to wallet users.

## WebView security

Code inside a WebView is executed in a separate process from the base wallet, therefore there is very few things that module code can do to maliciously affect the base wallet.

Module's entry HTML is fetched from a static file server running locally (e.g. `http://localhost:9331/...`) that only serves exactly the files listed in [`files` field of `nxs_package.json`](./nxs_package.json.md#files) so it is not possible for modules to retrieve private files in user's computer via `file://` protocol.

The only bridge that connects modules with the base wallet is the [`NEXUS` global variable](./nexus-globalvariable.md) which is injected into modules by WebView's `preload` script. `NEXUS` global variable provides modules with the data and functions they need, while still making sure modules don't get access to what they shouldn't be authorized to access. For example, functions that [`NEXUS.utilities`](./nexus-global-variable.md#utilities) provides use IPC messages under the hood, but wrap them all inside functions. Modules only have access to these functionaliities, and cannot send arbitrary IPC messages or get access to Electron's `remote` module. Moreover, because `NEXUS.utilities` functions use IPC messages under the hood, all arguments passed to these functions will be serialized in JSON, so only plain data (e.g. strings, numbers, objects,...) can get through and functions can't. Therefore, it's not possible for modules to pass malicious code to the base wallet to execute.

See [`NEXUS` global variable](./nexus-globalvariable.md) for more details about what modules can access to.

### A note about Electron's warning

You may have noticed, in [Electron's documentation on `<webview>`](https://electronjs.org/docs/api/webview-tag) there is a warning about `<webview>` tag's stability. However, the reason for that warning is only about `webview`'s possible changes in architecture and API in the future, not about the security. This has already been [confirmed by Electron team](https://github.com/electron/electron/issues/18187). Architectural and API changes are not really a big concern for us because we control when and whether to update new Electron versions, and can decide to hold off the updates until we can adapt to the changes. So in short, it is safe to use `<webview>` tag.

## SVG icon security

Module SVG icon's security is a concern, because unlike the rest of the module code, which is isolated in a `webview`, module icon is embedded directly in the base wallet, and SVG icons, by nature are XML files and can contain code. Therefore, we use [DOMPurify](https://github.com/cure53/DOMPurify) library to sanitize module SVG icons before rendering, making sure there are no dirty pieces of SVG can make their way into the HTML.

## Module open source policy

Another layer of security that we have created to minimize the risk of malicious code inside modules is the Module open source policy.

This policy requires all the modules to have a publicly accessible source code repository in order to be installed and run on Nexus Wallet. When this policy is turned on (it is by default), Nexus Wallet will do the following checks everytime the wallet loads modules or user tries to install a new module:

- Check if module has a valid [`repo_info.json` file](./repo_info.json.md) containing repository information, module hash, and a valid `RSA-SHA256` signature from Nexus team. This signature verifies that the provided repository is truly the source code that was compiled to the module with the provided hash. Module hash is calculated by hasing contents of all the files that module uses, including the `nxs_package.json` file.

- Check if the provided hash matches the hash calculated.

- Check if the repository is publicly accessible by calling github API.

If any one of the above checks fails, it will mark the module as _invalid_ and the module will not be able to be loaded or installed.

With this policy in place, in case a module developer has found a security hole that they can exploit (which is expected to be relatively unlikely already), they would also have to hope that the Nexus team wouldn't detect the malicious code during the [Repository verification process](./repo-verification-process.md). Even in case the Nexus team doesn't detect the malicious code and allow them to distribute their module, there will still be a whole community to look into their code because it must be kept open source. If they take down the repository or set it private, their module will stop running on users' wallets. If someone find out the bad intention in the code, they can alarm the community about it and Nexus team can also add it to the blacklist so no one can install or run it anymore.

---

We are also considering adding more security mechanism, for example we might allow module authors to get their information verified, so that in case their module turns out to be malicious, we will have more information on who is responsible.
