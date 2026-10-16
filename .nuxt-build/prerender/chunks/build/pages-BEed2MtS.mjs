import { a as useSeoMeta, p as products, b as useHead, e as WHATSAPP_URL, C as ClientOnly, h as useRuntimeConfig, _ as _plugin_vue_export_helper_default, i as useIntroDone, j as useLoadProgress, k as useHeroFlavour, l as useNoWebGL, m as gsapWithCSS, s as stageState, N as NuxtLink, A as AppIcon_default } from '../virtual/entry.mjs';
import { O as OrderBlock_default } from './OrderBlock-BgafvB_J.mjs';
import { defineComponent, mergeProps, ref, computed, watch, unref, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, useSSRContext } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderClass } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/server-renderer/index.mjs';
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

var HeroSection_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "HeroSection",
  __ssrInlineRender: true,
  setup(__props) {
    const root = ref();
    useIntroDone();
    useLoadProgress();
    const active = useHeroFlavour();
    const noWebGL = useNoWebGL();
    const p = computed(() => products[active.value]);
    const callouts = computed(() => p.value.ingredients.slice(0, 4).map((k, i) => ({
      k: k.replace(/\s*\(.*?\)/g, ""),
      pos: [
        "tl",
        "tr",
        "bl",
        "br"
      ][i]
    })));
    watch(active, (i) => {
      gsapWithCSS.timeline().to(stageState, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.in"
      }).call(() => {
        stageState.flavour = i;
      }).to({}, { duration: 0.1 }).fromTo(stageState, { spin: stageState.spin - 1.2 }, {
        spin: stageState.spin,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out"
      });
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = NuxtLink;
      const _component_AppIcon = AppIcon_default;
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "top",
        ref_key: "root",
        ref: root,
        class: ["hx", { nogl: unref(noWebGL) }],
        style: {
          "--a": unref(p).color.accent,
          "--d": unref(p).color.deep,
          "--t": unref(p).color.tint
        },
        "aria-labelledby": "hx-title"
      }, _attrs))} data-v-6d962c63><div class="hx__back" data-v-6d962c63><div class="hx__disc" aria-hidden="true" data-v-6d962c63><span class="hx__glow" data-v-6d962c63></span></div>`);
      if (unref(noWebGL)) _push(`<img${ssrRenderAttr("src", unref(p).image)}${ssrRenderAttr("alt", `${unref(p).name} jar`)} class="hx__still" width="400" height="530" data-v-6d962c63>`);
      else _push(`<!---->`);
      _push(`</div><div class="hx__front" data-v-6d962c63><h1 id="hx-title" class="sr-only" data-v-6d962c63>Dia\u2019s Taste \u2014 homemade chutneys</h1><div class="hx__row" data-v-6d962c63><div class="hx__col hx__col--l" data-v-6d962c63><div class="hx__stack" data-v-6d962c63><span class="hx__w display" aria-hidden="true" data-v-6d962c63>Dia\u2019s</span><div class="hx__copy hx__reveal" data-v-6d962c63><p class="hx__lead" data-v-6d962c63>Five chutneys cooked the way Ammi always made them \u2014 real fruit, fresh herbs, nothing added.</p><dl class="hx__stats" data-v-6d962c63><div data-v-6d962c63><dt data-v-6d962c63>Homemade</dt><dd class="display" data-v-6d962c63>100%</dd></div><div data-v-6d962c63><dt data-v-6d962c63>Additives</dt><dd class="display" data-v-6d962c63>0</dd></div><div data-v-6d962c63><dt data-v-6d962c63>Per jar</dt><dd class="display" data-v-6d962c63>500g</dd></div></dl></div></div></div><div class="hx__gap" data-v-6d962c63></div><div class="hx__col hx__col--r" data-v-6d962c63><div class="hx__stack" data-v-6d962c63><span class="hx__w hx__w--red display" aria-hidden="true" data-v-6d962c63>Taste</span>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/chutney/${unref(p).slug}`,
        class: "hx__fname hx__reveal"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="hx__fname-in display" data-v-6d962c63${_scopeId}><!--[-->`);
            ssrRenderList(unref(p).name, (ch, ci) => {
              _push2(`<span class="hx__fl" style="${ssrRenderStyle({ "--i": ci })}" data-v-6d962c63${_scopeId}>${ssrInterpolate(ch === " " ? "\xA0" : ch)}</span>`);
            });
            _push2(`<!--]--></span>`);
            _push2(ssrRenderComponent(_component_AppIcon, { name: "arrow" }, null, _parent2, _scopeId));
          } else return [createVNode("span", { class: "hx__fname-in display" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(p).name, (ch, ci) => {
            return openBlock(), createBlock("span", {
              key: unref(p).slug + ci,
              class: "hx__fl",
              style: { "--i": ci }
            }, toDisplayString(ch === " " ? "\xA0" : ch), 5);
          }), 128))]), createVNode(_component_AppIcon, { name: "arrow" })];
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div><div class="hx__notes hx__reveal" aria-hidden="true" data-v-6d962c63><div class="hx__note n-heat" data-v-6d962c63><span class="hx__nt" data-v-6d962c63><span class="hx__nk" data-v-6d962c63>Heat</span><span class="hx__dots" data-v-6d962c63><!--[-->`);
      ssrRenderList(5, (n) => {
        _push(`<i class="${ssrRenderClass({ on: n <= unref(p).taste.heat })}" data-v-6d962c63></i>`);
      });
      _push(`<!--]--></span></span><svg class="hx__arr" viewBox="0 0 120 50" aria-hidden="true" data-v-6d962c63><path d="M2 8 H44 L112 44" data-v-6d962c63></path><path class="hx__ah" d="M100 44 L113 45 L107 33" data-v-6d962c63></path></svg></div><div class="hx__note n-sweet" data-v-6d962c63><span class="hx__nt" data-v-6d962c63><span class="hx__nk" data-v-6d962c63>Sweet</span><span class="hx__dots" data-v-6d962c63><!--[-->`);
      ssrRenderList(5, (n) => {
        _push(`<i class="${ssrRenderClass({ on: n <= unref(p).taste.sweet })}" data-v-6d962c63></i>`);
      });
      _push(`<!--]--></span></span><svg class="hx__arr" viewBox="0 0 120 50" aria-hidden="true" data-v-6d962c63><path d="M2 8 H44 L112 44" data-v-6d962c63></path><path class="hx__ah" d="M100 44 L113 45 L107 33" data-v-6d962c63></path></svg></div><div class="hx__note n-tangy" data-v-6d962c63><span class="hx__nt" data-v-6d962c63><span class="hx__nk" data-v-6d962c63>Tangy</span><span class="hx__dots" data-v-6d962c63><!--[-->`);
      ssrRenderList(5, (n) => {
        _push(`<i class="${ssrRenderClass({ on: n <= unref(p).taste.tangy })}" data-v-6d962c63></i>`);
      });
      _push(`<!--]--></span></span><svg class="hx__arr" viewBox="0 0 120 50" aria-hidden="true" data-v-6d962c63><path d="M2 8 H44 L112 44" data-v-6d962c63></path><path class="hx__ah" d="M100 44 L113 45 L107 33" data-v-6d962c63></path></svg></div></div><p class="hx__mtitle display hx__reveal" aria-hidden="true" data-v-6d962c63>Dia\u2019s <span data-v-6d962c63>Taste</span></p><div class="hx__recipe hx__reveal" data-v-6d962c63><span class="hx__rk eyebrow" data-v-6d962c63>Quick recipe</span><strong class="display" data-v-6d962c63>${ssrInterpolate(unref(p).recipe.title)}</strong><ol data-v-6d962c63><!--[-->`);
      ssrRenderList(unref(p).recipe.steps, (st, si) => {
        _push(`<li data-v-6d962c63>${ssrInterpolate(st)}</li>`);
      });
      _push(`<!--]--></ol></div><div class="hx__mcopy hx__reveal" data-v-6d962c63><p data-v-6d962c63>Five chutneys cooked the way Ammi always made them \u2014 real fruit, fresh herbs, nothing added.</p><dl class="hx__mstats" data-v-6d962c63><div data-v-6d962c63><dd class="display" data-v-6d962c63>100%</dd><dt data-v-6d962c63>Homemade</dt></div><div data-v-6d962c63><dd class="display" data-v-6d962c63>0</dd><dt data-v-6d962c63>Additives</dt></div><div data-v-6d962c63><dd class="display" data-v-6d962c63>500g</dd><dt data-v-6d962c63>Per jar</dt></div></dl></div><div class="hx__hot" aria-hidden="true" data-v-6d962c63></div><!--[-->`);
      ssrRenderList(unref(callouts), (c) => {
        _push(`<div class="${ssrRenderClass([`p-${c.pos}`, "hx__callout"])}" aria-hidden="true" data-v-6d962c63><span class="hx__ck display" data-v-6d962c63>${ssrInterpolate(c.k)}</span><svg class="hx__arr" viewBox="0 0 120 50" aria-hidden="true" data-v-6d962c63><path d="M2 8 H44 L112 44" data-v-6d962c63></path><path class="hx__ah" d="M100 44 L113 45 L107 33" data-v-6d962c63></path></svg></div>`);
      });
      _push(`<!--]--></div></section>`);
    };
  }
});
var _sfc_setup$2 = HeroSection_vue_vue_type_script_setup_true_lang_default.setup;
HeroSection_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/home/HeroSection.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var HeroSection_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(HeroSection_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-6d962c63"]]), { __name: "HomeHeroSection" });
var OrderSection_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "OrderSection",
  __ssrInlineRender: true,
  setup(__props) {
    const root = ref();
    const hover = ref(null);
    const touch = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = NuxtLink;
      const _component_OrderBlock = OrderBlock_default;
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "flavours",
        ref_key: "root",
        ref: root,
        class: "fs cover",
        "aria-labelledby": "fs-title"
      }, _attrs))} data-v-91ecc178><div class="container fs__head" data-v-91ecc178><p class="eyebrow fs__eyebrow" data-v-91ecc178><span data-v-91ecc178>02</span> The flavours</p><h2 id="fs-title" class="display fs__title" data-v-91ecc178>Five jars. <em data-v-91ecc178>One kitchen.</em></h2><p class="fs__sub" data-v-91ecc178>${ssrInterpolate(unref(touch) ? "Tap a jar to meet it \u2014 tap its card for details." : "Hover a jar to meet it \u2014 click for details.")}</p></div><div class="od__jars" data-v-91ecc178><!--[-->`);
      ssrRenderList(unref(products), (p, i) => {
        _push(`<div class="${ssrRenderClass([{
          on: unref(hover) === i,
          dim: unref(hover) !== null && unref(hover) !== i,
          "edge-l": i === 0,
          "edge-r": i === unref(products).length - 1
        }, "od__slot"])}" style="${ssrRenderStyle({
          "--a": p.color.accent,
          "--d": p.color.deep,
          "--r": `${(i - 2) * 6}deg`,
          zIndex: unref(hover) === i ? 10 : 5 - Math.abs(i - 2)
        })}" data-v-91ecc178>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/chutney/${p.slug}`,
          class: "od__tag",
          tabindex: unref(hover) === i ? 0 : -1
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) _push2(`<span class="od__tag-name display" data-v-91ecc178${_scopeId}>${ssrInterpolate(p.short)}</span><span class="od__tag-tag" data-v-91ecc178${_scopeId}>${ssrInterpolate(p.tagline)}</span><span class="od__tag-ing" data-v-91ecc178${_scopeId}>${ssrInterpolate(p.ingredients.slice(0, 4).join(" \xB7 "))}</span><span class="od__tag-cta" data-v-91ecc178${_scopeId}>View details \u2192</span>`);
            else return [
              createVNode("span", { class: "od__tag-name display" }, toDisplayString(p.short), 1),
              createVNode("span", { class: "od__tag-tag" }, toDisplayString(p.tagline), 1),
              createVNode("span", { class: "od__tag-ing" }, toDisplayString(p.ingredients.slice(0, 4).join(" \xB7 ")), 1),
              createVNode("span", { class: "od__tag-cta" }, "View details \u2192")
            ];
          }),
          _: 2
        }, _parent));
        _push(`<span class="od__line" aria-hidden="true" data-v-91ecc178></span><button class="od__jar"${ssrRenderAttr("aria-label", `${p.name} \u2014 view details`)} data-v-91ecc178><span class="od__shadow" aria-hidden="true" data-v-91ecc178></span><img${ssrRenderAttr("src", p.image)} alt="" width="300" height="400" loading="lazy" data-v-91ecc178></button></div>`);
      });
      _push(`<!--]--></div>`);
      _push(ssrRenderComponent(_component_OrderBlock, null, null, _parent));
      _push(`</section>`);
    };
  }
});
var _sfc_setup$1 = OrderSection_vue_vue_type_script_setup_true_lang_default.setup;
OrderSection_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/home/OrderSection.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var OrderSection_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(OrderSection_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-91ecc178"]]), { __name: "HomeOrderSection" });
var index_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const config = useRuntimeConfig();
    useSeoMeta({
      title: "Homemade chutneys, ghar ka zaiqa",
      titleTemplate: "Dia\u2019s Taste \u2014 %s",
      description: "Dia\u2019s Taste makes five homemade chutneys \u2014 Green, Garlic, Aloo Bukhara, Imli and Khajoor \u2014 in small batches with no additives. Order on WhatsApp.",
      ogTitle: "Dia\u2019s Taste \u2014 Homemade chutneys, ghar ka zaiqa",
      ogDescription: "Five homemade chutneys, no additives. Order on WhatsApp.",
      ogUrl: config.public.siteUrl
    });
    const PRELOAD_HERO = `(function(){try{var c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl');if(!g)return;var x=g.getExtension('WEBGL_lose_context');x&&x.loseContext();var l=document.createElement('link');l.rel='preload';l.as='fetch';l.crossOrigin='anonymous';l.href='/models/${products[2].slug}.hero.glb';document.head.appendChild(l)}catch(e){}})()`;
    useHead({
      link: [{
        rel: "canonical",
        href: config.public.siteUrl
      }],
      script: [{
        innerHTML: PRELOAD_HERO,
        tagPosition: "head"
      }, {
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [{
            "@type": "Organization",
            name: "Dia\u2019s Taste",
            slogan: "Ghar ka Zaiqa",
            url: config.public.siteUrl,
            logo: `${config.public.siteUrl}/brand/dias-logo.svg`,
            sameAs: [WHATSAPP_URL]
          }, {
            "@type": "ItemList",
            name: "Dia\u2019s Taste chutneys",
            itemListElement: products.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${config.public.siteUrl}/chutney/${p.slug}`,
              name: p.name
            }))
          }]
        })
      }]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = ClientOnly;
      const _component_HomeHeroSection = HeroSection_default;
      const _component_HomeOrderSection = OrderSection_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "home" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(ssrRenderComponent(_component_HomeHeroSection, null, null, _parent));
      _push(ssrRenderComponent(_component_HomeOrderSection, null, null, _parent));
      _push(`</div>`);
    };
  }
});
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var pages_default = index_vue_vue_type_script_setup_true_lang_default;

export { pages_default as default };
//# sourceMappingURL=pages-BEed2MtS.mjs.map
