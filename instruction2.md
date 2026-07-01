# Production Final QA & Auto Fix

Perform a complete production-level review of the entire project before deployment.

## Code Review

* Scan every file in the project.
* Detect and fix all build errors.
* Detect and fix all runtime errors.
* Detect and fix all console errors and warnings.
* Remove unused code, imports, files, and dependencies.
* Ensure there are no broken references.

## UI / UX

* Review every page.
* Fix layout issues.
* Fix spacing, alignment, typography, and responsiveness.
* Ensure consistent colors, buttons, icons, and animations.
* Verify mobile, tablet, and desktop layouts.

## Functionality

* Test every button, link, form, navigation item, modal, dropdown, and interaction.
* Verify image loading.
* Verify all product pages.
* Verify the admin panel.
* Ensure CRUD operations (Create, Read, Update, Delete) work correctly.
* Verify authentication and route protection.

## Performance

* Optimize images.
* Improve loading speed.
* Remove unnecessary re-renders.
* Optimize JavaScript and CSS.
* Ensure there are no memory leaks.

## Security

* Validate and sanitize all inputs.
* Check authentication.
* Verify authorization.
* Protect admin routes.
* Review environment variables.
* Check for exposed secrets.
* Apply OWASP best practices where applicable.

## SEO

* Verify page titles.
* Verify meta descriptions.
* Verify favicon.
* Verify Open Graph metadata.
* Check sitemap and robots.txt if applicable.

## Accessibility

* Verify keyboard navigation.
* Verify image alt text.
* Verify color contrast.
* Verify form labels.

## Final Testing

* Test the complete application as if you were an end user.
* Fix every issue that you discover.
* Continue testing until no critical issues remain.

## Important Rules

* Do not change the design unless required to fix a bug.
* Do not remove any existing functionality.
* Do not add new features unless they are required to resolve an issue.
* Do not automatically open Chrome or any browser.
* Do not perform browser automation or screen interaction unless I explicitly request it.

## Final Report

After completion, provide:

* All issues found.
* All fixes applied.
* Any remaining recommendations.
* Confirmation that the project is production-ready.
