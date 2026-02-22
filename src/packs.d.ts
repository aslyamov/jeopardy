// Type declaration for the virtual '~packs' module resolved by the
// auto-packs esbuild plugin (see build.js). All *.json files from
// the /packs directory are bundled into BUILTIN_PACKS at build time.
declare module '~packs' {
  import type { Pack } from './types';
  export const BUILTIN_PACKS: Pack[];
}
