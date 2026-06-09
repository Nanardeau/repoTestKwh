import { d as defineEventHandler, u as useRuntimeConfig, j as joinURL, p as proxyRequest } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'unhead/server';
import 'vue';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/utils';
import '@iconify/utils';
import 'consola';

const _____ = defineEventHandler(async (event) => {
  const apiBase = useRuntimeConfig().public.apiBase;
  const path = event.path.replace(/^\/api/, "");
  const target = joinURL(apiBase, path);
  return proxyRequest(event, target);
});

export { _____ as default };
//# sourceMappingURL=_..._.mjs.map
