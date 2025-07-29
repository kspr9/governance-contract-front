import { Q as sanitize_props, R as rest_props, S as fallback, T as ensure_array_like, U as spread_attributes, V as clsx, W as element, K as slot, X as bind_props, E as pop, A as push, Y as spread_props, F as attr, J as store_get, G as attr_class, N as stringify, M as unsubscribe_stores } from "../../chunks/index.js";
import { s as showContractLoaderStore } from "../../chunks/uiStore.js";
import "clsx";
import { w as writable } from "../../chunks/index2.js";
/**
 * @license lucide-svelte v0.525.0 - ISC
 *
 * ISC License
 * 
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 * 
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * 
 */
const defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
};
function Icon($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "name",
    "color",
    "size",
    "strokeWidth",
    "absoluteStrokeWidth",
    "iconNode"
  ]);
  push();
  let name = fallback($$props["name"], void 0);
  let color = fallback($$props["color"], "currentColor");
  let size = fallback($$props["size"], 24);
  let strokeWidth = fallback($$props["strokeWidth"], 2);
  let absoluteStrokeWidth = fallback($$props["absoluteStrokeWidth"], false);
  let iconNode = fallback($$props["iconNode"], () => [], true);
  const mergeClasses = (...classes) => classes.filter((className, index, array) => {
    return Boolean(className) && array.indexOf(className) === index;
  }).join(" ");
  const each_array = ensure_array_like(iconNode);
  $$payload.out.push(`<svg${spread_attributes(
    {
      ...defaultAttributes,
      ...$$restProps,
      width: size,
      height: size,
      stroke: color,
      "stroke-width": absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      class: clsx(mergeClasses("lucide-icon", "lucide", name ? `lucide-${name}` : "", $$sanitized_props.class))
    },
    null,
    void 0,
    void 0,
    3
  )}><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [tag, attrs] = each_array[$$index];
    element($$payload, tag, () => {
      $$payload.out.push(`${spread_attributes({ ...attrs }, null, void 0, void 0, 3)}`);
    });
  }
  $$payload.out.push(`<!--]--><!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!----></svg>`);
  bind_props($$props, {
    name,
    color,
    size,
    strokeWidth,
    absoluteStrokeWidth,
    iconNode
  });
  pop();
}
function Search($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.525.0 - ISC
   *
   * ISC License
   *
   * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
   *
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   *
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   */
  const iconNode = [
    ["path", { "d": "m21 21-4.34-4.34" }],
    ["circle", { "cx": "11", "cy": "11", "r": "8" }]
  ];
  Icon($$payload, spread_props([
    { name: "search" },
    $$sanitized_props,
    {
      /**
       * @component @name Search
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtMjEgMjEtNC4zNC00LjM0IiAvPgogIDxjaXJjbGUgY3g9IjExIiBjeT0iMTEiIHI9IjgiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/search
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function LoadContractForm($$payload, $$props) {
  push();
  let { handleLoadContract } = $$props;
  let contractInput = "";
  $$payload.out.push(`<div class="w-full"><form class="search-container svelte-1985pg1"><input type="text" class="search-input"${attr("value", contractInput)} placeholder="Tokenization Registry Address"/> <button type="submit" class="btn-search svelte-1985pg1">`);
  Search($$payload, { size: 24 });
  $$payload.out.push(`<!----></button></form></div>`);
  pop();
}
const blockImage = "/_app/immutable/assets/block.7gKAvlSv.png";
const registerLogo = "/_app/immutable/assets/2riregister-logo.B0lxYOD2.png";
const contractState = writable({ contractAddress: null, isLoaded: false });
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  async function handleLoadContract(address) {
  }
  if (store_get($$store_subs ??= {}, "$showContractLoaderStore", showContractLoaderStore)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div${attr_class(`hero-section relative ${stringify(!store_get($$store_subs ??= {}, "$contractState", contractState).isLoaded ? "min-h-[35vh]" : "min-h-[160px]")} flex items-center justify-center`, "svelte-19yw9w8")}><div class="absolute inset-0 bg-cover bg-center bg-no-repeat hero-bg svelte-19yw9w8"></div> <div class="relative z-10 max-w-4xl mx-auto px-4 text-center text-white w-full">`);
    if (!store_get($$store_subs ??= {}, "$contractState", contractState).isLoaded) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<h1 class="text-4xl md:text-3xl font-bold mb-8">Load Tokenized Share Register</h1> <div class="max-w-4xl mx-auto mb-8 w-full">`);
      LoadContractForm($$payload, { handleLoadContract });
      $$payload.out.push(`<!----></div> <div class="text-lg md:text-xl space-y-2"><p>It is possible to make inquires about all legal persons.</p> <p>A contractual client has even more functionalities.</p></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="max-w-4xl mx-auto mb-8 w-full">`);
      LoadContractForm($$payload, { handleLoadContract });
      $$payload.out.push(`<!----></div>`);
    }
    $$payload.out.push(`<!--]--></div></div> `);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> `);
    if (!store_get($$store_subs ??= {}, "$contractState", contractState).isLoaded) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="bg-white py-12"><div class="max-w-5xl mx-auto px-4"><div class="text-center mb-8"><h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tokenized equity that actually means ownership</h2> <p class="text-xl text-gray-600">Legally compliant and officially registered on the Estonian Business Register.</p></div> <div class="max-w-5xl mx-auto"><div class="bg-gray-50 rounded-xl p-12 shadow-sm"><div class="flex items-center justify-center space-x-16"><div class="text-center"><h3 class="font-normal text-gray-900 text-xl">RWA Tokenization</h3> <div class="w-32 h-32 mx-auto mb-6 flex items-center justify-center"><img${attr("src", blockImage)} alt="RWA Tokenization" class="w-full h-full object-contain"/></div></div> <div class="flex items-center"><div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg></div></div> <div class="text-center"><h3 class="font-normal text-gray-900 text-xl">Estonian Business Register</h3> <div class="w-32 h-32 mx-auto mb-6 flex items-center justify-center"><img${attr("src", registerLogo)} alt="Estonian Business Register" class="w-full h-full object-contain"/></div></div></div></div></div></div></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="max-w-5xl mx-auto p-4 space-y-4"><div class="card">`);
    {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
