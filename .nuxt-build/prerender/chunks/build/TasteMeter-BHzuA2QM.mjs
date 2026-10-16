import { _ as _plugin_vue_export_helper_default } from '../virtual/entry.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrRenderClass } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/server-renderer/index.mjs';

var TasteMeter_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TasteMeter",
  __ssrInlineRender: true,
  props: {
    taste: {},
    compact: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    const props = __props;
    const rows = computed(() => [
      {
        label: "Sweet",
        value: props.taste.sweet
      },
      {
        label: "Tangy",
        value: props.taste.tangy
      },
      {
        label: "Heat",
        value: props.taste.heat
      }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<dl${ssrRenderAttrs(mergeProps({ class: ["tm", { "tm--compact": __props.compact }] }, _attrs))} data-v-8511511b><!--[-->`);
      ssrRenderList(unref(rows), (r) => {
        _push(`<div class="tm__row" data-v-8511511b><dt data-v-8511511b>${ssrInterpolate(r.label)}</dt><dd${ssrRenderAttr("aria-label", `${r.value} out of 5`)} data-v-8511511b><!--[-->`);
        ssrRenderList(5, (n) => {
          _push(`<span class="${ssrRenderClass([{ on: n <= r.value }, "tm__seg"])}" data-v-8511511b></span>`);
        });
        _push(`<!--]--></dd></div>`);
      });
      _push(`<!--]--></dl>`);
    };
  }
});
var _sfc_setup = TasteMeter_vue_vue_type_script_setup_true_lang_default.setup;
TasteMeter_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TasteMeter.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var TasteMeter_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(TasteMeter_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8511511b"]]), { __name: "TasteMeter" });

export { TasteMeter_default as T };
//# sourceMappingURL=TasteMeter-BHzuA2QM.mjs.map
