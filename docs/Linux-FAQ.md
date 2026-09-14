# Linux FAQ

This document will be a living document about issues and resolutions with different flavors/versions of linux distros

For comparison, the Nexus Wallet is build on a 16.04 machine, with testing done on 16.04 and 18.04.

#### Debian package build helper

Prerequisites: `git`, Node.js 22.12+, and npm 10.9+.

From a NexusInterface checkout:

```bash
chmod +x build_deb.sh
./build_deb.sh
```

The resulting `.deb` should appear in the `release/` directory inside the NexusInterface folder.
