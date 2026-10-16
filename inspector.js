
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify/+esm";

const REPO_API =
    "https://api.github.com/repos/nikholt1/nikholt1.github.io/contents/posts";

let initializationPromise = null;

// Load only once per page session. A failed request stays cached.
export function initializeInspector() {
    if (initializationPromise !== null) {
        return initializationPromise;
    }

    initializationPromise = renderPosts();
    return initializationPromise;
}

// Optional: call this explicitly if you add a refresh button later.
export function refreshInspector() {
    initializationPromise = null;
    return initializeInspector();
}

async function renderPosts() {
    const container = document.getElementById("inspector-container");

    if (!container) {
        console.error("Inspector container not found.");
        return;
    }

    // Hide the section while the data is being retrieved and rendered.
    container.classList.add("hidden");

    container.innerHTML = `
        <div class="post">
            <div class="section-heading">
                <h2>Loading posts...</h2>
                <div class="section-index">LOADING</div>
            </div>
        </div>
    `;

    try {
        const response = await fetch(REPO_API);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const files = await response.json();

        const markdownFiles = files.filter(file =>
            file.type === "file" &&
            file.name.toLowerCase().endsWith(".md")
        );

        const posts = await Promise.all(
            markdownFiles.map(async file => {
                if (!file.download_url) {
                    throw new Error(`Missing download URL: ${file.name}`);
                }

                const postResponse = await fetch(file.download_url);

                if (!postResponse.ok) {
                    throw new Error(
                        `Failed to load ${file.name}: ${postResponse.status}`
                    );
                }

                const markdown = await postResponse.text();

                return parsePost(markdown, file.name);
            })
        );

        // Sort chronologically, newest first.
        posts.sort((a, b) => {
            const dateA = parseDate(a.date)?.getTime() ?? 0;
            const dateB = parseDate(b.date)?.getTime() ?? 0;

            return dateB - dateA;
        });

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="post">
                    <div class="section-heading">
                        <h2>No posts found</h2>
                        <div class="section-index">—</div>
                    </div>
                    <div class="text-area">
                        No Markdown files were found in the posts folder.
                    </div>
                </div>
            `;

            return;
        }

        // Create the activity graph from the actual post dates.
        const graph = createActivityGraph(posts);

        // Render all posts before showing the container.
        const postMarkup = posts.map((post, index) => {
            const headline = escapeHTML(post.headline);
            const date = escapeHTML(formatDate(post.date));
            const postId = `dev-post-${index}`;

            const expanded = index === 0;

            const content = DOMPurify.sanitize(
                marked.parse(post.content)
            );

            return `
                <article class="post">
                    <div class="section-heading">
                        <h2>
                            <button
                                type="button"
                                class="post-toggle"
                                aria-expanded="${expanded}"
                                aria-controls="${postId}"
                            >
                                <span class="post-toggle-icon" aria-hidden="true">
                                    ${expanded ? "−" : "+"}
                                </span>
                                <span>${headline}</span>
                            </button>
                        </h2>

                        <div class="section-index">${date}</div>
                    </div>

                    <div
                        class="text-area${expanded ? "" : " hidden"}"
                        id="${postId}"
                    >
                        ${content}
                    </div>
                </article>
            `;
        }).join("");

        container.innerHTML = `
            <section class="activity-graph post">
                <div class="section-heading">
                    <h2>Development activity</h2>
                    <div class="section-index">TIMELINE</div>
                </div>
                <div class="text-area">
                    ${graph}
                </div>
            </section>

            <div class="dev-posts">
                ${postMarkup}
            </div>
        `;

        // Attach toggle events after all posts have been rendered.
        initializePostToggles(container);

    } catch (error) {
        console.error("Failed to load GitHub posts:", error);

        container.innerHTML = `
            <div class="post">
                <div class="section-heading">
                    <h2>Unable to load posts</h2>
                    <div class="section-index">ERROR</div>
                </div>

                <div class="text-area">
                    Could not retrieve the Markdown posts from GitHub.
                    Please refresh the page to try again.
                </div>
            </div>
        `;
    } finally {
        // Reveal the completed posts or the error message.
        container.classList.remove("hidden");
    }
}

function initializePostToggles(container) {
    container.querySelectorAll(".post-toggle").forEach(button => {
        button.addEventListener("click", () => {
            const contentId = button.getAttribute("aria-controls");
            const content = document.getElementById(contentId);

            if (!content) return;

            const expanded =
                button.getAttribute("aria-expanded") === "true";

            button.setAttribute("aria-expanded", String(!expanded));
            content.classList.toggle("hidden", expanded);

            const icon = button.querySelector(".post-toggle-icon");

            if (icon) {
                icon.textContent = expanded ? "+" : "−";
            }
        });
    });
}

function createActivityGraph(posts) {
    const datedPosts = posts
        .map(post => ({
            date: parseDate(post.date),
            headline: post.headline
        }))
        .filter(post => post.date !== null)
        .sort((a, b) => a.date - b.date);

    if (datedPosts.length === 0) {
        return `<p>No dated posts available for the activity timeline.</p>`;
    }

    // Count posts published on each date.
    const activityMap = new Map();

    datedPosts.forEach(post => {
        const key = dateKey(post.date);
        activityMap.set(key, {
            date: post.date,
            count: (activityMap.get(key)?.count ?? 0) + 1
        });
    });

    const activity = [...activityMap.values()]
        .sort((a, b) => a.date - b.date);

    const width = 720;
    const height = 230;
    const left = 48;
    const right = 20;
    const top = 24;
    const bottom = 48;

    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    const maxCount = Math.max(
        1,
        ...activity.map(point => point.count)
    );

    const x = index => {
        if (activity.length === 1) {
            return left + chartWidth / 2;
        }

        return left + (index / (activity.length - 1)) * chartWidth;
    };

    const y = count =>
        top + chartHeight - (count / maxCount) * chartHeight;

    const points = activity
        .map((point, index) => `${x(index)},${y(point.count)}`)
        .join(" ");

    const grid = Array.from({ length: maxCount }, (_, index) => {
        const count = index + 1;
        const positionY = y(count);

        return `
            <line
                x1="${left}"
                y1="${positionY}"
                x2="${width - right}"
                y2="${positionY}"
                stroke="currentColor"
                stroke-opacity="0.12"
            />
            <text
                x="${left - 12}"
                y="${positionY + 4}"
                text-anchor="end"
                fill="currentColor"
                opacity="0.7"
                font-size="11"
            >${count}</text>
        `;
    }).join("");

    const circles = activity.map((point, index) => `
        <circle
            cx="${x(index)}"
            cy="${y(point.count)}"
            r="4"
            fill="currentColor"
        >
            <title>${escapeHTML(formatDate(dateKey(point.date)))}: ${point.count} post${point.count === 1 ? "" : "s"}</title>
        </circle>
    `).join("");

    const firstDate = formatDate(dateKey(activity[0].date));
    const lastDate = formatDate(dateKey(activity[activity.length - 1].date));

    return `
        <div class="activity-chart">
            <p>
                ${datedPosts.length} dated post${datedPosts.length === 1 ? "" : "s"}
                across ${activity.length} publication date${activity.length === 1 ? "" : "s"}.
            </p>

            <svg
                viewBox="0 0 ${width} ${height}"
                role="img"
                aria-label="Development posts over time, from ${escapeHTML(firstDate)} to ${escapeHTML(lastDate)}"
                style="display:block;width:100%;height:auto;overflow:visible"
            >
                ${grid}

                <line
                    x1="${left}"
                    y1="${top + chartHeight}"
                    x2="${width - right}"
                    y2="${top + chartHeight}"
                    stroke="currentColor"
                    stroke-opacity="0.35"
                />

                <polyline
                    points="${points}"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                ${circles}

                <text
                    x="${left}"
                    y="${height - 14}"
                    text-anchor="start"
                    fill="currentColor"
                    font-size="11"
                >${escapeHTML(firstDate)}</text>

                <text
                    x="${width - right}"
                    y="${height - 14}"
                    text-anchor="end"
                    fill="currentColor"
                    font-size="11"
                >${escapeHTML(lastDate)}</text>
            </svg>
        </div>
    `;
}


function parsePost(markdown, filename) {
    let headline = "";
    let category = "POST";
    let date = "";
    let content = markdown;

    // Remove a possible UTF-8 BOM and normalize line endings.
    markdown = markdown
        .replace(/^\uFEFF/, "")
        .replace(/\r\n?/g, "\n")
        .trimStart();

    // Extract YAML front matter.
    const frontMatterMatch = markdown.match(
        /^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/
    );

    if (frontMatterMatch) {
        const metadata = frontMatterMatch[1];
        content = markdown.slice(frontMatterMatch[0].length);

        headline = getMetadataValue(metadata, "headline");
        category = getMetadataValue(metadata, "category") || "POST";
        date = getMetadataValue(metadata, "date");
    }

    // Use the first Markdown heading if headline is missing.
    if (!headline) {
        const headingMatch = content.match(/^#\s+(.+)$/m);

        if (headingMatch) {
            headline = headingMatch[1].trim();
            content = content.replace(headingMatch[0], "").trim();
        }
    }

    // Fall back to the filename.
    if (!headline) {
        headline = filename
            .replace(/\.md$/i, "")
            .replace(/[-_]/g, " ");
    }

    return {
        filename,
        headline,
        category,
        date,
        content
    };
}


function getMetadataValue(metadata, key) {
    const regex = new RegExp(`^${key}:\\s*(.*?)\\s*$`, "m");
    const match = metadata.match(regex);

    if (!match) return "";

    return match[1]
        .replace(/^(['"])(.*)\1$/, "$2")
        .trim();
}

// Supports DD-MM-YYYY, YYYY-MM-DD, and other browser-recognized dates.
function parseDate(value) {
    if (!value) return null;

    const input = String(value).trim();

    let match = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);

    if (match) {
        return makeUTCDate(
            Number(match[3]),
            Number(match[2]),
            Number(match[1])
        );
    }

    match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (match) {
        return makeUTCDate(
            Number(match[1]),
            Number(match[2]),
            Number(match[3])
        );
    }

    const parsed = new Date(input);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function makeUTCDate(year, month, day) {
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return date;
}

function dateKey(date) {
    if (typeof date === "string") {
        const parsed = parseDate(date);

        if (!parsed) return "";

        return parsed.toISOString().slice(0, 10);
    }

    return date.toISOString().slice(0, 10);
}

function formatDate(value) {
    const date = value instanceof Date ? value : parseDate(value);

    if (!date) return value || "";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}
