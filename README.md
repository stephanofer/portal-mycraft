# Portal Mycraft Network

Astro website for the Minecraft network, deployed as static assets on Cloudflare Workers.

## Development

Use pnpm and Node.js 22.12 or newer.

TypeScript stays on 6.x because the current Astro checker requires its JavaScript compiler API. Sharp is an explicit dependency for build-time image optimization.

```sh
pnpm install
pnpm astro dev --background
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
pnpm check
pnpm build
```

## Architecture

- `src/pages/index.astro`: homepage composition, including feature content passed through named slots.
- `src/layouts/SiteLayout.astro`: document, metadata, shared header and footer.
- `src/components/site/`: brand, header and responsive navigation. `MobileNavigation.astro` owns the full-screen menu markup; `mobile-navigation.ts` owns its GSAP timeline and modal lifecycle.
- `src/components/ui/`: domain-independent icons shared by site chrome and features.
- `src/features/home/`: hero, entrance animation and community invitation.
- `src/features/play/`: connection controls, joining instructions, server configuration and MCStatus integration.
- `src/lib/site.ts`: shared brand metadata and community URL.
- `src/styles/global.css`: Tailwind design tokens and global foundations.

## Configuration

Edit `src/features/play/data/server.ts` to change the address, status endpoint edition, edition label or supported versions. The initial Java version range comes from the server's advertised MOTD; it is a content value, not the proxy software version returned by the API.

Edit `src/lib/site.ts` to replace the provisional Discord invitation and update site metadata.

Set `SITE_URL` to the final public website origin in the build environment to enable canonical and Open Graph URLs:

```sh
SITE_URL=https://your-domain.example pnpm build
```

## Runtime behavior

- Astro generates static HTML. The hero uses build-optimized WebP variants, explicit dimensions and high-priority loading.
- Header and mobile menu reuse `src/features/play/components/ServerConnection.astro`: the same amber address button with the compact player count underneath. Both instances share one browser request to MCStatus v2. Responses are validated; failed requests are distinct from an offline server. The page passes these controls through layout and header slots, keeping site components independent of the play feature.
- Status requests time out after eight seconds. Refreshes are at least 60 seconds apart, respect the API cache expiry and pause while the tab is hidden. The API's cached player count is not instantaneous.
- Clipboard controls announce success and expose a selectable address if the Clipboard API is unavailable or blocked.
- Mobile navigation keeps the original header in place and expands below its measured bottom edge to fill the remaining viewport. The same button toggles between “Menú” and “Cerrar”. A reusable GSAP timeline synchronizes opposing panel/content translations, revealing content close to its resting position. `tweenTo()` controls entry and exit with independent durations (440 ms / 340 ms) and ease-out curves; interrupted transitions continue from their current position. Temporary `will-change` hints apply only during motion, and geometry reads are batched before layout writes or on resize. While open, the shared navigation wrapper acts as a modal: surrounding content is inert, keyboard focus stays within the header and panel, Escape closes the menu, and background scrolling is locked and restored on close. It closes when switching to desktop or changing motion preferences, and skips animation with reduced motion enabled. A native `details` fallback provides navigation without JavaScript.
- GSAP entrance animations respect reduced-motion preferences. Content is visible before JavaScript; the main heading and hero image are not hidden for an entrance effect.

## Manual review

Review the page at mobile, tablet and desktop widths. Check the mobile menu with keyboard and touch, anchor navigation, clipboard success and denial, the offline/API-error states, reduced motion and JavaScript disabled. Confirm the final Discord invitation and supported Minecraft versions before publishing.

For the expanded menu, review opening, closing and reopening during an unfinished animation, Escape, Tab navigation across the shared header and panel, return of focus to the trigger, scrolling on a short landscape viewport and switching to desktop while the menu is open. Check the first opening as well as repeated openings on a physical phone. Confirm that the panel starts exactly below the original header, the address and player count match desktop styling, clipboard success and manual fallback work inside the menu, in-page links navigate after the exit animation and closing preserves the page's previous scroll position.
