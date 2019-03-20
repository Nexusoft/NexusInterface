# 0.9.0-alpha4 (2019.3.XX)
[Release Link](https://github.com/Nexusoft/NexusInterface/releases/tag/Release-0.9.0)
#### Additions
- Tritium Cores
- New CSV download functionality for Transaction page
- New Currency icons for fiat balance
- Added links to the exchanges on the Market page

#### Adjustments
- There is now a max of `0.1` Nexus for the transaction fee setting
- Moved `Download Recent Database` to file dropdown
- Trust and Stake numbers now only show 6 significant numbers


#### Fixes
- Fixed typo on Israeli Shekel using the wrong ISO code
- Pressing Enter on the Terminal Page no longer displays the auto suggest
- Pressing Enter on the Terminal Page now properly removes focus from input field
- Fixed Pending Transaction label in transaction detail modal
- Fixed `Fee` not displaying on send transactions in the detail modal
- Fixed price history file not being created/read properly 

# 0.8.9 (2019.3.01)
[Release Link](https://github.com/Nexusoft/NexusInterface/releases/tag/Release-0.8.9)
#### Additions
- Added rescan buttons to allow for easy rescan of the wallet
- Addresses now on the add recipient

#### Adjustments
- Bootstrap only stops the core when it is finished downloading
- Improved Terminal Page
- App now remembers the last setting tab selected
- Improved auto suggestions

#### Fixes
- Fixed issue with auto updates, The app will now look for updates and ask the user if they want to upgrade
- Fixed issue with a crash using `minimalist` or `none` view
- Fixed issue were changing a color made the background turn to the light theme
- Fixed issue with account names in the Transaction page


# 0.8.8 (2019.2.22)
[Release Link](https://github.com/Nexusoft/NexusInterface/releases/tag/Release-0.8.8)
#### Additions
- Added Dutch/Nederlands Language
- Brand new Address Book interface
- New setting to set Nexus address format

#### Adjustments
- Language Improvements
- Nexus Data and App folder now will be marked with `Beta` instead of the version number so users do not need to rebootstrap or lose settings
- Removed unused packages from dependency list
- Market Data tooltips now with shift left or right in order for them to display center to the graph
- Transaction Chart in Transaction page now responds to Theme
- Transaction Graph now responds to Theme, transaction bar colors remain fixed. 
- On the send page the `X` to remove recipients from a send many now displays at all time

#### Fixes
- Closing the app while in Manual mode no longer tries to stop the manual Daemon
- Dock now properly hides and shows on Mac OSX if minimize on close is active

# 0.8.7 (2019.2.15)
[Release Link](https://github.com/Nexusoft/NexusInterface/releases/tag/Release-0.8.7)
#### Additions
- There are now additional display options for the overview page, see Settings/App

#### Adjustments
- Low disk warning has been reduced to 1gb for manual syncing
- Market page charts now respond to Theme adjustments
- Terminal page font has shrunk for both terminal and console output
- Renamed Dark theme background
- Removed `?` from the move NXS button
- Reordered the languages and replaced the US flag with a US/GB flag for English
- Adjusted some padding on the footer

#### Fixes
- Language translation improvements
- Fixed fiat selection bug
- Fixed typo with GBP where the app would not start up
- Fixed an issue where using the filters in the transactions page would cause the app to gray screen
- Fixed an Issue where the Nav Icon pulse was being cut off
- Fixed issues where transactions would still be labeled as 'Pending'


# 0.8.6 (2019.2.1)
[Release Link](https://github.com/Nexusoft/NexusInterface/releases/tag/Release-0.8.6)
#### Additions
- Theme file now accepts a URL and will auto download and store in App Data
- Theme is now in its own file named Theme.json
- You can now have a select a Light Theme
- You can now use custom colors but use a built in background
- The Send Queue has been revamped
- Now checks to see if you have 10gb of free space and will warn you each time you get a new block
- Closing nexus now performs better


# 0.8.5 (2019.1.18)
[Release Link](https://github.com/Nexusoft/NexusInterface/releases/tag/Release-0.8.5)
#### Additions
- New Css and layout all over the app
- Includes new 2.5.5 backend
- Better explanation on Exchange Page
- You can now import a theme json file
- Made changes to the Market Page’s charts
- Now added volume for each exchange
- Reconfigured bootstrap modal to have a progress bar that shows kb downloaded
- New loading message on Trust List

#### Bug Fixes
- Fixed issues with the settings page not saving

# 0.8.4 (2018.12.27)
#### Additions
- UI Improvments
- You can now change your Language
- Reconfigured File Menu
- Seperate Staking Balance on overview page
- You can now set a local minimum confirmations for the transactions and wallet balances
- Move now works over UTXO
- You can now select different accounts in the transaction page
- Both Core Output and Terminal now focus to the bottom
- Added a pause button in the Core Output page
- Modified the terminal to have a leading message per command
- Added backup directory picker
- Bootstrap will now alert user if there is not enough space 
- Added ForkBlock functionality to settings.json (Add “forkblocks=*number*” to settings.json)
- Bootstrap now deletes old zip after extraction
- Started Deprecating “Send” and “Receive” for “Debit” and “Credit”

#### Bug Fixes
- Overall bug fixes
- Improved chart to better display the data for transactions
- Core Output and Terminal now word wrap properly
- Fixed Issue with RPC commands that had multiple nested objects 
- Fixed issue with the app when switch between internal and manual daemon mode

# 0.8.3 (2018.10.1)
#### Private Internal Release

# 0.8.2 (2018.9.15)
#### Private Internal Release

# 0.8.1 (2018.9.1)
#### Private Internal Release

# 0.8.0 (2018.8.1)
#### First Private Internal Release
