// Global variables injected by webpack base config (configs/webpack.config.base.babel.js)
declare const APP_VERSION: string;
declare const BUILD_DATE: string;
declare const BACKWARD_COMPATIBLE_VERSION: string;
declare const APP_ID: string;
declare const NEXUS_EMBASSY_PUBLIC_KEY: string;
declare const LOCK_TESTNET: string;

declare const __: typeof import('lib/intl').translate;
declare const ___: typeof import('lib/intl').translateWithContext;
declare const __context: typeof import('lib/intl').withContext;

// File types that can be imported by webpack loaders
declare module '*.svg' {
  const content: string;
  export default content;
}
declare module '*.ico' {
  const content: string;
  export default content;
}
declare module '*.gif' {
  const content: string;
  export default content;
}
declare module '*.png' {
  const content: string;
  export default content;
}
declare module '*.jpg' {
  const content: string;
  export default content;
}
declare module '*.jpeg' {
  const content: string;
  export default content;
}
declare module '*.webp' {
  const content: string;
  export default content;
}
declare module '*.MD' {
  const content: string;
  export default content;
}
declare module '*.woff2' {
  const content: string;
  export default content;
}
declare module '*.css' {
  const content: string;
  export default content;
}
