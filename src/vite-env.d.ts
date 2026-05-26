/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_SW?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
