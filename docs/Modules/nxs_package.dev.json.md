# nxs_package.dev.json

`nxs_package.dev.json` is the development version of [nxs_package.json](./nxs_package.json.md). It will be used instead of `nxs_package.json` when and only when you add your module as a **development module**.

This is useful when you need to point your module entry to a different local development build.

Development modules are served through the wallet's module-scoped asset server. Existing development manifests that use a dev-server URL must migrate to a module-relative `entry` and add a `files` array containing every asset needed by the module.

## Schema

### `name`

- **Mandatory**
- Type: `string`
- Constraints: only accepts lowercase letters, digits, underscores (`_`) and dashes (`-`)

It's recommended that you make slight changes on this name compared to the production `name` in [nxs_package.json](./nxs_package.json.md) to avoid name conflict when you have both your development module and production module installed.

### `displayName`

- **Mandatory**
- Type: `string`
- Constraints: no newline characters

### `type`

- **Mandatory**
- Type: `string`
- Constraints: for now the only possible value is `app`

Should be the same as in [nxs_package.json](./nxs_package.json.md).

### `options`

- Optional
- Type: `object`
- Constraints:

  - Available options:

  <!-- prettier-ignore -->
  ```js
  {
    // Whether the module's webview is wrapped inside a panel
    // Only available with `app` type modules
    wrapInPanel: boolean
  }
  ```

Should be the same as in [nxs_package.json](./nxs_package.json.md).

### `description`

- Optional
- Type: `string`
- Constraints: none

### `files`

- **Mandatory**
- Type: `string[]`
- Constraints:
  - Each item must be a valid [internal file path](./nxs_package.json.md#internal-file-paths)
  - All listed files must exist

List every local file needed to run the development module, including the `entry` file and its scripts, styles, and other assets. The wallet only authorizes files listed in this on-disk manifest.

### `entry`

- Optional
- Type: `string`
- Constraints: [internal file paths](./nxs_package.json.md#internal-file-paths)

The development entry can differ from the production entry, but it must identify a local file included in `files`.

### `icon`

- Optional
- Type: `string`
- Constraints: [internal file paths](./nxs_package.json.md#internal-file-paths)
