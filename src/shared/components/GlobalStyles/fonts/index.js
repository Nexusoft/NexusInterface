/**
 * Important note - This file is imported into module_preload.js, either directly or
 * indirectly, and will be a part of the preload script for modules, therefore:
 * - Be picky with importing stuffs into this file, especially for big
 * files and libraries. The bigger the preload scripts get, the slower the modules
 * will load.
 * - Don't assign anything to `global` variable because it will be passed
 * into modules' execution environment.
 * - Make sure this note also presents in other files which are imported here.
 */

import { css } from '@emotion/react';
import NotoSansRegular from './NotoSans.woff2';
import NotoSansBold from './NotoSans-Bold.woff2';
import RobotoMonoRegular from './RobotoMono-Regular.woff2';

export default css`
  @font-face {
    font-family: 'Noto Sans';
    src: url('${NotoSansRegular}') format('woff2');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'Noto Sans';
    src: url('${NotoSansBold}') format('woff2');
    font-weight: bold;
    font-style: normal;
  }

  @font-face {
    font-family: 'Roboto Mono';
    src: url('${RobotoMonoRegular}') format('woff2');
    font-weight: normal;
    font-style: normal;
  }
`;
