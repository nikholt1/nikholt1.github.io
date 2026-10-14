
export function initializeFrontPage() {
    // Copenhagen clock

    const timeElement = document.getElementById("copenhagen-time");
    const dateElement = document.getElementById("copenhagen-date");

    const timeFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Copenhagen",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    });

    const dateFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Copenhagen",
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    const updatedFormatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Copenhagen",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    });

    function updateClock() {
        const now = new Date();

        if (timeElement) {
            timeElement.textContent = timeFormatter.format(now);
        }

        if (dateElement) {
            dateElement.textContent = dateFormatter.format(now);
        }
    }

    updateClock();
    setInterval(updateClock, 1000);

    // Weather descriptions

    const weatherCodes = {
        0:  { icon: "☀️", description: "Clear sky" },
        1:  { icon: "🌤️", description: "Mainly clear" },
        2:  { icon: "⛅", description: "Partly cloudy" },
        3:  { icon: "☁️", description: "Overcast" },
        45: { icon: "🌫️", description: "Foggy" },
        48: { icon: "🌫️", description: "Depositing rime fog" },
        51: { icon: "🌦️", description: "Light drizzle" },
        53: { icon: "🌦️", description: "Moderate drizzle" },
        55: { icon: "🌧️", description: "Dense drizzle" },
        56: { icon: "🌧️", description: "Freezing drizzle" },
        57: { icon: "🌧️", description: "Heavy freezing drizzle" },
        61: { icon: "🌧️", description: "Light rain" },
        63: { icon: "🌧️", description: "Moderate rain" },
        65: { icon: "🌧️", description: "Heavy rain" },
        66: { icon: "🌧️", description: "Freezing rain" },
        67: { icon: "🌧️", description: "Heavy freezing rain" },
        71: { icon: "🌨️", description: "Light snowfall" },
        73: { icon: "🌨️", description: "Moderate snowfall" },
        75: { icon: "❄️", description: "Heavy snowfall" },
        77: { icon: "❄️", description: "Snow grains" },
        80: { icon: "🌦️", description: "Rain showers" },
        81: { icon: "🌧️", description: "Moderate rain showers" },
        82: { icon: "⛈️", description: "Violent rain showers" },
        85: { icon: "🌨️", description: "Snow showers" },
        86: { icon: "❄️", description: "Heavy snow showers" },
        95: { icon: "⛈️", description: "Thunderstorm" },
        96: { icon: "⛈️", description: "Thunderstorm with hail" },
        99: { icon: "⛈️", description: "Severe thunderstorm with hail" }
    };

    const elements = {
        icon: document.getElementById("weather-icon"),
        temp: document.getElementById("weather-temp"),
        description: document.getElementById("weather-description"),
        feels: document.getElementById("weather-feels"),
        wind: document.getElementById("weather-wind"),
        humidity: document.getElementById("weather-humidity"),
        updated: document.getElementById("weather-updated"),
        status: document.getElementById("weather-status")
    };

    async function updateWeather() {
        const url = new URL("https://api.open-meteo.com/v1/forecast");

        url.search = new URLSearchParams({
            latitude: "55.6761",
            longitude: "12.5683",
            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "weather_code",
                "wind_speed_10m"
            ].join(","),
            timezone: "Europe/Copenhagen"
        }).toString();

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Weather request failed: ${response.status}`);
            }

            const data = await response.json();
            const current = data.current;

            if (!current) {
                throw new Error("Current weather data is unavailable.");
            }

            const weather = weatherCodes[current.weather_code] ?? {
                icon: "🌡️",
                description: "Current conditions"
            };

            if (elements.icon) {
                elements.icon.textContent = weather.icon;
            }

            if (elements.temp) {
                elements.temp.textContent =
                    `${Math.round(current.temperature_2m)}°C`;
            }

            if (elements.description) {
                elements.description.textContent = weather.description;
            }

            if (elements.feels) {
                elements.feels.textContent =
                    `${Math.round(current.apparent_temperature)}°C`;
            }

            if (elements.wind) {
                elements.wind.textContent =
                    `${Math.round(current.wind_speed_10m)} km/h`;
            }

            if (elements.humidity) {
                elements.humidity.textContent =
                    `${current.relative_humidity_2m}%`;
            }

            if (elements.updated) {
                elements.updated.textContent =
                    updatedFormatter.format(new Date());
            }

            if (elements.status) {
                elements.status.textContent =
                    "Live data · Copenhagen, Denmark";

                elements.status.classList.remove("error");
            }
        } catch (error) {
            console.error("Unable to load Copenhagen weather:", error);

            if (elements.status) {
                elements.status.textContent =
                    "Weather unavailable · Check your connection";

                elements.status.classList.add("error");
            }

            if (elements.description) {
                elements.description.textContent = "Unable to load data";
            }
        }
    }

    updateWeather();

    // Refresh weather every 10 minutes.
    setInterval(updateWeather, 10 * 60 * 1000);
}