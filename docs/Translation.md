# Translating Nexus Wallet

**[Contribute your translation on crowdin](https://crowdin.com/project/nexus-interface).**

## Translation guide

- Keep the special snippets enclosed in %{...}, <...> and </...> whole, intact and at the right positions corresponding to their positions in the original text. They will be replaced with appropriate values by the wallet code.
- Keep the spacing, punctuation marks, and capitalization as identical to the original text as possible.
- For most strings, there will be a "Context" section under "Source string", which let you know where the string appears in the wallet interface (e.g. Header, Settings.Core,...). If Context is blank, it means the string is general and can appears anywhere.

### Pluralization

Different plural forms of the same translation should be separated by 4 vertical pipe characters ||||, for example:

```
%{smart_count} message |||| %{smart_count} messages
```

Which translation is used will be determined automatically by the code depending on the value of smart_count. Some languages may have more or less than 2 plural forms, in that case, just provide the appropriate number or phrases/sentences separated by |||| corresponding to the number of plural forms your language has, ordered from low (e.g. 0, 1) to high (e.g. many), for example:

```
"%{smart_count} message |||| %{smart_count} messages": ""%{smart_count} zpráva |||| "%{smart_count} zprávy |||| "%{smart_count} zpráv"
```
