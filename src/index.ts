export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Handle root path - serve index.html as home page
    if (pathname === '/') {
      pathname = '/index.html';
    }

    // Handle clean URLs - if no extension, try /pathname/index.html
    if (!pathname.includes('.') && !pathname.endsWith('/')) {
      pathname = pathname + '/index.html';
    }

    try {
      // Use the __STATIC_CONTENT KV namespace directly
      const assetKey = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      const asset = await env.__STATIC_CONTENT.get(assetKey, { type: 'arrayBuffer' });
      
      if (asset) {
        const contentType = getContentType(pathname);
        return new Response(asset, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }

      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};

function getContentType(pathname: string): string {
  if (pathname.endsWith('.html')) return 'text/html';
  if (pathname.endsWith('.css')) return 'text/css';
  if (pathname.endsWith('.js')) return 'application/javascript';
  if (pathname.endsWith('.json')) return 'application/json';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.gif')) return 'image/gif';
  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  return 'text/plain';
}
