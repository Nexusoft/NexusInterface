// External
import styled from '@emotion/styled';
import { useSelector } from 'react-redux';

// Internal
import ControlledModal from 'components/ControlledModal';
import Icon from 'components/Icon';
import Button from 'components/Button';
import Tooltip from 'components/Tooltip';
import InfoField from 'components/InfoField';
import ExternalLink from 'components/ExternalLink';
import SimpleProgressBar from 'components/SimpleProgressBar';
import { downloadAndInstall, abortModuleDownload } from 'lib/modules';

import linkIcon from 'icons/link.svg';
import closeIcon from 'icons/x-circle.svg';
import downloadIcon from 'icons/download.svg';

__ = __context('ModuleDetails');

/**
 * Module details modal, for viewing details of both installed modules
 * and modules being installed
 *
 * @class ModuleDetailsModal
 * @extends {React.Component}
 */
export default function FeaturedModuleDetailsModal({
  featuredModule,
  ...rest
}) {
  const { host, owner, repo } = featuredModule.repoInfo || {};
  const repoUrl = featuredModule.repoInfo
    ? `https://${host}/${owner}/${repo}`
    : null;

  return (
    <ControlledModal {...rest}>
      <ControlledModal.Header className="relative">
        {__('Module Details')}
      </ControlledModal.Header>
      <ControlledModal.Body>
        <InfoField ratio={[1, 2]} label={__('Module name')}>
          {featuredModule.name}
        </InfoField>
        <InfoField ratio={[1, 2]} label={__('Display name')}>
          {featuredModule.displayName}
        </InfoField>
        <InfoField ratio={[1, 2]} label={__('Module type')}>
          {featuredModule.type}
        </InfoField>

        <InfoField ratio={[1, 2]} label={__('Description')}>
          {featuredModule.description || <span className="dim">N/A</span>}
        </InfoField>
        <InfoField ratio={[1, 2]} label={__('Author')}>
          {featuredModule.author ? (
            <div>
              <span>{featuredModule.author.name}</span>
              {!!featuredModule.author.email && (
                <span className="ml0_4">
                  -
                  <ExternalLink
                    className="ml0_4"
                    href={`mailto:${featuredModule.author.email}`}
                  >
                    {featuredModule.author.email}
                  </ExternalLink>
                </span>
              )}
            </div>
          ) : (
            <span className="dim">N/A</span>
          )}
        </InfoField>
        <InfoField ratio={[1, 2]} label={__('Source code')}>
          <div>
            <Tooltip.Trigger tooltip={repoUrl}>
              <ExternalLink href={repoUrl}>
                <span className="v-align">{__('Visit repository')}</span>
                <Icon icon={linkIcon} className="ml0_4" />
              </ExternalLink>
            </Tooltip.Trigger>
          </div>
        </InfoField>
      </ControlledModal.Body>

      <Installer featuredModule={featuredModule} />
    </ControlledModal>
  );
}

/**
 * Module Installer
 * =============================================================================
 */

const DownloadingSection = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '.5em 0',
});

/**
 * Install section at the bottom of Module Details modal
 *
 * @class Installer
 * @extends {React.Component}
 */
function Installer({ featuredModule }) {
  const downloadProgress = useSelector((state) => {
    const { downloaded, totalSize } =
      state.moduleDownloads[featuredModule.name] || {};
    return downloaded / totalSize;
  });
  const downloadRequest = useSelector(
    (state) => state.moduleDownloads[featuredModule.name]?.downloadRequest
  );
  // `downloading` -> when the module package is being downloaded
  // `busy` -> when the module package is being downloaded OR is in other preparation steps
  const downloading = !!downloadRequest;
  const busy = useSelector(
    (state) => !!state.moduleDownloads[featuredModule.name]
  );

  const doInstall = () => {
    downloadAndInstall({
      moduleName: featuredModule.name,
      owner: featuredModule.repoInfo.owner,
      repo: featuredModule.repoInfo.repo,
      releaseId: 'latest',
    });
  };

  return (
    <ControlledModal.Footer separator style={{ textAlign: 'center' }}>
      {downloading ? (
        <DownloadingSection>
          <SimpleProgressBar
            label={
              <>
                <Tooltip.Trigger tooltip={__('Cancel download')}>
                  <Button
                    square
                    skin="plain-danger"
                    className="mr0_4"
                    onClick={abortModuleDownload}
                  >
                    <Icon icon={closeIcon} />
                  </Button>
                </Tooltip.Trigger>
                <span style={{ whiteSpace: 'nowrap' }}>
                  {__('Downloading %{percentage}%...', {
                    percentage: Math.round(downloadProgress * 100),
                  })}
                </span>
              </>
            }
            progress={downloadProgress}
            width={250}
          />
        </DownloadingSection>
      ) : (
        <Button
          skin="primary"
          wide
          className="mt1"
          disabled={busy}
          onClick={doInstall}
        >
          <Icon icon={downloadIcon} className="mr0_4" />
          <span className="v-align">{__('Install')}</span>
        </Button>
      )}
    </ControlledModal.Footer>
  );
}
