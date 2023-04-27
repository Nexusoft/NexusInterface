# Module Auto-update

In order for Nexus Wallet's "Check for updates" feature to work on your module, make sure to follow the instructions below:

1. Follow [semver](https://semver.org/) for module versioning. Module version is specified in [nxs_package.json](./nxs_package.json.md) and should also be used in release tag name (see more details below).

2. Create a [github](https://github.com/) release for each update. Currently github is the only source code repository host that's supported for auto-update.

3. Put your module version into your release tag name. An optional 'v' prefix is acceptable. For example, if your module version is 1.1.0, you can set either '1.1.0' or 'v1.1.0' as your release tag name.

4. Attach your module's .zip file to the release. The file name MUST begin with your module name (the `name` field specified in your `nxs_modules.json` file, not `displayName`). For example, if your module name is `market_data_module`, something like `market_data_module_v1.4.0.zip` would be a valid file name. If you don't follow this naming convention and Nexus Wallet can't find the .zip file among release's attached files, Nexus Wallet won't be able to automatically download and install the update, user will have to do it manually by going to the release page.
