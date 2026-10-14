
export function initializeClock() {
    const timeElement = document.getElementById("copenhagen-time");
    const dateElement = document.getElementById("copenhagen-date");

    if (!timeElement || !dateElement) return;

    function updateClock() {
        const now = new Date();

        timeElement.textContent = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/Copenhagen",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }).format(now);

        dateElement.textContent = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/Copenhagen",
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(now);
    }

    updateClock();
    setInterval(updateClock, 1000);
}
