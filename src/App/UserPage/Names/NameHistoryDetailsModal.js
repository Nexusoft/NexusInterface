import ControlledModal from 'components/ControlledModal';
import InfoField from 'components/InfoField';
import QRButton from 'components/QRButton';
import { formatDateTime } from 'lib/intl';

__ = __context('NameHistoryDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export default function NameHistoryDetailsModal({
  event: {
    type,
    owner,
    modified,
    address,
    register,
    checksum,
    name,
    namespace,
  },
}) {
  return (
    <ControlledModal>
      <ControlledModal.Header className="relative">
        {__('Name History Event')}
      </ControlledModal.Header>

      <ControlledModal.Body>
        <InfoField label={__('Type')}>{type}</InfoField>
        <InfoField label={__('Time')}>
          {formatDateTime(modified * 1000, timeFormatOptions)}
        </InfoField>
        <InfoField label={__('Owner')}>{owner}</InfoField>
        <InfoField label={__('Checksum')}>{checksum}</InfoField>
        <InfoField label={__('Name')}>
          {name || <span className="dim">N/A</span>}
        </InfoField>
        <InfoField label={__('Namespace')}>
          {namespace || <span className="dim">N/A</span>}
        </InfoField>
        <InfoField label={__('Address')}>
          <span className="v-align">{address}</span>
          <QRButton className="ml0_4" address={address} />
        </InfoField>
        <InfoField label={__('Points to')}>
          <span className="v-align">{register}</span>
          <QRButton className="ml0_4" address={register} />
        </InfoField>
      </ControlledModal.Body>
    </ControlledModal>
  );
}
