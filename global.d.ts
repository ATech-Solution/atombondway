// global.d.ts
declare module '@payloadcms/next/css'
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}