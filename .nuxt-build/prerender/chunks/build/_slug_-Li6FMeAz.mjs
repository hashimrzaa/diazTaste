import { _ as _plugin_vue_export_helper_default, u as useRoute$1, g as getProduct, c as createError$2, p as products, a as useSeoMeta, b as useHead, A as AppIcon_default, N as NuxtLink, f as formatPrice, W as WHATSAPP_TEL, d as WHATSAPP_DISPLAY, e as WHATSAPP_URL, h as useRuntimeConfig } from '../virtual/entry.mjs';
import { T as TasteMeter_default } from './TasteMeter-Cia0CdKk.mjs';
import { defineComponent, computed, ref, watch, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderStyle, ssrRenderClass, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/server-renderer/index.mjs';
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

var _slug__vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute$1();
    const config = useRuntimeConfig();
    const product = computed(() => getProduct(String(route.params.slug)));
    if (!product.value) throw createError$2({
      statusCode: 404,
      statusMessage: "Chutney not found",
      fatal: true
    });
    const p = computed(() => product.value);
    const others = computed(() => products.filter((x) => x.slug !== p.value.slug));
    const url = computed(() => `${config.public.siteUrl}/chutney/${p.value.slug}`);
    useSeoMeta({
      title: () => p.value.name,
      description: () => `${p.value.name} by Dia\u2019s Taste \u2014 ${p.value.tagline} 500 g, homemade, no additives.`,
      ogTitle: () => `${p.value.name} \xB7 Dia\u2019s Taste`,
      ogDescription: () => p.value.tagline,
      ogUrl: () => url.value,
      ogImage: () => `${config.public.siteUrl}${p.value.image}`
    });
    useHead({
      link: [{
        rel: "canonical",
        href: url
      }],
      script: [{
        type: "application/ld+json",
        innerHTML: () => JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.value.name,
          description: p.value.description,
          image: `${config.public.siteUrl}${p.value.image}`,
          brand: {
            "@type": "Brand",
            name: "Dia\u2019s Taste"
          },
          ...p.value.price != null && { offers: {
            "@type": "Offer",
            price: p.value.price,
            priceCurrency: "PKR",
            availability: "https://schema.org/InStock",
            url: url.value
          } }
        })
      }]
    });
    const view = ref("photo");
    ref();
    const ready = ref(false);
    const canAR = ref(false);
    ref(0);
    const root = ref();
    watch(() => p.value.slug, () => {
      view.value = "photo";
      canAR.value = false;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppIcon = AppIcon_default;
      const _component_NuxtLink = NuxtLink;
      const _component_TasteMeter = TasteMeter_default;
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "root",
        ref: root,
        class: "pd",
        style: {
          "--t": unref(p).color.tint,
          "--a": unref(p).color.accent,
          "--d": unref(p).color.deep,
          "--accent": unref(p).color.accent
        }
      }, _attrs))} data-v-d1fc4397><div class="container pd__grid" data-v-d1fc4397><div class="pd__media-wrap" data-v-d1fc4397><div class="pd__media" data-v-d1fc4397><img${ssrRenderAttr("src", unref(p).image)}${ssrRenderAttr("alt", `${unref(p).name} \u2014 500 g jar`)} class="pd__photo" width="400" height="530" fetchpriority="high" style="${ssrRenderStyle(unref(view) === "photo" ? null : { display: "none" })}" data-v-d1fc4397><div class="pd__three" style="${ssrRenderStyle(unref(view) === "3d" ? null : { display: "none" })}" data-v-d1fc4397>`);
      if (unref(ready)) _push(`<model-viewer class="pd__mv"${ssrRenderAttr("src", unref(p).model)}${ssrRenderAttr("alt", `3D view of the ${unref(p).name} jar. Drag to turn it.`)} camera-controls disable-zoom disable-pan touch-action="pan-y" interaction-prompt="none" shadow-intensity="1" shadow-softness="0.9" exposure="0.95" environment-image="neutral" camera-orbit="0deg 80deg 0.62m" min-camera-orbit="auto 60deg 0.62m" max-camera-orbit="auto 100deg 0.62m" field-of-view="26deg" loading="eager" ar ar-modes="webxr scene-viewer quick-look" ar-scale="auto" ar-placement="floor" data-v-d1fc4397><span slot="ar-button" hidden data-v-d1fc4397></span><div slot="progress-bar" data-v-d1fc4397></div></model-viewer>`);
      else _push(`<div class="pd__spinner" aria-hidden="true" data-v-d1fc4397></div>`);
      _push(`</div><div class="pd__tabs" role="tablist" aria-label="View" data-v-d1fc4397><button role="tab"${ssrRenderAttr("aria-selected", unref(view) === "photo")} class="${ssrRenderClass({ on: unref(view) === "photo" })}" data-v-d1fc4397>Photo</button><button role="tab"${ssrRenderAttr("aria-selected", unref(view) === "3d")} class="${ssrRenderClass({ on: unref(view) === "3d" })}" data-v-d1fc4397>3D view</button></div>`);
      if (unref(view) === "3d") {
        _push(`<p class="pd__hint" data-v-d1fc4397>`);
        _push(ssrRenderComponent(_component_AppIcon, { name: "rotate" }, null, _parent));
        _push(` Drag to turn</p>`);
      } else _push(`<!---->`);
      if (unref(view) === "3d" && unref(canAR)) {
        _push(`<button class="btn pd__ar" data-v-d1fc4397>`);
        _push(ssrRenderComponent(_component_AppIcon, { name: "cube" }, null, _parent));
        _push(` View in your space</button>`);
      } else _push(`<!---->`);
      _push(`</div></div><article class="pd__info" data-v-d1fc4397><nav class="pd__crumbs pd__anim" aria-label="Breadcrumb" data-v-d1fc4397>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) _push2(`Home`);
          else return [createTextVNode("Home")];
        }),
        _: 1
      }, _parent));
      _push(`<span aria-hidden="true" data-v-d1fc4397>/</span>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/flavours" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) _push2(`Flavours`);
          else return [createTextVNode("Flavours")];
        }),
        _: 1
      }, _parent));
      _push(`<span aria-hidden="true" data-v-d1fc4397>/</span><span aria-current="page" data-v-d1fc4397>${ssrInterpolate(unref(p).short)}</span></nav><p class="eyebrow pd__eyebrow pd__anim" data-v-d1fc4397>${ssrInterpolate(unref(p).urdu)} \xB7 ${ssrInterpolate(unref(p).weight)}</p><h1 class="pd__name display pd__anim" data-v-d1fc4397>${ssrInterpolate(unref(p).name)}</h1><p class="pd__tag display pd__anim" data-v-d1fc4397>${ssrInterpolate(unref(p).tagline)}</p><div class="pd__buy pd__anim" data-v-d1fc4397><div data-v-d1fc4397><p class="pd__price" data-v-d1fc4397>${ssrInterpolate(unref(formatPrice)(unref(p)))}</p><a${ssrRenderAttr("href", unref(WHATSAPP_TEL))} target="_blank" rel="noopener" class="pd__num" data-v-d1fc4397>`);
      _push(ssrRenderComponent(_component_AppIcon, { name: "whatsapp" }, null, _parent));
      _push(` ${ssrInterpolate(unref(WHATSAPP_DISPLAY))}</a></div><a${ssrRenderAttr("href", unref(WHATSAPP_URL))} target="_blank" rel="noopener" class="btn btn--wa" data-v-d1fc4397>`);
      _push(ssrRenderComponent(_component_AppIcon, { name: "whatsapp" }, null, _parent));
      _push(` Order on WhatsApp</a></div><p class="pd__desc pd__anim" data-v-d1fc4397>${ssrInterpolate(unref(p).description)}</p><div class="pd__block pd__anim" data-v-d1fc4397><h2 class="eyebrow" data-v-d1fc4397>Taste profile</h2>`);
      _push(ssrRenderComponent(_component_TasteMeter, { taste: unref(p).taste }, null, _parent));
      _push(`</div><div class="pd__block pd__anim" data-v-d1fc4397><h2 class="eyebrow" data-v-d1fc4397>Key ingredients</h2><ul class="pd__chips" data-v-d1fc4397><!--[-->`);
      ssrRenderList(unref(p).ingredients, (i) => {
        _push(`<li data-v-d1fc4397>${ssrInterpolate(i)}</li>`);
      });
      _push(`<!--]--></ul><p class="pd__small" data-v-d1fc4397>Full ingredient and allergen details are printed on the jar. If you have an allergy, please message us before ordering.</p></div><div class="pd__block pd__anim" data-v-d1fc4397><h2 class="eyebrow" data-v-d1fc4397>Best with</h2><ul class="pd__pairs" data-v-d1fc4397><!--[-->`);
      ssrRenderList(unref(p).pairs, (x) => {
        _push(`<li data-v-d1fc4397>`);
        _push(ssrRenderComponent(_component_AppIcon, { name: "check" }, null, _parent));
        _push(` ${ssrInterpolate(x)}</li>`);
      });
      _push(`<!--]--></ul></div><div class="pd__block pd__care pd__anim" data-v-d1fc4397><p data-v-d1fc4397>`);
      _push(ssrRenderComponent(_component_AppIcon, { name: "fridge" }, null, _parent));
      _push(` <span data-v-d1fc4397><strong data-v-d1fc4397>Keep refrigerated</strong> after opening.</span></p><p data-v-d1fc4397>`);
      _push(ssrRenderComponent(_component_AppIcon, { name: "leaf" }, null, _parent));
      _push(` <span data-v-d1fc4397><strong data-v-d1fc4397>No additives</strong> or preservatives.</span></p></div></article></div><section class="container pd__more" aria-labelledby="more-title" data-v-d1fc4397><div class="pd__more-head" data-v-d1fc4397><h2 id="more-title" class="display pd__more-title" data-v-d1fc4397>More from <em data-v-d1fc4397>the kitchen</em></h2>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/flavours",
        class: "btn btn--ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`All flavours `);
            _push2(ssrRenderComponent(_component_AppIcon, { name: "arrow" }, null, _parent2, _scopeId));
          } else return [createTextVNode("All flavours "), createVNode(_component_AppIcon, { name: "arrow" })];
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="pd__more-grid" data-v-d1fc4397><!--[-->`);
      ssrRenderList(unref(others), (o) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: o.slug,
          to: `/chutney/${o.slug}`,
          class: "mk",
          style: {
            "--mt": o.color.tint,
            "--md": o.color.deep,
            "--ma": o.color.accent
          }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="mk__disc" aria-hidden="true" data-v-d1fc4397${_scopeId}></span><span class="mk__shadow" aria-hidden="true" data-v-d1fc4397${_scopeId}></span><img class="mk__img"${ssrRenderAttr("src", o.image)}${ssrRenderAttr("alt", `${o.name} jar`)} width="300" height="400" loading="lazy" decoding="async" data-v-d1fc4397${_scopeId}><span class="mk__body" data-v-d1fc4397${_scopeId}><span class="eyebrow mk__eye" data-v-d1fc4397${_scopeId}>${ssrInterpolate(o.urdu)}</span><span class="display mk__name" data-v-d1fc4397${_scopeId}>${ssrInterpolate(o.short)}</span><span class="mk__tag" data-v-d1fc4397${_scopeId}>${ssrInterpolate(o.tagline)}</span></span><span class="mk__go" aria-hidden="true" data-v-d1fc4397${_scopeId}>`);
              _push2(ssrRenderComponent(_component_AppIcon, { name: "arrow" }, null, _parent2, _scopeId));
              _push2(`</span>`);
            } else return [
              createVNode("span", {
                class: "mk__disc",
                "aria-hidden": "true"
              }),
              createVNode("span", {
                class: "mk__shadow",
                "aria-hidden": "true"
              }),
              createVNode("img", {
                class: "mk__img",
                src: o.image,
                alt: `${o.name} jar`,
                width: "300",
                height: "400",
                loading: "lazy",
                decoding: "async"
              }, null, 8, ["src", "alt"]),
              createVNode("span", { class: "mk__body" }, [
                createVNode("span", { class: "eyebrow mk__eye" }, toDisplayString(o.urdu), 1),
                createVNode("span", { class: "display mk__name" }, toDisplayString(o.short), 1),
                createVNode("span", { class: "mk__tag" }, toDisplayString(o.tagline), 1)
              ]),
              createVNode("span", {
                class: "mk__go",
                "aria-hidden": "true"
              }, [createVNode(_component_AppIcon, { name: "arrow" })])
            ];
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></section></div>`);
    };
  }
});
var _sfc_setup = _slug__vue_vue_type_script_setup_true_lang_default.setup;
_slug__vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/chutney/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _slug__default = /* @__PURE__ */ _plugin_vue_export_helper_default(_slug__vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-d1fc4397"]]);

export { _slug__default as default };
//# sourceMappingURL=_slug_-Li6FMeAz.mjs.map
