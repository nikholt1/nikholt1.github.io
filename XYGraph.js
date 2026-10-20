


const CONFIG = {
    type: "line",

    xLabel: "X",
    yLabel: "Y",

    background: "#050505",
    gridColor: "#242a31",
    axisColor: "#8b949e",
    textColor: "#a1a1aa",
    zeroColor: "#6b7280",

    lineColor: "#58a6ff",
    lineWidth: 2.5,

    pointColor: "#58a6ff",
    pointRadius: 4,

    pillarColor: "#58a6ff",
    pillarWidth: 22,
    pillarGap: 5,

    barColor: "#58a6ff",
    barHeight: 22,
    barGap: 5,

    areaColor: "rgba(88, 166, 255, 0.22)",
    fill: false,

    stepColor: "#58a6ff",
    smoothColor: "#58a6ff",
    stemColor: "#58a6ff",

    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 48,
    paddingLeft: 58,

    showGrid: true,
    showTicks: true,
    showZeroLine: true,

    drag: true,
    zoom: true,

    xMin: "plotMin",
    xMax: "plotMax",
    yMin: "plotMin",
    yMax: "plotMax",

    maxPoints: Infinity
};

const data = [];

let canvas;
let ctx;
let container;
let resizeObserver;
let animationFrame = 0;

let view = null;
let dragStart = null;
let destroyed = false;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function scheduleRender() {
    if (destroyed || !ctx) return;

    if (animationFrame) cancelAnimationFrame(animationFrame);

    animationFrame = requestAnimationFrame(() => {
        animationFrame = 0;
        render();
    });
}

function setup() {
    container = document.getElementById("xy-graph");

    if (!container) {
        throw new Error(
            'XYGraph: add an element with id="xy-graph" before importing XYGraph.js.'
        );
    }

    canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.cursor = CONFIG.drag ? "grab" : "default";
    canvas.style.touchAction = "none";

    container.appendChild(canvas);
    ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("XYGraph: could not create a 2D canvas context.");
    }

    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    resizeCanvas();
}

function resizeCanvas() {
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scheduleRender();
}

function niceStep(range, targetTicks = 6) {
    if (!Number.isFinite(range) || range <= 0) return 1;

    const rough = range / targetTicks;
    const power = Math.pow(10, Math.floor(Math.log10(rough)));
    const fraction = rough / power;

    if (fraction <= 1) return power;
    if (fraction <= 2) return 2 * power;
    if (fraction <= 5) return 5 * power;

    return 10 * power;
}

function dataExtents() {
    if (!data.length) {
        return { minX: 0, maxX: 10, minY: 0, maxY: 10 };
    }

    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;

    for (const point of data) {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
    }

    return { minX, maxX, minY, maxY };
}

function autoBounds() {
    let { minX, maxX, minY, maxY } = dataExtents();

    
    minX = Math.min(0, minX);
    maxX = Math.max(0, maxX);
    minY = Math.min(0, minY);
    maxY = Math.max(0, maxY);

    let rangeX = maxX - minX;
    let rangeY = maxY - minY;

    if (rangeX === 0) rangeX = 10;
    if (rangeY === 0) rangeY = 10;

    
    if (minX < 0) minX -= rangeX * 0.05;
    if (maxX > 0) maxX += rangeX * 0.05;
    if (minY < 0) minY -= rangeY * 0.05;
    if (maxY > 0) maxY += rangeY * 0.05;

    if (typeof CONFIG.xMin === "number") minX = CONFIG.xMin;
    if (typeof CONFIG.xMax === "number") maxX = CONFIG.xMax;
    if (typeof CONFIG.yMin === "number") minY = CONFIG.yMin;
    if (typeof CONFIG.yMax === "number") maxY = CONFIG.yMax;

    if (minX === maxX) maxX = minX + 1;
    if (minY === maxY) maxY = minY + 1;

    return { minX, maxX, minY, maxY };
}

function getBounds() {
    return view ?? autoBounds();
}

function plotRect(width, height) {
    return {
        left: CONFIG.paddingLeft,
        top: CONFIG.paddingTop,
        right: Math.max(CONFIG.paddingLeft + 1, width - CONFIG.paddingRight),
        bottom: Math.max(CONFIG.paddingTop + 1, height - CONFIG.paddingBottom)
    };
}

function toCanvasX(x, bounds, rect) {
    return rect.left +
        ((x - bounds.minX) / (bounds.maxX - bounds.minX)) *
        (rect.right - rect.left);
}

function toCanvasY(y, bounds, rect) {
    return rect.bottom -
        ((y - bounds.minY) / (bounds.maxY - bounds.minY)) *
        (rect.bottom - rect.top);
}

function fromCanvasX(x, bounds, rect) {
    return bounds.minX +
        ((x - rect.left) / (rect.right - rect.left)) *
        (bounds.maxX - bounds.minX);
}

function fromCanvasY(y, bounds, rect) {
    return bounds.minY +
        ((rect.bottom - y) / (rect.bottom - rect.top)) *
        (bounds.maxY - bounds.minY);
}

function formatTick(value) {
    if (Math.abs(value) < 1e-10) return "0";

    if (Math.abs(value) >= 100000 || Math.abs(value) < 0.001) {
        return value.toExponential(1);
    }

    return Number(value.toPrecision(5)).toString();
}



function drawGrid(bounds, rect) {
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;

    const stepX = niceStep(bounds.maxX - bounds.minX);
    const stepY = niceStep(bounds.maxY - bounds.minY);

    ctx.save();
    ctx.font = "12px system-ui, sans-serif";
    ctx.lineWidth = 1;

    if (CONFIG.showGrid) {
        ctx.strokeStyle = CONFIG.gridColor;
        ctx.beginPath();

        const firstX = Math.ceil(bounds.minX / stepX) * stepX;

        for (let x = firstX; x <= bounds.maxX + stepX * 1e-8; x += stepX) {
            const px = toCanvasX(x, bounds, rect);
            ctx.moveTo(px, rect.top);
            ctx.lineTo(px, rect.bottom);
        }

        const firstY = Math.ceil(bounds.minY / stepY) * stepY;

        for (let y = firstY; y <= bounds.maxY + stepY * 1e-8; y += stepY) {
            const py = toCanvasY(y, bounds, rect);
            ctx.moveTo(rect.left, py);
            ctx.lineTo(rect.right, py);
        }

        ctx.stroke();
    }

    if (CONFIG.showZeroLine) {
        ctx.strokeStyle = CONFIG.zeroColor;
        ctx.lineWidth = 1.3;
        ctx.beginPath();

        if (bounds.minX <= 0 && bounds.maxX >= 0) {
            const zeroX = toCanvasX(0, bounds, rect);
            ctx.moveTo(zeroX, rect.top);
            ctx.lineTo(zeroX, rect.bottom);
        }

        if (bounds.minY <= 0 && bounds.maxY >= 0) {
            const zeroY = toCanvasY(0, bounds, rect);
            ctx.moveTo(rect.left, zeroY);
            ctx.lineTo(rect.right, zeroY);
        }

        ctx.stroke();
    }

    if (CONFIG.showTicks) {
        ctx.fillStyle = CONFIG.textColor;

        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        for (
            let x = Math.ceil(bounds.minX / stepX) * stepX;
            x <= bounds.maxX + stepX * 1e-8;
            x += stepX
        ) {
            const px = toCanvasX(x, bounds, rect);
            if (px >= rect.left - 1 && px <= rect.right + 1) {
                ctx.fillText(formatTick(x), px, rect.bottom + 8);
            }
        }

        ctx.textAlign = "right";
        ctx.textBaseline = "middle";

        for (
            let y = Math.ceil(bounds.minY / stepY) * stepY;
            y <= bounds.maxY + stepY * 1e-8;
            y += stepY
        ) {
            const py = toCanvasY(y, bounds, rect);
            if (py >= rect.top - 1 && py <= rect.bottom + 1) {
                ctx.fillText(formatTick(y), rect.left - 9, py);
            }
        }
    }

    ctx.fillStyle = CONFIG.textColor;
    ctx.font = "13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(CONFIG.xLabel, rect.left + width / 2, rect.bottom + 43);

    ctx.save();
    ctx.translate(17, rect.top + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(CONFIG.yLabel, 0, 0);
    ctx.restore();

    ctx.restore();
}

function withClipping(rect, draw) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(
        rect.left,
        rect.top,
        rect.right - rect.left,
        rect.bottom - rect.top
    );
    ctx.clip();
    draw();
    ctx.restore();
}

function zeroY(bounds, rect) {
    return toCanvasY(clamp(0, bounds.minY, bounds.maxY), bounds, rect);
}

function zeroX(bounds, rect) {
    return toCanvasX(clamp(0, bounds.minX, bounds.maxX), bounds, rect);
}


function pointColor(point, fallback) {
    return point.color ?? fallback;
}

function drawPoints(bounds, rect) {
    for (const point of data) {
        const x = toCanvasX(point.x, bounds, rect);
        const y = toCanvasY(point.y, bounds, rect);

        ctx.fillStyle = pointColor(point, CONFIG.pointColor);
        ctx.beginPath();
        ctx.arc(x, y, CONFIG.pointRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}


function drawColoredSegments(bounds, rect, mode = "line") {
    if (data.length < 2) return;

    ctx.lineWidth = CONFIG.lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    for (let i = 1; i < data.length; i++) {
        const previous = data[i - 1];
        const current = data[i];

        const x1 = toCanvasX(previous.x, bounds, rect);
        const y1 = toCanvasY(previous.y, bounds, rect);
        const x2 = toCanvasX(current.x, bounds, rect);
        const y2 = toCanvasY(current.y, bounds, rect);

        ctx.strokeStyle = pointColor(current, CONFIG.lineColor);
        ctx.beginPath();

        if (mode === "step") {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2, y2);
        } else {
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }

        ctx.stroke();
    }
}



function drawLine(bounds, rect) {
    if (!data.length) return;

    if (CONFIG.fill) {
        const baseline = zeroY(bounds, rect);
        const first = data[0];
        const last = data[data.length - 1];

        ctx.beginPath();
        ctx.moveTo(toCanvasX(first.x, bounds, rect), baseline);

        for (const point of data) {
            ctx.lineTo(
                toCanvasX(point.x, bounds, rect),
                toCanvasY(point.y, bounds, rect)
            );
        }

        ctx.lineTo(toCanvasX(last.x, bounds, rect), baseline);
        ctx.closePath();
        ctx.fillStyle = CONFIG.areaColor;
        ctx.fill();
    }

    drawColoredSegments(bounds, rect);
    drawPoints(bounds, rect);
}

function drawScatter(bounds, rect) {
    drawPoints(bounds, rect);
}

function drawPillars(bounds, rect) {
    const baseline = zeroY(bounds, rect);

    const pixelStep = data.length > 1
        ? Math.abs(
            toCanvasX(data[1].x, bounds, rect) -
            toCanvasX(data[0].x, bounds, rect)
        )
        : CONFIG.pillarWidth + CONFIG.pillarGap;

    const barWidth = Math.max(
        1,
        Math.min(CONFIG.pillarWidth, pixelStep - CONFIG.pillarGap)
    );

    for (const point of data) {
        const x = toCanvasX(point.x, bounds, rect) - barWidth / 2;
        const y = toCanvasY(point.y, bounds, rect);

        ctx.fillStyle = pointColor(point, CONFIG.pillarColor);
        ctx.fillRect(
            x,
            Math.min(y, baseline),
            barWidth,
            Math.max(1, Math.abs(baseline - y))
        );
    }
}

function drawBars(bounds, rect) {
    const baseline = zeroX(bounds, rect);

    const pixelStep = data.length > 1
        ? Math.abs(
            toCanvasY(data[1].x, bounds, rect) -
            toCanvasY(data[0].x, bounds, rect)
        )
        : CONFIG.barHeight + CONFIG.barGap;

    const barHeight = Math.max(
        1,
        Math.min(CONFIG.barHeight, pixelStep - CONFIG.barGap)
    );

    for (const point of data) {
        const y = toCanvasY(point.x, bounds, rect) - barHeight / 2;
        const x = toCanvasX(point.y, bounds, rect);

        ctx.fillStyle = pointColor(point, CONFIG.barColor);
        ctx.fillRect(
            Math.min(x, baseline),
            y,
            Math.max(1, Math.abs(baseline - x)),
            barHeight
        );
    }
}

function drawArea(bounds, rect) {
    if (!data.length) return;

    const baseline = zeroY(bounds, rect);
    const first = data[0];
    const last = data[data.length - 1];

    ctx.beginPath();
    ctx.moveTo(toCanvasX(first.x, bounds, rect), baseline);

    for (const point of data) {
        ctx.lineTo(
            toCanvasX(point.x, bounds, rect),
            toCanvasY(point.y, bounds, rect)
        );
    }

    ctx.lineTo(toCanvasX(last.x, bounds, rect), baseline);
    ctx.closePath();
    ctx.fillStyle = CONFIG.areaColor;
    ctx.fill();

    drawColoredSegments(bounds, rect);
    drawPoints(bounds, rect);
}

function drawStep(bounds, rect) {
    if (!data.length) return;

    ctx.lineWidth = CONFIG.lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (data.length === 1) {
        drawPoints(bounds, rect);
        return;
    }

    for (let i = 1; i < data.length; i++) {
        const previous = data[i - 1];
        const current = data[i];

        const x1 = toCanvasX(previous.x, bounds, rect);
        const y1 = toCanvasY(previous.y, bounds, rect);
        const x2 = toCanvasX(current.x, bounds, rect);
        const y2 = toCanvasY(current.y, bounds, rect);

        ctx.strokeStyle = pointColor(current, CONFIG.stepColor);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    drawPoints(bounds, rect);
}

function drawStem(bounds, rect) {
    const baseline = zeroY(bounds, rect);

    ctx.lineWidth = CONFIG.lineWidth;

    for (const point of data) {
        const x = toCanvasX(point.x, bounds, rect);
        const y = toCanvasY(point.y, bounds, rect);

        ctx.strokeStyle = pointColor(point, CONFIG.stemColor);
        ctx.beginPath();
        ctx.moveTo(x, baseline);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = pointColor(point, CONFIG.pointColor);
        ctx.beginPath();
        ctx.arc(x, y, CONFIG.pointRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSmooth(bounds, rect) {
    if (!data.length) return;

    const points = data.map(point => ({
        x: toCanvasX(point.x, bounds, rect),
        y: toCanvasY(point.y, bounds, rect)
    }));

    if (points.length === 1) {
        drawPoints(bounds, rect);
        return;
    }

    ctx.lineWidth = CONFIG.lineWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    
    for (let i = 0; i < points.length - 1; i++) {
        const previous = points[Math.max(0, i - 1)];
        const current = points[i];
        const next = points[i + 1];
        const after = points[Math.min(points.length - 1, i + 2)];

        ctx.strokeStyle = pointColor(data[i + 1], CONFIG.smoothColor);
        ctx.beginPath();
        ctx.moveTo(current.x, current.y);

        ctx.bezierCurveTo(
            current.x + (next.x - previous.x) / 6,
            current.y + (next.y - previous.y) / 6,
            next.x - (after.x - current.x) / 6,
            next.y - (after.y - current.y) / 6,
            next.x,
            next.y
        );

        ctx.stroke();
    }

    drawPoints(bounds, rect);
}



function render() {
    if (!ctx || !canvas || destroyed) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = CONFIG.background;
    ctx.fillRect(0, 0, width, height);

    const bounds = getBounds();
    const rect = plotRect(width, height);

    drawGrid(bounds, rect);

    withClipping(rect, () => {
        switch (CONFIG.type) {
            case "scatter":
                drawScatter(bounds, rect);
                break;
            case "pillar":
                drawPillars(bounds, rect);
                break;
            case "bar":
                drawBars(bounds, rect);
                break;
            case "area":
                drawArea(bounds, rect);
                break;
            case "step":
                drawStep(bounds, rect);
                break;
            case "stem":
                drawStem(bounds, rect);
                break;
            case "smooth":
                drawSmooth(bounds, rect);
                break;
            case "line":
            default:
                drawLine(bounds, rect);
                break;
        }
    });
}



function onPointerDown(event) {
    if (!CONFIG.drag) return;

    dragStart = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        bounds: { ...getBounds() }
    };

    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = "grabbing";
}

function onPointerMove(event) {
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;

    const rect = plotRect(canvas.clientWidth, canvas.clientHeight);
    const bounds = dragStart.bounds;

    const dx = event.clientX - dragStart.startX;
    const dy = event.clientY - dragStart.startY;

    const shiftX = -(dx / (rect.right - rect.left)) *
        (bounds.maxX - bounds.minX);

    const shiftY = (dy / (rect.bottom - rect.top)) *
        (bounds.maxY - bounds.minY);

    view = {
        minX: bounds.minX + shiftX,
        maxX: bounds.maxX + shiftX,
        minY: bounds.minY + shiftY,
        maxY: bounds.maxY + shiftY
    };

    scheduleRender();
}

function onPointerUp(event) {
    if (!dragStart || dragStart.pointerId !== event.pointerId) return;

    dragStart = null;
    canvas.style.cursor = CONFIG.drag ? "grab" : "default";
}

function onWheel(event) {
    if (!CONFIG.zoom) return;

    event.preventDefault();

    const bounds = getBounds();
    const rect = plotRect(canvas.clientWidth, canvas.clientHeight);
    const canvasRect = canvas.getBoundingClientRect();

    const px = event.clientX - canvasRect.left;
    const py = event.clientY - canvasRect.top;

    const anchorX = fromCanvasX(px, bounds, rect);
    const anchorY = fromCanvasY(py, bounds, rect);

    const factor = event.deltaY < 0 ? 0.9 : 1.1;

    const nextView = {
        minX: anchorX + (bounds.minX - anchorX) * factor,
        maxX: anchorX + (bounds.maxX - anchorX) * factor,
        minY: anchorY + (bounds.minY - anchorY) * factor,
        maxY: anchorY + (bounds.maxY - anchorY) * factor
    };

    if (
        !Number.isFinite(nextView.minX) ||
        !Number.isFinite(nextView.maxX) ||
        !Number.isFinite(nextView.minY) ||
        !Number.isFinite(nextView.maxY) ||
        nextView.maxX - nextView.minX < 1e-12 ||
        nextView.maxY - nextView.minY < 1e-12
    ) {
        return;
    }

    view = nextView;
    scheduleRender();
}



const XYGraph = {

    plot(x, y, color) {
        x = Number(x);
        y = Number(y);

        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            throw new TypeError(
                "XYGraph.plot(x, y, color) expects finite numeric x and y values."
            );
        }

        if (
            color !== undefined &&
            (typeof color !== "string" || color.trim() === "")
        ) {
            throw new TypeError("XYGraph plot color must be a non-empty CSS color string.");
        }

        data.push({
            x,
            y,
            ...(color !== undefined ? { color } : {})
        });

        if (data.length > CONFIG.maxPoints) {
            data.splice(0, data.length - CONFIG.maxPoints);
        }

        
        scheduleRender();
    },

    clear() {
        data.length = 0;
        view = null;
        scheduleRender();
    },

    getData() {
        return data.map(point => ({ ...point }));
    },

    resetView() {
        view = null;
        dragStart = null;
        scheduleRender();
    },

    refresh() {
        scheduleRender();
    },

    destroy() {
        destroyed = true;

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        }

        resizeObserver?.disconnect();

        if (canvas) {
            canvas.removeEventListener("pointerdown", onPointerDown);
            canvas.removeEventListener("pointermove", onPointerMove);
            canvas.removeEventListener("pointerup", onPointerUp);
            canvas.removeEventListener("pointercancel", onPointerUp);
            canvas.removeEventListener("wheel", onWheel);
            canvas.remove();
        }

        canvas = null;
        ctx = null;
        container = null;
    }
};



const propertyMap = {
    setType: "type",
    setX: "xLabel",
    setY: "yLabel",

    setXMin: "xMin",
    setXMax: "xMax",
    setYMin: "yMin",
    setYMax: "yMax",

    setDrag: "drag",
    setZoom: "zoom",
    setFill: "fill",

    setPillarWidth: "pillarWidth",
    setPillarGap: "pillarGap",

    setBarHeight: "barHeight",
    setBarGap: "barGap",

    setPointRadius: "pointRadius",
    setLineWidth: "lineWidth",

    setLineColor: "lineColor",
    setPointColor: "pointColor",
    setPillarColor: "pillarColor",
    setBarColor: "barColor",
    setAreaColor: "areaColor",
    setStepColor: "stepColor",
    setSmoothColor: "smoothColor",
    setStemColor: "stemColor",

    setBackground: "background",
    setGridColor: "gridColor",
    setAxisColor: "axisColor",
    setTextColor: "textColor",

    setShowGrid: "showGrid",
    setShowTicks: "showTicks",
    setShowZeroLine: "showZeroLine",

    setMaxPoints: "maxPoints"
};

for (const [publicName, configName] of Object.entries(propertyMap)) {
    Object.defineProperty(XYGraph, publicName, {
        enumerable: true,
        configurable: false,

        get() {
            return CONFIG[configName];
        },

        set(value) {
            CONFIG[configName] = value;

            if (publicName === "setDrag" && canvas) {
                canvas.style.cursor = value ? "grab" : "default";
            }

            scheduleRender();
        }
    });
}

setup();

export default XYGraph;
