import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Handle root path - serve page.html as home page
    if (pathname === '/') {
      pathname = '/page.html';
    }

    // Handle clean URLs - if no extension, try .html
    if (!pathname.includes('.') && !pathname.endsWith('/')) {
      pathname = pathname + '/page.html';
    }

    try {
      // Create a new request with the modified pathname
      const modifiedRequest = new Request(
        new URL(pathname, request.url).toString(),
        {
          method: request.method,
          headers: request.headers,
        }
      );

      return await getAssetFromKV(
        {
          request: modifiedRequest,
          waitUntil: ctx.waitUntil,
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
        }
      );
    } catch (error) {
      // If asset not found, try with .html extension
      try {
        const htmlPath = pathname.endsWith('/') ? pathname + 'page.html' : pathname + '.html';
        const htmlRequest = new Request(
          new URL(htmlPath, request.url).toString(),
          {
            method: request.method,
            headers: request.headers,
          }
        );

        return await getAssetFromKV(
          {
            request: htmlRequest,
            waitUntil: ctx.waitUntil,
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
          }
        );
      } catch (htmlError) {
        return new Response('Not Found', { status: 404 });
      }
    }
  },
};
