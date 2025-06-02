import Tooltip from 'components/Tooltip';
import NexusAddress from 'components/NexusAddress';
import { HTMLAttributes } from 'react';

interface ContainsToken {
  token?: string;
  ticker?: string;
}

const getToken = ({
  token,
  account,
  contract,
}: {
  token?: ContainsToken;
  account?: ContainsToken;
  contract?: ContainsToken;
}) => {
  const obj = token || account || contract;
  return {
    name: obj?.ticker, //token_name might be depercated
    address: obj?.token,
  };
};

const trimAddress = (address?: string) =>
  address ? address.substring(0, 3) + '…' : '';

export default function TokenName({
  token,
  account,
  contract,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & {
  token?: ContainsToken;
  account?: ContainsToken;
  contract?: ContainsToken;
}) {
  const { name, address } = getToken({ token, account, contract });

  const tokenLabel = name ? (
    __('<token_name></token_name> token', undefined, {
      token_name: () => <strong>{name}</strong>,
    })
  ) : (
    <em>
      <strong>{__('Unnamed token')}</strong>
    </em>
  );

  const tooltip = address && (
    <NexusAddress address={address} label={tokenLabel} />
  );

  const tokenName = name ? (
    <span {...rest}>{name}</span>
  ) : (
    <span className="dim" {...rest}>
      {trimAddress(address)}
    </span>
  );

  return address === '0' ? (
    tokenName
  ) : (
    <Tooltip.Trigger maxWidth={400} tooltip={tooltip}>
      {tokenName}
    </Tooltip.Trigger>
  );
}

TokenName.from = ({
  token,
  account,
  contract,
}: {
  token?: ContainsToken;
  account?: ContainsToken;
  contract?: ContainsToken;
}) => {
  const { name, address } = getToken({ token, account, contract });
  return name || trimAddress(address);
};
