/**
 * Master Portfolio Script
 * Handles: Injection, Path Fixing, Transitions, Smart Header, Education Dropdowns, Dark Mode, & Futuristic Cursor
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1) CHECK THEME IMMEDIATELY (prevents flash)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Only run injection on pages inside the 'pages/' folder
    const isInPages = window.location.pathname.includes("/pages/");
    const pathToIndex = isInPages ? "../index.html" : "index.html";

    // Remove initial hiding classes for smooth entry
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.remove("js-fade-in");
        mainContent.classList.remove("fade-out");
    }

    // --- SMART HEADER ---
    function setupSmartHeader() {
        let lastScrollTop = 0;
        const delta = 5;
        const navbar = document.querySelector('nav');
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            let st = window.pageYOffset || document.documentElement.scrollTop;
            if (Math.abs(lastScrollTop - st) <= delta) return;

            if (st > lastScrollTop && st > 100) {
                navbar.classList.add('nav-hidden');
            } else {
                navbar.classList.remove('nav-hidden');
            }

            lastScrollTop = st <= 0 ? 0 : st;
        }, { passive: true });
    }

    // --- EDUCATION DROPDOWNS ---
    function setupEducationDropdowns() {
        const toggleButtons = document.querySelectorAll('.dropdown-toggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.toggle('active');
                }
            });
        });
    }

    // --- DARK MODE TOGGLE ---
    function setupThemeToggle() {
        const toggleBtn = document.querySelector('.theme-toggle-btn');
        if (!toggleBtn) return;

        const icon = toggleBtn.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.toggle('dark-mode');

            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // --- FUTURISTIC CURSOR (FIXED: Minimal & Performant) ---
    function setupFuturisticCursor() {
        const dot = document.getElementById("cursor-dot");
        const ring = document.getElementById("cursor-ring");
        if (!dot || !ring) return;

        // Only run on fine pointer devices (mouse)
        const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!isFinePointer) return;

        // Make sure cursor NEVER blocks clicking
        dot.style.pointerEvents = "none";
        ring.style.pointerEvents = "none";

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let dotX = mouseX, dotY = mouseY;
        let ringX = mouseX, ringY = mouseY;

        // Tweak ease for responsiveness (higher = faster)
        const DOT_EASE = 1.0; // Instant follow
        const RING_EASE = 1.0; // Absolutely zero lag (removes trailing slingshot entirely)

        let visible = false;

        // Initial off-screen position
        function setPos(el, x, y) {
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
        }
        setPos(dot, -100, -100);
        setPos(ring, -100, -100);

        // 1) TRACK MOUSE
        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!visible) {
                visible = true;
                dot.style.opacity = "1";
                ring.style.opacity = "1";
            }
        }, { passive: true });

        // 2) VISIBILITY HANDLERS
        window.addEventListener("mouseleave", () => {
            dot.style.opacity = "0";
            ring.style.opacity = "0";
            visible = false;
        });

        window.addEventListener("mouseenter", () => {
            dot.style.opacity = "1";
            ring.style.opacity = "1";
            visible = true;
        });

        // 3) HOVER & CLICK INTERACTIONS
        const hoverSelector = 'a, button, .btn, [role="button"], input, textarea, select, label';

        let magneticCenterX = 0;
        let magneticCenterY = 0;
        let isMagnetic = false;
        let hoverTarget = null;

        document.addEventListener("mouseover", (e) => {
            const target = e.target.closest(hoverSelector);
            if (target) {
                document.body.classList.add("cursor-hover");
                hoverTarget = target;
                isMagnetic = true;
            }
        });

        document.addEventListener("mouseout", (e) => {
            const target = e.target.closest(hoverSelector);
            if (target) {
                document.body.classList.remove("cursor-hover");
                hoverTarget = null;
                isMagnetic = false;
            }
        });

        // Click Scale Effect (Minimal)
        document.addEventListener("mousedown", () => {
            document.body.classList.add("cursor-active");
        });

        document.addEventListener("mouseup", () => {
            document.body.classList.remove("cursor-active");
        });

        // 4) ANIMATION LOOP
        function animate() {
            // Lerp logic
            dotX += (mouseX - dotX) * DOT_EASE;
            dotY += (mouseY - dotY) * DOT_EASE;

            let targetRingX = mouseX;
            let targetRingY = mouseY;

            if (isMagnetic && hoverTarget) {
                const rect = hoverTarget.getBoundingClientRect();
                magneticCenterX = rect.left + rect.width / 2;
                magneticCenterY = rect.top + rect.height / 2;

                // Magnetically pull the ring to the center of the hovered element,
                // but let it follow the mouse slightly for a tactile feel
                targetRingX = magneticCenterX + (mouseX - magneticCenterX) * 0.1;
                targetRingY = magneticCenterY + (mouseY - magneticCenterY) * 0.1;
            }

            ringX += (targetRingX - ringX) * RING_EASE;
            ringY += (targetRingY - ringY) * RING_EASE;

            // Use left/top so CSS transform can handle scale uniformly
            dot.style.left = `${dotX}px`;
            dot.style.top = `${dotY}px`;

            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;

            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
        requestAnimationFrame(animate);
    }

    // --- SETUP INTERACTIVE TILT (For hero images) ---
    function setupInteractiveTilt() {
        const cards = document.querySelectorAll("[data-tilt]");
        if (!cards.length) return;

        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

        cards.forEach((card) => {
            // Remove old listeners to avoid duplicates during SPA routing
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            let raf = null;
            newCard.style.setProperty("--rx", "0deg");
            newCard.style.setProperty("--ry", "0deg");
            newCard.style.setProperty("--mx", "50%");
            newCard.style.setProperty("--my", "50%");

            function onMove(e) {
                const rect = newCard.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                const tiltY = clamp((x - 0.5) * 12, -6, 6);
                const tiltX = clamp((0.5 - y) * 12, -6, 6);

                const mx = `${Math.round(x * 100)}%`;
                const my = `${Math.round(y * 100)}%`;

                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    newCard.style.setProperty("--rx", `${tiltX}deg`);
                    newCard.style.setProperty("--ry", `${tiltY}deg`);
                    newCard.style.setProperty("--mx", mx);
                    newCard.style.setProperty("--my", my);
                });
            }

            function onEnter() {
                newCard.classList.add("is-tilting");
            }

            function onLeave() {
                newCard.classList.remove("is-tilting");
                newCard.style.setProperty("--rx", "0deg");
                newCard.style.setProperty("--ry", "0deg");
                newCard.style.setProperty("--mx", "50%");
                newCard.style.setProperty("--my", "50%");
            }

            newCard.addEventListener("mousemove", onMove);
            newCard.addEventListener("mouseenter", onEnter);
            newCard.addEventListener("mouseleave", onLeave);
        });
    }

    // --- If NOT in /pages/ folder: enable features directly ---
    if (!isInPages) {
        setupSmartHeader();
        setupEducationDropdowns();
        setupThemeToggle();
        setupFuturisticCursor();
        setupInteractiveTilt();
        document.body.style.visibility = 'visible';
        return;
    }

    // --- CORE FETCH AND INJECTION LOGIC (only for /pages/) ---
    fetch(pathToIndex)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(data, "text/html");

            // Inject Font Awesome Link if missing in the current head
            const faLink = htmlDoc.querySelector('link[href*="font-awesome"]');
            if (faLink && !document.querySelector('link[href*="font-awesome"]')) {
                document.head.appendChild(faLink.cloneNode(true));
            }

            const nav = htmlDoc.querySelector("nav");
            const footer = htmlDoc.querySelector("footer");
            const mainContentElement = document.querySelector("main");
            const placeholder = document.getElementById("header-footer");

            // Path Fixer logic for relative directory navigation
            const fixPath = (url) => {
                if (!url) return url;
                if (url.startsWith("assets/") || url === "index.html") return "../" + url;
                if (url.startsWith("pages/")) return url.split('/').pop();
                return url;
            };

            // ✅ Ensure cursor exists on every /pages/ file
            if (!document.getElementById("cursor-dot")) {
                const dot = document.createElement("div");
                dot.id = "cursor-dot";
                document.body.prepend(dot);
            }
            if (!document.getElementById("cursor-ring")) {
                const ring = document.createElement("div");
                ring.id = "cursor-ring";
                document.body.prepend(ring);
            }

            // 1) Inject Navigation
            if (nav && placeholder) {
                const fixedNav = nav.cloneNode(true);
                const logo = fixedNav.querySelector("img");
                if (logo) logo.src = fixPath(logo.getAttribute('src'));

                fixedNav.querySelectorAll("a").forEach(link => {
                    link.setAttribute("href", fixPath(link.getAttribute("href")));

                    link.addEventListener("click", (e) => {
                        const href = link.getAttribute("href");
                        if (!href) return;

                        // allow new tab / modified clicks
                        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

                        const current = window.location.pathname.split("/").pop();
                        const target = href.split("/").pop();

                        if (current === target) {
                            e.preventDefault();
                            return;
                        }

                        e.preventDefault();
                        const currentMain = document.querySelector('main');
                        if (currentMain) currentMain.classList.add("fade-out");

                        setTimeout(() => {
                            fetch(href)
                                .then(res => res.text())
                                .then(html => {
                                    const parser = new DOMParser();
                                    const doc = parser.parseFromString(html, "text/html");

                                    // Update Title
                                    document.title = doc.title;

                                    // Load new CSS if any
                                    doc.querySelectorAll('link[rel="stylesheet"]').forEach(newLink => {
                                        if (!document.querySelector(`link[href="${newLink.getAttribute('href')}"]`)) {
                                            document.head.appendChild(newLink.cloneNode(true));
                                        }
                                    });

                                    // Remove everything in body EXCEPT nav, footer, cursors, and the master script
                                    Array.from(document.body.childNodes).forEach(node => {
                                        if (node.nodeType === Node.ELEMENT_NODE) {
                                            if (node.tagName === 'NAV' || 
                                                node.tagName === 'FOOTER' || 
                                                node.id === 'cursor-dot' || 
                                                node.id === 'cursor-ring' ||
                                                (node.tagName === 'SCRIPT' && node.src.includes('index.js'))) {
                                                return; // Keep
                                            }
                                        }
                                        node.remove();
                                    });

                                    // Insert new content
                                    const footer = document.querySelector('footer');
                                    Array.from(doc.body.childNodes).forEach(node => {
                                        if (node.nodeType === Node.ELEMENT_NODE) {
                                            if (node.id === 'header-footer' || 
                                                node.id === 'cursor-dot' || 
                                                node.id === 'cursor-ring' || 
                                                (node.tagName === 'SCRIPT' && node.src.includes('index.js'))) {
                                                return; // Skip duplicates
                                            }
                                        }
                                        if (footer) {
                                            document.body.insertBefore(node.cloneNode(true), footer);
                                        } else {
                                            document.body.appendChild(node.cloneNode(true));
                                        }
                                    });

                                    // Execute inline scripts manually
                                    document.body.querySelectorAll('script:not([src])').forEach(oldScript => {
                                        const newScript = document.createElement('script');
                                        newScript.textContent = oldScript.textContent;
                                        oldScript.replaceWith(newScript);
                                    });

                                    // Update URL and nav active state
                                    window.history.pushState({}, '', href);
                                    document.querySelectorAll("nav ul li a").forEach(navLink => {
                                        if (navLink.getAttribute("href").split("/").pop() === target) {
                                            navLink.classList.add("active");
                                        } else {
                                            navLink.classList.remove("active");
                                        }
                                    });

                                    // Re-initialize features
                                    setupEducationDropdowns();
                                    setupInteractiveTilt();

                                    // Fade in new main content
                                    setTimeout(() => {
                                        const newMain = document.querySelector('main');
                                        if (newMain) {
                                            newMain.classList.remove("js-fade-in");
                                            newMain.classList.remove("fade-out");
                                        }
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }, 50);

                                })
                                .catch(() => {
                                    window.location.href = href;
                                });
                        }, 400);
                    });
                });

                placeholder.before(fixedNav);
            }

            // 2) Inject Footer
            if (footer && mainContentElement) {
                const fixedFooter = footer.cloneNode(true);
                mainContentElement.after(fixedFooter);
            }

            if (placeholder) placeholder.remove();

            // 3) Active Link Highlighting
            const currentPage = window.location.pathname.split("/").pop();
            document.querySelectorAll("nav ul li a").forEach(link => {
                if (link.getAttribute("href").split("/").pop() === currentPage) {
                    link.classList.add("active");
                }
            });

            // --- INITIALIZE FEATURES AFTER INJECTION ---
            setupSmartHeader();
            setupEducationDropdowns();
            setupThemeToggle();
            setupFuturisticCursor();
            setupInteractiveTilt();

            document.body.style.visibility = 'visible';
        })
        .catch(err => {
            console.error("Layout Injection Failed:", err);
            setupSmartHeader();
            setupEducationDropdowns();
            setupThemeToggle();
            document.body.style.visibility = 'visible';
        });

    // --- HANDLE BROWSER BACK BUTTON ---
    window.addEventListener("popstate", () => {
        window.location.reload();
    });
});