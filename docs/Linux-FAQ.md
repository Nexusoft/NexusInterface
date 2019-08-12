# Linux FAQ

This document will be a living document about issues and resolutions with different flavors/versions of linux distros

For comparison, the Nexus Wallet is build on a 16.04 machine, with testing done on 16.04 and 18.04.

#### Debian Buster Fix for AppImage

Run before running AppImage
`sudo sysctl kernel.unprivileged_userns_clone=1`

#### Can not install gir1.2-gnomekeyring-1.0

gnomeKeyring has been deprecated but is still being required by electron 5
you must remove this dep from the package

To do this unpack the deb.
Unpack of the control archive.
Remove the dependency from the control file
repackage the control.tar.gz
repackage deb
