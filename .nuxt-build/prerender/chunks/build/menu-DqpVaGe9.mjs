import { defineComponent, useSSRContext } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/index.mjs';
import { ssrRenderAttrs } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/server-renderer/index.mjs';

var menu_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "menu",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}></div>`);
    };
  }
});
var _sfc_setup = menu_vue_vue_type_script_setup_true_lang_default.setup;
menu_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/menu.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var menu_default = menu_vue_vue_type_script_setup_true_lang_default;

export { menu_default as default };
//# sourceMappingURL=menu-DqpVaGe9.mjs.map
