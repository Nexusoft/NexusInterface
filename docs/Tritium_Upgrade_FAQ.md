# Tritium Upgrade FAQs

#### Where is Tritium?

We are releasing the wallet one week before the new block activation to have a smooth network transition.

#### So When?

11/11/2019 11:11PM (Arizona -7GMT) is when the new Tritium blocks will activate

#### Do I need to uninstall the previous version of the wallet?

You may but this step is unnecessary, 2.0.0 will install over the earlier version.

#### What do I need to do with my Wallet.dat?

Nothing, 2.0.0 runs on both legacy (wallet.dat) and Tritium (Sig chains). Please keep your wallet in the Nexus folder.

#### Should I backup my wallet.dat?

You should always backup your wallet.dat before making a change to the interface. However after you have migrated all of your NXS to your sig chain, your wallet.dat is no longer nessesary.

#### Can I send NXS to a legacy address?

Yes you can send NXS to and from Legacy and Tritium address.

#### What is a Sig Chain?

A Sig Chain is you, and everything connected to you. You may think of it as a blockchain inside of a blockchain. When you add items your Sig Chain will update .

#### What is Username/Password/Pin

These items will let you login to your Sig Chain. The username will be able to be accessed globally so it has to be unique. Password can be any 8 or more characters. A Pin must be more than 4 characters and will be used anytime you must make a encrypted action. For example, sending nexus or adjusting stake.

#### Can I change my Password or Pin

Not at this time, however nexus supports these functions.

#### What is changing with Trust and Stake?

In order to stake and get trust you must use the new Tritium system. On your first start up of the wallet you will be presented our migration tool so that you may migrate your balance off your wallet.dat and on to your sig chain. Once this is complete, verify the amount you would like to stake is in your `Trust` account then enable that amount to be staked by using the adjust stake button. You may have to wait for your Genesis transaction to be confirmed before staking will be enabled.

#### Does staking work differently with tritium?

No, staking works the same. The longer you are on the network the higher your trust score, resulting in larger payouts.

#### What are Names? Why can I create accounts with out a name and why do names cost NXS?

Things that are named act differently in tritium then they did before. A Name is just a shortcut to a specific address. A name has its own address and can be moved to point to different things. For this reason you replace the need to typing in an address for a Name. There are Local Names and Global names, Local names will resolve to `{username}:{name}` where as global will resolve to `{name}`.

#### What do I get for free?

When you create a Sig Chain you will be allocated a `default` and a `trust` nexus account

#### What are NameSpaces?

Namespaces like Names are just objects that point to other addresses. You can work with name spaces by using the formula `{namespace}:{name}`. For example a users default account will be at `user1:defualt`.

#### Does that mean I can send someone NXS using their username?

Yes, you can send to a users default account at `users1:default`
