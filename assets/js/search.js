const portfolioIndex = [
    {
        title: "Restorant POS",
        type: "Project",
        keywords: ["java", "pos", "point of sale", "mysql", "desktop app"],
        url: "pages/work.html",
        desc: "A Java-based Point of Sale system with inventory management."
    },
    {
        title: "Xvidia",
        type: "Project",
        keywords: ["react", "node.js", "web", "movie", "streaming", "api"],
        url: "pages/work.html",
        desc: "A full-stack movie browsing application with seamless UI."
    },
    {
        title: "RFID Tollgate System",
        type: "Project",
        keywords: ["c++", "arduino", "iot", "hardware", "rfid", "sensors"],
        url: "pages/work.html",
        desc: "An automated tollgate system utilizing RFID technology and IoT."
    },
    {
        title: "AI Kilo Bot",
        type: "Project",
        keywords: ["python", "ai", "machine learning", "bot", "discord"],
        url: "pages/work.html",
        desc: "An intelligent bot utilizing machine learning for automated tasks."
    },
    {
        title: "Capstone 1",
        type: "Project",
        keywords: ["iot", "embedded systems", "research", "hardware"],
        url: "pages/work.html",
        desc: "IoT research capstone focusing on embedded systems."
    },
    {
        title: "Technical Expertise & Skills",
        type: "Skill",
        keywords: ["html", "css", "javascript", "java", "python", "c#", "c++", "php", "mysql", "sqlite", "github"],
        url: "pages/skill.html",
        desc: "Programming languages, web development, and software design competencies."
    },
    {
        title: "IT Administration & Tech Support",
        type: "Skill",
        keywords: ["hardware", "networking", "windows", "troubleshooting", "qa", "testing", "deployment"],
        url: "pages/skill.html",
        desc: "System configuration, asset management, and technical troubleshooting."
    },
    {
        title: "Rizal Technological University",
        type: "Education",
        keywords: ["college", "bachelor", "computer engineering", "bscpe", "university"],
        url: "pages/education.html",
        desc: "Bachelor of Science in Computer Engineering (2022 - Present)"
    },
    {
        title: "Professional Experience",
        type: "Experience",
        keywords: ["timeline", "internship", "work", "job", "career"],
        url: "pages/experience.html",
        desc: "My professional timeline, internships, and roles."
    },
    {
        title: "Contact Khin",
        type: "Contact",
        keywords: ["email", "phone", "hire", "freelance", "message", "social"],
        url: "pages/contact.html",
        desc: "Get in touch for embedded systems, IoT solutions, or web development projects."
    },
    {
        title: "About Me",
        type: "About",
        keywords: ["who am i", "background", "innovator", "khin andrei", "gamboa"],
        url: "pages/about.html",
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
            const aiTextElement = document.getElementById('ai-answer-text');

            fetch(`/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            })
            .then(res => {
                if (!res.ok) throw new Error("Gemini API Error");
                return res.json();
            })
            .then(data => {
                if (data.answer && aiTextElement) {
                    aiTextElement.innerHTML = data.answer;
                } else if (aiTextElement) {
                    aiTextElement.innerHTML = getMockAIResponse(query);
                }
            })
            .catch(() => {
                // Fallback to local mock if API fails
                if (aiTextElement) {
                    aiTextElement.innerHTML = getMockAIResponse(query);
                }
            });
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

    // --- MOCK AI LOGIC ---
    // This acts as your AI agent until you connect a real LLM API (like OpenAI)
    function getMockAIResponse(query) {
        query = query.toLowerCase();
        
        if (query.includes("experience") || query.includes("work") || query.includes("job")) {
            return "Khin has experience as an IT Administrator and Technical Support, where he handles system configuration, hardware maintenance, and QA testing. He also develops robust web applications and embedded systems.";
        }
        if (query.includes("education") || query.includes("study") || query.includes("school") || query.includes("college")) {
            return "Khin is currently pursuing a Bachelor of Science in Computer Engineering at Rizal Technological University (2022 - Present).";
        }
        if (query.includes("skills") || query.includes("know") || query.includes("languages") || query.includes("tech")) {
            return "Khin's technical expertise spans Java, Python, C++, HTML/CSS/JS, React, and MySQL. He is also highly skilled in IoT development (Arduino) and hardware troubleshooting.";
        }
        if (query.includes("iot") || query.includes("hardware") || query.includes("arduino")) {
            return "Khin is deeply interested in the intersection of hardware and software. His notable hardware projects include an RFID Tollgate System and an IoT Research Capstone focused on embedded systems.";
        }
        if (query.includes("who") || query.includes("about") || query.includes("khin")) {
            return "Khin Andrei Gamboa is a passionate Computer Engineering student and innovator. He loves designing efficient circuits, programming embedded systems, and building responsive, futuristic web applications.";
        }
        if (query.includes("contact") || query.includes("hire") || query.includes("email")) {
            return "You can reach Khin at gamboa.khinandrei@gmail.com or by calling +63 992 421 5230. He is always open to discussing web development or IoT projects!";
        }
        
        return "I am Khin's AI assistant. Based on his portfolio, he is a highly capable Computer Engineering student with a strong background in software and hardware. Click one of the links below to see his work, or ask me about his skills and education!";
    }
    
    // Start trying to init search
    initSearch();
});
