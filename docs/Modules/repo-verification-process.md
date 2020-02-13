# Repository verification process

**Important notices**:

- This repository verification process **ONLY** verifies that a module's distributed files **match the provided open source repository**. This process does **NOT** guarantee **if the module contains malicious/faulty code or not**.

- **Everytime** you release new version of your module, you must go though this verification process **again**.

See [Module open source policy](./module-security.md#module-open-source-policy) to learn more about the reasonings behind this verification process.

## How to get your module verified

Before getting your repository verified, please ensure these prerequisites conditions are met:

- Your source code is hosted in a publicly accessible repository on [github.com](https://github.com/) (which is the only repository hosting that is currently supported). Private repositories won't work.

- Your source code can be built without errors, and there exists a clear and easy-to-follow build instruction on the main README of your repository. IF your module doesn't need to be built/compiled, it should also be stated clearly on the README.

- You have included a well-formed and valid [nxs_package.json](./nxs_package.json.md) in your repository.

When all the above prerequisites are met, send an email to [developer@nexus.io](mailto:developer@nexus.io) along with the following information:

1. An archive file (preferably in `.zip` format) that contains your module distribution (files that you'll distribute to users). This should be attached to the email.

2. The URL to your online repository AND the full hash of the specific commit in your repository that you compiled your module from (this will usually be the latest commit). A commit hash will look like this: `a1d7f9419b99b325043ae72264af3648023539d8`.

When the verification process completes successfully, you will receive an email with a [`repo_info.json` file](./repo_info.json.md) that contains a signature from Nexus team. You should then copy this `repo_info.json` file into the root directory of your module before distributing, so that your module becomes valid and can be installed by Nexus Wallet users.

Please note that although this verification doesn't verify if your module contains malicious/faulty code or not, **Nexus team still has the sole right to reject your application or to request for changes if something bad or undesirable is detected in the code**.
