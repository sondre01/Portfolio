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

    // Inject global features (progress bar and floating AI widget) immediately on page load
    injectGlobalFeatures();

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

    // --- CUSTOM CURSOR HAS BEEN MOVED TO NATIVE CSS ---
    // (See index.css for the responsive SVG cursor styles)

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

    // --- SEARCH TOGGLE ---
    function setupSearchToggle() {
        const searchToggleBtn = document.getElementById('search-toggle-btn');
        const searchUiContainer = document.getElementById('search-ui');
        const closeSearchBtn = document.getElementById('close-search-btn');
        const searchInput = document.getElementById('ai-search-input');

        if (!searchToggleBtn || !searchUiContainer) return;

        function openSearch() {
            searchUiContainer.classList.add('active');
            setTimeout(() => searchInput && searchInput.focus(), 300); // Focus after animation
        }

        function closeSearch() {
            searchUiContainer.classList.remove('active');
        }

        searchToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (searchUiContainer.classList.contains('active')) {
                closeSearch();
            } else {
                openSearch();
            }
        });

        if (closeSearchBtn) {
            closeSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeSearch();
            });
        }
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchUiContainer.classList.contains('active')) {
                closeSearch();
            }
        });
    }

    // --- If NOT in /pages/ folder: enable features directly ---
    if (!isInPages) {
        setupSmartHeader();
        setupEducationDropdowns();
        setupThemeToggle();
        setupSearchToggle();
        setupInteractiveTilt();
        document.body.style.visibility = 'visible';
        return;
    }

    // --- CORE FETCH AND INJECTION LOGIC (only for /pages/) ---
    fetch(pathToIndex)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            let htmlDoc = parser.parseFromString(data, "text/html");

            // If we got redirected on Vercel (nav is missing), fallback to the get-index rewrite route
            if (!htmlDoc.querySelector("nav")) {
                return fetch(isInPages ? "../get-index" : "get-index")
                    .then(res => res.text())
                    .then(fallbackData => {
                        return parser.parseFromString(fallbackData, "text/html");
                    });
            }
            return htmlDoc;
        })
        .then(htmlDoc => {
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

            // Cursor is now handled entirely by CSS using native SVG url()

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

                        window.navigateToPage(href);
                    });
                });

                window.navigateToPage = function(href) {
                    if (!href) return;

                    const currentUrl = window.location.pathname.split("/").pop();
                    const hashSplit = href.split('#');
                    const targetFile = hashSplit[0].split("/").pop();
                    const targetHash = hashSplit.length > 1 ? '#' + hashSplit[1] : '';

                    if (currentUrl === targetFile && !targetHash) {
                        return; // Already exactly here
                    } else if (currentUrl === targetFile && targetHash) {
                        window.location.hash = targetHash;
                        return;
                    }

                    const currentMain = document.querySelector('main');
                    if (currentMain) currentMain.classList.add("fade-out");

                    // Start fetching the new page immediately in parallel with the transition
                    const fetchPromise = fetch(hashSplit[0])
                        .then(res => {
                            if (!res.ok) throw new Error("Fetch Error");
                            return res.text();
                        });

                    // Wait 250ms for the CSS fade-out transition to complete
                    const transitionPromise = new Promise(resolve => setTimeout(resolve, 250));

                    Promise.all([fetchPromise, transitionPromise])
                        .then(([html]) => {
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

                            // Remove everything in body EXCEPT nav, footer, chat assistant, cursors, and the master script
                            Array.from(document.body.childNodes).forEach(node => {
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    if (node.tagName === 'NAV' || 
                                        node.tagName === 'FOOTER' || 
                                        node.id === 'ai-chat-widget' ||
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
                                if (navLink.getAttribute("href").split("/").pop() === targetFile) {
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
                                
                                if (targetHash) {
                                    const el = document.getElementById(targetHash.substring(1));
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    else window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }, 50);
                        })
                        .catch((err) => {
                            console.error("Navigation Fetch Failed:", err);
                            window.location.href = href;
                        });
                };

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
            setupSearchToggle();
            setupInteractiveTilt();

            document.body.style.visibility = 'visible';
        })
        .catch(err => {
            console.error("Layout Injection Failed:", err);
            setupSmartHeader();
            setupEducationDropdowns();
            setupThemeToggle();
            setupSearchToggle();
            document.body.style.visibility = 'visible';
        });

    // --- HANDLE BROWSER BACK BUTTON ---
    window.addEventListener("popstate", () => {
        window.location.reload();
    });
});

const portfolioIndex = [
    {
        title: "Restorant POS",
        type: "Project",
        keywords: ["java", "pos", "point of sale", "mysql", "desktop app"],
        url: "work.html",
        desc: "A Java-based Point of Sale system with inventory management."
    },
    {
        title: "Xvidia",
        type: "Project",
        keywords: ["react", "node.js", "web", "movie", "streaming", "api"],
        url: "work.html",
        desc: "A full-stack movie browsing application with seamless UI."
    },
    {
        title: "RFID Tollgate System",
        type: "Project",
        keywords: ["c++", "arduino", "iot", "hardware", "rfid", "sensors"],
        url: "work.html",
        desc: "An automated tollgate system utilizing RFID technology and IoT."
    },
    {
        title: "AI Kilo Bot",
        type: "Project",
        keywords: ["python", "ai", "machine learning", "bot", "discord"],
        url: "work.html",
        desc: "An intelligent bot utilizing machine learning for automated tasks."
    },
    {
        title: "Capstone 1",
        type: "Project",
        keywords: ["iot", "embedded systems", "research", "hardware"],
        url: "work.html",
        desc: "IoT research capstone focusing on embedded systems."
    },
    {
        title: "Technical Expertise & Skills",
        type: "Skill",
        keywords: ["html", "css", "javascript", "java", "python", "c#", "c++", "php", "mysql", "sqlite", "github"],
        url: "skill.html",
        desc: "Programming languages, web development, and software design competencies."
    },
    {
        title: "IT Administration & Tech Support",
        type: "Skill",
        keywords: ["hardware", "networking", "windows", "troubleshooting", "qa", "testing", "deployment"],
        url: "skill.html",
        desc: "System configuration, asset management, and technical troubleshooting."
    },
    {
        title: "Rizal Technological University",
        type: "Education",
        keywords: ["college", "bachelor", "computer engineering", "bscpe", "university"],
        url: "education.html",
        desc: "Bachelor of Science in Computer Engineering (2022 - Present)"
    },
    {
        title: "Professional Experience",
        type: "Experience",
        keywords: ["timeline", "internship", "work", "job", "career"],
        url: "experience.html",
        desc: "My professional timeline, internships, and roles."
    },
    {
        title: "Contact Khin",
        type: "Contact",
        keywords: ["email", "phone", "hire", "freelance", "message", "social"],
        url: "contact.html",
        desc: "Get in touch for embedded systems, IoT solutions, or web development projects."
    },
    {
        title: "About Me",
        type: "About",
        keywords: ["who am i", "background", "innovator", "khin andrei", "gamboa"],
        url: "about.html",
        desc: "Computer Engineering Student passionate about hardware and software."
    }
];

document.addEventListener("DOMContentLoaded", () => {
    // Wait for the master script to inject the nav before binding search
    // We can use a MutationObserver or simply retry grabbing the elements since injection is async.
    
    function initSearch() {
        const searchInput = document.getElementById('ai-search-input');
        const resultsArea = document.getElementById('search-results-area');
        
        if (!searchInput || !resultsArea) {
            setTimeout(initSearch, 200); // Retry
            return;
        }

        const suggestionHTML = resultsArea.innerHTML;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length === 0) {
                resultsArea.innerHTML = suggestionHTML; // Restore suggestions
                bindSuggestionChips();
                return;
            }

            // Perform search
            const results = portfolioIndex.filter(item => {
                return item.title.toLowerCase().includes(query) || 
                       item.desc.toLowerCase().includes(query) || 
                       item.keywords.some(kw => kw.toLowerCase().includes(query));
            });

            renderResults(results, query, resultsArea);
        });

        bindSuggestionChips();
    }

    function renderResults(results, query, resultsArea) {
        // Check if it's a conversational question
        const questionWords = ['what', 'who', 'how', 'why', 'where', 'when', 'tell me', 'can you'];
        const isQuestion = questionWords.some(w => query.toLowerCase().includes(w)) || query.includes('?');

        let html = '';

        let fetchAi = false;

        // Generate AI Response UI if it's a question or a longer phrase
        if (query.length > 5 && (isQuestion || results.length === 0)) {
            fetchAi = true;
            html += `
                <div class="ai-response-box" style="background: rgba(255,215,0,0.05); border: 1px solid var(--accent-color); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <i class="fas fa-robot" style="color: var(--accent-color);"></i>
                        <span style="color: var(--accent-color); font-family: 'Space Grotesk', sans-serif; font-weight: 700;">AI Agent (Gemini)</span>
                    </div>
                    <p id="ai-answer-text" style="color: var(--text-color); font-family: 'Sora', sans-serif; font-size: 0.95rem; margin: 0; line-height: 1.6; opacity: 0.9;">
                        <i class="fas fa-circle-notch fa-spin"></i> Thinking...
                    </p>
                </div>
            `;
        }

        if (results.length === 0) {
            html += `
                <div class="search-empty">
                    <p style="color: var(--text-color); opacity: 0.8; font-family: 'Sora', sans-serif;">
                        No exact portfolio links found for "<strong>${query}</strong>".
                    </p>
                </div>
            `;
            resultsArea.innerHTML = html;
            return;
        }

        html += `<div class="search-results-list" style="display: flex; flex-direction: column; gap: 10px;">`;
        results.forEach(res => {
            html += `
                <a href="${res.url}" class="search-result-item" data-url="${res.url}" style="display: block; padding: 15px; border-radius: 8px; border: 1px solid var(--border-color); text-decoration: none; transition: all 0.2s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="color: var(--accent-color); font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.1rem;">${res.title}</span>
                        <span style="background: rgba(128,128,128,0.1); padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; color: var(--text-color); font-family: 'Sora', sans-serif; text-transform: uppercase;">${res.type}</span>
                    </div>
                    <p style="color: var(--text-color); opacity: 0.8; font-family: 'Sora', sans-serif; font-size: 0.9rem; margin: 0;">${res.desc}</p>
                </a>
            `;
        });
        html += `</div>`;
        resultsArea.innerHTML = html;

        // If we decided to fetch AI, do it now that the element is in the DOM
        if (fetchAi) {
            const fetchId = Date.now();
            window.currentAiFetchId = fetchId;

            // Debounce the AI request by 800ms so we don't spam the API on every keystroke
            setTimeout(() => {
                if (window.currentAiFetchId !== fetchId) return; // User kept typing, abort this request

                // Fetch response from our secure Vercel Serverless Function (/api/chat)
                // This keeps the API key hidden on the server side and prevents key exposure.
                fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: query })
                })
                .then(res => {
                    if (!res.ok) throw new Error("Serverless API Error");
                    return res.json();
                })
                .then(data => {
                    if (window.currentAiFetchId !== fetchId) return;
                    
                    const activeAiElement = document.getElementById('ai-answer-text');
                    if (data.answer && activeAiElement) {
                        activeAiElement.innerHTML = data.answer;
                    } else if (activeAiElement) {
                        activeAiElement.innerHTML = getMockAIResponse(query);
                    }
                })
                .catch((err) => {
                    console.error("AI Serverless Error:", err);
                    if (window.currentAiFetchId !== fetchId) return;
                    
                    // Fall back to predefined mock answers if API or Serverless function is not configured / offline
                    const activeAiElement = document.getElementById('ai-answer-text');
                    if (activeAiElement) {
                        activeAiElement.innerHTML = getMockAIResponse(query);
                    }
                });
            }, 800);
        }

        // Hover effects via JS since inline styles are used for simplicity
        const links = resultsArea.querySelectorAll('.search-result-item');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                link.style.borderColor = 'var(--accent-color)';
                link.style.background = 'rgba(255, 215, 0, 0.05)';
            });
            link.addEventListener('mouseleave', () => {
                link.style.borderColor = 'var(--border-color)';
                link.style.background = 'transparent';
            });
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const url = link.getAttribute('data-url');
                
                // Close search bar
                document.getElementById('search-ui').classList.remove('active');
                
                // Route
                if (window.navigateToPage) {
                    window.navigateToPage(url);
                } else {
                    window.location.href = url;
                }
            });
        });
    }

    function bindSuggestionChips() {
        const chips = document.querySelectorAll('.suggestion-chip');
        const searchInput = document.getElementById('ai-search-input');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = chip.textContent;
                    searchInput.dispatchEvent(new Event('input'));
                }
            });
        });
    }

    // Start trying to init search
    initSearch();
});

// =======================================================
// GLOBAL HELPER FUNCTIONS
// =======================================================

// --- INJECT GLOBAL FEATURES ---
function injectGlobalFeatures() {
    // Inject floating AI chat widget
    if (!document.getElementById('ai-chat-widget')) {
        const widget = document.createElement('div');
        widget.id = 'ai-chat-widget';
        widget.className = 'chat-widget-container';
        widget.innerHTML = `
            <button class="chat-trigger-btn" aria-label="Toggle AI Assistant" type="button">
                <i class="fas fa-robot"></i>
                <span class="chat-trigger-badge"></span>
            </button>
            <div class="chat-window">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <i class="fas fa-robot"></i>
                        <div>
                            <div class="chat-header-title">AI Assistant</div>
                            <div class="chat-header-status">
                                <span class="chat-status-dot"></span>
                                <span>Online</span>
                            </div>
                        </div>
                    </div>
                    <button class="chat-close-btn" aria-label="Close Chat" type="button">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chat-messages">
                    <div class="chat-bubble bot">
                        Hi! I am Khin's AI Assistant. Ask me anything about my projects, experience, or skills!
                    </div>
                </div>
                <div class="chat-input-area">
                    <input type="text" class="chat-input-field" placeholder="Ask a question..." autocomplete="off">
                    <button class="chat-send-btn" aria-label="Send Message" type="button">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
        setupFloatingChatLogic(widget);
    }
}

function setupFloatingChatLogic(widget) {
    const triggerBtn = widget.querySelector('.chat-trigger-btn');
    const chatWindow = widget.querySelector('.chat-window');
    const closeBtn = widget.querySelector('.chat-close-btn');
    const inputField = widget.querySelector('.chat-input-field');
    const sendBtn = widget.querySelector('.chat-send-btn');
    const messagesContainer = widget.querySelector('.chat-messages');

    // Toggle chat window visibility
    triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            inputField.focus();
            // Remove the online pulse green badge on first click
            const badge = triggerBtn.querySelector('.chat-trigger-badge');
            if (badge) badge.style.display = 'none';
        }
    });

    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chatWindow.classList.remove('active');
    });

    // Prevent clicks inside chat window from bubbling up
    chatWindow.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close on clicking outside
    document.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // Handle sending messages
    const sendMessage = () => {
        const query = inputField.value.trim();
        if (!query) return;

        // Clear input
        inputField.value = '';

        // Render user bubble
        appendBubble(query, 'user');

        // Render thinking bubble
        const thinkingBubble = appendBubble(`
            <span class="chat-dot"></span>
            <span class="chat-dot"></span>
            <span class="chat-dot"></span>
        `, 'bot thinking');

        // API endpoint call to Vercel Serverless Function
        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        })
        .then(res => {
            if (!res.ok) throw new Error("Serverless API Error");
            return res.json();
        })
        .then(data => {
            thinkingBubble.remove();
            if (data.answer) {
                appendBubble(data.answer, 'bot');
            } else {
                appendBubble(getMockAIResponse(query), 'bot');
            }
        })
        .catch(err => {
            console.error("AI Widget Error:", err);
            thinkingBubble.remove();
            appendBubble(getMockAIResponse(query), 'bot');
        });
    };

    const appendBubble = (htmlContent, className) => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${className}`;
        bubble.innerHTML = htmlContent;
        messagesContainer.appendChild(bubble);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return bubble;
    };

    // Send on click
    sendBtn.addEventListener('click', sendMessage);

    // Send on Enter key
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// --- MOCK AI LOGIC ---
// This acts as your AI agent until you connect a real LLM API (like OpenAI)
function getMockAIResponse(query) {
    query = query.toLowerCase();
    
    if (query.includes("experience") || query.includes("work") || query.includes("job") || query.includes("it")) {
        return "Khin has hands-on experience in IT administration and support, handling remote troubleshooting, networking, and software/hardware setups. He is currently expanding his expertise into the DevOps industry.";
    }
    if (query.includes("education") || query.includes("study") || query.includes("school") || query.includes("college")) {
        return "Khin is currently a final-year Bachelor of Science in Computer Engineering student at Rizal Technological University (2022 - Present).";
    }
    if (query.includes("skills") || query.includes("know") || query.includes("languages") || query.includes("tech")) {
        return "Khin's technical expertise spans Java, Python, C++, web development, and hardware infrastructure. He is highly skilled in IoT development, automation, and modern deployment pipelines.";
    }
    if (query.includes("projects") || query.includes("portfolio") || query.includes("ai") || query.includes("devops")) {
        return "Khin has delivered diverse projects including full-featured restaurant dashboards with inventory systems, AI-driven camera detection interfaces, and automated IoT solutions.";
    }
    if (query.includes("who") || query.includes("about") || query.includes("khin") || query.includes("goal")) {
        return "Khin is a final-year Computer Engineering student with a passion for automation and system efficiency. He aims to leverage his IT support foundation to build scalable infrastructure as a DevOps Engineer.";
    }
    if (query.includes("contact") || query.includes("hire") || query.includes("email")) {
        return "You can reach Khin at gamboa.khinandrei@gmail.com or by calling +63 992 421 5230. He is always open to discussing DevOps, web development, or IT support roles!";
    }
    
    return "I am Khin's AI assistant. Based on his portfolio, he bridges the gap between hardware infrastructure and software solutions. Click one of the links below to see his work, or ask me about his DevOps goals and IT experience!";
}
