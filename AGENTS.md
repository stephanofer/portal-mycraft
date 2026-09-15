## Network Minecraft

Tenemos por aca un proyecto que basicametne sera para una Network de minecraft y lo que queremos realizar con este proyecto es lo siguiente

1. Dar visibilidad a la Network de minecraft para poder posicionaros correctamene cuando busquen la network en los motores de busqueda
2. Queremos que todo los enlances se puedan encontrar en este sitio, y se pueda navegar por los distintos apartados del sitio correctamente
3. Obviamente queremos tener las mejores User Interfaces y el mejor User Experience en todos los sitios que realizaremos
4. Con respecto a todo lo que son animaciones recuerda que esto es un proyecto profesional empresarial lo que quiere decir que las animaciones deben ser professionales, sutiles, utilizando toda la teoria de las animaciones, con duraciones cortas, smooths, suaves, visualmente hermosas que den ganas de ver esas animaciones que le de una experiencia profunda al sitio queremos tener un sitio profesional, con animaciones sutiles pero visualmetne hermosas con una corta correcta duracion

## Non negotiables

- Keep in mind that we’re using pnpm for this project
- Remember that we’re using Tailwind CSS in this project, so avoid writing custom CSS unless it’s genuinely necessary. Custom CSS makes sense when implementing the same thing with Tailwind 4.3.3 would be excessively complex or impractical. For everything else, please use Tailwind properly and consistently. 
- Keep in mind that we're using GSAP for this project 3.15.0
- No delegues a subagentes hacelo todo en el mismo chat

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Architecture

Use Astro's filesystem routing with a feature-scoped architecture. Organize code by what the product does, not by component size or technical pattern. Create directories only when they have a concrete use; do not add speculative layers.

```text
src/
├── assets/            # Build-processed fonts, icons, and images
├── components/
│   ├── ui/            # Domain-agnostic reusable primitives
│   └── site/          # Site-wide header, footer, and navigation
├── features/          # Product capabilities and page-specific sections
│   └── <feature>/
│       ├── components/
│       ├── animations/
│       ├── data/
│       ├── services/
│       └── types.ts
├── layouts/           # Shared document and page shells
├── content/           # Structured editorial content
├── lib/               # Cross-cutting infrastructure and utilities
├── pages/             # Routes and page composition only
├── styles/            # Global styles and design tokens
├── content.config.ts  # Content collection loaders and schemas
└── env.d.ts           # Environment types
```

Only create the optional directories shown inside a feature when needed.

### Responsibilities

- Keep `src/pages/` thin: resolve route data and compose layouts and features. Do not place substantial UI or business logic there.
- Keep feature-specific components, types, data access, and animations together under `src/features/<feature>/`.
- Move a component to `components/ui/` only when it is reused across features and has no domain knowledge.
- Put permanent site chrome in `components/site/` and shared page structure in `layouts/`.
- Keep component-specific styles and scripts colocated. Reserve `styles/` for global CSS, Tailwind configuration, and design tokens.
- Store assets that Astro should process in `src/assets/`. Use `public/` only for files that must be copied unchanged, such as `robots.txt`, favicons, and manifests.
- Use Content Collections with schemas for repeated structured content. Prefer build-time collections unless freshness requires live data.
- Keep types local to their feature. Promote them only when multiple independent scopes share the same contract.

### Dependency Direction

```text
pages -> layouts + features + components
layouts -> components + lib
features -> components + lib + assets
components/ui -> no feature dependencies
```

- Features must not import another feature's internals. Compose features at the page level or extract a genuinely shared contract.
- Avoid generic dumping grounds such as `helpers`, `common`, or global `types`.
- Prefer explicit imports through the `@/*` alias.

### Rendering And Interactivity

- Use `.astro` components by default to ship static HTML with no client runtime.
- Add browser JavaScript only when behavior requires it. Keep scripts scoped and colocated with their owning component or feature.
- Treat framework components as isolated client islands. Choose `client:load`, `client:idle`, `client:visible`, or `client:media` according to when interaction is required; do not hydrate by default.
- Use server rendering, server islands, or live collections only when request-time freshness or personalization requires them. Keep the same feature boundaries regardless of rendering mode.
- Preserve strict TypeScript and validate external or content data at system boundaries.
- Prefer the smallest correct abstraction. Extract shared code after real reuse appears, not in anticipation of it.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
