Create a premium, modern, mobile-first smart navigation bar.

Navbar Behavior:
- The navbar must be fixed at the top and fully visible when the page loads.
- Keep the navbar visible while the user is at the top of the page.
- When the user scrolls down, smoothly hide the navbar by sliding it upward.
- Do not hide it instantly; wait until the user has scrolled around 50–80px to avoid accidental hiding.
- As soon as the user scrolls upward, immediately reveal the navbar with a smooth slide-down animation, regardless of how far down the page the user is.
- If scrolling stops, keep the navbar in its current state.
- The animation should be fluid (200–300ms) with no flickering or layout shifts.

Design:
- Use a clean glassmorphism effect with a subtle backdrop blur.
- Add a soft shadow while scrolling.
- Maintain a high-end premium appearance.
- Ensure the navbar remains responsive on all screen sizes.

Performance:
- Use CSS transforms (translateY) instead of changing top or display for smooth 60fps animations.
- Optimize scroll listeners using requestAnimationFrame or passive event listeners.
- Avoid unnecessary re-renders, lag, or memory leaks.

Extra UX Improvements:
- Add a smooth "Scroll to Top" floating button that appears after scrolling about 500px.
- Preserve the last scroll position when navigating back to a page.
- Lazy-load images where appropriate for faster page loading.
- Ensure everything works perfectly in a Vite + Vanilla HTML, CSS, and JavaScript SPA.


Fix the Admin shortcut issue professionally.

Current Problem:
- The Admin page is hidden from the UI.
- When I create a Chrome Home Screen shortcut for the Admin page, tapping the shortcut always opens the Home page instead of the Admin page.

Requirements:
- Fix deep linking so that a shortcut created for the Admin route always opens the Admin page directly.
- Preserve the requested URL during app launch.
- Ensure it works after installation as a PWA and also in a normal browser.
- Support page refresh and direct URL access without redirecting to the Home page.
- Do not break existing SPA routing.
- If the issue is caused by Vite, SPA fallback, service worker, manifest.json, or routing configuration, fix it using best practices.
- Use a production-ready solution.
- Keep the Admin page hidden from the website navigation.
- Do not rely on hacks or temporary workarounds.
- Explain the root cause and implement the proper fix.