import React from 'react';
import styled from '@emotion/styled';
import QRCode from 'qrcode';
import { useTheme } from '@emotion/react';

import Modal from 'components/Modal';
import NexusAddress from 'components/NexusAddress';

const width = 322;

const QRWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export default function QRModal({ address }) {
  const theme = useTheme();
  const [dataURL, setDataURL] = React.useState(null);
  React.useEffect(() => {
    QRCode.toDataURL(
      address,
      {
        width,
        color: { dark: theme.background, light: theme.foreground },
        margin: 2,
      },
      (err, url) => {
        if (!err) {
          setDataURL(url);
        }
      }
    );
  }, []);
  return (
    <Modal maxWidth={500}>
      <Modal.Body>
        <QRWrapper>
          {!!dataURL && <img src={dataURL} width={width} />}
          <NexusAddress address={address} />
        </QRWrapper>
      </Modal.Body>
    </Modal>
  );
}
