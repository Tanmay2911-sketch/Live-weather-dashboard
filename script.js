const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const error = document.getElementById("error");

const weatherCodes = {
    0: ["Clear Sky", "☀️"],
    1: ["Mainly Clear", "🌤️"],
    2: ["Partly Cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Foggy", "🌫️"],
    48: ["Foggy", "🌫️"],
    51: ["Light Drizzle", "🌦️"],
    53: ["Drizzle", "🌧️"],
    55: ["Heavy Drizzle", "🌧️"],
    61: ["Light Rain", "🌦️"],
    63: ["Rainy", "🌧️"],
    65: ["Heavy Rain", "🌧️"],
    71: ["Light Snow", "🌨️"],
    73: ["Snowy", "❄️"],
    75: ["Heavy Snow", "❄️"],
    80: ["Rain Showers", "🌦️"],
    81: ["Rain Showers", "🌧️"],
    82: ["Heavy Showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm", "⛈️"],
    99: ["Thunderstorm", "⛈️"]
};

async function getWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        error.textContent = "Please enter a city name!";
        return;
    }

    error.textContent = "";
    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";

    try {
        // Step 1: Get city coordinates
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to search city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found! Try another city.");
        }

        const place = geoData.results[0];
        const latitude = place.latitude;
        const longitude = place.longitude;

        // Step 2: Get live weather
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=6`
        );

        if (!weatherResponse.ok) {
            throw new Error("Weather data unavailable.");
        }

        const data = await weatherResponse.json();

        // Step 3: Display current weather
        document.getElementById("cityName").textContent =
            `${place.name}, ${place.country}`;

        const current = data.current;
        const code = current.weather_code;
        const info = weatherCodes[code] || ["Unknown", "🌡️"];

        document.getElementById("weatherIcon").textContent =
            current.is_day ? info[1] : "🌙";

        document.getElementById("temperature").textContent =
            `${Math.round(current.temperature_2m)}°C`;

        document.getElementById("condition").textContent = info[0];

        document.getElementById("humidity").textContent =
            `${current.relative_humidity_2m}%`;

        document.getElementById("wind").textContent =
            `${current.wind_speed_10m} km/h`;

        // Step 4: Display 5-day forecast
        const forecastBox = document.getElementById("forecast");
        forecastBox.innerHTML = "";

        for (let i = 1; i <= 5; i++) {
            const forecastCode = data.daily.weather_code[i];
            const forecastInfo =
                weatherCodes[forecastCode] || ["Unknown", "🌡️"];

            const date = new Date(data.daily.time[i] + "T00:00:00");

            const day = date.toLocaleDateString("en-US", {
                weekday: "short"
            });

            forecastBox.innerHTML += `
                <div class="forecast-card">
                    <h3>${day}</h3>
                    <div class="icon">${forecastInfo[1]}</div>
                    <p>${forecastInfo[0]}</p>
                    <p>Max: ${Math.round(data.daily.temperature_2m_max[i])}°C</p>
                    <p>Min: ${Math.round(data.daily.temperature_2m_min[i])}°C</p>
                </div>
            `;
        }

    } catch (err) {
        error.textContent = err.message;
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}

// Search button click
searchBtn.addEventListener("click", getWeather);

// Enter key search
cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});