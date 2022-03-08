# Developer's guide to Nexus Wallet Module

**Nexus Wallet Modules** are third party code packages that allow Nexus Wallet users to customize and add more functionalities to their wallets (similarly to _extensions_ or _add-ons_ in other systems). Modules can be written and distributed by anyone who has sufficient programming skills, and can be optionally installed by anyone who uses Nexus Wallet.

Nexus Wallet is a web-based desktop application built on [Electron](https://electronjs.org/), therefore you can build Nexus Wallet Modules using the **web technology**, i.e. HTML, CSS, and Javascript. You, as a module developer, have the total freedom to choose what web frameworks or libraries you like to use to build their modules, for example you can use either React, Angular or Vue for UI logic, LESS, SASS, or Stylus for styling,... or you can even just use plain HTML/CSS/Javascript if that's what you prefer.

However, if you aim for the best convenience, compatibility, and the most consistent look and feel compared to the base wallet, it is highly recommended that you use the same libraries (not necessarily all) that are used in the base wallet, namely:

- [React](https://reactjs.org/) for javascript GUI library.
- [Emotion](https://emotion.sh) for CSS styling.

Another benefit of using these libraries in your module is that you won't need to add them as your project dependencies, because the base Nexus Wallet will provide your module with these libraries through an injected [global variable](./nexus-global-variable.md). As a result, you will be able to reduce your module size, speed up your development, and ensure a more consistent UI with the base wallet.

## Getting Started

### 0. Preparations

In order to test your module, you need to download and install the [latest version of Nexus Wallet](https://github.com/Nexusoft/NexusInterface/releases/latest) if you haven't.

Just like when you develop a website, you need a suitable code editor like Visual Studio Code or Sublime Text. You also need to have [Node.js](https://nodejs.org/) installed, even though it's not a hard requirement, it is very likely that you will need it, especially if you plan to follow the steps below.

### 1. Initialize your repository

Unless you're experienced with developing Nexus Wallet Modules, or you're confident about your ability to build a module from scratch, it is highly recommended that you start your project by forking one of the template modules below or using them as a template (click the green "Use this template" button in the repository):

- [minimal_module_template](https://github.com/Nexusoft/minimal_module_template) - A minimal "Hello World" type of module to demonstrate what a simple Nexus Wallet Module needs at minimum, written in plain HTML, CSS and Javascript.
- [react_module_template](https://github.com/Nexusoft/react_module_template) - A simple Nexus Wallet Module template built with React.
- [react_redux_module_template](https://github.com/Nexusoft/react_redux_module_template) - (Recommended) A Nexus Wallet Module template built with React and Redux, also includes boilerplate code and example usages of some Nexus Wallet Module's advanced features.

Please keep in mind that your module code needs to be open source and publicly accessible (read access). If not, Nexus team won't be able to verify your module source code and people won't be able to run your module. Currently, github.com is the only repository hosting that is supported, Nexus team will consider supporting more hostings in the future.

Clone your repository on your computer and run `npm install` to install the dependencies.

### 2. Develop your module features

After your repository is initialized, the first thing you should do is to add your in-development module to the wallet so that you can see your results live on the wallet while you developing. Enable Developer mode if you haven't (in Settings/Application), go to Settings/Modules, click "Add a development module" link, and select your module repository folder.

A development version of your module will appear on the wallet. But it won't be working yet, in your module repository folder, you need to run `npm run dev` to start the local development server. Now open the module on the wallet, you should see it working. Everytime you save your code with some changes, your module will automatically reload so that you can review the changes immediately. WebView works like a separate web browser so it has a separate Developer Tools, you can open it with "View/Toggle Module's Developer Tools" menu.

Now you can start replacing the template UI components and logic with your own code and add more cool stuffs.

Here are some topics that you can learn about:

- [Module types](./module-types.md)
- [Communicating between modules and the wallet](./communication.md)
- [Module icon](./module-icon.md)
- [Auto-update](./auto-update.md)

API References

- [nxs_package.json](./nxs_package.json.md)
- [nxs_package.dev.json](./nxs_package.dev.json.md)
- [NEXUS global variable](./nexus-global-variable.md)
- [repo_info.json](./repo_info.json)

### 3. Test your module

When you're done adding features to your module in the development environment, you would probably want to test if your module works as expected in production.

Make sure your [nxs_package.json](./nxs_package.json.md) file is filled out with appropriate information, then go to the wallet and install from your module repository folder. Also make sure "Developer mode" setting is on and "Module open source policy" setting is off, or you will not be able to install your module.

You can have both your development module and production module installed at the same time if you set the `name` fields differently in [nxs_package.json](./nxs_package.json.md) and in [nxs_package.dev.json](./nxs_package.dev.json.md). If your module doesn't work as expected, or there's something you want to improve, you can go back and forth between this step and the previous step many times.

### 4. Get your module verified

When you're already satisfied with your module, before you can distribute it to your users, you need to get your module repository verified, or people will not be able to install and run your module due to the [Module open source policy](./module-security.md#module-open-source-policy).

The purpose of this verification process is to ensure that all Nexus Wallet Modules are open source, reducing the risk of malicious modules. See [Module open source policy](./module-security.md#module-open-source-policy) to learn more about the security concerns and reasonings behind this policy, and [Repository verification process](./repo-verification-process.md) to learn what steps you need to do to get your repository will be verified.

### 5. Package & release

#### Packaging your module

Once your module is verified and you've received the repo_info.json file from Nexus team, copy this repo_info.json file to a new folder together with all production files (those that are listed in [nxs_package.json's `files` field](./nxs_package.json.md#files)) including nxs_package.json itself, compress that folder (currently the only supported compression formats is `.zip`) and distribute it.

A tip for you is that if you already installed your module as suggested from step 3, you can copy repo_info.json into your module installation folder (from wallet menu select "Help/Open Interface Data Folder", then open folder `modules/<your module name>`), by doing so you won't have to hand pick which file you need to include but the wallet has already done that for you. After you copied, restart your wallet to see if the non-open-source warning is gone for your module, if it's gone it means everything's right and your module is ready to be delivered.

#### Releasing on github

You are free to choose how to deliver your module to your users, either uploading your packaged modules to your website or sending them directly via chat or forum, etc... But we **highly recommend** you to [create a release on github](https://help.github.com/en/articles/creating-releases) which enables the wallet to check and notify users whenever your module has a new version, then send the link to your module's release page via your blogs, social media, chat, or other communication channels that you use.

In order to make auto-update work on your module, check out [Auto-update guide](./auto-update.md).

---

If you have any question or idea about Nexus Wallet Module, contact us via #modules channel on [Nexus Community slack](https://slack.nexus.io/).
