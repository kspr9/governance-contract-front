import { f as attr, c as pop, p as push, h as attr_class, e as escape_html, i as stringify } from "../../chunks/index2.js";
import { NetworkType, BeaconEvent } from "@airgap/beacon-sdk";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { TezosToolkit } from "@taquito/taquito";
import "clsx";
import { w as writable } from "../../chunks/index.js";
const walletStore = writable(null);
const rpcUrl_mainnet = "https://rpc.tzkt.io/mainnet";
const SELECTED_RPC_URL = rpcUrl_mainnet;
const Tezos = new TezosToolkit(SELECTED_RPC_URL);
const wallet = new BeaconWallet({
  name: "Tokenshare Beacon Wallet",
  preferredNetwork: NetworkType.MAINNET
});
Tezos.setWalletProvider(wallet);
walletStore.set(wallet);
wallet.client.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, async (account) => {
  console.log(`${BeaconEvent.ACTIVE_ACCOUNT_SET} triggered: `, account?.address);
  if (account) {
    account.address;
    await getWalletBalance(account.address);
  }
});
async function getWalletBalance(address) {
  const balance = await Tezos.tz.getBalance(address);
  return balance.toNumber() / 1e6;
}
function createToastStore() {
  const { subscribe, update } = writable([]);
  let nextId = 0;
  return {
    subscribe,
    add: (type, message, operationHash) => {
      const id = nextId++;
      update((toasts) => [
        ...toasts,
        { id, type, message, operationHash }
      ]);
      setTimeout(
        () => {
          update((toasts) => toasts.filter((t) => t.id !== id));
        },
        5e3
      );
    },
    remove: (id) => {
      update((toasts) => toasts.filter((t) => t.id !== id));
    }
  };
}
createToastStore();
const terminology = {
  MANAGE_DEPLOYED_WALLETS: "Manage Deployed Registers"
};
function LoadContractForm($$payload, $$props) {
  push();
  let contractInput = "";
  $$payload.out += `<div class="bg-[color:var(--card)] rounded-[var(--radius)] shadow p-4 border border-[color:var(--border)] h-full"><div class="font-semibold text-lg mb-2 text-[color:var(--primary)]">Search for a Company Share Register</div> <div class="flex gap-2 mb-2"><input class="input flex-1"${attr("value", contractInput)} placeholder="Contract address"/> <button class="btn-primary">Search</button></div></div>`;
  pop();
}
function _page($$payload, $$props) {
  push();
  $$payload.out += `<main class="min-h-screen bg-[color:var(--background)]"><div class="sticky top-0 z-50 bg-[color:var(--primary)] text-white p-4 shadow-md"><div class="max-w-5xl mx-auto"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><img src="./src/assets/Miracap_logo_white.png" alt="Miracap Logo" class="h-8"/></div> <div class="flex items-center ml-auto">`;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div></div></div></div> <div class="flex"><div${attr_class(`${stringify("w-16")} md:${stringify("w-16")} fixed md:static top-[72px] md:top-0 left-0 z-40 min-h-screen bg-[color:var(--card)] border-r border-[color:var(--border)] transition-all duration-300 ease-in-out overflow-hidden flex flex-col`)}><div class="flex items-center justify-between p-4 border-b border-[color:var(--border)] md:hidden"><span${attr_class(`poppins-semibold text-lg text-[color:var(--primary)] ${stringify("hidden")}`)}>Menu</span> <button${attr_class(`p-2 rounded-lg hover:bg-[color:var(--muted)] transition-colors ${stringify("hidden")}`, "svelte-aipy8y")} aria-label="Close Sidebar"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <nav${attr_class(`${stringify("p-2")} space-y-2 flex-1`)}><button${attr_class(`flex items-center ${stringify("justify-center px-3 py-3")} w-full rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group mb-4`, "svelte-aipy8y")} aria-label="Toggle Sidebar" title="Toggle Sidebar"><svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"${attr("d", "M13 5l7 7-7 7M5 5l7 7-7 7")}></path></svg> <span${attr_class(`${stringify("hidden")} whitespace-nowrap`)}>Collapse</span></button> <a href="#"${attr_class(`flex items-center ${stringify("justify-center px-3 py-3")} rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group`)} title="Dashboard"><svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5v4"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 5v4"></path></svg> <span${attr_class(`${stringify("hidden")} whitespace-nowrap`)}>Dashboard</span></a> <a href="#"${attr_class(`flex items-center ${stringify("justify-center px-3 py-3")} rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group`)} title="Contracts"><svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <span${attr_class(`${stringify("hidden")} whitespace-nowrap`)}>Contracts</span></a> <a href="#"${attr_class(`flex items-center ${stringify("justify-center px-3 py-3")} rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group`)} title="Wallets"><svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg> <span${attr_class(`${stringify("hidden")} whitespace-nowrap`)}>Wallets</span></a> <a href="#"${attr_class(`flex items-center ${stringify("justify-center px-3 py-3")} rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group`)} title="Companies"><svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> <span${attr_class(`${stringify("hidden")} whitespace-nowrap`)}>Companies</span></a> <a href="#"${attr_class(`flex items-center ${stringify("justify-center px-3 py-3")} rounded-lg hover:bg-[color:var(--muted)] transition-colors text-[color:var(--foreground)] group`)} title="Settings"><svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> <span${attr_class(`${stringify("hidden")} whitespace-nowrap`)}>Settings</span></a></nav> <button class="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors bg-transparent text-white hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 mt-auto svelte-aipy8y" aria-label="Toggle View" style="min-width:0;"><span${attr_class(`text-sm font-medium ${stringify("hidden")}`)}>${escape_html(terminology.MANAGE_DEPLOYED_WALLETS)}</span> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg></button></div> `;
  {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <div class="flex-1"><div class="max-w-5xl mx-auto p-4 space-y-4">`;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div>`;
    LoadContractForm($$payload);
    $$payload.out += `<!----></div>`;
  }
  $$payload.out += `<!--]--> `;
  {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div>`;
    {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></div>`;
  }
  $$payload.out += `<!--]--></div></div></div></main>`;
  pop();
}
export {
  _page as default
};
