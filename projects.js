

const GITHUB_USER = "nikholt1";

const LANGUAGE_COLORS = {
    JavaScript: "#f1e05a",
    Java: "#b07219",
    HTML: "#e34c26",
    CSS: "#663399",
    Python: "#3572A5",
    TypeScript: "#3178c6",
    Shell: "#89e051",
    Kotlin: "#A97BFF",
    Swift: "#F05138",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    PHP: "#4F5D95",
    Go: "#00ADD8",
    Rust: "#dea584",
    SQL: "#e38c00",
    Dockerfile: "#384d54",
    Vue: "#41b883",
    Ruby: "#701516",
    Dart: "#00B4AB",
    PowerShell: "#012456"
};

const GITHUB_API = "https://api.github.com/repos";

export async function initializeRepositoryCards() {
    const cards = document.querySelectorAll(
        ".pinned-repositories .repo-card[data-repo]"
    );

    await Promise.all(
        [...cards].map(loadRepositoryCard)
    );
}

function getRepositoryDetails(card) {
    // Prefer the actual GitHub link in the card.
    // This avoids accidentally using the wrong owner.
    const githubLink = [...card.querySelectorAll("a[href]")]
        .find((link) => {
            try {
                return new URL(link.href).hostname === "github.com";
            } catch {
                return false;
            }
        });

    if (githubLink) {
        const parts = new URL(githubLink.href)
            .pathname
            .split("/")
            .filter(Boolean);

        if (parts.length >= 2) {
            return {
                owner: parts[0],
                repo: parts[1].replace(/\.git$/, "")
            };
        }
    }

    return {
        owner: card.dataset.owner || GITHUB_USER,
        repo: card.dataset.repo
    };
}

async function fetchGitHubJSON(url) {
    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json"
        }
    });

    if (!response.ok) {
        throw new Error(
            `GitHub API ${response.status}: ${url}`
        );
    }

    return response.json();
}

async function loadRepositoryCard(card) {
    const { owner, repo } = getRepositoryDetails(card);

    const baseUrl =
        `${GITHUB_API}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

    const descriptionElement =
        card.querySelector(".repo-description");

    const languagesElement =
        card.querySelector(".repo-languages");

    const languageLabel =
        card.querySelector(".repo-language-label");

    if (!languagesElement || !languageLabel) {
        console.warn(`Missing language elements for ${owner}/${repo}`);
        return;
    }

    // --------------------------------------------------
    // DESCRIPTION
    // Only fetch descriptions for cards without a custom one.
    // Team project descriptions are maintained in the HTML.
    // --------------------------------------------------

    const hasCustomDescription =
        descriptionElement?.dataset.customDescription === "true";

    const descriptionTask = async () => {
        if (!descriptionElement || hasCustomDescription) {
            return;
        }

        try {
            const repository = await fetchGitHubJSON(baseUrl);

            descriptionElement.textContent =
                repository.description || "No description provided.";

            const visibilityElement =
                card.querySelector(".repo-visibility");

            if (visibilityElement) {
                visibilityElement.textContent =
                    repository.private ? "Private" : "Public";
            }
        } catch (error) {
            console.error(
                `Failed to load description for ${owner}/${repo}:`,
                error
            );

            descriptionElement.textContent =
                "Unable to load repository description.";
        }
    };

    // --------------------------------------------------
    // LANGUAGES
    // Independent of description loading.
    // --------------------------------------------------

    const languagesTask = async () => {
        try {
            const languages = await fetchGitHubJSON(
                `${baseUrl}/languages`
            );

            const entries = Object.entries(languages)
                .sort((a, b) => b[1] - a[1]);

            const totalBytes = entries.reduce(
                (sum, [, bytes]) => sum + bytes,
                0
            );

            languagesElement.replaceChildren();
            languageLabel.replaceChildren();

            if (entries.length === 0 || totalBytes === 0) {
                languageLabel.textContent = "No language data";
                return;
            }

            for (const [language, bytes] of entries) {
                const percentage = (bytes / totalBytes) * 100;
                const color =
                    LANGUAGE_COLORS[language] || "#8b949e";

                // Language distribution bar.
                const segment = document.createElement("span");

                segment.className = "language-segment";
                segment.style.width = `${percentage}%`;
                segment.style.backgroundColor = color;
                segment.title =
                    `${language}: ${percentage.toFixed(1)}%`;

                languagesElement.appendChild(segment);

                // Language percentage legend.
                const item = document.createElement("span");
                item.className = "language-percentage";

                const dot = document.createElement("i");
                dot.className = "language-dot";
                dot.style.backgroundColor = color;

                const text = document.createElement("span");
                text.textContent =
                    `${language} ${percentage.toFixed(1)}%`;

                item.append(dot, text);
                languageLabel.appendChild(item);
            }
        } catch (error) {
            console.error(
                `Failed to load languages for ${owner}/${repo}:`,
                error
            );

            languagesElement.replaceChildren();
            languageLabel.textContent = "Language data unavailable";
        }
    };

    // Each task handles its own errors, so one failure
    // cannot stop the other task or other repository cards.
    await Promise.all([
        descriptionTask(),
        languagesTask()
    ]);
}
