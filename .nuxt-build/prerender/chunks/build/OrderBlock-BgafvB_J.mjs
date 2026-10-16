import { _ as _plugin_vue_export_helper_default, e as WHATSAPP_URL, A as AppIcon_default, N as NuxtLink, W as WHATSAPP_TEL, d as WHATSAPP_DISPLAY } from '../virtual/entry.mjs';
import { defineComponent, ref, resolveDirective, mergeProps, unref, withCtx, createTextVNode, createVNode, useSSRContext } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderList, ssrGetDirectiveProps, ssrRenderComponent, ssrRenderAttr, ssrInterpolate } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/server-renderer/index.mjs';

var OrderBlock_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "OrderBlock",
  __ssrInlineRender: true,
  setup(__props) {
    const root = ref();
    const qr = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppIcon = AppIcon_default;
      const _component_NuxtLink = NuxtLink;
      const _directive_magnetic = resolveDirective("magnetic");
      _push(`<div${ssrRenderAttrs(mergeProps({
        id: "order",
        ref_key: "root",
        ref: root,
        class: "od"
      }, _attrs))} data-v-3d30d1ee><div class="od__marquee" aria-hidden="true" data-v-3d30d1ee><!--[-->`);
      ssrRenderList(2, (n) => {
        _push(`<span data-v-3d30d1ee>Green \xB7 Garlic \xB7 Aloo Bukhara \xB7 Imli \xB7 Khajoor \xB7 </span>`);
      });
      _push(`<!--]--></div><div class="container od__grid" data-v-3d30d1ee><p class="eyebrow od__eyebrow" data-v-3d30d1ee><span data-v-3d30d1ee>03</span> Order</p><h2 class="display od__title" data-v-3d30d1ee><span class="od__w" data-v-3d30d1ee>Hungry</span> <span class="od__w od__w--red" data-v-3d30d1ee>yet?</span></h2><div class="od__row" data-v-3d30d1ee><div class="od__main" data-v-3d30d1ee><p class="od__lead" data-v-3d30d1ee>Message us your flavours and address \u2014 we confirm the price and delivery, and cook it fresh in our kitchen.</p><div class="od__ctas" data-v-3d30d1ee><a${ssrRenderAttrs(mergeProps({
        href: unref(WHATSAPP_URL),
        target: "_blank",
        rel: "noopener",
        class: "btn btn--wa od__big"
      }, ssrGetDirectiveProps(_ctx, _directive_magnetic, 0.25)))} data-v-3d30d1ee>`);
      _push(ssrRenderComponent(_component_AppIcon, { name: "whatsapp" }, null, _parent));
      _push(` Order on WhatsApp</a>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/flavours",
        class: "btn btn--ghost od__big"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`All flavours `);
            _push2(ssrRenderComponent(_component_AppIcon, { name: "arrow" }, null, _parent2, _scopeId));
          } else return [createTextVNode("All flavours "), createVNode(_component_AppIcon, { name: "arrow" })];
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="od__qr" data-v-3d30d1ee>`);
      if (unref(qr)) _push(`<img${ssrRenderAttr("src", unref(qr))} width="140" height="140" alt="QR code to order from Dia\u2019s Taste on WhatsApp" data-v-3d30d1ee>`);
      else _push(`<!---->`);
      _push(`<p data-v-3d30d1ee>Scan to chat<br data-v-3d30d1ee><a${ssrRenderAttr("href", unref(WHATSAPP_TEL))} target="_blank" rel="noopener" class="od__num" data-v-3d30d1ee>`);
      _push(ssrRenderComponent(_component_AppIcon, { name: "whatsapp" }, null, _parent));
      _push(` ${ssrInterpolate(unref(WHATSAPP_DISPLAY))}</a></p></div></div></div></div>`);
    };
  }
});
var _sfc_setup = OrderBlock_vue_vue_type_script_setup_true_lang_default.setup;
OrderBlock_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/OrderBlock.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var OrderBlock_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(OrderBlock_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3d30d1ee"]]), { __name: "OrderBlock" });

export { OrderBlock_default as O };
//# sourceMappingURL=OrderBlock-BgafvB_J.mjs.map
