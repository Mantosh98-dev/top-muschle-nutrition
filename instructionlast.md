1. Announcement Bar

Improve the announcement bar.

Requirements
Add a close (×) button on the right side.
If the user closes it, save the state in localStorage so it stays hidden.
On small screens, do not increase the height.
Instead of wrapping into multiple lines, make the text auto-scroll horizontally (marquee/ticker effect).
Pause the scrolling when the user touches or hovers over it.
Resume after interaction.
2. Navbar

Keep the current navbar exactly the same.

No redesign.

No spacing changes.

No color changes.

Only maintain responsiveness.

3. Homepage Order

Homepage sections should appear in this exact order:

Announcement Bar
Navbar
Hero Slider
Features Section
Shop by Category
Featured Products
Best Sellers
Shop by Brand (hidden for now via Admin toggle)
Why Choose Us Banner
Customer Reviews (disabled from Admin for now)
Footer
4. Features Section

Add a premium feature strip below the Hero.

Include:

🚚 Fast Delivery
✅ Authentic Products
🔒 Secure Payment
📞 Customer Support

Also include 2 CTA Buttons

Shop Products
Verify Product

Keep the same design language.

5. Shop by Brand

Create the complete section.

But make it disabled by default.

Admin can enable/disable it later.

No UI redesign.

6. Customer Reviews

Build the complete component.

Keep it hidden by default.

Admin can enable it later.

7. Why Choose Us

Instead of cards,

Create a premium full-width banner section.

Include:

Authentic Products
Trusted Brands
Fast Delivery
Customer Support

Maintain current design style.

8. Product Card Fix (Very Important)

Currently the Buy Now button gets cut off on some devices.

Fix every product card so:

Buy Now button is always fully visible.
Equal card heights.
Proper spacing.
Buttons never overflow.
No text clipping.
Images maintain aspect ratio.
Responsive on every screen width.

Do not redesign the cards.

Only fix responsiveness and layout issues.

9. Responsiveness

Fix all remaining responsive issues.

Ensure perfect display on:

320px
360px
375px
390px
412px
768px
1024px
Desktop

No overflow.

No clipped buttons.

No broken layouts.

10. Code Quality
Keep existing component structure.
Do not break routing.
Do not modify existing functionality.
Maintain current animations.
Clean responsive CSS.
No unnecessary libraries.
Preserve current UI exactly.


Fix all UI, UX, responsiveness, and routing issues on my website.

Current Issues:

1. Vercel Routing
- Home page works.
- Product pages show 404 NOT_FOUND when refreshed or opened directly.
- Fix routing permanently without breaking SEO or dynamic routes.

2. Product Cards
- "VIEW DETAIL" button text is getting cut and only "EW DETAIL" is visible.
- Ensure buttons always display full text.
- Make button width responsive.
- Prevent text clipping, overflow, or wrapping.
- Keep equal spacing between both buttons.

3. Responsive Layout
- Check every page on mobile, tablet, and desktop.
- Fix any overflow, broken alignment, uneven spacing, or inconsistent card heights.
- Ensure product cards have equal height and clean alignment.

4. Sticky Navbar
- Navbar should stay fixed.
- When user scrolls DOWN, hide the navbar with a smooth animation.
- When user scrolls UP, show the navbar again.
- On reaching the top, navbar should remain fully visible.
- Animation should be smooth without layout shift.

5. General UI Improvements
- Remove any text clipping.
- Fix button padding.
- Improve touch targets for mobile.
- Ensure all elements are perfectly responsive.
- Prevent horizontal scrolling.
- Optimize spacing and typography.

6. Verification
- Test every page.
- Test every product page.
- Test refresh on every route.
- Test on Android Chrome and desktop.
- Explain every change made and provide the final modified code for each updated file.