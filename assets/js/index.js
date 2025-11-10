document.addEventListener("DOMContentLoaded", () => {
    // Only run injection on pages inside the 'pages/' folder
    const isInPages = window.location.pathname.includes("/pages/");
    if (!isInPages) {
        return; 
    }
    
    // Path to the source file (index.html) is always '../index.html' from within 'pages/'
    const pathToIndex = "../index.html"; 
    
    // CRITICAL FIX: Immediately remove the initial hiding class for the smooth fade-in
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.classList.remove("js-fade-in"); 
        mainContent.classList.remove("fade-out"); 
    }

    // Fetch the index.html content (header and footer)
    fetch(pathToIndex)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(data, "text/html");
            
            // Inject Font Awesome Link 
            const fontAwesomeLink = htmlDoc.querySelector('link[href*="font-awesome"]');
            if (fontAwesomeLink && !document.querySelector('link[href*="font-awesome"]')) {
                 document.head.appendChild(fontAwesomeLink.cloneNode());
            }
            
            const nav = htmlDoc.querySelector("nav");
            const footer = htmlDoc.querySelector("footer");
            
            const mainContentElement = document.querySelector("main");
            const placeholder = document.getElementById("header-footer");

            // Function to correctly fix paths from 'pages/' to the root assets/pages
            const fixPath = (url) => {
                // 1. Fix links to ASSETS and the HOME page (which is outside /pages/)
                if (url.startsWith("assets/") || url === "index.html") {
                    return "../" + url;
                }
                
                // 2. Fix links to other pages (e.g., pages/about.html) to be relative filenames
                if (url.startsWith("pages/")) {
                    return url.split('/').pop(); 
                }
                
                return url;
            }

            // 1. Inject Navigation Bar
            if (nav && placeholder) {
                const fixedNav = nav.cloneNode(true);

                // Fix logo path
                const logo = fixedNav.querySelector("img");
                if (logo) logo.src = fixPath(logo.getAttribute('src'));
                
                // Fix link paths and handle transition
                const links = fixedNav.querySelectorAll("a");
                links.forEach(link => {
                    link.setAttribute("href", fixPath(link.getAttribute("href")));
                    
                    // --- Transition and click handler logic ---
                    let isNavigating = false;
                    link.addEventListener("click", (e) => {
                        const current = window.location.pathname.split("/").pop();
                        const target = link.getAttribute("href").split("/").pop();
                        
                        if (current === target || isNavigating) {
                            e.preventDefault();
                            return;
                        }

                        e.preventDefault();
                        isNavigating = true;
                        
                        document.querySelector('main').classList.add("fade-out");
                        
                        setTimeout(() => {
                            window.location.href = link.getAttribute("href");
                        }, 300); 
                    });
                });
                
                placeholder.before(fixedNav); 
            }

            // 2. Inject Footer
            if (footer && mainContentElement) {
                const fixedFooter = footer.cloneNode(true);
                mainContentElement.after(fixedFooter);
            }
            
            // 3. Remove Placeholder
            if (placeholder) {
                 placeholder.remove();
            }

            // Highlight active link 
            const currentPage = window.location.pathname.split("/").pop(); 
            const allLinks = document.querySelectorAll("nav ul li a");
            allLinks.forEach(link => {
                const linkPage = link.getAttribute("href").split("/").pop();
                
                // Set active class
                if (linkPage === currentPage) {
                    link.classList.add("active");
                } else {
                    link.classList.remove("active");
                }
            });
            
            // CRITICAL FIX: Make the body visible only after everything has been injected and styled
            document.body.style.visibility = 'visible';

        })
        .catch(err => {
            console.error("Failed to load header/footer:", err);
            // Fallback: If injection fails, at least make the content visible
            document.body.style.visibility = 'visible';
        });
});