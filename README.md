# Note

Cleaned up version of [https://github.com/chentsulin/electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate)

# electron-react-boilerplate

### A Boilerplate for Scalable Cross-Platform Desktop Apps

<br/>

[![Build Status][travis-image]][travis-url]
[![Appveyor Build Status][appveyor-image]][appveyor-url]
[![Dependency Status][david_img]][david_site]
[![Github Tag][github-tag-image]][github-tag-url]
[![Join the chat at https://gitter.im/electron-react-boilerplate/Lobby](https://badges.gitter.im/electron-react-boilerplate/Lobby.svg)](https://gitter.im/electron-react-boilerplate/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![OpenCollective](https://opencollective.com/electron-react-boilerplate/backers/badge.svg)](#backers)
[![OpenCollective](https://opencollective.com/electron-react-boilerplate/sponsors/badge.svg)](#sponsors)

[![React](/internals/img/react-padded-90.png)](https://facebook.github.io/react/)
[![Webpack](/internals/img/webpack-padded-90.png)](https://webpack.github.io/)
[![Redux](/internals/img/redux-padded-90.png)](http://redux.js.org/)
[![React Router](/internals/img/react-router-padded-90.png)](https://github.com/ReactTraining/react-router)
[![Flow](/internals/img/flow-padded-90.png)](https://flowtype.org/)
[![ESLint](/internals/img/eslint-padded-90.png)](http://eslint.org/)
[![Jest](/internals/img/jest-padded-90.png)](https://facebook.github.io/jest/)
[![Yarn](/internals/img/yarn-padded-90.png)](https://yarnpkg.com/)

[Electron](http://electron.atom.io/) application boilerplate based on [React](https://facebook.github.io/react/), [Redux](https://github.com/reactjs/redux), [React Router](https://github.com/reactjs/react-router), [Webpack](http://webpack.github.io/docs/), [React Transform HMR](https://github.com/gaearon/react-transform-hmr) for rapid application development.

## Install

* **Note: requires a node version >= 7 and an npm version >= 4.**
* **If you have installation or compilation issues with this project, please see [our debugging guide](https://github.com/chentsulin/electron-react-boilerplate/issues/400)**

First, clone the repo via git:

```bash
git clone --depth=1 https://github.com/manojsinghnegiwd/react-image-browser.git your-project-name
```

And then install dependencies with yarn.

```bash
$ cd your-project-name
$ yarn
```
**Note**: If you can't use [yarn](https://github.com/yarnpkg/yarn) for some reason, try `npm install`.

## Run

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a server that sends hot updates to the renderer process:

```bash
$ npm run dev
```

Run these two commands __simultaneously__ in different console tabs:

```bash
$ npm run start-renderer-dev
$ npm run start-main-dev
```

## Editor Configuration
**Atom**
```bash
apm install editorconfig es6-javascript atom-ternjs javascript-snippets linter linter-eslint language-babel autocomplete-modules file-icons
```

**VSCode**
* [Editorconfig](https://github.com/editorconfig/editorconfig-vscode)
* [ESLint](https://github.com/Microsoft/vscode-eslint)
* [Flow](https://github.com/flowtype/flow-for-vscode)
* [Babel](https://github.com/dzannotti/vscode-babel)
* [Jest](https://github.com/orta/vscode-jest)
* [ES6 Snippets](https://marketplace.visualstudio.com/items?itemName=xabikos.JavaScriptSnippets)
* [React Snippets](https://marketplace.visualstudio.com/items?itemName=xabikos.ReactSnippets)
:bulb: *If you are using the `flow-for-vscode` plugin, make sure to disable the `flowtype-errors/show-errors` eslint rule in the `.eslintrc` by setting it to `0`*

**Sublime**
* [Editorconfig Integration](https://github.com/sindresorhus/editorconfig-sublime#readme)
* [Linting](https://github.com/SublimeLinter/SublimeLinter3)
* [ESLint Integration](https://github.com/roadhump/SublimeLinter-eslint)
* [Syntax Highlighting](https://github.com/babel/babel-sublime)
* [Autocompletion](https://github.com/ternjs/tern_for_sublime)
* [Node Snippets](https://packagecontrol.io/packages/JavaScript%20%26%20NodeJS%20Snippets)
* [ES6 Snippets](https://packagecontrol.io/packages/ES6-Toolkit)

**Others**
* [Editorconfig](http://editorconfig.org/#download)
* [ESLint](http://eslint.org/docs/user-guide/integrations#editors)
* Babel Syntax Plugin

## DevTools

#### Toggle Chrome DevTools

- OS X: <kbd>Cmd</kbd> <kbd>Alt</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Linux: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>

*See [electron-debug](https://github.com/sindresorhus/electron-debug) for more information.*

#### DevTools extension

This boilerplate includes the following DevTools extensions:

* [Devtron](https://github.com/electron/devtron) - Install via [electron-debug](https://github.com/sindresorhus/electron-debug).
* [React Developer Tools](https://github.com/facebook/react-devtools) - Install via [electron-devtools-installer](https://github.com/GPMDP/electron-devtools-installer).
* [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension) - Install via [electron-devtools-installer](https://github.com/GPMDP/electron-devtools-installer).

You can find the tabs on Chrome DevTools.

If you want to update extensions version, please set `UPGRADE_EXTENSIONS` env, just run:

```bash
$ UPGRADE_EXTENSIONS=1 npm run dev

# For Windows
$ set UPGRADE_EXTENSIONS=1 && npm run dev
```

:bulb: You can debug your production build with devtools by simply setting the `DEBUG_PROD` env variable:
```
DEBUG_PROD=true npm run package
```


## CSS Modules

This boilerplate is configured to use [css-modules](https://github.com/css-modules/css-modules) out of the box.

All `.css` file extensions will use css-modules unless it has `.global.css`.

If you need global styles, stylesheets with `.global.css` will not go through the
css-modules loader. e.g. `app.global.css`

If you want to import global css libraries (like `bootstrap`), you can just write the following code in `.global.css`:

```css
@import "~bootstrap/dist/css/bootstrap.css";
```

## Sass support

If you want to use Sass in your app, you only need to import `.sass` files instead of `.css` once:
```js
import './app.global.scss';
```

## Packaging

To package apps for the local platform:

```bash
$ npm run package
```

To package apps for all platforms:

First, refer to [Multi Platform Build](https://www.electron.build/multi-platform-build) for dependencies.

Then,
```bash
$ npm run package-all
```

To package apps with options:

```bash
$ npm run package -- --[option]
```

## Further commands

To run the application without packaging run

```bash
$ npm run build
$ npm start
```

To run End-to-End Test

```bash
$ npm run build
$ npm run test-e2e
```

#### Options

See [electron-builder CLI Usage](https://github.com/electron-userland/electron-builder#cli-usage)

## How to add modules to the project

You will need to add other modules to this boilerplate, depending on the requirements of your project. For example, you may want to add [node-postgres](https://github.com/brianc/node-postgres) to communicate with PostgreSQL database, or 
[material-ui](http://www.material-ui.com/) to reuse react UI components.

⚠️ Please read the following section before installing any dependencies ⚠️

### Module Structure

This boilerplate uses a [two package.json structure](https://github.com/electron-userland/electron-builder/wiki/Two-package.json-Structure). This means, you will have two `package.json` files.

1. `./package.json` in the root of your project
1. `./app/package.json` inside `app` folder

### Which `package.json` file to use

**Rule of thumb** is: all modules go into `./package.json` except native modules. Native modules go into `./app/package.json`.

1. If the module is native to a platform (like node-postgres) or otherwise should be included with the published package (i.e. bcrypt, openbci), it should be listed under `dependencies` in `./app/package.json`.
2. If a module is `import`ed by another module, include it in `dependencies` in `./package.json`.   See [this ESLint rule](https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md). Examples of such modules are `material-ui`, `redux-form`, and `moment`.
3. Otherwise, modules used for building, testing and debugging should be included in `devDependencies` in `./package.json`.

### Further Readings

See the wiki page, [Module Structure — Two package.json Structure](https://github.com/chentsulin/electron-react-boilerplate/wiki/Module-Structure----Two-package.json-Structure) to understand what is native module, the rationale behind two package.json structure and more.

For an example app that uses this boilerplate and packages native dependencies, see [erb-sqlite-example](https://github.com/amilajack/erb-sqlite-example).

## Static Type Checking
This project comes with Flow support out of the box! You can annotate your code with types, [get Flow errors as ESLint errors](https://github.com/amilajack/eslint-plugin-flowtype-errors), and get [type errors during runtime](https://github.com/codemix/flow-runtime) during development. Types are completely optional.

## Native-like UI

If you want to have native-like User Interface (OS X El Capitan and Windows 10), [react-desktop](https://github.com/gabrielbull/react-desktop) may perfect suit for you.

## Dispatching redux actions from main process

see discusses in [#118](https://github.com/chentsulin/electron-react-boilerplate/issues/118) and [#108](https://github.com/chentsulin/electron-react-boilerplate/issues/108)