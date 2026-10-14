
const WEATHER_CODES = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Fog", "🌫️"],
    48: ["Rime fog", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Moderate drizzle", "🌦️"],
    55: ["Dense drizzle", "🌧️"],
    56: ["Freezing drizzle", "🌧️"],
    57: ["Heavy freezing drizzle", "🌧️"],
    61: ["Light rain", "🌦️"],
    63: ["Moderate rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    66: ["Freezing rain", "🌧️"],
    67: ["Heavy freezing rain", "🌧️"],
    71: ["Light snow", "🌨️"],
    73: ["Moderate snow", "🌨️"],
    75: ["Heavy snow", "❄️"],
    77: ["Snow grains", "❄️"],
    80: ["Rain showers", "🌦️"],
    81: ["Moderate rain showers", "🌧️"],
    82: ["Heavy rain showers", "🌧️"],
    85: ["Snow showers", "🌨️"],
    86: ["Heavy snow showers", "❄️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Severe thunderstorm with hail", "⛈️"]
};

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

export async function initializeWeather() {
    const status = document.getElementById("weather-status");
    if (!status) return;

    const url = "https://api.open-meteo.com/v1/forecast" +
        "?latitude=55.6761&longitude=12.5683" +
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
        "&timezone=Europe%2FCopenhagen";

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Weather API returned ${response.status}`);
        }

        const data = await response.json();
        const current = data.current;

        if (!current) throw new Error("Weather data unavailable");

        const [description, icon] =
            WEATHER_CODES[current.weather_code] ??
            ["Unknown conditions", "🌡️"];

        setText("weather-icon", icon);
        setText("weather-temp", `${Math.round(current.temperature_2m)}°C`);
        setText("weather-description", description);
        setText("weather-feels", `${Math.round(current.apparent_temperature)}°C`);
        setText("weather-wind", `${Math.round(current.wind_speed_10m)} km/h`);
        setText("weather-humidity", `${current.relative_humidity_2m}%`);

        setText(
            "weather-updated",
            new Intl.DateTimeFormat("en-GB", {
                timeZone: "Europe/Copenhagen",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }).format(new Date(current.time))
        );

        status.textContent = "Weather data updated";
    } catch (error) {
        console.error("Could not load Copenhagen weather:", error);
        status.textContent = "Weather is currently unavailable";
        setText("weather-description", "Unable to load weather");
    }
}
