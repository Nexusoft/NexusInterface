import { modalSurface } from 'utils/modalStyles';
// External
import { createRef, Component } from 'react';
import styled from '@emotion/styled';

// Internal
import ControlledModal from 'components/ControlledModal';
import * as color from 'utils/color';
import Dialog from './Dialog';
import themeStyles from 'utils/themeStyles';
import { withTheme } from '@emotion/react';

__ = __context('ErrorDialog');

const ErrorSurface = styled(Dialog)(({ theme }) => ({
  width: 'calc(100% - 32px)',
  maxWidth: 500,
  maxHeight: 'calc(100% - 32px)',
  ...modalSurface(theme),
  border: `1px solid ${color.fade(theme.danger, 0.65)}`,
  '&&:focus-visible': { outline: 'none' },
}));

const ErrorBody = styled(ControlledModal.Body)({
  margin: 0,
  padding: 24,
  '@media (max-width: 480px)': { padding: 16 },
});

const XMark = styled(Dialog.Icon)(themeStyles([({
  theme
}) => ({
  fontSize: 56,
  color: theme.danger,
  borderWidth: 3,
  filter: `drop-shadow(0 0 5px ${color.fade(theme.danger, 0.5)})`
})], [({
  theme
}) => ({
  width: 52,
  height: 52,
  borderRadius: 16,
  fontSize: 28,
  color: theme.danger,
  borderWidth: 1,
  borderColor: color.fade(theme.danger, 0.55),
  background: color.fade(theme.danger, 0.9)
})]));

const Message = styled(Dialog.Message)({
  fontSize: 20,
  fontWeight: 500,
  lineHeight: 1.35,
  letterSpacing: '-0.4px',
  overflowWrap: 'anywhere',
});

const ErrorDetails = styled(Dialog.Note)(({ theme }) => ({
  marginTop: 18,
  padding: '12px 16px',
  borderRadius: 10,
  border: `1px solid ${color.fade(theme.foreground, 0.9)}`,
  background: color.fade(theme.foreground, 0.97),
  color: theme.mixer(0.75),
  fontSize: 13,
  lineHeight: 1.6,
  overflowWrap: 'anywhere',
}));

const DismissButton = styled(Dialog.Button)({
  width: 'calc(100% - 48px)',
  margin: '0 24px 24px',
  minHeight: 44,
  height: 'auto',
  padding: '10px 16px',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
  '@media (max-width: 480px)': { width: 'calc(100% - 32px)', margin: '0 16px 16px' },
});

class ErrorDialog extends Component {
  buttonRef = createRef();

  componentDidMount() {
    if (this.buttonRef.current) {
      this.buttonRef.current.focus();
    }
  }

  render() {
    const { message, note, ...rest } = this.props;
    return (
      this.props.theme.modern ? (<ErrorSurface
        assignClose={(closeModal) => {
          this.closeModal = closeModal;
        }}
        {...rest}
        maxWidth={500}
      >
        <ErrorBody>
          <XMark>✕</XMark>
          <Message>{message}</Message>
          {!!note && <ErrorDetails>{note}</ErrorDetails>}
        </ErrorBody>
        <DismissButton
          ref={this.buttonRef}
          skin="filled-danger"
          onClick={() => this.closeModal()}
        >
          {__('Dismiss')}
        </DismissButton>
      </ErrorSurface>) : (<Dialog
        assignClose={(closeModal) => {
          this.closeModal = closeModal;
        }}
        {...rest}
      >
        <ControlledModal.Body>
          <XMark>✕</XMark>
          <Dialog.Message>{message}</Dialog.Message>
          {!!note && <Dialog.Note>{note}</Dialog.Note>}
        </ControlledModal.Body>
        <Dialog.Button
          ref={this.buttonRef}
          skin="filled-danger"
          onClick={() => this.closeModal()}
        >
          {__('Dismiss')}
        </Dialog.Button>
      </Dialog>)
    );
  }
}

export default withTheme(ErrorDialog);
