import Tooltip from 'components/Tooltip';
import NexusAddress from 'components/NexusAddress';

const getToken = (token, account) =>
  token || { name: account.token_name, address: account.token };

const trimAddress = (address) => (address ? address.substring(0, 3) + '…' : '');

export default function TokenName({ token, account, ...rest }) {
  const { name, address } = getToken(token, account);

  const tokenLabel = name ? (
    __('<token_name></token_name> token', null, {
      token_name: () => <strong>{name}</strong>,
    })
  ) : (
    <em>
      <strong>{__('Unnamed token')}</strong>
    </em>
  );

  const tooltip = <NexusAddress address={address} label={tokenLabel} />;

  const tokenName = name ? (
    <span>{name}</span>
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

TokenName.from = ({ token, account }) => {
  const { name, address } = getToken(token, account);
  return name || trimAddress(address);
};
