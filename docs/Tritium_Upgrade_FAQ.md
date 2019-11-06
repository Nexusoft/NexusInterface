# Tritium Upgrade FAQs

#### Where is Tritium?

We are releasing the wallet one week before the new block activation to have a smooth network transition.

#### So When?

11/11/2019 11:11PM (Arizona -7GMT) is when the new Tritium blocks will activate

#### Do I need to uninstall the previous version of the wallet?

You may but this step is unnecessary, 2.0.0 will install over the earlier version.

#### What do I need to do with my Wallet.dat?

Nothing, 2.0.0 runs on both legacy (wallet.dat) and Tritium (signature chains). Please keep your wallet in the Nexus folder.

#### Should I backup my wallet.dat?

You should always backup your wallet.dat before making a change to the interface. However after you have migrated all of your NXS to a signature chain account, your wallet.dat is no longer nessesary.

#### I am in sync but my balance is still 0

We have made wholesale changes to the way everything works. If you get this issue, please go terminal and enter these commands in this order (It may that a few seconds for these commands to finish). `checkwallet`, `repairwallet` , than `rescan` . Any other issues please contact us in our slack.

#### I am staking but it says `Waiting for average age of balance to exceede 72 hours...`

This is a display issue, this is being resolved in the next release. You are still staking and you will still gain trust.

#### Can I send NXS to a legacy address?

Yes you can send NXS to and from Legacy and Tritium address.

#### What is a Signature Chain?

A Signature Chain is a chain of transactions that defines your accounts, assets, tokens, and anything else that you "own". You may think of it as your own personal blockchain inside the Nexus blockchain. Every time you make a transcaction, whether to debit or credit an account, create an token, make a new account, or transfer an asset, the transaction is appended to the end of your signature chain. On the interface your `user` will be your Signature Chain, To see everything about your Signature Chain including your Genesis see the User page.

#### What is Username/Password/Pin

The combination of username, password, and PIN are used to prove owndership of a signature chain. The username is hashed into a 256-bit number known as your genesis hash, which identifies your signature chain. Therefore your username must be unique within the Nexus blockchain. Passwords can be any 8 or more characters. A Pin must be more than 4 characters and will be required any time you make a new transaction in your signature chain, for example sending NXS or adjusting stake.

#### Can I change my Password or Pin

The Nexus platform does allow a recovery phrase to be set on your signature chain, which can then be used at a later time to set new password and PIN. However this function is not currently available in the Nexus Interface or API.

#### Where is my encryption?

On the chain! With signature chains your encryption is on the chain, no need to encrypt your wallet.

#### What is changing with Trust and Stake?

In order to stake and get trust you must use the new Tritium system. On your first start up of the wallet you will be presented our migration tool so that you may migrate your balance off your wallet.dat and on to your sig chain. This will automatically stake the full balance of your legacy trust key. Once migrated, you are free to adjust the amount to be staked by using the adjust stake button. You may have to wait for your Genesis transaction to be confirmed before staking will be enabled.

#### Does staking work differently with tritium?

No, staking works the same. The longer you are on the network the higher your trust score, resulting in larger payouts.

#### That's great but can I just use legacy to stake?

NO! After mainnet activateion if you want to continue to stake NXS you MUST move your coin to a Signature Chain and stake with the new system.

#### It Says I can not stake without a Genesis?

Please allow the wallet time to generate that transaction, this will happen automatically.

#### What are Names? Why can I create accounts with out a name and why do names cost NXS?

Things that are named act differently in tritium then they did before. A Name is just a shortcut to a specific address. A name has its own address and can be moved to point to different things. For this reason you replace the need to typing in an address for a Name. There are Local Names and Global names as well as Namespaces, Local names will resolve to `{username}:{name}`, global will resolve to `{name}`, and Namespaces resolve to `{namespace}::{name}`.

#### What do I get for free?

When you create a new Signature Chain we automatically create a `default` and a `trust` NXS account. It is free to make other accounts, but fee apply if you give them a name.

#### Should I give people my username?

This is up to you. One neat feature of Nexus is the ability to use names instead of account addresses. For example a users default NXS account will be called `default`. However if you want to have someone else send to your account then they have to prefix it with your username, e.g. `user1:default` which requires them to know your username. Your username - and the genesis hash which is derived from it - allows other users visibility into your signature chain, including the accounts, tokens, assets and anything else your chain owns. If you prefer privacy, then you may give out your account address instead (the long sequence of characters starting with an 8 that looks a lot like your old legacy addresses).

#### Does that mean I can send someone NXS using their username?

Yes, you can send to a users default account at `username:default`
