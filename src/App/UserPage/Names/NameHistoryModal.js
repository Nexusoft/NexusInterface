import { useState, useEffect, useRef } from 'react';

import ControlledModal from 'components/ControlledModal';
import Table from 'components/Table';
import WaitingMessage from 'components/WaitingMessage';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import { callApi } from 'lib/tritiumApi';
import { handleError } from 'utils/form';

import NameHistoryDetailsModal from './NameHistoryDetailsModal';

__ = __context('NameHistory');

const timeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export const tableColumns = [
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

export default function NameHistoryModal({ nameRecord }) {
  const [events, setEvents] = useState(null);
  const closeModalRef = useRef();
  useEffect(() => {
    (async () => {
      try {
        const events = await callApi('names/history/name', {
          address: nameRecord.address,
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
      assignClose={(close) => {
        closeModalRef.current = close;
      }}
    >
      <ControlledModal.Header className="relative">
        {__('Name History')}
      </ControlledModal.Header>

      <ControlledModal.Body>
        {!events ? (
          <WaitingMessage>
            {__('Loading name history')}
            ...
          </WaitingMessage>
        ) : (
          <Table
            data={events}
            columns={tableColumns}
            defaultPageSize={10}
            onRowClick={(row) => {
              const event = row?.original;
              openModal(NameHistoryDetailsModal, {
                event,
              });
            }}
          />
        )}
      </ControlledModal.Body>
    </ControlledModal>
  );
}
