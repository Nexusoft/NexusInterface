import Button from 'components/Button';
import Modal from 'components/Modal';
import { alphaRelease } from 'consts/misc';

const PreReleaseWarningModal = () => {
  console.log(this);

  const versionRunning = APP_VERSION.toString();
  const releaseType = alphaRelease ? 'Alpha' : 'Beta';
  return (
    <Modal maxWidth={600}>
      {(closeModal) => (
        <>
          <Modal.Header>{__('Pre-Release Active')}</Modal.Header>
          <Modal.Body>
            <div className="text-center">{versionRunning}</div>

            <div className="mt1">
              {__(
                `You are currenctly running a ${releaseType} version of the wallet. `
              )}
            </div>
            <div className="mt2">
              {__('Thank you for testing our wallet, please ')}
              <Button skin="plain-link-primary">{__('Click here')}</Button>
              {__(' To send feedback to the devs.')}
              {__('Or join us on the offical ')}
              <Button skin="plain-link-primary">
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
};

export default PreReleaseWarningModal;
