export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg","icon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.IeR04KCg.js",app:"_app/immutable/entry/app.c8ZFYbtr.js",imports:["_app/immutable/entry/start.IeR04KCg.js","_app/immutable/chunks/CVtnd7NH.js","_app/immutable/chunks/CUmzwEjM.js","_app/immutable/chunks/Bv5Dzk5n.js","_app/immutable/entry/app.c8ZFYbtr.js","_app/immutable/chunks/AIt528uS.js","_app/immutable/chunks/CUmzwEjM.js","_app/immutable/chunks/Bzak7iHL.js","_app/immutable/chunks/CuJMLKj1.js","_app/immutable/chunks/BG7SOyfb.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/contract/[address]/operations",
				pattern: /^\/api\/contract\/([^/]+?)\/operations\/?$/,
				params: [{"name":"address","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/contract/_address_/operations/_server.ts.js'))
			},
			{
				id: "/api/contract/[address]/storage",
				pattern: /^\/api\/contract\/([^/]+?)\/storage\/?$/,
				params: [{"name":"address","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/contract/_address_/storage/_server.ts.js'))
			},
			{
				id: "/api/registry/[registryNumber]",
				pattern: /^\/api\/registry\/([^/]+?)\/?$/,
				params: [{"name":"registryNumber","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/registry/_registryNumber_/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
