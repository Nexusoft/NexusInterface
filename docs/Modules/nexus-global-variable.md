# `NEXUS` global variable

`NEXUS` global variable is a javascript object injected into the global scope of every module's javascript execution environment. It contains all the libraries, data and methods that you need to be able to interact and communicate with the base wallet.

From your module's javascript code, you can access to `NEXUS` global variable via `window.NEXUS` or just `NEXUS`, for example:

```js
const React = NEXUS.libraries.React;
```

Below are what's contained inside the `NEXUS` global variable:

## `walletVersion`

The current Nexus Wallet version.

```js
const { walletVersion } = NEXUS;
```

---

## `libraries`

`libraries` object provides the most commonly used third-party js libraries that's also used in the base wallet. If you use one or more of these libraries, you can grab them from `NEXUS.libraries` without having to add them as a dependency of your module, reducing your module's distributed package size.

<!-- prettier-ignore -->
```js
const {
  libraries: {
    React,          // from 'react'
    ReactDOM,       // from 'react-dom'
    emotion: {
      react,        // from '@emotion/react'
      styled,       // from '@emotion/styled'
      cache,        // from '@emotion/cache'
    },
  }
} = NEXUS
```

---

## `components`

`components` provides reusable React components that are also used in the base wallet. Using these React components can help you shorten your development time by not having to reinvent the wheel, and make your module UI look and feel more in sync with the base wallet UI.

Please note that these components are built on React, so your module also need to be built on React in order to use them. These components are also styled using [Emotion](https://emotion.sh/), so although you can use them without using Emotion, it would be easiest to customize them using Emotion.

```js
const {
  components: {
    Arrow,
    AutoSuggest,
    Button,
    Dropdown,
    FieldSet,
    FormField,
    GlobalStyles,
    Icon,
    Modal,
    Panel,
    Select,
    Switch,
    HorizontalTab,
    VerticalTab,
    TextField,
    ThemeController,
    Tooltip,
  },
} = NEXUS;
```

List of included components:

- [Arrow](../../src/shared/components/Arrow.js)
- [AutoSuggest](../../src/shared/components/AutoSuggest.js)
- [Button](../../src/shared/components/Button.js)
- [Dropdown](../../src/shared/components/Dropdown.js)
- [FieldSet](../../src/shared/components/FieldSet.js)
- [FormField](../../src/shared/components/FormField.js)
- [GlobalStyles](../../src/shared/components/GlobalStyles/index.js)
- [Icon](../../src/shared/components/Icon.js)
- [Modal](../../src/shared/components/Modal.js)
- [Panel](../../src/shared/components/Panel.js)
- [Select](../../src/shared/components/Select.js)
- [Switch](../../src/shared/components/Switch.js)
- [HorizontalTab](../../src/shared/components/HorizontalTab.js)
- [VerticalTab](../../src/shared/components/VerticalTab.js)
- [TextField](../../src/shared/components/TextField.js)
- [ThemeController](../../src/shared/components/ThemeController.js)
- [Tooltip](../../src/shared/components/Tooltip.js)

---

## `utilities`

`utilities` object provides utility functions that helps your module interact with the base wallet, manipulate color values, copy text to clipboard, etc...

Some notes about the utilities function:

- The arguments you pass in will be serialized in JSON, so passing functions or any other non-serializable data won't work.
- Most functions are executed asynchronously (except for the `color` utilities). In those cases, call results are not returned directly from the function calls but can only be received by registering a listener with the corresponding utility function.

```js
const {
  utilities: {
    send,
    rpcCall,
    apiCall,
    secureApiCall,
    proxyRequest,
    showNotification,
    showErrorDialog,
    showSuccessDialog,
    showInfoDialog,
    confirm,
    updateState,
    updateStorage,
    onceInitialize,
    onWalletDataUpdated,
    copyToClipboard,
    openInBrowser,
    color,
  },
} = NEXUS;
```

### `utilities` API references

- [`send`](#send)
- [`rpcCall`](#rpccall)
- [`apiCall`](#apicall)
- [`secureApiCall`](#secureapicall)
- [`proxyRequest`](#proxyrequest)
- [`showNotification`](#shownotification)
- [`showErrorDialog`](#showerrordialog)
- [`showSuccessDialog`](#showsuccessdialog)
- [`showInfoDialog`](#showinfodialog)
- [`confirm`](#confirm)
- [`updateState`](#updatestate)
- [`updateStorage`](#updatestorage)
- [`onceInitialize`](#onceinitialize)
- [`onWalletDataUpdated`](#onwalletdataupdated)
- [`copyToClipboard`](#copytoclipboard)
- [`openInBrowser`](#openinbrowser)
- [`color`](#color)

---

### `send`

For security reasons, this function **won't really send NXS or any tokens**. It only **redirects** user to the built in Send page in the wallet, prefilled with data fields. User will then need to manually click Send to complete the transaction.

```js
send(options: object): void;
```

Depending on whether the wallet is in Tritium mode or Legacy mode, the `options` parameter shape is different.

For Tritium mode:

- `options.sendFrom`: string - The address of the account or token to send from.
- `options.recipients`: array - An array of objects that contain recipient addresses and the NXS amount to send to the corresponding address.
  - `options.recipients[].address`: string - Recipient's Nexus address to send to.
  - `options.recipients[].amount`: string - Amount to send.
  - `options.recipients[].reference`: string|number - An optional number which may be provided by the recipient to identify this transaction from the others. Reference should be an unsigned integer between 0 and 18446744073709551615.
  - `options.recipients[].expireDays`: string|number - Expiration time in days.
  - `options.recipients[].expireHours`: string|number - Expiration time in hours.
  - `options.recipients[].expireMinutes`: string|number - Expiration time in minutes.
  - `options.recipients[].expireSeconds`: string|number - Expiration time in seconds.
- `options.advancedOptions`: boolean - Whether to turn on "Advanced options", which will enable reference and expiration settings.

For Legacy mode:

- `options.sendFrom`: string - The address of the account or token to send from.
- `options.recipients`: array - An array of objects that contain recipient addresses and the NXS amount to send to the corresponding address.
  - `options.recipients[].address`: string - Recipient's Nexus address to send to.

### `rpcCall`

`rpcCall` function sends an [RPC call](https://en.wikipedia.org/wiki/Remote_procedure_call) to Nexus core, and the call result (or error) will be returned to your module via a Promise.

```js
rpcCall(command: string, params: array) : Promise<object>
```

- `command`: string - A valid command that will be sent to Nexus core (see Nexus core documentation for list of all available commands).
- `params`: array - List of all params that will be passed along with the command.
- Returns a Promise that will be resolved to the RPC call result or rejected with an error.

```js
NEXUS.utilities
  .rpcCall('getaccountaddress', ['default'])
  .then((result) => {
    // handle result...
  })
  .catch((err) => {
    // handle error...
  });
```

### `apiCall`

`apiCall` method will be the interface between the module and executing API calls. To use API calls that will modify the sig chain use [secureApiCall](#secureapicall) . Will return a promise with the result, a result will only ever return if the nexus core accepts the request.

```js
apiCall(url: string, params: object) : Promise<object>
```

- `url`: string - The API endpoint.
- `params`: object - parameters to pass to the endpoint
- Return : promise - promise returns a object

Example Usage

```js
apiCall('system/get/info', { foo: bar })
  .then((result) => {
    // handle result
  })
  .catch((err) => {
    //handle error
  });
```

### `secureApiCall`

`secureApiCall` acts just like the `apiCall` method but will allow for secured operations that will result in a change to your sigchain, such as sending NXS to another address. All API methods that require a PIN must use this function. When `secureApiCall` is called, a modal will be displayed prompting the user to enter their PIN, it will also transparently display which API endpoint being called and what params being passed in.

```js
secureApiCall(url: string, params: object) : Promise<object>
```

- `url`: string - The api endpoint, must be on the whitelist.
- `params`: object - parameters to pass to the endpoint
- Return : promise - promise returns a object

Example Usage:

```js
secureApiCall('finance/debit/account', { address: foo, name_to: bar })
  .then((result) => {
    // hendle result
  })
  .catch((err) => {
    // handle error
    // Also returns if prompt is canceled
  });
```

### `proxyRequest`

`proxyRequest` function sends a request through the wallet's proxy, most commonly to avoid CORS issues.

Normally, you don't need to call this function to send a request from your module. However, if the server you're sending to isn't configured for CORS (Cross-origin resource sharing) requests and you don't have the necessary permission to re-configure that server, then you can use `proxyRequest` function to bypass the CORS restriction.

Under the hood, this function uses `axios` to send request, so both its input and output align with `axios`'s, with an exception that is the `response` object returned will only contain these fields: `data`, `status`, `statusText`, and `headers`.

```js
proxyRequest(url: string, config: object) : Promise<object>
```

- `url`: string - The request URL, must be either `http://` or `https://`.
- `config`: object - Request config that will be passed to [`axios`](https://github.com/axios/axios), so check out [`axios` documentation](https://github.com/axios/axios) for the full list of valid config.

Example usage:

```js
NEXUS.utilities
  .proxyRequest('getaccountaddress', ['default'])
  .then((result) => {
    // handle result...
  })
  .catch((err) => {
    // handle error...
  });
```

### `showNotification`

Displays a notification at the top left corner of the wallet.

```js
showNotification((options: object));
```

Available options:

- `content`: string - The content that you want to display in the notification.
- `type`: string (optional) - Type of notification that you want to display. Available types are: `info` (default), `success`, `error`.
- `autoClose`: number (optional) - The time (in miliseconds) after which the notification will automatically be closed. If a falsy value except `undefined` is passed, the notification will not automatically be closed. Default value is `5000`.

### `showErrorDialog`

Displays an error dialog in the wallet.

```js
showErrorDialog((options: object));
```

Available options:

- `message`: string - The main (larger) text shown in the error dialog.
- `note`: string (optional) - The supporting (smaller) text shown in the error dialog below the `message`.

### `showSuccessDialog`

Displays an success dialog in the wallet.

```js
showSuccessDialog((options: object));
```

Available options:

- `message`: string - The main (larger) text shown in the success dialog.
- `note`: string (optional) - The supporting (smaller) text shown in the success dialog below the `message`.

### `showInfoDialog`

Displays an info dialog in the wallet.

```js
showInfoDialog((options: object));
```

Available options:

- `message`: string - The main (larger) text shown in the info dialog.
- `note`: string (optional) - The supporting (smaller) text shown in the info dialog below the `message`.

### `confirm`

`confirm` function displays a confirmation dialog to the user. The confirmation dialog contains a question and two buttons for "Yes" and "No" answers, and the answer user selected (either `true` for "Yes" or `false` for "No") will be returned to your module via a Promise.

```js
confirm(options: object) : Promise<boolean>
```

- `options`: object
  - `options.question`: string - The question (on larger text) to display on the confirmation dialog.
  - `options.note`: string (optional) - The added information (on smaller text) to display on the confirmation dialog under the question.
  - `options.labelYes`: string (default: `'Yes'`) - The custom label for the "Yes" button, which will send back the result `true` when chosen by user.
  - `options.skinYes`: string (default: `'primary'`) - The button skin for the "Yes" button. List of available values for button skin can be found here (coming soon).
  - `options.labelNo`: string (default: `'No'`) - The custom label for the "No" button, which will send back the result `false` when chosen by user.
  - `options.skinNo`: string (default: `'default'`) - The button skin for the "No" button. List of available values for button skin can be found here (coming soon).

Example usage:

```js
NEXUS.utilities
  .confirm({
    /* options... */
  })
  .then((agreed) => {
    if (agreed) {
      // proceed...
    } else {
      // cancel the action...
    }
  });
```

### `updateState`

Saves an arbitrary data object (usually your module's state data) into the base wallet's memory so that it won't be lost when user navigates away from your module.

Because all your module's code is embedded inside a [`<webview>` tag](./module-types.md#webview-tag), normally when user navigates away from your module page, the `<webview>` tag will be unmounted and all your module state will be lost. The next time user navigates back to your module, user will have to do everything from the beginning. Therefore you might want to save your module's state into the base wallet by interval or everytime when it's changed.

Using the `updateState` utility, the next time user navigates back to your module, the **last** data object that you've saved with `updateState` will be passed back to your module via [`onceInitialize` listener](#onceinitialize).

```js
updateState((state: object));
```

- `state`: object - Any data object that you want to save.

Note: This data will not be persisted when the wallet is closed. In order to persist data even when the wallet is closed, use [`updateStorage` utilities](#updatestorage) instead.

### `updateStorage`

Saves an arbitrary data object (usually your module's settings) into a file so that it won't be lost when the wallet is closed.

Data will be saved into a file named `storage.json` inside your module's directory, therefore each module has its own storage, not shared with any other. Maximum size of the data that can be stored in `storage.json` is roughly 1MB.

Using the `updateStorage` utility, the next time user navigates back to your module, the **last** data object that you've saved with `updateStorage` will be passed back to your module via [`onceInitialize` listener](#onceinitialize).

```js
send(`updateStorage`, (data: object));
```

- `data`: object - Any data object that you want to save.

Note: This will write data into a file on user's hard drive, so avoid calling this on highly frequent events such as on user's key stroke. For the data that doesn't need to be persisted when the wallet is closed (textbox content for example), use [`updateState` utilities](#updatestate) instead.

### `onceInitialize`

Register a listener that receives the initial data passed from the base wallet.

The listener registered in `onceInitialize` will be called only once when the `webview`'s DOM is ready.

```js
const listener = (initialData) => {
  const { theme, settings, coreInfo, moduleState, storageData } = initialData;
  // populate initial data in module...
};
NEXUS.utilities.onceInitialize(listener);
```

- `initialData`: object
  - `initialData.theme`: object - See [`onThemeUpdated`](#onthemeupdated) for more details
  - `initialData.settings`: object - See [`onSettingsUpdated`](#onsettingsupdatedd) for more details
  - `initialData.coreInfo`: object - See [`onCoreInfoUpdated`](#oncoreinfoupdated) for more details
  - `initialData.userStatus`: object - See [`onUserStatusUpdated](#onuserstatusupdated) for more details
  - `initialData.addressBook`: object - This local machines Address Book
  - `initialData.moduleState`: object - The last state object that your module has previously stored via [`updateState` function](#updatestate).
  - `initialData.storageData`: object - The last data object that your module has previously stored via [`updateStorage` function](#updatestorage).

### `onWalletDataUpdated`

Example usage:

Register a listener that will be called everytime the wallet data is changed.

```js
const listener = (walletData) => {
  // update wallet data in module...
};
NEXUS.utilities.onWalletDataUpdated(listener);
```

- `walletData`: object - Includes `theme`, `settings`, `coreInfo`, `userStatus`, `addressBook`.

  - `walletData.theme`: object - The current theme object that the base wallet is using. It is best used in combination with `NEXUS.utilities.color.getMixer` and pass to [Emotion](https://emotion.sh)'s `ThemeProvider`:

  - `walletData.settings`: object - The current user settings that the base wallet is using. It's not the full settings but only a few settings that modules might care about.

<!-- prettier-ignore -->
  ```js
  // Fields in `settings`
  {
    locale,       // string, e.g. 'en'
    fiatCurrency, // string, e.g. 'USD'
    addressStyle, // string enum: ['segmented', 'truncateMiddle', 'raw']
  }
  ```

<!-- prettier-ignore -->
  - `walletData.coreInfo`: object - Returned data from `system/get/info` API calls (or `getinfo` RPC calls if wallet is in Legacy mode) updated at regular intervals (about every 10 seconds).


  - `walletData.userStatus`: object - Contains information about the user, will return `null` if logged out.

### `copyToClipboard`

Copy plain text to clipboard.

```js
copyToClipboard((text: string));
```

- `text`: string - text to copy

### `openInBrowser`

Open an URL in the OS's default browser.

```js
openInBrowser((url: string));
```

- `url`: string - URL to open

### `color`

Provides various utility functions to manipulate color values. Under the hood, these functions use npm `color` package, so you can check out the [`color` package documentation](https://github.com/Qix-/color) for more details on how to use them.

```js
const { color } = NEXUS.utilities;

color.negate(color);
color.lighten(color, value);
color.darken(color, value);
color.saturate(color, value);
color.desaturate(color, value);
color.grayscale(color);
color.whiten(color, value);
color.blacken(color, value);
color.fade(color, value);
color.opaquer(color, value);
color.rotate(color, value);
color.mix(color1, color2, value);
color.isLight(color);
color.isDark(color);
color.toHex(color);
```
