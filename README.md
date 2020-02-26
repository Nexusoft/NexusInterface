# Nexus Wallet Interface

![GitHub package.json version](https://img.shields.io/github/package-json/v/Nexusoft/NexusInterface) [![Crowdin](https://badges.crowdin.net/nexus-interface/localized.svg)](https://crowdin.com/project/nexus-interface)

This is an Electron and React based interface to Nexus. It is an example of what can comprise the 6th and 7th layers of the Nexus software stack, which are the Logical and Interface layers respectively.

If you would like to learn more about Nexus we encourage you to visit the [Nexus Website.](https://nexus.io/)

## Develop your modules for Nexus Wallet

See [Developer's Guide to Nexus Wallet Module](docs/Modules).

## Help translating Nexus Wallet

See [Translation Guide](docs/Translation.md).

## Build and Dev-server Instructions

To get started, you will first need to set up node.js (version 10 or higher) and npm (version 6 or higher) they come together as a package and can be found [here](https://nodejs.org). You will then need to clone into this repository, cd into the NexusInterface dir, run `npm install`, then run `npm run dev` and the dev server will spin up launching the app for you.

To test a production build run `npm run package` and navigate to the _release_ directory in the root of the project and install as you would any other program.

Or use the _BuildStandalone-{platform}.sh_ files that include cleaning out old builds.

## License

Nexus is released under the terms of the MIT license. See [COPYING](COPYING.MD) for more
information or see https://opensource.org/licenses/MIT.

## Contributing

If you would like to contribute as always submit a pull request. This library development is expected to be on-going.
