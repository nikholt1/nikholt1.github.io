
let canvas;
let ctx;
let resizeObserver;
let animationFrameId = null;

let selectedNodeId = null;
let activeNode = null;
let isPanning = false;
let isSpacePressed = false;

let panStartX = 0;
let panStartY = 0;
let dragOffsetX = 0;
let dragOffsetY = 0;
let panOffsetX = 0;
let panOffsetY = 0;
let zoom = 5;

let labelMode = "always";

let simulationTime = 0;
let lastFrameTime = 0;

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;

const NODE_RADIUS = 3.5;
const SELECTED_RADIUS = 5;
const LABEL_OFFSET = 9;

const BASE_BRANCH_SPACING = 3;
const SIZE_SPACING_FACTOR = 5.5;

const ANGLE_JITTER = 0.12;
const DISTANCE_JITTER = 3;

const SPRING_STRENGTH = 0.006;
const EDGE_STRENGTH = 0.009;
const REPULSION_STRENGTH = 1000;
const REPULSION_DISTANCE = 65;
const DAMPING = 0.765;
const WATER_STRENGTH = 0.008;
const MAX_SPEED = 100;

let connectionsHighlighted = "rgba(200, 200, 200, 0.9)";
let connectionNonSelected = "rgba(184, 184, 184, 0.35)";

const notes = [
    // =========================================
    // ROOT
    // =========================================
    {
        id: "index",
        title: "index.html",
        color: "#f97316",
        size: 10,
        links: [
            "app",
            "style",
            "cesium-library",
            "markdown-css",
            "navigation",
            "profile",
            "contact",
            "assets",
            "reports"
        ]
    },

    // =========================================
    // MAIN ENTRY POINT
    // =========================================
    {
        id: "app",
        title: "app.js",
        parentId: "index",
        color: "#facc15",
        size: 8,
        links: [
            "navigation",
            "profile",
            "clock",
            "weather",
            "projects",
            "inspector",
            "cesium"
        ]
    },

    // =========================================
    // HTML / CSS / EXTERNAL LIBRARIES
    // =========================================
    {
        id: "style",
        title: "style.css",
        parentId: "index",
        color: "#b9b9b9",
        size: 6
    },
    {
        id: "cesium-library",
        title: "CesiumJS",
        parentId: "index",
        color: "#b9b9b9",
        size: 5
    },
    {
        id: "markdown-css",
        title: "GitHub Markdown CSS",
        parentId: "index",
        color: "#b9b9b9",
        size: 4
    },

    // =========================================
    // NAVIGATION
    // =========================================
    {
        id: "navigation",
        title: "navigation.js",
        parentId: "app",
        color: "#facc15",
        size: 7,
        links: [
            "home",
            "github-page",
            "projects-page"
        ]
    },
    {
        id: "home",
        title: "Home view",
        parentId: "navigation",
        color: "#b9b9b9",
        size: 4
    },
    {
        id: "github-page",
        title: "GitHub view",
        parentId: "navigation",
        color: "#b9b9b9",
        size: 4
    },
    {
        id: "projects-page",
        title: "Projects view",
        parentId: "navigation",
        color: "#b9b9b9",
        size: 4,
        links: ["reports"]
    },

    // =========================================
    // PROFILE
    // =========================================
    {
        id: "profile",
        title: "profile.js",
        parentId: "app",
        color: "#facc15",
        size: 7,
        links: [
            "overview",
            "interests",
            "tab-projects",
            "tab-focus"
        ]
    },
    {
        id: "overview",
        title: "Overview tab",
        parentId: "profile",
        color: "#b9b9b9",
        size: 4
    },
    {
        id: "interests",
        title: "Interests tab",
        parentId: "profile",
        color: "#b9b9b9",
        size: 4
    },
    {
        id: "tab-projects",
        title: "Profile projects tab",
        parentId: "profile",
        color: "#b9b9b9",
        size: 4
    },
    {
        id: "tab-focus",
        title: "Development Focus tab",
        parentId: "profile",
        color: "#b9b9b9",
        size: 4
    },

    // =========================================
    // TIME
    // =========================================
    {
        id: "clock",
        title: "clock.js",
        parentId: "app",
        color: "#facc15",
        size: 5,
        links: ["copenhagen-time"]
    },
    {
        id: "copenhagen-time",
        title: "Copenhagen time",
        parentId: "clock",
        color: "#b9b9b9",
        size: 3
    },

    // =========================================
    // WEATHER
    // =========================================
    {
        id: "weather",
        title: "weather.js",
        parentId: "app",
        color: "#facc15",
        size: 5,
        links: ["weather-api", "weather-display"]
    },
    {
        id: "weather-api",
        title: "Weather API",
        parentId: "weather",
        color: "#b9b9b9",
        size: 4
    },
    {
        id: "weather-display",
        title: "Weather display",
        parentId: "weather",
        color: "#b9b9b9",
        size: 3
    },

    // =========================================
    // PROJECTS
    // =========================================
    {
        id: "projects",
        title: "projects.js",
        parentId: "app",
        color: "#facc15",
        size: 5,
        links: ["github-api", "project-cards"]
    },
    {
        id: "github-api",
        title: "GitHub API",
        parentId: "projects",
        color: "#b9b9b9",
        size: 4
    },
    {
        id: "project-cards",
        title: "Project cards",
        parentId: "projects",
        color: "#b9b9b9",
        size: 4
    },

    // =========================================
    // REPOSITORY INSPECTOR
    // =========================================
    {
        id: "inspector",
        title: "inspector.js",
        parentId: "app",
        color: "#facc15",
        size: 6,
        links: ["repository-inspector"]
    },
    {
        id: "repository-inspector",
        title: "Repository Inspector",
        parentId: "inspector",
        color: "#b9b9b9",
        size: 4
    },

    // =========================================
    // CESIUM / GLOBE
    // =========================================
    {
        id: "cesium",
        title: "cesium.js",
        parentId: "app",
        color: "#facc15",
        size: 6,
        links: ["cesium-library", "map-asset", "globe"]
    },
    {
        id: "globe",
        title: "Interactive globe",
        parentId: "cesium",
        color: "#b9b9b9",
        size: 5
    },
    {
        id: "map-asset",
        title: "images/map.png",
        parentId: "cesium",
        color: "#b9b9b9",
        size: 3
    },

    // =========================================
    // IMAGES / ASSETS
    // =========================================
    {
        id: "assets",
        title: "Images and assets",
        parentId: "index",
        color: "#b9b9b9",
        size: 4,
        links: ["simplefastpost-icon"]
    },
    {
        id: "simplefastpost-icon",
        title: "simplefastpostIcon.png",
        parentId: "assets",
        color: "#b9b9b9",
        size: 3
    },

    // =========================================
    // CONTACT
    // =========================================
    {
        id: "contact",
        title: "Contact form",
        parentId: "index",
        color: "#b9b9b9",
        size: 4,
        links: ["formspree"]
    },
    {
        id: "formspree",
        title: "Formspree",
        parentId: "contact",
        color: "#b9b9b9",
        size: 3
    },

    // =========================================
    // PROJECT REPORTS
    // =========================================
    {
        id: "reports",
        title: "Project report pages",
        parentId: "index",
        color: "#b9b9b9",
        size: 5,
        links: [
            "report-refract",
            "report-simplefastpost"
        ]
    },
    {
        id: "report-refract",
        title: "Refract report",
        parentId: "reports",
        color: "#f97316",
        size: 3
    },
    {
        id: "report-simplefastpost",
        title: "SimpleFastPost report",
        parentId: "reports",
        color: "#f97316",
        size: 3
    }
];
const graphLinks = [];



function findNode(id) {
    return notes.find(node => node.id === id);
}

export function getNode(id) {
    return findNode(id);
}

export function getNodes() {
    return [...notes];
}

export function getGraphLinks() {
    return graphLinks.map(link => ({ ...link }));
}

function ensureNode(id) {
    if (id == null || id === "") {
        throw new Error("Every graph node requires a valid ID.");
    }

    let node = findNode(id);

    if (!node) {
        node = {
            id,
            title: String(id),
            parentId: null,
            placeholder: true
        };

        notes.push(node);
    }

    return node;
}

function upsertLink(link) {
    if (!link || link.source == null || link.target == null) {
        throw new Error("A link requires both source and target IDs.");
    }

    if (link.source === link.target) {
        throw new Error("A node cannot link to itself.");
    }

    ensureNode(link.source);
    ensureNode(link.target);

    const existing = graphLinks.find(item =>
        item.source === link.source &&
        item.target === link.target
    );

    if (existing) {
        Object.assign(existing, link);
    } else {
        graphLinks.push({ ...link });
    }
}

export function pushLink(link) {
    upsertLink(link);
    refreshGraph();

    return graphLinks.find(item =>
        item.source === link.source &&
        item.target === link.target
    );
}

export function pushNode(input) {
    if (!input || input.id == null || input.id === "") {
        throw new Error("pushNode() requires a valid node ID.");
    }

    const { links = [], ...properties } = input;

    if (!Array.isArray(links)) {
        throw new TypeError("Node links must be an array.");
    }

    const node = ensureNode(properties.id);

    Object.assign(node, properties);
    node.placeholder = false;

    if (node.parentId != null) {
        ensureNode(node.parentId);
    }

    for (const link of links) {
        if (typeof link === "string" || typeof link === "number") {
            upsertLink({
                source: node.id,
                target: link
            });
        } else if (link && typeof link === "object") {
            const source = link.source ?? node.id;
            const target = link.target;

            if (target == null) {
                throw new Error(
                    `A link on node "${node.id}" requires a target.`
                );
            }

            upsertLink({
                ...link,
                source,
                target
            });
        } else {
            throw new TypeError(
                "Each link must be a node ID or a link object."
            );
        }
    }

    refreshGraph();

    return node;
}



function getConnections() {
    const nodeMap = new Map(notes.map(node => [node.id, node]));
    const connections = [];
    const seen = new Set();

    function addConnection(sourceId, targetId, properties = {}) {
        const source = nodeMap.get(sourceId);
        const target = nodeMap.get(targetId);

        if (!source || !target || sourceId === targetId) return;

        const key = `${sourceId}->${targetId}`;

        if (seen.has(key)) return;

        seen.add(key);

        connections.push({
            ...properties,
            source,
            target
        });
    }

    for (const node of notes) {
        if (node.parentId != null) {
            addConnection(node.parentId, node.id);
        }
    }

    for (const link of graphLinks) {
        addConnection(link.source, link.target, link);
    }

    return connections;
}



function refreshGraph() {
    if (!canvas || !ctx || !canvas.isConnected) return;

    initializePositions();
    drawGraph();
}



function getNodeRadius(node) {
    return Number.isFinite(node.size) && node.size > 0
        ? node.size
        : NODE_RADIUS;
}

function getDesiredLinkDistance(source, target) {
    const combinedRadius =
        getNodeRadius(source) + getNodeRadius(target);

    return BASE_BRANCH_SPACING +
        combinedRadius * SIZE_SPACING_FACTOR;
}

function initializePositions() {
    if (!canvas || !notes.length) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const nodeMap = new Map(notes.map(node => [node.id, node]));
    const childrenMap = new Map(notes.map(node => [node.id, []]));

    for (const node of notes) {
        node.vx ??= 0;
        node.vy ??= 0;

        node.phase ??= Math.random() * Math.PI * 2;
        node.waveX ??= Math.random() * 0.8 + 0.6;
        node.waveY ??= Math.random() * 0.8 + 0.6;
        node.waveSpeed ??= Math.random() * 0.3 + 0.7;

        node.angleJitter ??=
            (Math.random() - 0.5) * ANGLE_JITTER;

        node.distanceJitter ??=
            (Math.random() - 0.5) * 2 * DISTANCE_JITTER;

        if (
            node.parentId != null &&
            childrenMap.has(node.parentId)
        ) {
            childrenMap.get(node.parentId).push(node);
        }
    }

    const roots = notes.filter(node =>
        node.parentId == null || !nodeMap.has(node.parentId)
    );

    const root = roots[0];
    if (!root) return;

    function countLeaves(node, path = new Set()) {
        if (path.has(node.id)) return 0;

        const nextPath = new Set(path);
        nextPath.add(node.id);

        const children = childrenMap.get(node.id) || [];

        if (!children.length) return 1;

        return children.reduce(
            (sum, child) => sum + countLeaves(child, nextPath),
            0
        );
    }

    if (
        !Number.isFinite(root.x) ||
        !Number.isFinite(root.y)
    ) {
        root.x = width / 2;
        root.y = height / 2;
    }

    root.targetX = width / 2;
    root.targetY = height / 2;

    const visited = new Set();

    function placeBranch(node, parent, startAngle, endAngle) {
        if (visited.has(node.id)) return;
        visited.add(node.id);

        const angle =
            (startAngle + endAngle) / 2 +
            node.angleJitter;

        const distance =
            getDesiredLinkDistance(parent, node) +
            node.distanceJitter;

        node.targetX =
            parent.targetX + Math.cos(angle) * distance;

        node.targetY =
            parent.targetY + Math.sin(angle) * distance;

        if (
            !Number.isFinite(node.x) ||
            !Number.isFinite(node.y)
        ) {
            node.x = node.targetX;
            node.y = node.targetY;
        }

        const children = childrenMap.get(node.id) || [];
        if (!children.length) return;

        const totalLeaves = children.reduce(
            (sum, child) => sum + countLeaves(child),
            0
        );

        let cursor = startAngle;
        const sectorSize = endAngle - startAngle;

        for (const child of children) {
            const leaves = countLeaves(child);

            const childSector = totalLeaves
                ? sectorSize * leaves / totalLeaves
                : sectorSize / children.length;

            placeBranch(
                child,
                node,
                cursor,
                cursor + childSector
            );

            cursor += childSector;
        }
    }

    const fullCircle = Math.PI * 2;
    const rootChildren = childrenMap.get(root.id) || [];

    let cursor = -Math.PI / 2;

    const totalRootLeaves = rootChildren.reduce(
        (sum, child) => sum + countLeaves(child),
        0
    );

    for (const child of rootChildren) {
        const leaves = countLeaves(child);

        const sector = totalRootLeaves
            ? fullCircle * leaves / totalRootLeaves
            : fullCircle / Math.max(1, rootChildren.length);

        placeBranch(
            child,
            root,
            cursor,
            cursor + sector
        );

        cursor += sector;
    }

    roots.slice(1).forEach((otherRoot, index) => {
        const angle =
            index * fullCircle / Math.max(1, roots.length - 1);

        otherRoot.targetX =
            root.targetX +
            Math.cos(angle) *
            getDesiredLinkDistance(root, otherRoot);

        otherRoot.targetY =
            root.targetY +
            Math.sin(angle) *
            getDesiredLinkDistance(root, otherRoot);

        if (
            !Number.isFinite(otherRoot.x) ||
            !Number.isFinite(otherRoot.y)
        ) {
            otherRoot.x = otherRoot.targetX;
            otherRoot.y = otherRoot.targetY;
        }

        placeBranch(
            otherRoot,
            root,
            angle - Math.PI / 4,
            angle + Math.PI / 4
        );
    });

    for (const node of notes) {
        if (
            !Number.isFinite(node.x) ||
            !Number.isFinite(node.y)
        ) {
            node.x = root.x;
            node.y = root.y;
        }

        node.vx ??= 0;
        node.vy ??= 0;
    }
}



export function initializeInspector() {
    const container = document.getElementById("foam-graph");

    if (!container) {
        console.error("Graph container not found.");
        return;
    }

    resizeObserver?.disconnect();

    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    selectedNodeId = null;
    activeNode = null;
    isPanning = false;
    isSpacePressed = false;

    zoom = 1;
    panOffsetX = 0;
    panOffsetY = 0;
    simulationTime = 0;
    lastFrameTime = 0;

    container.innerHTML = `
        <section class="obsidian-graph">
            <div class="obsidian-toolbar">
                <span class="obsidian-heading">Graph view</span>

                <div class="obsidian-controls">
                    <label class="obsidian-label-toggle">
                        <span>Labels</span>
                        <select
                            data-action="labels"
                            aria-label="Node label visibility"
                        >
                            <option value="selected">Selected only</option>
                            <option value="always">Always show</option>
                        </select>
                    </label>

                    <button type="button" data-action="out"
                        aria-label="Zoom out">−</button>

                    <span class="obsidian-zoom">100%</span>

                    <button type="button" data-action="in"
                        aria-label="Zoom in">+</button>

                    <button type="button" data-action="reset">Reset</button>
                </div>
            </div>

            <div class="obsidian-viewport">
                <canvas class="obsidian-canvas"
                    aria-label="Obsidian-style note graph"
                    tabindex="0"></canvas>

                <div class="obsidian-status">
                    <span class="obsidian-status-dot"></span>
                    <span class="obsidian-counter"></span>
                </div>

            </div>

            <div class="obsidian-footer">
                <span class="obsidian-selection">
                    Click a note to explore its connections
                </span>
            </div>
        </section>
    `;

    addGraphStyles();

    canvas = container.querySelector(".obsidian-canvas");
    ctx = canvas.getContext("2d");

    const controls = container.querySelector(".obsidian-controls");

    controls.querySelector('[data-action="in"]')
        .addEventListener("click", () => setZoom(zoom * 1.2));

    controls.querySelector('[data-action="out"]')
        .addEventListener("click", () => setZoom(zoom / 1.2));

    controls.querySelector('[data-action="reset"]')
        .addEventListener("click", resetView);

    const labelSelect = controls.querySelector('[data-action="labels"]');

    labelSelect.value = labelMode;

    labelSelect.addEventListener("change", event => {
        labelMode = event.target.value;
        drawGraph();
    });

    canvas.addEventListener("pointerdown", startDrag);
    canvas.addEventListener("pointermove", dragNode);
    canvas.addEventListener("pointerup", stopDrag);
    canvas.addEventListener("pointercancel", stopDrag);
    canvas.addEventListener("lostpointercapture", stopDrag);

    canvas.addEventListener("wheel", handleZoom, { passive: false });

    canvas.addEventListener("keydown", event => {
        if (event.code === "Space") {
            isSpacePressed = true;
            event.preventDefault();
        }
    });

    canvas.addEventListener("keyup", event => {
        if (event.code === "Space") isSpacePressed = false;
    });

    canvas.addEventListener("blur", () => {
        isSpacePressed = false;
    });

    canvas.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas.parentElement);

    resizeCanvas();

    const root = notes.find(node => node.parentId == null);

    if (root) {
        panOffsetX = canvas.clientWidth / 2 - root.x;
        panOffsetY = canvas.clientHeight / 2 - root.y;
    }

    startAnimation();
}



function addGraphStyles() {
    if (document.getElementById("obsidian-graph-styles")) return;

    const style = document.createElement("style");
    style.id = "obsidian-graph-styles";

style.textContent = `
.obsidian-graph {
    --graph-bg: #050505;

        --graph-panel: #050505;
        --graph-border: #30363d;
        --graph-text: #dcddde;
        --graph-muted: #999;
        --graph-blue: #7f6df2;
        --graph-surface: #18232d;

        width: 100%;
        overflow: hidden;
        color: var(--graph-text);
        background: var(--graph-bg);
        border: 1px solid var(--graph-border);
        border-radius: 8px;
        font-family: Arial, sans-serif;
    }

    .obsidian-graph * {
        box-sizing: border-box;
    }

    .obsidian-toolbar {
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 14px;
        background: var(--graph-panel);
        border-bottom: 1px solid var(--graph-border);
    }

    .obsidian-heading {
        color: var(--graph-text);
        font-size: 13px;
        font-weight: 600;
    }

    .obsidian-controls {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .obsidian-controls button {
        min-width: 29px;
        height: 28px;
        padding: 0 8px;
        color: var(--graph-text);
        background: var(--graph-surface);
        border: 1px solid var(--graph-border);
        border-radius: 5px;
        font-size: 12px;
        cursor: pointer;
        transition: background 150ms ease, border-color 150ms ease;
    }

    .obsidian-controls button:hover {
        background: var(--graph-border);
        border-color: var(--graph-muted);
    }

    .obsidian-controls button:focus-visible,
    .obsidian-label-toggle select:focus-visible {
        outline: 1px solid var(--graph-blue);
        outline-offset: 2px;
    }

    .obsidian-label-toggle {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--graph-muted);
        font-size: 11px;
        white-space: nowrap;
    }

    .obsidian-label-toggle select {
        max-width: 115px;
        height: 28px;
        padding: 0 6px;
        color: var(--graph-text);
        background: var(--graph-surface);
        border: 1px solid var(--graph-border);
        border-radius: 5px;
        font-size: 11px;
        cursor: pointer;
    }

    .obsidian-label-toggle select:hover {
        border-color: var(--graph-muted);
    }

    .obsidian-zoom {
        min-width: 43px;
        color: var(--graph-muted);
        font-size: 11px;
        text-align: center;
    }

    .obsidian-viewport {
        position: relative;
        height: clamp(400px, 62vh, 680px);
        min-height: 350px;
        overflow: hidden;
        background: var(--graph-bg);
    }

    .obsidian-canvas {
        display: block;
        width: 100%;
        height: 100%;
        touch-action: none;
        cursor: grab;
        outline: none;
    }

    .obsidian-canvas:active {
        cursor: grabbing;
    }

    .obsidian-status {
        position: absolute;
        top: 13px;
        left: 14px;
        display: flex;
        align-items: center;
        gap: 7px;
        color: var(--graph-muted);
        font-size: 10px;
        pointer-events: none;
    }

    .obsidian-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--graph-blue);
    }



    .obsidian-footer {
        min-height: 38px;
        display: flex;
        align-items: center;
        padding: 9px 14px;
        background: var(--graph-panel);
        border-top: 1px solid var(--graph-border);
        font-size: 11px;
        color: var(--graph-muted);
    }

    .obsidian-selection {
        overflow: hidden;
        color: var(--graph-text);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    @media (max-width: 600px) {
        .obsidian-toolbar {
            padding: 8px;
            flex-wrap: wrap;
        }

        .obsidian-controls {
            flex-wrap: wrap;
        }

        .obsidian-viewport {
            height: 470px;
        }


    }
`;

document.head.appendChild(style);

    document.head.appendChild(style);
}



function resizeCanvas() {
    if (!canvas || !ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    initializePositions();
    drawGraph();
}



function updatePhysics(dt) {
    const step = Math.min(dt / 16.667, 2);

    simulationTime += dt * 0.001;

    const connections = getConnections();
    const root = notes.find(node => node.parentId == null);

    for (const node of notes) {
        if (node === activeNode) {
            node.vx = 0;
            node.vy = 0;
            continue;
        }

        let fx = 0;
        let fy = 0;

        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;

        const rootStrength = node === root
            ? 0.055
            : SPRING_STRENGTH;

        fx += dx * rootStrength;
        fy += dy * rootStrength;

        const t = simulationTime * node.waveSpeed + node.phase;

        fx += Math.sin(t) * WATER_STRENGTH * node.waveX;
        fy += Math.cos(t * 0.83 + node.phase) *
            WATER_STRENGTH * node.waveY;

        if (node === root) {
            fx += (root.targetX - node.x) * 0.04;
            fy += (root.targetY - node.y) * 0.04;
        }

        node.vx += fx * step;
        node.vy += fy * step;
    }

    
    for (const { source, target } of connections) {
        const dx = target.x - source.x;
        const dy = target.y - source.y;

        const distance = Math.hypot(dx, dy) || 0.001;

        const desiredDistance =
            getDesiredLinkDistance(source, target);

        const force =
            (distance - desiredDistance) * EDGE_STRENGTH;

        const fx = dx / distance * force * step;
        const fy = dy / distance * force * step;

        if (source !== activeNode) {
            source.vx += fx;
            source.vy += fy;
        }

        if (target !== activeNode) {
            target.vx -= fx;
            target.vy -= fy;
        }
    }

   
    for (let i = 0; i < notes.length; i++) {
        const a = notes[i];

        for (let j = i + 1; j < notes.length; j++) {
            const b = notes[j];

            let dx = b.x - a.x;
            let dy = b.y - a.y;

            let distance = Math.hypot(dx, dy);

            if (distance === 0) {
                dx = 0.01;
                dy = 0.01;
                distance = Math.hypot(dx, dy);
            }

            if (distance >= REPULSION_DISTANCE) continue;

            const strength =
                (REPULSION_DISTANCE - distance) /
                REPULSION_DISTANCE;

            const force = REPULSION_STRENGTH *
                strength * strength / distance;

            const fx = dx * force * 0.00001 * step;
            const fy = dy * force * 0.00001 * step;

            if (a !== activeNode) {
                a.vx -= fx;
                a.vy -= fy;
            }

            if (b !== activeNode) {
                b.vx += fx;
                b.vy += fy;
            }
        }
    }

    
    for (const node of notes) {
        if (node === activeNode) continue;

        node.vx *= Math.pow(DAMPING, step);
        node.vy *= Math.pow(DAMPING, step);

        const speed = Math.hypot(node.vx, node.vy);

        if (speed > MAX_SPEED) {
            node.vx = node.vx / speed * MAX_SPEED;
            node.vy = node.vy / speed * MAX_SPEED;
        }

        node.x += node.vx * step;
        node.y += node.vy * step;
    }
}



function startAnimation() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }

    function animate(timestamp) {
        if (!canvas?.isConnected) {
            animationFrameId = null;
            return;
        }

        const dt = lastFrameTime
            ? Math.min(timestamp - lastFrameTime, 32)
            : 16.667;

        lastFrameTime = timestamp;

        updatePhysics(dt);
        drawGraph();

        animationFrameId = requestAnimationFrame(animate);
    }

    animationFrameId = requestAnimationFrame(animate);
}



function drawGraph() {
    if (!canvas || !ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.save();

    ctx.translate(panOffsetX, panOffsetY);
    ctx.scale(zoom, zoom);

    const connections = getConnections();
    const selected = findNode(selectedNodeId);
    const connectedIds = new Set();

    if (selected) {
        for (const { source, target } of connections) {
            if (source.id === selected.id) {
                connectedIds.add(target.id);
            }

            if (target.id === selected.id) {
                connectedIds.add(source.id);
            }
        }
    }

    
    for (const link of connections) {
        const { source, target } = link;

        const highlighted = selected && (
            source.id === selected.id ||
            target.id === selected.id
        );

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);

        ctx.strokeStyle = link.color || (
            highlighted
                ? connectionsHighlighted
                : selected
                    ? connectionNonSelected
                    : connectionNonSelected
        );

        ctx.lineWidth = link.width ?? (
            highlighted ? 1.2 : 0.8
        );

        ctx.stroke();
    }

    
    for (const node of notes) {
        drawNode(
            node,
            node.id === selectedNodeId,
            connectedIds.has(node.id)
        );
    }

    ctx.restore();

    updateGraphUI();
}

function drawNode(node, isSelected, isConnected) {
    const baseRadius = getNodeRadius(node);

    const radius = isSelected
        ? Math.max(baseRadius, SELECTED_RADIUS)
        : baseRadius;

    
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

    ctx.fillStyle = isSelected
        ? "#7f6df2"
        : node.color || "#999999";

    ctx.fill();

   
    if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);

        ctx.strokeStyle = "rgba(127, 109, 242, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

   
    const showLabel =
        labelMode === "always" || isSelected;

    if (!showLabel) return;

    
    ctx.font = isSelected
        ? "600 12px Arial, sans-serif"
        : "12px Arial, sans-serif";

    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    ctx.fillStyle = isSelected
        ? "#a99bff"
        : isConnected
            ? "#dedede"
            : "#b5b5b5";

    ctx.fillText(
        node.title,
        node.x,
        node.y - radius - LABEL_OFFSET
    );
}


function getPointerPosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function screenToWorld(x, y) {
    return {
        x: (x - panOffsetX) / zoom,
        y: (y - panOffsetY) / zoom
    };
}

function getNoteAt(screenX, screenY) {
    const world = screenToWorld(screenX, screenY);

    for (let i = notes.length - 1; i >= 0; i--) {
        const node = notes[i];
        const radius = getNodeRadius(node);

        if (
            Math.hypot(
                world.x - node.x,
                world.y - node.y
            ) <= Math.max(14, radius + 8) / zoom
        ) {
            return node;
        }
    }

    return null;
}



function startDrag(event) {
    if (event.button !== 0) return;

    canvas.focus({ preventScroll: true });

    const position = getPointerPosition(event);

    const node = isSpacePressed
        ? null
        : getNoteAt(position.x, position.y);

    if (node) {
        activeNode = node;
        selectedNodeId = node.id;

        const world = screenToWorld(position.x, position.y);

        dragOffsetX = world.x - node.x;
        dragOffsetY = world.y - node.y;

        node.vx = 0;
        node.vy = 0;

       
        const index = notes.indexOf(node);

        if (index !== -1) {
            notes.splice(index, 1);
            notes.push(node);
        }
    } else {
        isPanning = true;

        panStartX = position.x - panOffsetX;
        panStartY = position.y - panOffsetY;
    }

    canvas.setPointerCapture(event.pointerId);
    drawGraph();
}

function dragNode(event) {
    const position = getPointerPosition(event);

    if (activeNode) {
        const world = screenToWorld(position.x, position.y);

        activeNode.x = world.x - dragOffsetX;
        activeNode.y = world.y - dragOffsetY;

        activeNode.targetX = activeNode.x;
        activeNode.targetY = activeNode.y;

        activeNode.vx = 0;
        activeNode.vy = 0;

        drawGraph();
        return;
    }

    if (isPanning) {
        panOffsetX = position.x - panStartX;
        panOffsetY = position.y - panStartY;

        drawGraph();
        return;
    }

    canvas.style.cursor = getNoteAt(position.x, position.y)
        ? "pointer"
        : "grab";
}

function stopDrag() {
    if (activeNode) {
        activeNode.vx = 0;
        activeNode.vy = 0;
    }

    activeNode = null;
    isPanning = false;

    if (canvas) canvas.style.cursor = "grab";
}



function handleZoom(event) {
    event.preventDefault();

    const position = getPointerPosition(event);
    const worldBefore = screenToWorld(position.x, position.y);

    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;

    zoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, zoom * factor)
    );

    panOffsetX = position.x - worldBefore.x * zoom;
    panOffsetY = position.y - worldBefore.y * zoom;

    drawGraph();
}

function setZoom(value) {
    if (!canvas) return;

    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2;

    const worldBefore = screenToWorld(centerX, centerY);

    zoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, value)
    );

    panOffsetX = centerX - worldBefore.x * zoom;
    panOffsetY = centerY - worldBefore.y * zoom;

    drawGraph();
}

// --------------------------------------------------
// RESET VIEW
// --------------------------------------------------

function resetView() {
    if (!canvas) return;

    zoom = 1;
    selectedNodeId = null;

    const xs = notes.map(node => node.x);
    const ys = notes.map(node => node.y);

    if (!xs.length) return;

    const centerX =
        (Math.min(...xs) + Math.max(...xs)) / 2;

    const centerY =
        (Math.min(...ys) + Math.max(...ys)) / 2;

    panOffsetX = canvas.clientWidth / 2 - centerX;
    panOffsetY = canvas.clientHeight / 2 - centerY;

    drawGraph();
}



function updateGraphUI() {
    const container = canvas?.closest(".obsidian-graph");
    if (!container) return;

    const zoomLabel = container.querySelector(".obsidian-zoom");
    const selectionLabel = container.querySelector(".obsidian-selection");
    const counter = container.querySelector(".obsidian-counter");

    if (zoomLabel) {
        zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    }

    const connections = getConnections();

    if (counter) {
        counter.textContent =
            `${notes.length} notes · ${connections.length} links`;
    }

    if (!selectionLabel) return;

    const selected = findNode(selectedNodeId);

    if (!selected) {
        selectionLabel.textContent =
            "Click a note to explore its connections";
        return;
    }

    const related = new Set();

    for (const { source, target } of connections) {
        if (source.id === selected.id) {
            related.add(target.id);
        }

        if (target.id === selected.id) {
            related.add(source.id);
        }
    }

    selectionLabel.textContent =
        `${selected.title} · ${related.size} linked notes`;
}







