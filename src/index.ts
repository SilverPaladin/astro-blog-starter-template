export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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
      // Try to fetch the asset from the ASSETS binding
      const assetResponse = await env.ASSETS.fetch(new URL(pathname, request.url));
      
      if (assetResponse.status === 404) {
        // If not found, try with .html extension
        const htmlPath = pathname.endsWith('/') ? pathname + 'page.html' : pathname + '.html';
        const htmlResponse = await env.ASSETS.fetch(new URL(htmlPath, request.url));
        
        if (htmlResponse.status === 404) {
          return new Response('Not Found', { status: 404 });
        }
        
        return htmlResponse;
      }

      return assetResponse;
    } catch (error) {
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
