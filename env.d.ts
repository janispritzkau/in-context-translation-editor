/// <reference types="vite/client" />

declare module "./locales/*.yaml" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const src: Record<string, any>;
  export default src;
}
