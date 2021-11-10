import Tooltip from 'components/Tooltip';
import NexusAddress from 'components/NexusAddress';

const getToken = ({ token, account, contract }) => {
  const obj = token || account || contract;
  return {
    name: obj?.ticker || obj?.token_name, //token_name might be depercated
    address: obj?.token,
  };
};

const trimAddress = (address) => (address ? address.substring(0, 3) + '…' : '');

export default function TokenName({ token, account, contract, ...rest }) {
  const { name, address } = getToken({ token, account, contract });

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

TokenName.from = ({ token, account, contract }) => {
  const { name, address } = getToken({ token, account, contract });
  return name || trimAddress(address);
};
