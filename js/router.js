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
      // Dynamic manifest switcher depending on path
      const manifestEl = document.getElementById('pwa-manifest') || document.querySelector('link[rel="manifest"]');
      if (manifestEl) {
        if (path.startsWith('/admin')) {
          manifestEl.setAttribute('href', '/admin.webmanifest');
        } else {
          manifestEl.setAttribute('href', '/site.webmanifest');
        }
      }

      const result = matchedHandler(params);
      this.updateNavbarActive(path);

      const restoreScroll = () => {
        if (path === '/contact') return; // Do not interrupt smooth scroll for contact section
        const state = history.state;
        if (state && typeof state.scrollY === 'number') {
          window.scrollTo({ top: state.scrollY, behavior: 'instant' });
          if (window.onScrollUpdateTrackers) {
            window.onScrollUpdateTrackers(state.scrollY);
          }
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
          if (window.onScrollUpdateTrackers) {
            window.onScrollUpdateTrackers(0);
          }
        }
      };

      if (result instanceof Promise) {
        result.then(() => {
          setTimeout(restoreScroll, 50);
        }).catch(err => {
          console.error("Error in route handler:", err);
          restoreScroll();
        });
      } else {
        setTimeout(restoreScroll, 50);
      }
    } else {
      console.warn(`Route "${path}" not recognized.`);
      if (this.routes['/404']) {
        const manifestEl = document.getElementById('pwa-manifest') || document.querySelector('link[rel="manifest"]');
        if (manifestEl) {
          manifestEl.setAttribute('href', '/site.webmanifest');
        }

        const result = this.routes['/404']({});
        this.updateNavbarActive('/404');

        const restoreScroll = () => {
          const state = history.state;
          if (state && typeof state.scrollY === 'number') {
            window.scrollTo({ top: state.scrollY, behavior: 'instant' });
            if (window.onScrollUpdateTrackers) {
              window.onScrollUpdateTrackers(state.scrollY);
            }
          } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
            if (window.onScrollUpdateTrackers) {
              window.onScrollUpdateTrackers(0);
            }
          }
        };

        if (result instanceof Promise) {
          result.then(() => {
            setTimeout(restoreScroll, 50);
          }).catch(err => {
            console.error("Error in 404 handler:", err);
            restoreScroll();
          });
        } else {
          setTimeout(restoreScroll, 50);
        }
      }
    }
  }

  // Visual helper to update active nav items
  updateNavbarActive(path) {
    // Clear active links
    document.querySelectorAll('.nav-link, .drawer-nav-link').forEach(link => {
      link.classList.remove('active');
    });

    // Match exact path or parent path (e.g., matching /product/xxx to Products menu)
    let targetLink = document.querySelector(`.nav-link[href="${path}"]`);
    let drawerTargetLink = document.querySelector(`.drawer-nav-link[href="${path}"]`);
    
    if (!targetLink) {
      if (path.startsWith('/product/')) {
        targetLink = document.getElementById('nav-products');
      } else if (path.startsWith('/admin')) {
        targetLink = document.getElementById('nav-admin');
      }
    }

    if (!drawerTargetLink) {
      if (path.startsWith('/product/') || path.startsWith('/products')) {
        drawerTargetLink = document.querySelector('.drawer-dropdown-toggle .drawer-nav-link') || document.querySelector('.drawer-dropdown-toggle');
      }
    }

    if (targetLink) {
      targetLink.classList.add('active');
    }
    if (drawerTargetLink) {
      drawerTargetLink.classList.add('active');
    }
  }

  navigate(path) {
    // Normalize path by removing trailing slash (except for '/')
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    // Save scroll position for the current history entry before navigating away
    const currentState = history.state || {};
    history.replaceState({ ...currentState, scrollY: window.scrollY }, '');

    history.pushState({ scrollY: 0 }, '', path);
    this.handleRoute();
  }
}

export const router = new Router();
