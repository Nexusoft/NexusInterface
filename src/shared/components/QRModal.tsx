import { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import QRCode from 'qrcode';
import { useTheme } from '@emotion/react';

import ControlledModal from 'components/ControlledModal';
import { ControlledModalProps } from 'components/ControlledModal';
import NexusAddress from 'components/NexusAddress';

const size = 322;

const QRWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export interface QRModalProps extends ControlledModalProps {
  address: string;
}

export default function QRModal({ address, ...rest }: QRModalProps) {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    QRCode.toCanvas(canvasRef.current, address, {
      width: size,
      color: { dark: theme.background, light: theme.foreground },
      margin: 1,
    });
  }, []);
  return (
    <ControlledModal maxWidth={500} {...rest}>
      <ControlledModal.Body>
        <QRWrapper>
          <canvas ref={canvasRef} width={size} />
          <NexusAddress address={address} className="mt1" />
        </QRWrapper>
      </ControlledModal.Body>
    </ControlledModal>
  );
}
