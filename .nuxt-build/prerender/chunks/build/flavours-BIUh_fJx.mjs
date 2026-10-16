import { _ as _plugin_vue_export_helper_default, a as useSeoMeta, b as useHead, p as products, N as NuxtLink, f as formatPrice, e as WHATSAPP_URL, A as AppIcon_default, h as useRuntimeConfig } from '../virtual/entry.mjs';
import { T as TasteMeter_default } from './TasteMeter-Cia0CdKk.mjs';
import { O as OrderBlock_default } from './OrderBlock-Bi1p8zqv.mjs';
import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderComponent, ssrRenderAttr } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/server-renderer/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/nostics/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/nostics/dist/formatters/ansi.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/hookable/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/ufo/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/ofetch/dist/node.mjs';
import '../_/renderer.mjs';
import '../_/nitro.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/unhead/dist/server.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/unhead/dist/legacy.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/unhead/dist/plugins.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/h3/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/destr/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/nitropack/node_modules/hookable/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/node-mock-http/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/unstorage/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/unstorage/drivers/fs.mjs';
import 'file:///C:/Users/PublicUser/Documents/projects/diaz/node_modules/@nuxt/nitro-server/dist/runtime/utils/cache-driver.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/ohash/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/klona/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/defu/dist/defu.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/scule/dist/index.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/radix3/dist/index.mjs';
import 'node:fs';
import 'node:url';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/pathe/dist/index.mjs';
import 'node:async_hooks';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/devalue/src/index.js';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue-router/vue-router.node.mjs';
import 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/unhead/dist/utils.mjs';

var flavours_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "flavours",
  __ssrInlineRender: true,
  setup(__props) {
    const config = useRuntimeConfig();
    useSeoMeta({
      title: "Flavours",
      description: "All five Dia\u2019s Taste chutneys \u2014 Green, Garlic, Aloo Bukhara, Imli and Khajoor \u2014 in 500 g jars. Homemade, no additives.",
      ogUrl: `${config.public.siteUrl}/flavours`
    });
    useHead({ link: [{
      rel: "canonical",
      href: `${config.public.siteUrl}/flavours`
    }] });
    const root = ref();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = NuxtLink;
      const _component_TasteMeter = TasteMeter_default;
      const _component_AppIcon = AppIcon_default;
      const _component_OrderBlock = OrderBlock_default;
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "root",
        ref: root,
        class: "fv"
      }, _attrs))} data-v-32591be3><section class="container fv__intro" data-v-32591be3><p class="eyebrow fv__eyebrow" data-v-32591be3>The flavours \xB7 ${ssrInterpolate(unref(products).length)} chutneys \xB7 500 g each</p><h1 class="fv__title display" data-v-32591be3>Five jars, <em data-v-32591be3>endless</em> plates.</h1><p class="lead" data-v-32591be3>Cooked in small batches with nothing added. Pick one \u2014 or all five.</p></section><section class="container" aria-label="All chutneys" data-v-32591be3><ul class="fb" role="list" data-v-32591be3><!--[-->`);
      ssrRenderList(unref(products), (p, i) => {
        _push(`<li class="${ssrRenderClass([["fb__tile--big", { "fb__tile--wide": i === unref(products).length - 1 }], "fb__tile"])}" style="${ssrRenderStyle({
          "--t": p.color.tint,
          "--a": p.color.accent,
          "--d": p.color.deep,
          "--accent": p.color.accent
        })}" data-v-32591be3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/chutney/${p.slug}`,
          class: "fb__link",
          "aria-label": `${p.name} \u2014 details`
        }, null, _parent));
        _push(`<span class="fb__no display" aria-hidden="true" data-v-32591be3>0${ssrInterpolate(i + 1)}</span><div class="fb__media" data-v-32591be3><span class="fb__glow" aria-hidden="true" data-v-32591be3></span><img class="fb__img"${ssrRenderAttr("src", p.image)}${ssrRenderAttr("alt", `${p.name}, 500 g jar`)} width="400" height="530" loading="lazy" data-v-32591be3></div><div class="fb__body" data-v-32591be3><p class="eyebrow fb__eye" data-v-32591be3>${ssrInterpolate(p.urdu)}</p><h2 class="fb__name display" data-v-32591be3>${ssrInterpolate(p.name)}</h2><p class="fb__tag" data-v-32591be3>${ssrInterpolate(p.tagline)}</p><div class="fb__meter" data-v-32591be3>`);
        _push(ssrRenderComponent(_component_TasteMeter, {
          taste: p.taste,
          compact: ""
        }, null, _parent));
        _push(`</div><div class="fb__foot" data-v-32591be3><span class="fb__price" data-v-32591be3>${ssrInterpolate(unref(formatPrice)(p))}</span><a${ssrRenderAttr("href", unref(WHATSAPP_URL))} target="_blank" rel="noopener" class="btn fb__order"${ssrRenderAttr("aria-label", `Order ${p.name} on WhatsApp`)} data-v-32591be3>`);
        _push(ssrRenderComponent(_component_AppIcon, { name: "whatsapp" }, null, _parent));
        _push(` Order</a></div></div></li>`);
      });
      _push(`<!--]--></ul></section>`);
      _push(ssrRenderComponent(_component_OrderBlock, null, null, _parent));
      _push(`</div>`);
    };
  }
});
var _sfc_setup = flavours_vue_vue_type_script_setup_true_lang_default.setup;
flavours_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/flavours.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var flavours_default = /* @__PURE__ */ _plugin_vue_export_helper_default(flavours_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-32591be3"]]);

export { flavours_default as default };
//# sourceMappingURL=flavours-BIUh_fJx.mjs.map
