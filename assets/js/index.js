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

    // --- FUTURISTIC CURSOR (YOUR WORKING VERSION) ---
    function setupFuturisticCursor() {
        const dot = document.getElementById("cursor-dot");
        const ring = document.getElementById("cursor-ring");
        if (!dot || !ring) return;

        const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (!isFinePointer) return;

        // Make sure cursor NEVER blocks clicking
        dot.style.pointerEvents = "none";
        ring.style.pointerEvents = "none";

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let dotX = mouseX, dotY = mouseY;
        let ringX = mouseX, ringY = mouseY;

        const DOT_EASE = 0.28;
        const RING_EASE = 0.28;  // ✅ same speed = no slingshot


        let visible = false;

        function setPos(el, x, y) {
            el.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0)`;
        }

        // Start off-screen so it doesn't show in top-left
        setPos(dot, -100, -100);
        setPos(ring, -100, -100);

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!visible) {
                visible = true;
                dot.style.opacity = "1";
                ring.style.opacity = "1";
            }
        }, { passive: true });

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

        const hoverSelector = 'a, button, .btn, [role="button"], input, textarea, select, label';
        document.addEventListener("mouseover", (e) => {
            if (e.target.closest(hoverSelector)) document.body.classList.add("cursor-hover");
        });
        document.addEventListener("mouseout", (e) => {
            if (e.target.closest(hoverSelector)) document.body.classList.remove("cursor-hover");
        });

        document.addEventListener("mousedown", () => {
            document.body.classList.add("cursor-click");
            window.setTimeout(() => document.body.classList.remove("cursor-click"), 450);
        });

        function animate() {
            dotX += (mouseX - dotX) * DOT_EASE;
            dotY += (mouseY - dotY) * DOT_EASE;
            ringX += (mouseX - ringX) * RING_EASE;
            ringY += (mouseY - ringY) * RING_EASE;

            setPos(dot, dotX, dotY);
            setPos(ring, ringX, ringY);

            requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
    }

    // --- If NOT in /pages/ folder: enable features directly ---
    if (!isInPages) {
        setupSmartHeader();
        setupEducationDropdowns();
        setupThemeToggle();
        setupFuturisticCursor();
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
                        document.querySelector('main')?.classList.add("fade-out");
                        setTimeout(() => { window.location.href = href; }, 300);
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

            document.body.style.visibility = 'visible';
        })
        .catch(err => {
            console.error("Layout Injection Failed:", err);
            setupSmartHeader();
            setupEducationDropdowns();
            setupThemeToggle();
            setupFuturisticCursor();
            document.body.style.visibility = 'visible';
        });
});
