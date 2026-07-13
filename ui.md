You are a senior React/Next.js frontend engineer.

CRITICAL BUG (HIGH PRIORITY)

Desktop navigation works perfectly.

The bug exists ONLY in the mobile drawer.

Current behavior:
- Home works.
- All Products works.
- But submenu items such as Protein, Whey Protein, Mass Gainer, Creatine, Pre Workout, BCAA, etc. do absolutely nothing when clicked.
- There is no navigation.
- The UI must remain exactly the same.

DO NOT GUESS THE PROBLEM.

You must debug the project until the exact root cause is found.

Perform these checks one by one:

1. Inspect how the mobile drawer is built.
2. Compare desktop navigation logic with mobile navigation logic.
3. Verify every submenu item has the correct Link/to/href.
4. Verify route names exactly match the router configuration.
5. Ensure submenu items are rendered as Link components instead of plain div/span/button.
6. Check whether onClick is preventing navigation.
7. Search the entire project for:
   - preventDefault()
   - stopPropagation()
   - pointer-events
   - z-index
   - overflow
   - touch-action
8. Check whether an invisible overlay/backdrop is blocking touch events.
9. Check whether the submenu container has pointer-events:none.
10. Check if event bubbling is preventing Link clicks.
11. Check whether the drawer component intercepts clicks.
12. Check Button → Link nesting and Link → Button nesting.
13. Check touch events on mobile devices.
14. Check browser console for JavaScript errors.
15. Check Network tab for failed route requests.
16. Verify every submenu route actually exists.
17. Verify the router is correctly initialized.
18. Verify no state update immediately closes/re-renders the drawer before navigation.
19. Test every submenu item individually.

DO NOT USE WORKAROUNDS.

Find the REAL ROOT CAUSE.

After fixing:

- Every submenu item must navigate correctly.
- Navigation must work on desktop, tablet, and mobile.
- Drawer must close automatically after successful navigation.
- Scroll position must reset to top.
- No console errors.
- No warnings.
- No broken routes.

Finally provide:

1. Root cause.
2. Why it happened.
3. Files modified.
4. Exact code changes.
5. How you verified the fix.
6. Confirmation that every menu item was manually tested.

Do not stop until the issue is completely fixed and verified.