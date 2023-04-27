# Analytics Policy Statement

The Nexus Wallet, by default, will use Google analytics to track certain metrics about the wallet. The following outlines what is going on and your rights.

#### What services do you use?

We ONLY use Google Analytics, using the `Universal Analytics` npm package

#### Is my info anonymous?

YES! When your info gets set to google's severs they will strip the last digits of your IP address off. We have very little knowledge of any user, we are not interested in it.

#### What is being tracked?

Page views, and a limited number of actions. The purpose is to track usage of features to know what features are being used the most. All items will execute through our wrapper. There for you can looks at the calls in our source code.

#### Can I disable all tracking?

Yes, go to Settings and disable analytics.

#### I want to install the wallet with out analytics

BEFORE YOU OPEN THE WALLET FOR THE FIRST TIME, go to your local storage where Nexus will keep local files
Windows: `c:/Users/Username/App Data/Roaming/`
Mac: `/Username/Library/Application Support`
Linux:`/.config`
Create a `Nexus Wallet` folder
Create a `settings.json` file
Write in that file
`{ "sendUsageData":false}`
Save, then start Nexus Wallet

#### Will this information ever be sold?

No, this is only for us to help develop and maintain the wallet.

#### Do you guys have a retention policy?

Not at this time, currently no data is deleted.
