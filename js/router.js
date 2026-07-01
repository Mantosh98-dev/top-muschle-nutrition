// Hash-based client-side router for the SPA

class Router {
  constructor() {
    this.routes = {};
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  // Register a route and its callback handler
  addRoute(routePattern, handler) {
    this.routes[routePattern] = handler;
  }

  // Handle route change
  handleRoute() {
    const hash = window.location.hash || '#home';
    
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
      const match = hash.match(regex);

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

    // Run active view handler or redirect to Home
    if (matchedHandler) {
      if (hash !== '#contact') {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      matchedHandler(params);
      this.updateNavbarActive(hash);
    } else {
      console.warn(`Route "${hash}" not recognized, redirecting to #home.`);
      window.location.hash = '#home';
    }
  }

  // Visual helper to update active nav items
  updateNavbarActive(hash) {
    // Clear active links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Match exact hash or parent hash (e.g., matching #product/xxx to Products menu)
    let targetLink = document.querySelector(`.nav-link[href="${hash}"]`);
    
    if (!targetLink) {
      if (hash.startsWith('#product/')) {
        targetLink = document.getElementById('nav-products');
      } else if (hash.startsWith('#admin')) {
        targetLink = document.getElementById('nav-admin');
      }
    }

    if (targetLink) {
      targetLink.classList.add('active');
    }
  }

  navigate(hash) {
    window.location.hash = hash;
  }
}

export const router = new Router();
