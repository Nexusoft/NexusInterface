import { useEffect } from 'react';

import NexusAddress from 'components/NexusAddress';

import { addressRegex } from 'consts/misc';
import { debounced } from 'utils/universal';

const resolveName = debounced(async (name, callback) => {
  try {
    const { address } = await callApi('names/get/name', { name });
    callback(address);
  } catch (err) {
    callback(null);
  }
}, 500);

export default function RecipientAddress({
  nameOrAddress,
  address,
  setAddress,
}) {
  useEffect(() => {
    if (!nameOrAddress) return;
    if (addressRegex.test(nameOrAddress)) {
      // Treat nameOrAddress as an address
      setAddress(address);
    } else {
      // Treat nameOrAddress as a name
      // Temporarily clear the old address before the name is resolved
      setAddress(null);
      // Resolve name whenever user stops typing for 0.5s
      resolveName(nameOrAddress, setAddress);
    }
  }, [nameOrAddress]);

  return !!address && <NexusAddress address={address} />;
}
