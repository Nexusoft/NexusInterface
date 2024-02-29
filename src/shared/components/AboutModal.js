import { useSelector } from 'react-redux';

import ControlledModal from 'components/ControlledModal';
import Icon from 'components/Icon';
import InfoField from 'components/InfoField';
import ExternalLink from 'components/ExternalLink';
import styled from '@emotion/styled';
import nexusLogo from 'icons/logo-full.svg';

__ = __context('About');

const Section = styled.div({
  margin: '2em 2em',
  textAlign: 'center',
});

const openSourceCredits = [
  {
    Title: 'Electron',
    website: 'electronjs.org',
    URL: 'https://electronjs.org/',
    license: 'MIT License',
  },
  {
    Title: 'React',
    website: 'reactjs.org',
    URL: 'https://reactjs.org/',
    license: 'MIT License',
  },
  {
    Title: 'Redux',
    website: 'redux.js.org',
    URL: 'https://redux.js.org/',
    license: 'MIT License',
  },
  {
    Title: 'Babel',
    website: 'babeljs.io',
    URL: 'https://babeljs.io/',
    license: 'MIT License',
  },
  {
    Title: 'Victory Chart',
    website: 'formidable.com',
    URL: 'https://formidable.com/open-source/victory/',
    license: 'MIT License',
  },
];

const OpenSourceCreditsContainer = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto',
  gridTemplateRows: 'auto',
  gridGap: '1em 1em',
  textAlign: 'center',
});

const NexusLogo = styled(Icon)(({ theme }) => ({
  height: 80,
  width: 'auto',
  display: 'inline-block',
  color: theme.primary,
}));

const BusinessUnits = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto auto auto',
  gridTemplateRows: 'auto',
  gridGap: '1em',
  textAlign: 'center',
});

const Strong = styled.strong(({ theme }) => ({
  color: theme.mixer(0.875),
  fontWeight: 'bold',
}));

const AgreementContent = styled.p({
  marginLeft: 20,
  marginRight: 20,
  textAlign: 'justify',
});

export default function About() {
  const version = useSelector(
    ({ core: { systemInfo } }) => systemInfo?.version
  );
  const testnet = useSelector(
    ({ core: { systemInfo } }) => systemInfo?.testnet
  );
  const privateBlockchain = useSelector(
    ({ core: { systemInfo } }) => systemInfo?.private
  );
  return (
    <ControlledModal>
      <ControlledModal.Header>
        <NexusLogo icon={nexusLogo} />
      </ControlledModal.Header>
      <ControlledModal.Body>
        <div>
          <InfoField ratio={[1, 1]} label={__('Wallet version')}>
            {APP_VERSION}
          </InfoField>
          <InfoField ratio={[1, 1]} label={__('Wallet build date')}>
            {BUILD_DATE}
          </InfoField>
          <InfoField ratio={[1, 1]} label={__('Nexus Core version')}>
            {version}
          </InfoField>
          <InfoField ratio={[1, 1]} label={__('Core build date')}>
            February 28th 2024
          </InfoField>
          {!!testnet && (
            <InfoField ratio={[1, 1]} label={__('Testnet')}>
              {testnet}
            </InfoField>
          )}
          {!!privateBlockchain && (
            <InfoField ratio={[1, 1]} label={__('Private blockchain')}>
              {String(privateBlockchain)}
            </InfoField>
          )}
        </div>

        <Section>
          <Strong> Copyright {new Date().getFullYear()}</Strong>{' '}
          {'NEXUS DEVELOPMENT, U.S. LLC.'}
          <br />
          <ExternalLink href={'https://nexus.io/'}>Nexus.io</ExternalLink>
        </Section>

        <BusinessUnits>
          <div>
            <Strong>
              <ExternalLink href={'https://crypto.nexus.io/embassies'}>
                Nexus Embassy USA
              </ExternalLink>
            </Strong>
            <br />
            Tempe, Arizona, United States Of America
          </div>
        </BusinessUnits>

        <Section>
          <Strong>
            THIS IS EXPERIMENTAL SOFTWARE AND THE NEXUS EMBASSY HOLDS NO
            LIABILITY FOR THE USE OF THIS SOFTWARE
          </Strong>
        </Section>

        <Section>
          <h3>
            <Strong>License Agreement</Strong>
          </h3>
          <div>
            <div className="text-center">
              Copyright {new Date().getFullYear()} Nexus
            </div>
            <AgreementContent>
              Permission is hereby granted, free of charge, to any person
              obtaining a copy of this software and associated documentation
              files (the "Software"), to deal in the Software without
              restriction, including without limitation the rights to use, copy,
              modify, merge, publish, distribute, sublicense, and/or sell copies
              of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </AgreementContent>
            <AgreementContent>
              The above copyright notice and this permission notice shall be
              included in all copies or substantial portions of the Software.
            </AgreementContent>
            <AgreementContent>
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
              NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
              HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
              WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
              OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
              DEALINGS IN THE SOFTWARE.
            </AgreementContent>
          </div>
          <br />
        </Section>

        <Section>
          <h2>
            <Strong>Open Source Credits</Strong>
          </h2>

          <OpenSourceCreditsContainer>
            {openSourceCredits.map((e, i) => (
              <div key={i}>
                <dt>{e.Title}</dt>
                <div>
                  <ExternalLink href={e.URL}>{e.website}</ExternalLink> &middot;{' '}
                  {e.license}
                </div>
              </div>
            ))}

            <div className="mt1">
              <dt>MaxMind</dt>
              <dd>
                Copyright &copy; 2018 MaxMind, Inc. This work is licensed under
                the Creative Commons Attribution-ShareAlike 4.0 International
                License. To view a copy of this license, visit&nbsp;
                <ExternalLink href="http://creativecommons.org/licenses/by-sa/4.0/">
                  creativecommons.org
                </ExternalLink>
                . This database incorporates&nbsp;
                <ExternalLink href="http://www.geonames.org">
                  GeoNames
                </ExternalLink>
                &nbsp;geographical data, which is made available under the
                Creative Commons Attribution 3.0 License. To view a copy of this
                license, visit&nbsp;
                <ExternalLink href="http://www.creativecommons.org/licenses/by/3.0/us/">
                  creativecommons.org
                </ExternalLink>
                .
              </dd>
            </div>
          </OpenSourceCreditsContainer>
        </Section>

        <Section>
          <div>Icons made by</div>
          <div>
            <ExternalLink
              title="Freepik"
              href="https://www.flaticon.com/authors/freepik"
            >
              Freepik
            </ExternalLink>
            ,&nbsp;
            <ExternalLink
              title="Gregor Cresnar"
              href="https://www.flaticon.com/authors/gregor-cresnar"
            >
              Gregor Cresnar
            </ExternalLink>
            ,&nbsp;
            <ExternalLink
              title="Google"
              href="https://www.flaticon.com/authors/google"
            >
              Google
            </ExternalLink>
            ,&nbsp;
            <ExternalLink
              title="Dave Gandy"
              href="https://www.flaticon.com/authors/dave-gandy"
            >
              Dave Gandy
            </ExternalLink>
            ,&nbsp;
            <ExternalLink
              title="Pixel perfect"
              href="https://www.flaticon.com/authors/pixel-perfect"
            >
              Pixel perfect
            </ExternalLink>
            ,&nbsp;
            <ExternalLink
              title="Kirill Kazachek"
              href="https://www.flaticon.com/authors/kirill-kazachek"
            >
              Kirill Kazachek
            </ExternalLink>
            ,&nbsp;
            <ExternalLink
              title="srip"
              href="https://www.flaticon.com/authors/srip"
            >
              srip
            </ExternalLink>
            ,&nbsp;
            <ExternalLink
              title="Kiranshastry"
              href="https://www.flaticon.com/authors/kiranshastry"
            >
              Kiranshastry
            </ExternalLink>
            ,&nbsp;
            <ExternalLink
              title="Smashicons"
              href="https://www.flaticon.com/authors/smashicons"
            >
              Smashicons
            </ExternalLink>
            ,&nbsp;
          </div>
          <div>
            from{' '}
            <ExternalLink href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </ExternalLink>
          </div>
        </Section>
      </ControlledModal.Body>
    </ControlledModal>
  );
}
