import { F as attr, G as attr_class, I as escape_html, J as store_get, K as slot, M as unsubscribe_stores, E as pop, A as push, N as stringify } from "../../chunks/index.js";
import { s as showContractLoaderStore } from "../../chunks/uiStore.js";
const miracapLogo = "/_app/immutable/assets/logo.B03p7w5F.svg";
const terminology = {
  VIEW_CONTRACTS: "View Share Registers",
  MANAGE_DEPLOYED_WALLETS: "Manage Deployed Registers"
};
function _layout($$payload, $$props) {
  push();
  var $$store_subs;
  $$payload.out.push(`<main class="min-h-screen bg-(--background) grid grid-rows-[auto_1fr] svelte-1p61z68"><div class="sticky top-0 z-50 navbar p-4 shadow-md"><div class="max-w-5xl mx-auto"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><img${attr("src", miracapLogo)} alt="Miracap Logo" class="h-8"/></div> <div class="flex items-center ml-auto">`);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div></div></div> <div class="layout-container svelte-1p61z68"><div${attr_class(`sidebar ${stringify("w-16")} md:${stringify("w-16")} bg-(--card) border-r border-(--border) transition-all duration-300 ease-in-out flex flex-col h-full overflow-hidden ${stringify("")}`, "svelte-1p61z68")}><nav${attr_class(`${stringify("p-2")} space-y-2 flex-1 overflow-y-auto`)}><button${attr_class(`flex items-center ${stringify("justify-center px-3 py-3")} w-full rounded-lg hover:bg-(--muted) transition-colors text-(--foreground) group mb-4`)} aria-label="Toggle Sidebar" title="Toggle Sidebar"><svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${attr("d", "M13 5l7 7-7 7M5 5l7 7-7 7")}></path></svg> <span${attr_class(`${stringify("hidden")} whitespace-nowrap`)}>Collapse</span></button> <a href="/"${attr_class(`flex items-center ${stringify("justify-center px-3 py-3")} rounded-lg hover:bg-(--muted) transition-colors text-(--foreground) group`)} title="Dashboard"><svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v4"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 5v4"></path></svg> <span${attr_class(`${stringify("hidden")} whitespace-nowrap`)}>Dashboard</span></a></nav> <button class="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-(--border) hover:bg-(--muted) transition-all duration-200 bg-transparent text-(--foreground) hover:text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--primary)/50 shrink-0 opacity-0 hover:opacity-100 group" aria-label="Toggle View" style="min-width:0;"><span${attr_class(`text-sm font-medium ${stringify("hidden")}`)}>${escape_html(store_get($$store_subs ??= {}, "$showContractLoaderStore", showContractLoaderStore) ? terminology.MANAGE_DEPLOYED_WALLETS : terminology.VIEW_CONTRACTS)}</span> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-(--foreground)" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg></button></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div class="overflow-y-auto h-full"><!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!----></div></div></main>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _layout as default
};
