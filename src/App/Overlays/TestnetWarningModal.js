import Button from 'components/Button';
import Modal from 'components/Modal';
import { shell } from 'electron';
import { removeModal } from 'lib/ui';

export default function TestnetWarningModal(props) {
  const versionRunning = APP_VERSION.toString();
  return (
    <Modal
      maxWidth={600}
      visible={true}
      removeModal={() => removeModal(props.modalId)}
    >
      {(closeModal) => (
        <>
          <Modal.Header>{__('Testnet Only Mode')}</Modal.Header>
          <Modal.Body>
            <div className="text-center">{versionRunning}</div>

            <div className="mt1 text-center">
              {__(
                `You are currenctly running a Testnet only version of the wallet. `
              )}
            </div>

            <div className="mt1 text-center">
              {__(
                `The core will only connect to nexus-interactions.io:testnet1 `
              )}
            </div>
            <div className="mt1 text-center">
              {__('Thank you for testing our wallet, please ')}
              <Button
                skin="plain-link-primary"
                onClick={() =>
                  shell.openExternal(
                    'https://github.com/Nexusoft/NexusInterface/issues'
                  )
                }
              >
                {__('Click here')}
              </Button>
              {__(' To send feedback to the developers. ')}
              {__('Or join us on the offical ')}
              <Button
                skin="plain-link-primary"
                onClick={() =>
                  shell.openExternal('https://t.me/joinchat/jrfQGVfaNe03MWM8')
                }
              >
                Nexus Testing Telegram group
              </Button>
              {' .'}
            </div>
            <div className="mt3 flex center">
              <Button
                skin="filled-primary"
                style={{ width: '100%' }}
                onClick={closeModal}
              >
                {__('Ok')}
              </Button>
            </div>
          </Modal.Body>
        </>
      )}
    </Modal>
  );
}
