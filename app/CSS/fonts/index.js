import { css } from '@emotion/core';
import NotoSansRegular from './NotoSans.woff2';
import NotoSansBold from './NotoSans-Bold.woff2';
import RobotoMonoRegular from './RobotoMono-Regular.woff2';

export default css`
  @font-face {
    font-family: "Noto Sans";
    src: url("${NotoSansRegular}") format("woff2");
    font-weight: normal;
    font-style: normal;
  }
  
  @font-face {
    font-family: "Noto Sans";
    src: url("${NotoSansBold}") format("woff2");
    font-weight: bold;
    font-style: normal;
  }

  @font-face {
    font-family: "Roboto Mono";
    src: url("${RobotoMonoRegular}") format("woff2");
    font-weight: normal;
    font-style: normal;
  }
`;
