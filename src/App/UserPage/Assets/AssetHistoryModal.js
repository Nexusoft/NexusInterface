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

export const tableColumns = [
  {
    id: 'time',
    Header: __('Time'),
    accessor: 'modified',
    Cell: (cell) => formatDateTime(cell.value * 1000, timeFormatOptions),
    width: 210,
  },
  {
    id: 'type',
    Header: __('Type'),
    accessor: 'type',
    width: 100,
  },
  {
    id: 'owner',
    Header: __('Owner'),
    accessor: 'owner',
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
            columns={tableColumns}
            data={events}
            defaultPageSize={events.length < 10 ? events.length : 10}
            getTrProps={(state, row) => {
              const event = row && row.original;
              return {
                onClick: () => {
                  openModal(AssetHistoryDetailsModal, {
                    event,
                  });
                },
                style: {
                  cursor: 'pointer',
                  fontSize: 15,
                },
              };
            }}
          />
        )}
      </ControlledModal.Body>
    </ControlledModal>
  );
}
