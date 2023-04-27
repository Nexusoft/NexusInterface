import ControlledModal from 'components/ControlledModal';
import InfoField from 'components/InfoField';
import { formatDateTime } from 'lib/intl';

__ = __context('AssetHistoryDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export default function AssetHistoryDetailsModal({
  event: { type, owner, modified, address, checksum, name, ...data },
}) {
  return (
    <ControlledModal>
      <ControlledModal.Header className="relative">
        {__('Asset History Event')}
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
        <InfoField label={__('Address')}>{address}</InfoField>

        {Object.entries(data).map(([key, value]) => (
          <InfoField key={key} label={key}>
            {value}
          </InfoField>
        ))}
      </ControlledModal.Body>
    </ControlledModal>
  );
}
