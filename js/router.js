// Client-side router for the SPA using clean URLs

class Router {
  constructor() {
    this.routes = {};
    window.router = this; // Expose router globally for inline click event handlers
    window.addEventListener('popstate', () => this.handleRoute());

    // Intercept clicks on links for SPA routing
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented) return;
      const target = e.target.closest('a');
      if (!target) return;

      // Ignore external links, new tabs, downloads, and modified clicks
      if (
        target.target === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0 ||
        target.hasAttribute('download')
      ) {
        return;
      }

      const href = target.getAttribute('href');
      if (!href) return;

      // Only handle internal routing paths
      try {
        const url = new URL(target.href);
        if (url.origin === window.location.origin) {
          e.preventDefault();
          this.navigate(url.pathname + url.search + url.hash);
        }
      } catch (err) {
        // If not a valid URL, let it load naturally
      }
    });
  }

  // Register a route and its callback handler
  addRoute(routePattern, handler) {
    this.routes[routePattern] = handler;
  }

  // Handle route change
  handleRoute() {
    let path = window.location.pathname || '/';

    // Normalize path by removing trailing slash (except for '/')
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    let matchedHandler = null;
    let params = {};

    // Check each registered route pattern
    for (const pattern in this.routes) {
      // Replace :param with a regex capture group
      // and escape other characters in the path
      const regexPattern = '^' + pattern
        .replace(/\//g, '\\/')
        .replace(/:[a-zA-Z0-9_]+/g, '([^\\/]+)') + '$';
      
      const regex = new RegExp(regexPattern);
      const match = path.match(regex);

      if (match) {
        matchedHandler = this.routes[pattern];
        // Extract parameter keys from the pattern (e.g. ['slug'])
        const paramKeys = (pattern.match(/:[a-zA-Z0-9_]+/g) || []).map(key => key.slice(1));
        
        // Map parameter keys to values from matching regex groups
        paramKeys.forEach((key, index) => {
          params[key] = match[index + 1];
        });
        break;
      }
    }

    // Run active view handler or display 404
    if (matchedHandler) {
      if (path !== '/contact') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      matchedHandler(params);
      this.updateNavbarActive(path);
    } else {
      console.warn(`Route "${path}" not recognized.`);
      if (this.routes['/404']) {
        if (path !== '/contact') {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
        this.routes['/404']({});
        this.updateNavbarActive('/404');
      }
    }
  }

  // Visual helper to update active nav items
  updateNavbarActive(path) {
    // Clear active links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Match exact path or parent path (e.g., matching /product/xxx to Products menu)
    let targetLink = document.querySelector(`.nav-link[href="${path}"]`);
    
    if (!targetLink) {
      if (path.startsWith('/product/')) {
        targetLink = document.getElementById('nav-products');
      } else if (path.startsWith('/admin')) {
        targetLink = document.getElementById('nav-admin');
      }
    }

    if (targetLink) {
      targetLink.classList.add('active');
    }
  }

  navigate(path) {
    // Normalize path by removing trailing slash (except for '/')
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    history.pushState(null, '', path);
    this.handleRoute();
  }
}

export const router = new Router();
