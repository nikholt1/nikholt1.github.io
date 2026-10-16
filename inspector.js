
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";
import DOMPurify from "https://cdn.jsdelivr.net/npm/dompurify/+esm";

const REPO_API =
    "https://api.github.com/repos/nikholt1/nikholt1.github.io/contents/posts";

// Cache the initialization promise for the lifetime of this module.
let initializationPromise = null;

export function initializeInspector() {
    // Return the original promise on every subsequent call.
    if (initializationPromise !== null) {
        return initializationPromise;
    }

    // Cache immediately, including when loading fails.
    initializationPromise = renderPosts();

    return initializationPromise;
}

async function renderPosts() {
    const inspectorContainer = document.getElementById("inspector-container");

    if (!inspectorContainer) {
        console.error("Inspector container not found.");
        return;
    }

    inspectorContainer.innerHTML = `
        <div class="post">
            <div class="section-heading">
                <h2>Loading posts...</h2>
                <div class="section-index">POST</div>
            </div>
        </div>
    `;

    try {
        // Fetch the posts directory.
        const response = await fetch(REPO_API);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const files = await response.json();

        // Select Markdown files only.
        const markdownFiles = files.filter(file =>
            file.type === "file" &&
            file.name.toLowerCase().endsWith(".md")
        );

        // Fetch and parse all posts concurrently.
        const posts = await Promise.all(
            markdownFiles.map(async file => {
                if (!file.download_url) {
                    throw new Error(`Missing download URL for ${file.name}`);
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

        // Sort newest first.
        posts.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;

            return dateB - dateA;
        });

        if (posts.length === 0) {
            inspectorContainer.innerHTML = `
                <div class="post">
                    <div class="section-heading">
                        <h2>No posts found</h2>
                        <div class="section-index">POST</div>
                    </div>
                    <div class="text-area">
                        No Markdown files were found in the posts folder.
                    </div>
                </div>
            `;
            return;
        }

        // Render posts using the existing CSS classes.
        inspectorContainer.innerHTML = posts.map(post => {
            const headline = escapeHTML(post.headline);
            const category = escapeHTML(post.category);
            const date = escapeHTML(formatDate(post.date));

            const renderedMarkdown = DOMPurify.sanitize(
                marked.parse(post.content)
            );

            return `
                <div class="post">
                    <div class="section-heading">
                        <h2>
                            ${headline}
                            <span class="post-date">${date}</span>
                        </h2>

                        <div class="section-index">${category}</div>
                    </div>

                    <div class="text-area">
                        ${renderedMarkdown}
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Failed to load GitHub posts:", error);

        inspectorContainer.innerHTML = `
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
        
        // Intentionally do not reset initializationPromise.
        // Failed attempts remain cached until the page is refreshed.
    }
}

function parsePost(markdown, filename) {
    let headline = "";
    let category = "POST";
    let date = "";
    let content = markdown;

    // Extract YAML-style front matter.
    const frontMatterMatch = markdown.match(
        /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/
    );

    if (frontMatterMatch) {
        const metadata = frontMatterMatch[1];
        content = markdown.slice(frontMatterMatch[0].length);

        headline = getMetadataValue(metadata, "headline");
        category = getMetadataValue(metadata, "category") || "POST";
        date = getMetadataValue(metadata, "date");
    }

    // Use the first Markdown heading if no headline is specified.
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

function formatDate(date) {
    if (!date) return "";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
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
