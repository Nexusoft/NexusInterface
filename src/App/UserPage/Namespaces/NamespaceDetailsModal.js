import ControlledModal from 'components/ControlledModal';
import Button from 'components/Button';
import InfoField from 'components/InfoField';
import QRButton from 'components/QRButton';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';

import TransferNamespaceModal from './TransferNamespaceModal';
import NamespaceHistoryModal from './NamespaceHistoryModal';

__ = __context('NamespaceDetails');

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export default function NamespaceDetailsModal({ namespace }) {
  return (
    <ControlledModal>
      {(closeModal) => (
        <>
          <ControlledModal.Header className="relative">
            {__('Namespace Details')}
          </ControlledModal.Header>
          <ControlledModal.Body>
            <InfoField label={__('Name')}>{namespace.namespace}</InfoField>
            <InfoField label={__('Address')}>
              <span className="v-align">{namespace.address}</span>
              <QRButton className="ml0_4" address={namespace.address} />
            </InfoField>
            <InfoField label={__('Created at')}>
              {formatDateTime(namespace.created * 1000, timeFormatOptions)}
            </InfoField>
            <InfoField label={__('Last modified')}>
              {formatDateTime(namespace.modified * 1000, timeFormatOptions)}
            </InfoField>

            <div className="mt2 flex space-between">
              <div />
              <div>
                <Button
                  onClick={() => {
                    closeModal();
                    openModal(NamespaceHistoryModal, { namespace });
                  }}
                >
                  {__('View history')}
                </Button>
                <Button
                  className="ml0_4"
                  onClick={() => {
                    closeModal();
                    openModal(TransferNamespaceModal, { namespace });
                  }}
                >
                  {__('Transfer ownership')}
                </Button>
              </div>
            </div>
          </ControlledModal.Body>
        </>
      )}
    </ControlledModal>
  );
}
