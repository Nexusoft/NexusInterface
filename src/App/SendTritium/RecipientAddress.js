import { useEffect, useState } from 'react';

import NexusAddress from 'components/NexusAddress';
import Icon from 'components/Icon';
import { lookupAddress } from 'lib/addressBook';
import { callApi } from 'lib/tritiumApi';
import { addressRegex } from 'consts/misc';
import { debounced } from 'utils/universal';
import contactIcon from 'icons/address-book.svg';
import warningIcon from 'icons/warning.svg';

const resolveName = debounced(async (name, callback) => {
  try {
    const { address } = await callApi('names/get/name', { name });
    callback(address);
  } catch (err) {
    callback(null);
  }
}, 500);

function useAddressLabel(address) {
  const [name, setName] = useState(null);
  const contact = lookupAddress(address);
  useEffect(() => {
    if (!contact) {
      // If address is not saved in address book, look up its name
      callApi('names/lookup/address', { address })
        .then(({ name }) => setName(name))
        .catch((err) => {
          console.error('lookup address', err);
        });
    } else if (name) {
      // If address is in address book, display contact name so reset name state to null
      setName(null);
      // If name is already null, no need to do anything
    }
  }, [address]);

  if (contact) {
    return (
      <span>
        <Icon icon={contactIcon} className="mr0_4" />
        <span className="v-align">
          {contact.name}
          {contact.label ? ` - ${contact.label}` : ''}
        </span>
      </span>
    );
  } else {
    return name;
  }
}

export default function RecipientAddress({
  nameOrAddress,
  address,
  setAddress,
  error,
}) {
  useEffect(() => {
    if (addressRegex.test(nameOrAddress)) {
      // Treat nameOrAddress as an address
      setAddress(nameOrAddress);
    } else {
      // Treat nameOrAddress as a name
      // Temporarily clear the old address before the name is resolved
      setAddress(null);
      if (nameOrAddress) {
        // Resolve name whenever user stops typing for 0.5s
        resolveName(nameOrAddress, setAddress);
      }
    }
  }, [nameOrAddress]);
  const label = useAddressLabel(address);

  return (
    <div>
      {!!address && (
        <NexusAddress label={<span>Send to {label}</span>} address={address} />
      )}
      {!!error && (
        <div>
          <Icon icon={warningIcon} className="mr0_4" />
          <span className="v-align">{error}</span>
        </div>
      )}
    </div>
  );
}
