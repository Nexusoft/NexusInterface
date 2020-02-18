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
    ReactRouterDOM, // from 'react-router-dom
    Redux,          // from 'redux'
    ReactRedux,     // from 'react-redux'
    emotion: {
      core,         // from '@emotion/core'
      styled,       // from '@emotion/styled'
      theming,      // from 'emotion-themeing'
      createCache,  // from '@emotion/cache'
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
    GlobalStyles,
    Panel,
    Button,
    Tooltip,
    TextField,
    Switch,
    Select,
    Link,
    Icon,
    Tab,
    FieldSet,
  },
} = NEXUS;
```

More documentations on how to use components will be updated.

<!-- See [React components](./react-components.md) for more details. -->

---

## `utilities`

`utilities` object provides utility functions that helps your module interact with the base wallet, manipulate color values, copy text to clipboard, etc...

Some notes about the utilities function:

- The arguments you pass in will be serialized in JSON, so passing functions or any other non-serializable data won't work.
- Most functions are executed asynchronously (except for the `color` utilities). In those cases, call results are not returned directly from the function calls but can only be received by registering a listener with the corresponding utility function.

```js
const {
  utilities: {
    showNotification,
    showErrorDialog,
    showSuccessDialog,
    rpcCall,
    proxyRequest,
    confirm,
    updateState,
    updateStorage,
    onceInitialize,
    onThemeUpdated,
    onSettingsUpdate,
    onCoreInfoUpdated,
    onceRpcReturn,
    onceProxyResponse,
    onceCOnfirmAnswer,
    copyToClipboard,
    color,
  },
} = NEXUS;
```

### `utilities` API references

- [`showNotification`](#shownotification)
- [`showErrorDialog`](#showerrordialog)
- [`showSuccessDialog`](#showsuccessdialog)
- [`updateState`](#updatestate)
- [`updateStorage`](#updatestorage)
- [`onceInitialize`](#onceinitialize)
- [`onThemeUpdated`](#onthemeupdated)
- [`onSettingsUpdated`](#onsettingsupdated)
- [`onCoreInfoUpdated`](#oncoreinfoupdated)
- [`sendNXS`](#sendnxs)
- [`rpcCall`](#rpccall)
- [`proxyRequest`](#proxyrequest)
- [`confirm`](#confirm)
- [`copyToClipboard`](#copytoclipboard)
- [`color`](#color)

---

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
const listener = initialData => {
  const { theme, settings, coreInfo, moduleState, storageData } = initialData;
  // populate initial data in module...
};
NEXUS.utilities.onceInitialize(listener);
```

- `initialData`: object
  - `initialData.theme`: object - See [`onThemeUpdated`](#onthemeupdated) for more details
  - `initialData.settings`: object - See [`onSettingsUpdated`](#onsettingsupdatedd) for more details
  - `initialData.coreInfo`: object - See [`onCoreInfoUpdated`](#oncoreinfoupdated) for more details
  - `initialData.moduleState`: object - The last state object that your module has previously stored via [`updateState` function](#updatestate).
  - `initialData.storageData`: object - The last data object that your module has previously stored via [`updateStorage` function](#updatestorage).

### `onThemeUpdated`

Example usage:

Register a listener that will be called everytime the base wallet theme is changed.

```js
const listener = theme => {
  // update theme in module...
};
NEXUS.utilities.onThemeUpdated(listener);
```

- `theme`: object - The current theme object that the base wallet is using. It is best used in combination with `NEXUS.utilities.color.getMixer` and pass to [Emotion](https://emotion.sh)'s `ThemeProvider`:

  ```js
  // Add the mixer function
  const themeWithMixer = {
    ...theme,
    mixer: color.getMixer(theme.background, theme.foreground),
  };

  // Then render this...
  <ThemeProvider theme={themeWithMixer}>{/* Your module... */}</ThemeProvider>;
  ```

  Check out usage example in [react-redux_module_example](https://github.com/Nexusoft/react_redux_module_example).

### `onSettingsUpdated`

Register a listener that will be called everytime the base wallet settings is changed.

```js
const listener = settings => {
  // update settings in module...
};
NEXUS.utilities.onSettingsUpdated(listener);
```

- `settings`: object - The current user settings that the base wallet is using. It's not the full settings but only a few settings that modules might care about.

<!-- prettier-ignore -->
  ```js
  // Fields in `settings`
  {
    locale,       // string, e.g. 'en'
    fiatCurrency, // string, e.g. 'USD'
    addressStyle, // string enum: ['segmented', 'truncateMiddle', 'raw']
  }
  ```

### `onCoreInfoUpdated`

Register a listener that will be called everytime the core info is updated in the base wallet.

```js
const listener = coreInfo => {
  // update core info in module...
};
NEXUS.utilities.onCoreInfoUpdated(listener);
```

- `coreInfo`: object - Information that the Nexus core returned from `getinfo` RPC calls which are called at regular interval. What's contained inside `coreInfo` depends on the core that the Nexus Wallet is using.

### `sendNXS`

For security reasons, this function **doesn't send out NXS directly**. It only **redirects** user to the built in Send NXS page with the recipient addresses, send amount, and the transaction message filled, so user can manually click Send to complete the transaction.

```js
sendNXS((recipients: array), (message: string));
```

- `recipients`: array - An array of objects that contain recipient addresses and the NXS amount to send to the corresponding address.
  - `recipients[].address`: string - Recipient's Nexus address to send to.
  - `recipients[].amount`: string - Amount to send.

### `rpcCall`

`rpcCall` function sends an [RPC call](https://en.wikipedia.org/wiki/Remote_procedure_call) to Nexus core, and the call result (or error) will be returned to your module via a Promise.

```js
rpcCall(command: string, params: array) : Promise<object>
```

- `command`: string - A valid command that will be sent to Nexus core (see Nexus core documentation for list of all available commands). There's a whitelist of commands that is allowed to be called (see the full list below).
- `params`: array - List of all params that will be passed along with the command.
- Returns a Promise that will be resolved to the RPC call result or rejected with an error.

RPC command whitelist:

```
checkwallet
getaccount
getaccountaddress
getaddressesbyaccount
getbalance
getblock
getblockcount
getblockhash
getblocknumber
getconnectioncount
getdifficulty
getinfo
getmininginfo
getmoneysupply
getnetworkhashps
getnetworkpps
getnetworktrustkeys
getnewaddress
getpeerinfo
getrawtransaction
getreceivedbyaccount
getreceivedbyaddress
getsupplyrates
gettransaction
help
isorphan
listaccounts
listaddresses
listreceivedbyaccount
listreceivedbyaddress
listsinceblock
listtransactions
listtrustkeys
listunspent
unspentbalance
validateaddress
verifymessage
```

```js
NEXUS.utilities
  .rpcCall('getaccountaddress', ['default'])
  .then(result => {
    // handle result...
  })
  .catch(err => {
    // handle error...
  });
```

### `proxyRequest`

`proxyRequest` function indirectly sends out a HTTP/HTTPS request proxied by the base wallet, and the response (or error) will be returned to your module via a Promise.

Normally, you don't need to call this function to send out a request from your module. You can import an `npm` package like `request` or `axios` and make HTTP requests with them as usual. However, if the server you're sending to doesn't accept CORS (Cross-origin resource sharing) requests from your module and you're having problems with CORS-related issues, then you might want to use `proxyRequest` function to bypass this. Because the base wallet isn't restricted by the same origin rule, it's free to send requests to servers even when they don't support CORS, you can use the base wallet as a proxy server for modules with `proxyRequest` function.

```js
proxyRequest(url: string, options: object) : Promise<object>
```

- `url`: string - The request URL, must be either `http://` or `https://`.
- `options`: object - Request options that will be passed to [`axios`](https://github.com/axios/axios), so check out [`axios` documentation](https://github.com/axios/axios) for the full list of valid options. Keep in mind that function options won't work here.

Example usage:

```js
NEXUS.utilities
  .proxyRequest('getaccountaddress', ['default'])
  .then(result => {
    // handle result...
  })
  .catch(err => {
    // handle error...
  });
```

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
  .then(agreed => {
    if (agreed) {
      // proceed...
    } else {
      // cancel the action...
    }
  });
```

### `copyToClipboard`

Copy plain text to clipboard.

```js
copyToClipboard((text: string));
```

- `text`: string - text to copy

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
// This is a special function that is intended to only be used together with
// the wallet's `theme` object. You would probably not need to use this function
// in most other cases.
// For usage example, check out `react-redux-module-example` repository:
// https://github.com/Nexusoft/react_redux_module_example
color.getMixer(color1, color2);
```
