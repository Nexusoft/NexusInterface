# Upgrading modules to Nexus Wallet v3.1

Nexus Wallet v3.1 comes with a lot of breaking changes to the module API. This article will walk you through those changes so that you can make your modules compatible with Nexus Wallet v3.1.

## Some third-party libraries are no longer provided through `NEXUS.libraries`

These libraries will no longer be found at `NEXUS.libraries`:

- `Redux` (from redux)xw
- `ReactRedux` (from react-redux)
- `ReactRouterDOM` (from react-router-dom)
- `ReduxForm` (from redux-form)

If you still want to use these libraries in your module, you can add them as direct dependencies of your module project.

Removing these from `NEXUS.libraries` reduces the size of the preload script which is loaded every time you open a module, making the loading process a bit faster.

Only 3 libraries `react`, `react-dom` and `emotion` remain to be passed through `NEXUS.libraries`. They are common dependencies of the components at `NEXUS.components`, so they are always loaded anyway, passing them through won't make any difference in loading time.

## ThemeController was added, `color.getMixer` was removed

Before v3.1, in order to make the wallet theme work on your module, you had to use `color.getMixer()` to produce the complete `theme` object and pass it to `ThemeProvider`. For example:

```
const themeWithMixer = {
  ...theme,
  mixer: color.getMixer(theme.background, theme.foreground),
};

return (
  <ThemeProvider theme={themeWithMixer}>
    {/* your app */}
  </ThemeProvider>
)
```

Since v3.1, you can just simply pass the original theme object to the new `ThemeController` component from `NEXUS.components`.

```
return (
  <ThemeController theme={theme}>
    {/* your app */}
  </ThemeController>
)
```

## Emotion sub-libraries names have been updated

Starting from v11, Emotion library had a lot of changes related to library namings. Therefore, Emotion sub-libraries under `NEXUS.libraries` will be updated as follow:

- `emotion.core` => `emotion.react`
- `emotion.theming` => `emotion.react`
- `emotion.createCache` => `emotion.cache`
- `emotion.styled` remains

## RF adapter components were removed

Before v3.1, many components in `NEXUS.components` have a 'sub-component' called RF (e.g. `TextField` has `TextField.RF`) which is the adapter for `redux-form`'s interface.

Since v3.1, `redux-form` is no longer be passed through `NEXUS.libraries`, and the choice of form library is completely up to you to decide. Therefore, these RF components are removed. If you still want to use them, you should implement them in your modules. It would be just a few lines of code for each component, for example:

```
const TextFieldReduxForm = ({ input, meta, ...rest }) => (
  <TextField error={meta.touched && meta.error} {...input} {...rest} />
);
```

## `DateTimePicker` and `Link` components were removed. `Tab` component was replaced by `HorizontalTab`

`DateTimePicker` component was removed because it's not being used by the wallet. Modules which need it should implement a DateTimePicker on its own.

`Link` component was removed because in most cases it can be replaced by a `Button` with `skin="hyperlink"` prop. Furthermore, it requires `react-router-dom` library, which is not intended to be included in the preload script.

`Tab` component was replaced by `HorizontalTab`, which purely focuses on the component's UI and doesn't depend on `react-router-dom` library. There's also a new `VerticalTab` component added.

## `options` param for `send()` now has a slightly different shape

Previously `send()` function supports an `options` parameter that's more suitable for Legacy mode:

```
{
  recipients: [{
    address,
    amount
  }],
  message,
  reference,
  expires
}
```

Now `options` parameter shape is more suitable for Tritium mode:

```
{
  sendFrom,
  recipients: [{
    address,
    amount,
    reference,
    expireDays,
    expireHours,
    expireMinutes,
    expireSeconds,
  }],
  advancedOptions,
}
```

## Individual `onSomethingUpdated` functions (e.g. `onThemeUpdated`) were replaced by a single `onWalletDataUpdated` function

All functions listed below

```
onThemeUpdated(listener)
onSettingsUpdated(listener)
onCoreInfoUpdated(listener)
onUserStatusUpdate(listener)
```

were removed and replaced by `onWalletDataUpdated(listener)` which registers a single listener for any kind of wallet data change. `listener` will now also be called when there's a change in `addressBook`.

## Dropped support for `.tar.gz` file type

Starting from v3.1, in order to simplify the code and reduce the number of project dependencies, `.tar.gz` is no longer supported when you install a module. The only supported archive file type is `.zip`. Given the popularity of `.zip` type, this change is expected to have almost no impact on module developers.

---

## Notable non-breaking changes

### Right clicking in module now opens up a default context menu with Copy and Paste options

### Clicking an external link will now opens up the URL in user's default browser
