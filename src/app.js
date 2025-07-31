import "./reset.css";
import "./styles.css";

const API_KEY = "XC4QYZZPRS9TTRE9P9LRP2DF6";
const BASE_URL =
  "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";

const form = document.getElementById("locationForm");
const locationInput = document.getElementById("locationInput");
const weatherDiv = document.getElementById("weather");
const loadingDiv = document.getElementById("loading");
const toggleBtn = document.getElementById("toggleUnit");
const forecastDiv = document.getElementById("forecast");

let currentUnit = "metric"; // metric = Celsius, us = Fahrenheit

async function getWeatherData(location, unitGroup) {
  const url = `${BASE_URL}${encodeURIComponent(
    location
  )}?unitGroup=${unitGroup}&key=${API_KEY}&contentType=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

function processCurrentWeather(data) {
  if (!data || !data.currentConditions) return null;
  return {
    location: data.resolvedAddress,
    temp: data.currentConditions.temp,
    feelslike: data.currentConditions.feelslike,
    conditions: data.currentConditions.conditions,
    icon: data.currentConditions.icon,
  };
}

function processForecast(data, days = 3) {
  if (!data || !data.days || data.days.length === 0) return [];
  return data.days.slice(1, days + 1).map((day) => ({
    date: day.datetime,
    temp: day.temp,
    conditions: day.conditions,
    icon: day.icon,
  }));
}

function updateBackground(temp) {
  if (currentUnit === "metric") {
    if (temp >= 30)
      document.body.style.background =
        "linear-gradient(135deg, #ff416c, #ff4b2b)";
    else if (temp <= 10)
      document.body.style.background =
        "linear-gradient(135deg, #83a4d4, #b6fbff)";
    else
      document.body.style.background =
        "linear-gradient(135deg, #4facfe, #00f2fe)";
  } else {
    // Fahrenheit
    if (temp >= 86)
      document.body.style.background =
        "linear-gradient(135deg, #ff416c, #ff4b2b)";
    else if (temp <= 50)
      document.body.style.background =
        "linear-gradient(135deg, #83a4d4, #b6fbff)";
    else
      document.body.style.background =
        "linear-gradient(135deg, #4facfe, #00f2fe)";
  }
}

async function displayWeather(weather) {
  if (!weather) {
    weatherDiv.innerHTML = "<p>Could not fetch weather data.</p>";
    return;
  }

  const iconSrc = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/4th%20Set%20-%20Color/${weather.icon}.png`;
  const unitLabel = currentUnit === "metric" ? "°C" : "°F";

  weatherDiv.innerHTML = `
    <h2>${weather.location}</h2>
    <p>Temperature: ${weather.temp}${unitLabel}</p>
    <p>Feels like: ${weather.feelslike}${unitLabel}</p>
    <p>Conditions: ${weather.conditions}</p>
    <img src="${iconSrc}" alt="${weather.conditions}">
  `;

  updateBackground(weather.temp);
}

async function displayForecast(forecast) {
  if (!forecast || forecast.length === 0) {
    forecastDiv.innerHTML = "<p>No forecast available.</p>";
    return;
  }

  const unitLabel = currentUnit === "metric" ? "°C" : "°F";

  forecastDiv.innerHTML = forecast
    .map((day) => {
      const iconSrc = `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/4th%20Set%20-%20Color/${day.icon}.png`;
      return `
      <div class="forecast-day">
        <p>${day.date}</p>
        <img src="${iconSrc}" alt="${day.conditions}">
        <p>${day.temp}${unitLabel}</p>
        <p>${day.conditions}</p>
      </div>
    `;
    })
    .join("");
}

async function fetchAndDisplayWeather(location) {
  loadingDiv.style.display = "block";
  weatherDiv.innerHTML = "";
  forecastDiv.innerHTML = "";

  const rawData = await getWeatherData(
    location,
    currentUnit === "metric" ? "metric" : "us"
  );
  const weather = processCurrentWeather(rawData);
  const forecast = processForecast(rawData, 3);

  loadingDiv.style.display = "none";
  await displayWeather(weather);
  await displayForecast(forecast);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const location = locationInput.value.trim();
  if (!location) return;
  await fetchAndDisplayWeather(location);
});

toggleBtn.addEventListener("click", async () => {
  currentUnit = currentUnit === "metric" ? "us" : "metric";
  toggleBtn.textContent =
    currentUnit === "metric" ? "Switch to °F" : "Switch to °C";
  const location = locationInput.value.trim();
  if (location) {
    await fetchAndDisplayWeather(location);
  }
});
