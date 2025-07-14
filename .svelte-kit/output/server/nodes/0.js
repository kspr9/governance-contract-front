

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.DWmrragM.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/BKiLih1q.js","_app/immutable/chunks/BiM2wTEP.js"];
export const stylesheets = ["_app/immutable/assets/0.BpTqJ0fV.css"];
export const fonts = [];
