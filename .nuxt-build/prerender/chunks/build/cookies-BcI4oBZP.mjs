import { _ as _plugin_vue_export_helper_default } from '../virtual/entry.mjs';
import { L as LegalPage_default } from './LegalPage-C-qdqAx1.mjs';
import { mergeProps, withCtx, createVNode, createTextVNode, useSSRContext } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/index.mjs';
import { ssrRenderComponent } from 'file://C:/Users/PublicUser/Documents/projects/diaz/node_modules/vue/server-renderer/index.mjs';
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

var _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(ssrRenderComponent(LegalPage_default, mergeProps({
    title: "Cookies",
    description: "Dia\u2019s Taste does not use tracking or advertising cookies.",
    updated: "15 October 2026",
    path: "/cookies"
  }, _attrs), {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) _push2(`<p${_scopeId}><strong${_scopeId}>We don\u2019t use cookies.</strong> This website does not set any cookies \u2014 not for analytics, not for advertising and not for tracking \u2014 so there is nothing to accept or decline. </p><h2${_scopeId}>Third parties</h2><p${_scopeId}> Fonts, scripts and 3D models are all served from our own domain, so no third-party service can place cookies through this site. If you follow a link to WhatsApp, or open the AR viewer built into your phone, those services operate under their own cookie and privacy policies. </p><h2${_scopeId}>If this changes</h2><p${_scopeId}> If we ever add analytics or other non-essential cookies, we will update this page and ask for your consent before setting them. </p>`);
      else return [
        createVNode("p", null, [createVNode("strong", null, "We don\u2019t use cookies."), createTextVNode(" This website does not set any cookies \u2014 not for analytics, not for advertising and not for tracking \u2014 so there is nothing to accept or decline. ")]),
        createVNode("h2", null, "Third parties"),
        createVNode("p", null, " Fonts, scripts and 3D models are all served from our own domain, so no third-party service can place cookies through this site. If you follow a link to WhatsApp, or open the AR viewer built into your phone, those services operate under their own cookie and privacy policies. "),
        createVNode("h2", null, "If this changes"),
        createVNode("p", null, " If we ever add analytics or other non-essential cookies, we will update this page and ask for your consent before setting them. ")
      ];
    }),
    _: 1
  }, _parent));
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/cookies.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var cookies_default = /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { cookies_default as default };
//# sourceMappingURL=cookies-BcI4oBZP.mjs.map
