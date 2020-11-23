import React from 'react';
import styled from '@emotion/styled';
import QRCode from 'qrcode';
import { useTheme } from '@emotion/react';

import Modal from 'components/Modal';
import NexusAddress from 'components/NexusAddress';

const size = 322;

const QRWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export default function QRModal({ address }) {
  const theme = useTheme();
  const canvasRef = React.useRef();
  React.useEffect(() => {
    QRCode.toCanvas(canvasRef.current, address, {
      width: size,
      color: { dark: theme.background, light: theme.foreground },
      margin: 1,
    });
  }, []);
  return (
    <Modal maxWidth={500}>
      <Modal.Body>
        <QRWrapper>
          <canvas ref={canvasRef} width={size} />
          <NexusAddress address={address} />
        </QRWrapper>
      </Modal.Body>
    </Modal>
  );
}
