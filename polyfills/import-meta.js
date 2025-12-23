// Polyfill for import.meta on web
if (typeof globalThis !== 'undefined' && typeof globalThis.importMeta === 'undefined') {
  globalThis.importMeta = {
    url: typeof document !== 'undefined' 
      ? document.currentScript?.src || window.location.href 
      : '',
    env: process?.env || {},
  };
}

// Ensure import.meta is available
if (typeof window !== 'undefined' && typeof window.importMeta === 'undefined') {
  window.importMeta = globalThis.importMeta;
}

// Define import.meta globally for modules
if (typeof global !== 'undefined' && typeof global.importMeta === 'undefined') {
  global.importMeta = globalThis.importMeta;
}

