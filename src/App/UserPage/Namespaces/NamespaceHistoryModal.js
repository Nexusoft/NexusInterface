import { useState, useEffect, useRef } from 'react';

import ControlledModal from 'components/ControlledModal';
import Table from 'components/Table';
import WaitingMessage from 'components/WaitingMessage';
import Tooltip from 'components/Tooltip';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import { callAPI } from 'lib/api';
import { handleError } from 'lib/form';

import NamespaceHistoryDetailsModal from './NamespaceHistoryDetailsModal';

__ = __context('NamespaceHistory');

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
    id: 'modified',
    header: __('Time'),
    accessorKey: 'modified',
    cell: ({ getValue }) =>
      getValue() ? formatDateTime(getValue() * 1000, timeFormatOptions) : '',
    size: 200,
  },
  {
    id: 'action',
    header: __('Action'),
    accessorKey: 'action',
    size: 100,
  },
  {
    id: 'register',
    header: __('Register'),
    accessorKey: 'register',
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <Tooltip.Trigger tooltip={value} align="start">
          <span>{value}</span>
        </Tooltip.Trigger>
      );
    },
    size: 200,
  },
  {
    id: 'owner',
    header: __('Owner'),
    accessorKey: 'owner',
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <Tooltip.Trigger tooltip={value} align="start">
          <span>{value}</span>
        </Tooltip.Trigger>
      );
    },
    size: 200,
  },
];

export default function NamespaceHistoryModal() {
  const closeModalRef = useRef();
  const [events, setEvents] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const events = await callAPI('names/history/namespace', {
          address: namespace.address,
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
      style={{ width: '80%' }}
    >
      <ControlledModal.Header className="relative">
        {__('Namespace History')}
      </ControlledModal.Header>

      <ControlledModal.Body>
        {!events ? (
          <WaitingMessage>
            {__('Loading namespace history')}
            ...
          </WaitingMessage>
        ) : (
          <Table
            data={events}
            columns={tableColumns}
            defaultPageSize={10}
            onRowClick={(row) => {
              const event = row?.original;
              openModal(NamespaceHistoryDetailsModal, {
                event,
              });
            }}
          />
        )}
      </ControlledModal.Body>
    </ControlledModal>
  );
}
