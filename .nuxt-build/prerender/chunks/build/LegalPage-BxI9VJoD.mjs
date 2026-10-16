import { _ as _plugin_vue_export_helper_default, a as useSeoMeta, b as useHead, h as useRuntimeConfig } from '../virtual/entry.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderSlot } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/server-renderer/index.mjs';

var LegalPage_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "LegalPage",
  __ssrInlineRender: true,
  props: {
    title: {},
    description: {},
    updated: {},
    path: {}
  },
  setup(__props) {
    const props = __props;
    const config = useRuntimeConfig();
    useSeoMeta({
      title: props.title,
      description: props.description,
      robots: "index, follow"
    });
    useHead({ link: [{
      rel: "canonical",
      href: `${config.public.siteUrl}${props.path}`
    }] });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "legal container" }, _attrs))} data-v-8ef51650><header class="legal__head" data-v-8ef51650><p class="eyebrow legal__eyebrow" data-v-8ef51650>Legal</p><h1 class="display legal__title" data-v-8ef51650>${ssrInterpolate(__props.title)}</h1><p class="muted" data-v-8ef51650>Last updated ${ssrInterpolate(__props.updated)}</p></header><div class="prose" data-v-8ef51650>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
var _sfc_setup = LegalPage_vue_vue_type_script_setup_true_lang_default.setup;
LegalPage_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LegalPage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var LegalPage_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(LegalPage_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8ef51650"]]), { __name: "LegalPage" });

export { LegalPage_default as L };
//# sourceMappingURL=LegalPage-BxI9VJoD.mjs.map
