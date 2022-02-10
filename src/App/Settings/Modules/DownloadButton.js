// External
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';

// Internal
import Tooltip from 'components/Tooltip';
import Icon from 'components/Icon';
import Button from 'components/Button';
import { timing } from 'styles';
import downloadIcon from 'icons/download.svg';
import { download } from 'lib/modules/installModule';

const ProgressBar = styled.div(({ percentage, theme }) => ({
  height: 20,
  borderRadius: 10,
  border: `1px solid ${theme.mixer(0.5)}`,
  overflow: 'hidden',
  animation:
    percentage >= 100
      ? `pulse 1.25s infinite cubic-bezier(0.66, 0, 0, 1)`
      : null,
  '&::before': {
    content: '""',
    display: 'block',
    background: theme.primary,
    height: '100%',
    width: '100%',
    transformOrigin: 'left center',
    transform: `scaleX(${percentage / 100})`,
    transition: `transform ${timing.normal}`,
  },
}));

export default function DownloadButton({ module, ...rest }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    if (downloading && downloadProgress >= 100) return;
    const timerId =
      downloading &&
      setInterval(() => setDownloadProgress(downloadProgress + 1), 50);
    return () => clearInterval(timerId);
  });
  return (
    <div>
      {downloading ? (
        <>
          {downloadProgress}
          <ProgressBar percentage={downloadProgress} />
        </>
      ) : (
        <Tooltip.Trigger tooltip={'Download'}>
          <Button
            style={{ height: '2em' }}
            onClick={() => {
              if (downloading === false) {
                setDownloading(true);
                setTimeout(() => {
                  download({ owner: 'Nexusoft', repo: module.repository.repo });
                }, 500);
              }
            }}
          >
            <Icon icon={downloadIcon} />
          </Button>
        </Tooltip.Trigger>
      )}
    </div>
  );
}
