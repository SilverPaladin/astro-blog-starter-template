import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    
    try {
      // Handle root path - serve page.html as home page
      if (url.pathname === '/') {
        const homeRequest = new Request(url.origin + '/page.html', request);
        return await getAssetFromKV({
          request: homeRequest,
          waitUntil: ctx.waitUntil,
        });
      }

      // Handle clean URLs - try /pathname/page.html first
      if (!url.pathname.includes('.')) {
        try {
          const cleanUrlRequest = new Request(url.origin + url.pathname + '/page.html', request);
          return await getAssetFromKV({
            request: cleanUrlRequest,
            waitUntil: ctx.waitUntil,
          });
        } catch (error) {
          // Continue to serve the original request
        }
      }

      // Serve the original request
      return await getAssetFromKV({
        request,
        waitUntil: ctx.waitUntil,
      });
    } catch (error) {
      return new Response(`Not Found: ${url.pathname}`, { status: 404 });
    }
  },
};
