/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_ASSISTANT_API_KEY?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
