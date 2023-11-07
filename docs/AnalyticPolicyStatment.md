# Analytics Policy Statement

###### rev 2.0 November 7th 2023

The Nexus Wallet, by default, will use Google analytics to track certain metrics about the wallet. The following outlines what is going on and your rights.

### REV2.0 Changes:

In June 2023 Google dropped all support and tracking for `Universal Analytics` and migrated everyone to GA4. Although the new tool improved analytics for websites and apps that use e-commerce and ads, it did not add much for our use-case. It would be a fair criticism to say that this is now overkill, however it is still the easiest and most user friendly way to look at the data we need. With the new Analytics protocol we can review more data that is useful for the health of the wallet, like device info, error capturing, and events. Nexus will now, and forever, never sell this information, use this information to sell ads, or use this data in any way that is not related to improving the wallet. As always you can turn it off as well as view the analytic triggers on Github.

### What services do you use?

We ONLY use Google Analytics 4, using the `GTag.js` package.

### Is my info anonymous?

Yes and no, your IP is sent to Google, but we can not see it. Google can extract more info from your IP, however on our report can not tract, identify , or deduce any one user.

### What is being tracked?

Page views, and a limited number of actions. The purpose is to track usage of features to know what features are being used the most. We also capture and report certain errors, and some User information (device/language/location). All items will execute through our wrapper. There for you can looks at the calls in our source code.

### Can I disable all tracking?

Yes, go to Settings and disable analytics.

### I want to install the wallet with out analytics

BEFORE YOU OPEN THE WALLET FOR THE FIRST TIME, go to your local storage where Nexus will keep local files

- Windows: `c:/Users/Username/App Data/Roaming/`
- Mac: `/Username/Library/Application Support`
- Linux:`/.config`

1. Create a `Nexus Wallet` folder
2. Create a `settings.json` file
3. Write in that file
   `{ "sendUsageData":false}`
4. Save, then start Nexus Wallet

### Will this information ever be sold?

No, this is only for us to help develop and maintain the wallet.

### Do you guys have a retention policy?

Not at this time, currently no data is deleted.
