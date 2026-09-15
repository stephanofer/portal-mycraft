import { gsap } from "gsap";

function lockPageScroll() {
    const body = document.body;
    const page = document.documentElement;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - page.clientWidth;
    const paddingRight = parseFloat(getComputedStyle(body).paddingRight);
    const changes = [
        { element: page, property: "overflow", value: "hidden" },
        { element: body, property: "position", value: "fixed" },
        { element: body, property: "top", value: `${-scrollY}px` },
        { element: body, property: "left", value: `${-scrollX}px` },
        { element: body, property: "width", value: "100%" },
        { element: body, property: "overflow", value: "hidden" },
        { element: body, property: "padding-right", value: `${paddingRight + scrollbarWidth}px` },
    ];
    const previous = changes.map(({ element, property }) => ({
        element,
        property,
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
    }));

    changes.forEach(({ element, property, value }) => element.style.setProperty(property, value));

    return () => {
        previous.forEach(({ element, property, value, priority }) => {
            element.style.setProperty(property, value, priority);
        });
        window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    };
}

function isolateNavigation(shell: HTMLElement) {
    const background: HTMLElement[] = [];
    let branch: HTMLElement = shell;

    // Keep the existing header interactive and make only the surrounding page inert.
    while (branch.parentElement) {
        const parent: HTMLElement = branch.parentElement;
        for (const sibling of parent.children) {
            if (sibling instanceof HTMLElement && sibling !== branch && !sibling.inert) {
                sibling.inert = true;
                background.push(sibling);
            }
        }
        if (parent === document.body) break;
        branch = parent;
    }

    shell.setAttribute("role", "dialog");
    shell.setAttribute("aria-modal", "true");
    shell.setAttribute("aria-labelledby", "mobile-navigation-title");

    return () => {
        background.forEach((element) => { element.inert = false; });
        shell.removeAttribute("role");
        shell.removeAttribute("aria-modal");
        shell.removeAttribute("aria-labelledby");
    };
}

function getFocusableElements(shell: HTMLElement) {
    return Array.from(shell.querySelectorAll<HTMLElement>(
        "a[href], button, input, select, textarea, summary, [tabindex]",
    )).filter((element) =>
        element.tabIndex >= 0 &&
        !element.matches(":disabled") &&
        !element.closest("[inert]") &&
        element.getClientRects().length > 0 &&
        getComputedStyle(element).visibility !== "hidden",
    );
}

export function initializeMobileNavigation(root: HTMLElement) {
    const shell = root.closest<HTMLElement>("[data-site-navigation]");
    const header = root.closest<HTMLElement>("[data-site-header]");
    const trigger = root.querySelector<HTMLButtonElement>("[data-menu-trigger]");
    const label = root.querySelector<HTMLElement>("[data-menu-label]");
    const panel = root.querySelector<HTMLElement>("[data-menu-panel]");
    const sheet = root.querySelector<HTMLElement>("[data-menu-sheet]");
    const scrim = root.querySelector<HTMLElement>("[data-menu-scrim]");
    const topLine = root.querySelector<SVGPathElement>("[data-menu-line-top]");
    const bottomLine = root.querySelector<SVGPathElement>("[data-menu-line-bottom]");
    const scrollArea = root.querySelector<HTMLElement>("[data-menu-scroll]");
    const items = root.querySelectorAll<HTMLElement>("[data-menu-reveal]");

    if (!shell || !header || !trigger || !label || !panel || !sheet || !scrim || !topLine || !bottomLine || !scrollArea) return () => {};

    const media = gsap.matchMedia();

    media.add(
        {
            mobile: "(width < 64rem)",
            reducedMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
            if (!context.conditions?.mobile) return;

            const reducedMotion = Boolean(context.conditions.reducedMotion);
            const controller = new AbortController();
            const { signal } = controller;
            let state: "closed" | "opening" | "open" | "closing" = "closed";
            let unlockScroll: (() => void) | undefined;
            let restoreBackground: (() => void) | undefined;
            let pendingHref: string | undefined;
            let playheadTween: gsap.core.Tween | undefined;
            let panelTop: number | undefined;
            let resizeFrame = 0;

            trigger.hidden = false;

            const setPanelTop = (top: number) => {
                if (top === panelTop) return;
                panelTop = top;
                panel.style.setProperty("--mobile-menu-top", `${top}px`);
            };

            const schedulePanelBounds = () => {
                if (state === "closed" || resizeFrame) return;
                resizeFrame = requestAnimationFrame(() => {
                    resizeFrame = 0;
                    if (state !== "closed") {
                        setPanelTop(Math.max(0, header.getBoundingClientRect().bottom));
                    }
                });
            };

            const prepareMotion = () => {
                sheet.style.willChange = "transform";
                scrollArea.style.willChange = "transform";
                scrim.style.willChange = "opacity";
            };

            const releaseMotion = () => {
                sheet.style.removeProperty("will-change");
                scrollArea.style.removeProperty("will-change");
                scrim.style.removeProperty("will-change");
            };

            const updateTrigger = (expanded: boolean) => {
                trigger.setAttribute("aria-expanded", String(expanded));
                label.textContent = expanded ? "Cerrar" : "Menú";
            };

            const finishClose = () => {
                const wasActive = state !== "closed";
                const href = pendingHref;
                pendingHref = undefined;
                state = "closed";
                cancelAnimationFrame(resizeFrame);
                resizeFrame = 0;
                updateTrigger(false);
                panel.hidden = true;
                panelTop = undefined;
                panel.style.removeProperty("--mobile-menu-top");
                releaseMotion();
                restoreBackground?.();
                restoreBackground = undefined;
                unlockScroll?.();
                unlockScroll = undefined;

                if (href) {
                    window.location.assign(href);
                } else if (wasActive && root.isConnected) {
                    const focusTarget = matchMedia("(width < 64rem)").matches
                        ? trigger
                        : header.querySelector("a");
                    focusTarget?.focus({ preventScroll: true });
                }
            };

            // Linear tracks keep opposing transforms synchronized. The playhead owns easing.
            const animation = gsap.timeline({
                paused: true,
                defaults: { duration: 1, ease: "none" },
            });

            animation
                .fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1 }, 0)
                .fromTo(sheet, { yPercent: -100 }, { yPercent: 0 }, 0)
                // Counter-translation reveals stationary content instead of carrying it down.
                .fromTo(scrollArea, { yPercent: 100 }, { yPercent: 0 }, 0)
                .fromTo(topLine, { y: 0, rotation: 0, transformOrigin: "50% 50%" }, {
                    y: 3.5, rotation: 45,
                }, 0)
                .fromTo(bottomLine, { y: 0, rotation: 0, transformOrigin: "50% 50%" }, {
                    y: -3.5, rotation: -45,
                }, 0)
                .fromTo(items, { y: 6, autoAlpha: 0 }, {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.82,
                    stagger: 0.03,
                }, 0);

            const moveMenu = (expanded: boolean) => {
                playheadTween?.kill();
                playheadTween = undefined;

                const destination = expanded ? animation.duration() : 0;
                const distance = Math.abs(destination - animation.time()) / animation.duration();
                const complete = () => {
                    playheadTween = undefined;
                    if (expanded) {
                        state = "open";
                        releaseMotion();
                    } else {
                        finishClose();
                    }
                };

                if (reducedMotion || distance < 0.0001) {
                    animation.pause(destination, true);
                    complete();
                    return;
                }

                prepareMotion();
                playheadTween = animation.tweenTo(destination, {
                    duration: Math.max(0.08, (expanded ? 0.44 : 0.34) * Math.sqrt(distance)),
                    ease: "power2.out",
                    onComplete: complete,
                });
            };

            const openMenu = () => {
                if (state === "open" || state === "opening") return;
                const reopening = state === "closing";
                pendingHref = undefined;
                state = "opening";

                if (!reopening) {
                    // Read geometry before scroll locking writes to the document layout.
                    const top = Math.max(0, header.getBoundingClientRect().bottom);
                    unlockScroll = lockPageScroll();
                    setPanelTop(top);
                    panel.hidden = false;
                    restoreBackground = isolateNavigation(shell);
                    scrollArea.scrollTo({ top: 0, behavior: "instant" });
                }

                updateTrigger(true);
                trigger.focus({ preventScroll: true });

                moveMenu(true);
            };

            const closeMenu = (href?: string) => {
                if (state === "closed" || state === "closing") return;
                state = "closing";
                pendingHref = href;
                updateTrigger(false);

                moveMenu(false);
            };

            trigger.addEventListener("click", () => {
                if (state === "closed" || state === "closing") openMenu();
                else closeMenu();
            }, { signal });

            document.addEventListener("keydown", (event) => {
                if (state === "closed" || event.defaultPrevented) return;

                if (event.key === "Escape") {
                    event.preventDefault();
                    closeMenu();
                } else if (event.key === "Tab") {
                    const focusable = getFocusableElements(shell);
                    const first = focusable[0] ?? trigger;
                    const last = focusable.at(-1) ?? trigger;
                    const active = document.activeElement;

                    if (event.shiftKey && (active === first || !shell.contains(active))) {
                        event.preventDefault();
                        last.focus();
                    } else if (!event.shiftKey && (active === last || !shell.contains(active))) {
                        event.preventDefault();
                        first.focus();
                    }
                }
            }, { signal });

            document.addEventListener("focusin", (event) => {
                if (state !== "closed" && event.target instanceof Node && !shell.contains(event.target)) {
                    trigger.focus({ preventScroll: true });
                }
            }, { signal });

            shell.addEventListener("click", (event) => {
                if (state === "closed" || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                const link = event.target instanceof Element ? event.target.closest("a") : null;
                if (!link || link.hasAttribute("download")) return;

                if (link.target && link.target !== "_self") {
                    closeMenu();
                    return;
                }

                // Restore page scrolling before the browser follows an anchor or route.
                event.preventDefault();
                closeMenu(link.href);
            }, { signal });

            const resizeObserver = new ResizeObserver(schedulePanelBounds);
            resizeObserver.observe(header);
            window.addEventListener("resize", schedulePanelBounds, { signal });
            window.addEventListener("pagehide", () => {
                playheadTween?.kill();
                playheadTween = undefined;
                pendingHref = undefined;
                animation.pause(0, true);
                finishClose();
            }, { signal });

            return () => {
                controller.abort();
                resizeObserver.disconnect();
                playheadTween?.kill();
                playheadTween = undefined;
                pendingHref = undefined;
                animation.pause(0, true);
                finishClose();
                trigger.hidden = true;
            };
        },
        root,
    );

    return () => media.revert();
}
