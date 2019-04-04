# Nexus Module Developer Guide

In this guide, you will find the instructions on how to write your own [Nexus module](./README.md).

## What technology can Nexus modules be built on?

Nexus Wallet is a web-based desktop application built on Electron, therefore Nexus modules can be built on the **web technology**, that is HTML, CSS, and Javascript. module developers have the total freedom to choose what web frameworks or libraries they want to use to build their modules, for example you can use Angular, Vue,... for javascript framework, LESS, SASS, Stylus,... for CSS preprocessors, or you can even just use plain HTML/CSS/Javascript if it's what you prefer.

However, if you aim for the best convenience, compatibility, and the most identical look with the base wallet, it is recommended that you use the same libraries that are used in the base wallet, namely:

- [React](https://reactjs.org/) for javascript GUI library.
- [Redux](https://redux.js.org/) for app state manager.
- [Emotion](https://emotion.sh) for CSS styling.
- [ReactRouter](https://reacttraining.com/react-router/) for navigations.

If you use the libraries listed above in your module, you won't need to add them to your `package.json` dependencies, because the base Nexus wallet will pass these libraries to your module through an injected global variable, along with some utility functions and components built on these libraries (mostly React and Emotion). As a result, you will be able to reduce your module size by not having to include these libraries in your module, speed up your development by not having to reinvent the wheel, and ensure a more consistent UI with the base wallet by reusing the same UI components that the base wallet uses.

## Quick Start

If you want to quickly set up your new module code base, you can check out these [examples](#examples-and-boilerplates), fork one of them, and modify the code to achieve the functionality as you wish.

## Requirements for a valid module

A module (either in a directory or packaged as an archive) is considered valid if it meets all the requirements below:

1. A well-formed and valid [nxs_package.json](./nxs_package.json.md) file in the top level of your module directory.
2. All the files that are listed in `files` field of `nxs_package.json` must exist.
3. A well-formed and valid [repo_info.json](./repo_info.json.md) file in the top level of your module directory.
4. The repository specified in `repo_info.json` must exist and publicly accessible (non-private).

If your module is not valid, Nexus Wallet users will not be able to install it.

If somehow a user has already installed your module, but your module becomes invalid at the moment user opens the wallet (for example your repository is then deleted), your module will not be loaded.

## Nexus module specification

Nexus module specification is the collection of all the programming interfaces for communicating between the base Nexus wallet and Nexus modules. Nexus module specification comprises of:

- File schemas - including schemas for [nxs_package.json](./nxs_package.json.md) and [repo_info.json](./repo_info.json.md).
- [Injected global variable](./InjectedGlobalVariable.md).
- [IPC messages API](./IPCMessagesAPI.md).

## Get your source code verified

## Packaging

You can compress your module in either `.zip` or `.tar.gz` formats so users will be able to install it directly from those archive files. You can also compress your files in other archive formats, though in that case, users will have to manually extract your compressed module first, then choose to install from the extracted directory.

## Delivering

You are free to choose how to deliver your module to your users.

One easy way that we recommend is to [create a release on github](https://help.github.com/en/articles/creating-releases), then send the link to your module's release page via your blogs, social media, chat, and other channels that you use.

## Examples and boilerplates

Currently there are 3 Nexus module example repositories that you can also use as boilerplates:
