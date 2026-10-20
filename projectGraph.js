
import XYGraph from "./XYGraph.js";

const GITHUB_USERNAME = "nikholt1";
const CURRENT_YEAR = new Date().getFullYear();

const CONTRIBUTIONS_API =
    `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=${CURRENT_YEAR}`;

const MILLISECONDS_PER_DAY = 86_400_000;

export async function initializeProjectDataGraph() {
    XYGraph.setType = "area";

    XYGraph.setX = `${CURRENT_YEAR}`;
    XYGraph.setY = "Contributions";

    XYGraph.setXMin = 0;
    XYGraph.setYMin = 0;

    
    const startOfYear = new Date(CURRENT_YEAR, 0, 1);
    const endOfYear = new Date(CURRENT_YEAR + 1, 0, 1);

    const daysInYear = Math.round(
        (endOfYear - startOfYear) / MILLISECONDS_PER_DAY
    );

    XYGraph.setXMax = daysInYear - 1;
    XYGraph.setYMax = "plotMax";

    XYGraph.setPointColor = "#58a6ff";
    XYGraph.setPointRadius = 0.1;
    XYGraph.setLineWidth = 1;
    XYGraph.setDrag = false;
    XYGraph.setZoom = false;
    XYGraph.setFill = false;

    try {
        const response = await fetch(CONTRIBUTIONS_API);

        if (!response.ok) {
            throw new Error(
                `GitHub contributions request failed: ${response.status}`
            );
        }

        const result = await response.json();

        if (!Array.isArray(result.contributions)) {
            throw new Error("Invalid GitHub contribution data.");
        }

        
        const dailyCounts = new Array(daysInYear).fill(0);

        for (const entry of result.contributions) {
            const date = new Date(`${entry.date}T00:00:00`);

            if (
                Number.isNaN(date.getTime()) ||
                date.getFullYear() !== CURRENT_YEAR
            ) {
                continue;
            }

            const dayIndex = Math.round(
                (date - startOfYear) / MILLISECONDS_PER_DAY
            );

            if (dayIndex >= 0 && dayIndex < daysInYear) {
                dailyCounts[dayIndex] = entry.count;
            }
        }

        for (let day = 0; day < daysInYear; day++) {
            XYGraph.plot(day, dailyCounts[day]);
        }

        console.info(
            `Loaded ${CURRENT_YEAR} GitHub contribution data: ` +
            `${daysInYear} calendar days.`
        );
    } catch (error) {
        console.error(
            "Failed to initialize GitHub contribution graph:",
            error
        );
    }
}
