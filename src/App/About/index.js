// External Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { shell } from 'electron';
// Internal Dependencies
import Panel from 'components/Panel';
import Text from 'components/Text';
import styled from '@emotion/styled';

// Images
import nexusLogo from 'images/logo-full.svg';
import updateicon from 'images/unlock.png';

const Column = styled.div({
  flex: '50%',
  display: 'flex',
  flexDirection: 'column',
});

const Row = styled.div({
  display: 'flex',
  flexDirection: 'row',
  textAlign: 'center',
});

const CenterText = styled.div({
  margin: '2em 2em',
  justifyContent: 'center',
  textAlign: 'center',
  ['h2']: {
    textAlign: 'center',
  },
  ['h3']: {
    textAlign: 'center',
  },
});

const Link = styled.u({
  cursor: 'pointer',
  padding: '0.5em',
});

const OpenSourceCredits = [
  {
    Title: 'Electron',
    WebSite: 'electronjs.org',
    URL: 'https://electronjs.org/',
    License: 'MIT License',
  },
  {
    Title: 'React',
    WebSite: 'reactjs.org',
    URL: 'https://reactjs.org/',
    License: 'MIT License',
  },
  {
    Title: 'Redux',
    WebSite: 'redux.js.org',
    URL: 'https://redux.js.org/',
    License: 'MIT License',
  },
  {
    Title: 'Babel',
    WebSite: 'babeljs.io',
    URL: 'https://babeljs.io/',
    License: 'MIT License',
  },
  {
    Title: 'Victory Chart',
    WebSite: 'formidable.com',
    URL: 'https://formidable.com/open-source/victory/',
    License: 'MIT License',
  },
];

const OpenSourceCreditsContainer = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto',
  gridTemplateRows: 'auto',
  gridGap: '1em .5em',
});

const NexusLogoimg = styled.img({
  display: 'inline',
  maxwidth: '100%',
  maxheight: '100%',
  height: 'auto',
  width: 'auto',
});

const BusinessUnits = styled.div({
  marginLeft: 'auto',
  marginRight: 'auto',
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto auto auto',
  gridTemplateRows: 'auto',
  gridGap: '1em .5em',
});

// React-Redux mandatory methods
const mapStateToProps = ({
  core: {
    info: { version },
  },
}) => ({
  version,
});

/**
 * About Page
 *
 * @class About
 * @extends {Component}
 */
@connect(mapStateToProps)
class About extends Component {
  // Class Methods
  /**
   * Get Current Year
   *
   * @returns {number} Current Year
   * @memberof About
   */
  getCurrentYear() {
    let temp = new Date();
    return temp.getFullYear();
  }

  /**
   * Get App Version
   *
   * @returns {string} App version from package.json
   * @memberof About
   */
  getInterfaceVersionNumber() {
    return APP_VERSION;
  }

  /**
   *
   * Gets Version number of the Daemon
   * @returns {String} Damon Version
   * @memberof About
   */
  getDaemonVersionNumber() {
    return this.props.version;
  }

  returnOpenSourceCredits() {
    return OpenSourceCredits.map(e => (
      <CenterText>
        <dt>{e.Title}</dt>
        <div>
          <Link onClick={() => shell.openExternal(e.URL)}>{e.WebSite} </Link>
          {e.License}
        </div>
      </CenterText>
    ));
  }

  // Mandatory React method
  /**
   * Component's Renderable JSX
   *
   * @returns {JSX} JSX
   * @memberof About
   */
  render() {
    return (
      <Panel title={<Text id="About" />}>
        <NexusLogoimg src={nexusLogo} />
        <br />
        <Column>
          <Row>
            <Column>
              <b>Interface Version:</b> {this.getInterfaceVersionNumber()}
              <br />
              <b>Build Date: </b> July 19th 2019 <br />
            </Column>
            <Column>
              <b>Nexus Core Version:</b> {this.getDaemonVersionNumber()} <br />
              <b>Build Date: </b> July 19th 2019 <br />
            </Column>
          </Row>
          <CenterText>
            <b> Copyright {this.getCurrentYear()} </b>{' '}
            {'NEXUS DEVELOPMENT, U.S. LLC.'}
            <br />
          </CenterText>
        </Column>
        <BusinessUnits>
          <CenterText>
            <b>Nexus Embassy USA</b>
            <br />
            Tempe, Arizona, United States Of America
          </CenterText>
          <CenterText>
            <b>Nexus Embassy UK</b>
            <br />
            London, England, United Kingdom
          </CenterText>
          <CenterText>
            <b>Nexus Embassy Australia</b>
            <br />
            Sydney, New South Wales, Australia
          </CenterText>
        </BusinessUnits>

        <CenterText>
          <b>
            THIS IS EXPERIMENTAL SOFTWARE AND THE NEXUS EMBASSY HOLDS NO
            LIABILITY FOR THE USE OF THIS SOFTWARE
          </b>
        </CenterText>
        <CenterText>
          <h3>License Agreement</h3>
          <blockquote>
            Copyright {this.getCurrentYear()} Nexus
            <br />
            Permission is hereby granted, free of charge, to any person
            obtaining a copy of this software and associated documentation files
            (the "Software"), to deal in the Software without restriction,
            including without limitation the rights to use, copy, modify, merge,
            publish, distribute, sublicense, and/or sell copies of the Software,
            and to permit persons to whom the Software is furnished to do so,
            subject to the following conditions:
            <br />
            The above copyright notice and this permission notice shall be
            included in all copies or substantial portions of the Software.
            <br />
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
            NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
            BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
            ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
            CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
            SOFTWARE.
          </blockquote>
          <br />
        </CenterText>

        <CenterText>
          <h2>Open Source Credits</h2>

          <OpenSourceCreditsContainer>
            {this.returnOpenSourceCredits()}
            <dt>MaxMind</dt>
            <dd>
              Copyright &copy; 2018 MaxMind, Inc. This work is licensed under
              the Creative Commons Attribution-ShareAlike 4.0 International
              License. To view a copy of this license, visit{' '}
              <Link
                onClick={() =>
                  shell.openExternal(
                    'http://creativecommons.org/licenses/by-sa/4.0/'
                  )
                }
              >
                {' '}
                creativecommons.org
              </Link>
              . This database incorporates
              <Link
                onClick={() => shell.openExternal('http://www.geonames.org')}
              >
                GeoNames
              </Link>
              geographical data, which is made available under the Creative
              Commons Attribution 3.0 License. To view a copy of this license,
              visit
              <Link
                onClick={() =>
                  shell.openExternal(
                    'http://www.creativecommons.org/licenses/by/3.0/us/'
                  )
                }
              >
                creativecommons.org
              </Link>
              .
            </dd>
          </OpenSourceCreditsContainer>
        </CenterText>
      </Panel>
    );
  }
}

// Mandatory React-Redux method
export default About;
