Replace the current Hero Section with a premium responsive image-only banner slider.

## Hero Banner

- Remove the old hero completely.
- Create a full-width responsive banner slider.
- The slider must use a fixed aspect ratio (for example 1920×1080 or configurable from Admin).
- The height must be calculated automatically from the width to preserve the aspect ratio.
- Never use a fixed pixel height.
- As the browser width changes, the height should scale proportionally.
- The banner should always maintain its original aspect ratio.

Example:

Desktop
1920 × 1080

Laptop
1600 × 900

Tablet
1200 × 675

Mobile
720 × 405

The aspect ratio must always remain identical.

## Image Rendering

Images must NEVER:

- crop
- zoom
- stretch
- blur
- lose quality

Always display the complete uploaded image.

Use responsive scaling that preserves the entire image.

## Banner Content

Image only.

Do NOT add:

- Title
- Subtitle
- Description
- CTA Button
- Overlay
- Gradient
- Text

Everything is already included inside the uploaded banner image.

## Slider

- Auto-slide every 6 seconds (editable from Admin).
- Infinite loop.
- Smooth transition.

Users can also navigate by:

- Mouse drag
- Touch swipe
- Horizontal swipe on mobile
- Previous/Next arrows
- Pagination dots

When the user starts dragging or swiping:

- Pause auto-slide.
- Continue from the current slide after interaction ends.

## Admin Panel

Create a Hero Slider section where the admin can:

- Enable/Disable slider
- Upload desktop banner
- Upload mobile banner
- Reorder banners (drag & drop)
- Delete banner
- Hide/Show banner

Slider Settings:

- Auto Slide
- Slide Duration (default 6 sec)
- Transition Speed
- Infinite Loop
- Show Arrows
- Show Dots

Also allow changing the banner aspect ratio (e.g. 16:9, 21:9, 3:1) from Admin.

## Responsiveness

Desktop → Desktop banner

Tablet → Scaled banner

Mobile → Mobile banner

No horizontal overflow.

No layout shift.

No cropping.

No blurry images.

Maintain perfect aspect ratio on every screen size.

## Performance

- Lazy-load images except the first one.
- Preload the first banner.
- Use optimized WebP images.
- Keep animations smooth (60 FPS).

The final result should look like the homepage banner of Amazon, MuscleBlaze, MyProtein, or Nike: a clean, full-width, responsive image slider where the banner scales proportionally with the screen width while always showing the complete image.