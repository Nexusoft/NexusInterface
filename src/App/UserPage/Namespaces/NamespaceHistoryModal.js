import React from 'react';

import Modal from 'components/Modal';
import Table from 'components/Table';
import WaitingMessage from 'components/WaitingMessage';
import { formatDateTime } from 'lib/intl';
import { openModal } from 'lib/ui';
import { apiPost } from 'lib/tritiumApi';
import { handleError } from 'utils/form';

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
    id: 'time',
    Header: __('Time'),
    accessor: 'modified',
    Cell: cell => formatDateTime(cell.value * 1000, timeFormatOptions),
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

export default class NamespaceHistoryModal extends React.Component {
  state = {
    events: null,
  };

  async componentDidMount() {
    const { namespace } = this.props;
    try {
      const events = await apiPost('names/list/namespace/history', {
        address: namespace.address,
      });
      this.setState({ events: events.reverse() });
    } catch (err) {
      handleError(err);
      this.closeModal();
    }
  }

  render() {
    const { events } = this.state;

    return (
      <Modal
        assignClose={close => {
          this.closeModal = close;
        }}
      >
        <Modal.Header className="relative">
          {__('Namespace History')}
        </Modal.Header>

        <Modal.Body>
          {!events ? (
            <WaitingMessage>
              {__('Loading namespace history')}
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
                    openModal(NamespaceHistoryDetailsModal, {
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
        </Modal.Body>
      </Modal>
    );
  }
}
