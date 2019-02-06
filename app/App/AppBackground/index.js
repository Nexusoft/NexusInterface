// External
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { existsSync } from 'fs';
import styled from '@emotion/styled';

// Internal
import StarrySky from './StarrySky';
import CosmicLight from './Light';

const mapStateToProps = state => ({
  wallpaper: state.theme.wallpaper,
  defaultStyle: state.theme.defaultStyle,
});

const CustomWallpaper = styled.div(
  {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  },
  ({ wallpaper }) =>
    !!wallpaper && {
      backgroundImage: `url("${wallpaper}")`,
    }
);

/**
 * Controls the background of the app
 *
 * @class AppBackground
 * @extends {Component}
 */
class AppBackground extends Component {
  render() {
    const { wallpaper, defaultStyle } = this.props;
    return !!wallpaper && existsSync(wallpaper) ? (
      <CustomWallpaper wallpaper={wallpaper} />
    ) : (
      defaultStyle.startsWith('Dark') ? <StarrySky /> : <CosmicLight />
    );
  }
}

export default connect(mapStateToProps)(AppBackground);
