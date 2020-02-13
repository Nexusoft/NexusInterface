# nxs_package.dev.json

`nxs_package.dev.json` is the development version of [nxs_package.json](./nxs_package.json.md). It will be used instead of `nxs_package.json` when and only when you add your module as a **development module**.

This is useful when you need to point your module entry to a different file or URL (e.g. from the dev server) in order to use Live Reload (or Hot Module Replacement) feature for a better developer experience.

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

### `entry`

- Optional
- Type: `string`
- Constraints: [internal file paths](./nxs_package.json.md#internal-file-paths) OR a URL

This field is what makes `nxs_package.dev.json` useful. The entry file or URL in your development environment should be different from that of production environment, so that you can use development features like Live Reload.

### `icon`

- Optional
- Type: `string`
- Constraints: [internal file paths](./nxs_package.json.md#internal-file-paths)
