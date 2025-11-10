document.addEventListener("DOMContentLoaded", () => {
    const isInPages = window.location.pathname.includes("/pages/");
    const pathToIndex = isInPages ? "../index.html" : "index.html";
    
    // ✅ Ensure the page content fades in immediately upon DOM load
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.remove("fade-out");
    }

    // --- ICON AND GLOBAL CSS INJECTION ---
    const head = document.head;
    if (!document.querySelector('link[href*="index.css"]')) {
        const indexCss = document.createElement("link");
        indexCss.rel = "stylesheet";
        indexCss.href = isInPages ? "../assets/css/index.css" : "assets/css/index.css";
        head.appendChild(indexCss);
    }
    // -------------------------------------

    // Fetch header and footer from index.html
    fetch(pathToIndex)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(data, "text/html");
            
            // ⭐️ FIX: Clone and inject Font Awesome link into the current page's head
            const fontAwesomeLink = htmlDoc.querySelector('link[href*="font-awesome"]');
            if (fontAwesomeLink && !document.querySelector('link[href*="font-awesome"]')) {
                 document.head.appendChild(fontAwesomeLink.cloneNode());
            }
            
            const nav = htmlDoc.querySelector("nav");
            const footer = htmlDoc.querySelector("footer");
            
            const mainContentElement = document.querySelector("main");
            const placeholder = document.getElementById("header-footer");

            // --- Injection Logic ---
            
            // 1. Inject the fixed Navigation Bar
            if (nav && placeholder) {
                const fixedNav = nav.cloneNode(true);

                // Fix logo path
                const logo = fixedNav.querySelector("img");
                if (logo) logo.src = isInPages ? "../assets/img/logo.png" : "assets/img/logo.png";
                
                // Fix link paths and handle transition
                const links = fixedNav.querySelectorAll("a");
                links.forEach(link => {
                    let href = link.getAttribute("href");
                    
                    if (isInPages && !href.startsWith("../") && href.startsWith("pages/")) {
                        link.setAttribute("href", "../" + href);
                    } else if (!isInPages && href.startsWith("pages/")) {
                         // No change needed for index.html links
                    }
                    
                    // Prevent multiple clicks issue and handle transition
                    let isNavigating = false;
                    link.addEventListener("click", (e) => {
                        const current = window.location.pathname.split("/").pop() || 'index.html';
                        const target = href.split("/").pop();
                        
                        if (current === target || isNavigating) {
                            e.preventDefault();
                            return;
                        }

                        e.preventDefault();
                        isNavigating = true;
                        
                        document.querySelector('main').classList.add("fade-out");

                        setTimeout(() => {
                            window.location.href = link.href;
                        }, 300); 
                    });
                });
                
                placeholder.before(fixedNav); 
            }

            // 2. Inject the fixed Footer
            if (footer && mainContentElement) {
                const fixedFooter = footer.cloneNode(true);
                const socialLinks = fixedFooter.querySelectorAll('.social-links a');

                mainContentElement.after(fixedFooter);
            }
            
            // 3. Remove the Placeholder
            if (placeholder) {
                 placeholder.remove();
            }

            // Highlight active link (kept the original logic)
            const currentPage = window.location.pathname.split("/").pop() || 'main.html';
            const allLinks = document.querySelectorAll("nav ul li a");
            allLinks.forEach(link => {
                const linkPage = link.getAttribute("href").split("/").pop();
                if (linkPage === currentPage) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            });
        })
        .catch(err => console.error("Failed to load header/footer:", err));
});

window.onload = function() {
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.remove("fade-out");
    }
};