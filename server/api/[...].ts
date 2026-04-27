import { joinURL } from 'ufo';

export default defineEventHandler(async (event) => {
  const apiBase = useRuntimeConfig().public.apiBase;

  const path = event.path.replace(/^\/api/, '');
  const target = joinURL(apiBase, path);

  return proxyRequest(event, target);
})