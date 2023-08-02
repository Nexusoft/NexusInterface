import { useState, useEffect, useRef } from 'react';

import ControlledModal from 'components/ControlledModal';
import Table from 'components/Table';
import WaitingMessage from 'components/WaitingMessage';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import { callApi } from 'lib/tritiumApi';
import { handleError } from 'utils/form';

import AssetHistoryDetailsModal from './AssetHistoryDetailsModal';

__ = __context('AssetHistory');

const timeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export const columns = [
  {
    id: 'time',
    header: __('Time'),
    accessorKey: 'modified',
    cell: ({ row }) =>
      row.getValue()
        ? formatDateTime(row.getValue() * 1000, timeFormatOptions)
        : '',
    size: 210,
  },
  {
    id: 'type',
    header: __('Type'),
    accessorKey: 'type',
    size: 100,
  },
  {
    id: 'owner',
    header: __('Owner'),
    accessorKey: 'owner',
    size: 100,
  },
];

export default function AssetHistoryModal({ asset }) {
  const [events, setEvents] = useState(null);
  const closeModalRef = useRef();
  useEffect(() => {
    (async () => {
      try {
        const events = await callApi('assets/history/asset', {
          address: asset.address,
        });
        setEvents(events.reverse());
      } catch (err) {
        handleError(err);
        closeModalRef.current?.();
      }
    })();
  }, []);

  return (
    <ControlledModal
      assignClose={(closeModal) => {
        closeModalRef.current = closeModal;
      }}
    >
      <ControlledModal.Header className="relative">
        {__('Asset History')}
      </ControlledModal.Header>

      <ControlledModal.Body>
        {!events ? (
          <WaitingMessage>
            {__('Loading asset history')}
            ...
          </WaitingMessage>
        ) : (
          <Table
            data={events}
            columns={columns}
            defaultPageSize={10}
            onRowClick={(row) => {
              const event = row?.original;
              openModal(AssetHistoryDetailsModal, {
                event,
              });
            }}
          />
        )}
      </ControlledModal.Body>
    </ControlledModal>
  );
}
