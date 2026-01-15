/**
 * Master Portfolio Script
 * Handles: Injection, Path Fixing, Transitions, Smart Header, Education Dropdowns, & Dark Mode
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. CHECK THEME IMMEDIATELY (Before anything else to prevent flash)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Only run injection on pages inside the 'pages/' folder
    const isInPages = window.location.pathname.includes("/pages/");
    if (!isInPages) return;
    
    const pathToIndex = "../index.html"; 
    
    // Immediately remove initial hiding classes for smooth entry
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.remove("js-fade-in"); 
        mainContent.classList.remove("fade-out"); 
    }

    // --- FUNCTION: SMART HEADER (Hide on Scroll Down, Show on Scroll Up) ---
    function setupSmartHeader() {
        let lastScrollTop = 0;
        const delta = 5; // Minimum scroll distance to trigger
        const navbar = document.querySelector('nav');
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            let st = window.pageYOffset || document.documentElement.scrollTop;
            
            // Check if scroll is significant enough
            if (Math.abs(lastScrollTop - st) <= delta) return;
            
            // Scrolling Down and past the header area
            if (st > lastScrollTop && st > 100) {
                navbar.classList.add('nav-hidden');
            } else {
                // Scrolling Up
                navbar.classList.remove('nav-hidden');
            }
            
            // Prevent negative scroll values on mobile
            lastScrollTop = st <= 0 ? 0 : st; 
        }, { passive: true });
    }

    // --- FUNCTION: EDUCATION DROPDOWN TOGGLE ---
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

    // --- FUNCTION: DARK MODE TOGGLE ---
    function setupThemeToggle() {
        const toggleBtn = document.querySelector('.theme-toggle-btn');
        if (!toggleBtn) return;

        // Set initial icon based on current mode
        const icon = toggleBtn.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any link behavior
            document.body.classList.toggle('dark-mode');
            
            // Update Icon & Save Preference
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

    // --- CORE FETCH AND INJECTION LOGIC ---
    fetch(pathToIndex)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(data, "text/html");
            
            // Inject Font Awesome Link if missing in the current head
            const faLink = htmlDoc.querySelector('link[href*="font-awesome"]');
            if (faLink && !document.querySelector('link[href*="font-awesome"]')) {
                 document.head.appendChild(faLink.cloneNode());
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
            }

            // 1. Inject Navigation
            if (nav && placeholder) {
                const fixedNav = nav.cloneNode(true);
                const logo = fixedNav.querySelector("img");
                if (logo) logo.src = fixPath(logo.getAttribute('src'));
                
                fixedNav.querySelectorAll("a").forEach(link => {
                    link.setAttribute("href", fixPath(link.getAttribute("href")));
                    
                    // Don't apply fade transition to the theme toggle button
                    if (link.closest('.theme-toggle-btn')) return;

                    link.addEventListener("click", (e) => {
                        const current = window.location.pathname.split("/").pop();
                        const target = link.getAttribute("href").split("/").pop();
                        
                        if (current === target) { 
                            e.preventDefault(); 
                            return; 
                        }

                        e.preventDefault();
                        document.querySelector('main').classList.add("fade-out");
                        setTimeout(() => { window.location.href = link.getAttribute("href"); }, 300); 
                    });
                });
                placeholder.before(fixedNav); 
            }

            // 2. Inject Footer
            if (footer && mainContentElement) {
                const fixedFooter = footer.cloneNode(true);
                mainContentElement.after(fixedFooter);
            }
            
            if (placeholder) placeholder.remove();

            // 3. Active Link Highlighting
            const currentPage = window.location.pathname.split("/").pop(); 
            document.querySelectorAll("nav ul li a").forEach(link => {
                if (link.getAttribute("href").split("/").pop() === currentPage) {
                    link.classList.add("active");
                }
            });
            
            // --- INITIALIZE FEATURES AFTER INJECTION ---
            setupSmartHeader();
            setupEducationDropdowns();
            setupThemeToggle(); // Initialize Dark Mode logic
            
            document.body.style.visibility = 'visible';
        })
        .catch(err => {
            console.error("Layout Injection Failed:", err);
            document.body.style.visibility = 'visible';
        });
});