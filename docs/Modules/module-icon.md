# Module icon

Each module can have an icon which will be displayed in the navigation bar, the module list, or the `Panel` header. There are 2 icon formats that are currently supported: `.svg` and `.png`.

If your module icon is in `.png` format, it is highly recommended that your icon size is at least at **42px squared** (or **84px squared** if you do care about retina displays) for the best image quality. Your icon's original ratio should also be 1:1 or it will be morphed when displayed to users.

By default, Nexus Wallet will check if a file named either `icon.svg` or `icon.png` exists in your module's root directory. If it does then it will be loaded and used as your module icon. If not, a default icon will be used.

You can also set a custom path to your icon file by setting the [`icon field in nxs_package.json`](./nxs_package.json.md#icon).
