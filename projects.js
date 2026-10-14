



export function initializeProjects() {
    document.getElementById("projects-list").innerHTML = `
        <article class="project-card">
            <div class="project-content">
                <div class="project-label">FEATURED REPOSITORY</div>
                <h3 style="display: flex; align-items: center;">
                    <img src="images/simplefastpostIcon.png" alt="SimpleFastPost" style="width: 30px; height: 30px; margin-right: 10px;">SimpleFastPost</h3>

                <p>
                    A lightweight, HTTP server developed in Java, focused on fast request handling and efficient response delivery. Built to explore core networking concepts, HTTP protocol implementation, socket communication, and low-level server architecture, with an emphasis on simplicity, performance, and understanding how web servers process client requests.

                </p>

                <div class="project-links">
                    <a href="https://github.com/nikholt1/SimpleFastPost"
                       target="_blank" rel="noopener noreferrer">
                        GitHub repository ↗
                    </a>
                    
                </div>
            </div>

            <a class="project-preview"
               href="https://github.com/nikholt1/SimpleFastPost"
               target="_blank" rel="noopener noreferrer"
               aria-label="View TraceAI repository">
                <div class="repo-languages" data-repo="TraceAI">
                    <h4>Languages</h4>
                    <div class="language-bar"></div>
                    <div class="language-list">Loading...</div>
                </div>
            </a>
        </article>
        <br>
        <article class="project-card">
            <div class="project-content">
                <div class="project-label">FEATURED REPOSITORY</div>
                <h3 style="display: flex; align-items: center;">
                    <img src="images/refractIcon.png" alt="Refract" style="width: 30px; height: 30px; margin-right: 10px;">Refract</h3>


                <p>
                    A selected software project showcasing my work and
                    approach to development. Explore the repository for
                    source code and technical details.
                </p>

                <div class="project-links">
                    <a href="https://github.com/nikholt1/Refract"
                       target="_blank" rel="noopener noreferrer">
                        GitHub repository ↗
                    </a>
                    <a href="https://niklasholtlau.web.app/R.html"
                       target="_blank" rel="noopener noreferrer">
                        Project details ↗
                    </a>
                </div>
            </div>

            <a class="project-preview"
               href="https://github.com/nikholt1/Refract"
               target="_blank" rel="noopener noreferrer"
               aria-label="View Refract repository">
                <div class="repo-languages" data-repo="Refract">
                    <h4>Languages</h4>
                    <div class="language-bar"></div>
                    <div class="language-list">Loading...</div>
                </div>
            </a>
        </article>

        <br>

        <article class="project-card">
            <div class="project-content">
                <div class="project-label">FEATURED REPOSITORY</div>
                <h3 style="display: flex; align-items: center;">
                    <img src="images/traceAI.gif" alt="TraceAI" style="width: 60px; height: 60px; margin-right: 10px;">TraceAI</h3>


                <p>
                    A full-stack AI application developed as a school project, combining Java, Spring Boot, and Ollama to provide a secure interface for interacting with locally hosted large language models. Features a modular microservice architecture with a frontend, Backend-for-Frontend (BFF), AI API proxy, authentication, JWT-based authorization, and integration with external data sources. Focused on secure AI integration, service separation, and controlled access to local AI resources.
 <img src="images/buildBall.gif" alt="TraceAI" style="width: 35px; height: 35px; margin-right: 10px;">
                </p>
                    

                <div class="project-links">
                    <a href="https://github.com/nikholt1/TraceAI"
                       target="_blank" rel="noopener noreferrer">
                        GitHub repository ↗
                    </a>
                    <a href="https://niklasholtlau.web.app/R.html"
                       target="_blank" rel="noopener noreferrer">
                        Project details ↗
                    </a>
                </div>
            </div>

            <a class="project-preview"
               href="https://github.com/nikholt1/TraceAI"
               target="_blank" rel="noopener noreferrer"
               aria-label="View TraceAI repository">
                <div class="repo-languages" data-repo="TraceAI">
                    <h4>Languages</h4>
                    <div class="language-bar"></div>
                    <div class="language-list">Loading...</div>
                </div>
            </a>
        </article>
    `;

    loadRepositoryLanguages();
}

async function loadRepositoryLanguages() {
    const colors = {
        Java: "#b07219",
        JavaScript: "#f1e05a",
        TypeScript: "#3178c6",
        Python: "#3572A5",
        HTML: "#e34c26",
        CSS: "#663399",
        Shell: "#89e051",
        Dockerfile: "#384d54",
        Kotlin: "#A97BFF",
        C: "#555555",
        "C++": "#f34b7d",
        Go: "#00ADD8",
        Rust: "#dea584"
    };

    const containers = document.querySelectorAll(
        ".repo-languages[data-repo]"
    );

    await Promise.all([...containers].map(async container => {
        const repo = container.dataset.repo;
        const list = container.querySelector(".language-list");
        const bar = container.querySelector(".language-bar");

        try {
            const response = await fetch(
                `https://api.github.com/repos/nikholt1/${repo}/languages`
            );

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const languages = await response.json();
            const entries = Object.entries(languages)
                .sort((a, b) => b[1] - a[1]);

            const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);

            list.replaceChildren();
            bar.replaceChildren();

            if (!total) {
                list.textContent = "No languages found.";
                return;
            }

            entries.forEach(([language, bytes]) => {
                const percentage = bytes / total * 100;
                const color = colors[language] || "#8b949e";

                const segment = document.createElement("span");
                segment.className = "language-segment";
                segment.style.width = `${percentage}%`;
                segment.style.backgroundColor = color;
                segment.title = `${language}: ${percentage.toFixed(1)}%`;
                bar.appendChild(segment);

                const row = document.createElement("div");
                row.className = "language-row";

                const name = document.createElement("span");
                name.className = "language-name";

                const dot = document.createElement("span");
                dot.className = "language-dot";
                dot.style.backgroundColor = color;

                const label = document.createElement("span");
                label.textContent = language;

                name.append(dot, label);

                const value = document.createElement("span");
                value.className = "language-percentage";
                value.textContent = `${percentage.toFixed(1)}%`;

                row.append(name, value);
                list.appendChild(row);
            });
        } catch (error) {
            list.textContent = "Unable to load languages.";
            console.error(`Failed to load ${repo}:`, error);
        }
    }));
}

