import { useState, useEffect, useRef } from 'react';

import ControlledModal from 'components/ControlledModal';
import Table from 'components/Table';
import WaitingMessage from 'components/WaitingMessage';
import Tooltip from 'components/Tooltip';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import { Asset, AssetHistoryEvent, callAPI } from 'lib/api';
import { handleError } from 'lib/form';

import AssetHistoryDetailsModal from './AssetHistoryDetailsModal';
import { ColumnDef } from '@tanstack/react-table';

__ = __context('AssetHistory');

const timeFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

export const tableColumns: ColumnDef<AssetHistoryEvent>[] = [
  {
    id: 'modified',
    header: __('Time'),
    accessorKey: 'modified',
    cell: ({ getValue }) => {
      const value = getValue<number>();
      return value ? formatDateTime(value * 1000, timeFormatOptions) : '';
    },
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
      const value = getValue() ? String(getValue()) : undefined;
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
      const value = getValue() ? String(getValue()) : undefined;
      return (
        <Tooltip.Trigger tooltip={value} align="start">
          <span>{value}</span>
        </Tooltip.Trigger>
      );
    },
    size: 200,
  },
];

export default function AssetHistoryModal({ asset }: { asset: Asset }) {
  const [events, setEvents] = useState<AssetHistoryEvent[] | null>(null);
  const closeModalRef = useRef(() => {});
  useEffect(() => {
    (async () => {
      try {
        const events = await callAPI('assets/history/asset', {
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
      style={{ width: '80%' }}
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
            columns={tableColumns}
            // defaultPageSize={10}
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
