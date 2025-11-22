const city = document.getElementById('city');
const btnSearch = document.getElementById('btn-search');
const cityHero = document.getElementById('city-hero');
const cityData = document.getElementById('city-data');

async function getCoordinates(cityName) {
    try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);
        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("City not found");
        }

        return data.results[0];
    } catch (err) {
        console.error(err);
        return null;
    }
}


async function getWeather(latitude, longitude) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,rain,showers&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=2`;

        const res = await fetch(url);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
        return null;
    }
}

btnSearch.addEventListener('click', async function () {
    const cityValue = city.value.trim();

    if (!cityValue) {
        cityData.textContent = "Please enter a city.";
        return;
    }

    const cityInfo = await getCoordinates(cityValue);
    if (!cityInfo) {
        cityData.textContent = "City not found.";
        return;
    }

    const { latitude, longitude, name, country, population } = cityInfo;

    const weatherData = await getWeather(latitude, longitude);

    if (!weatherData) {
        cityData.textContent = "Weather data not available.";
        return;
    }

    const isDay = weatherData.current.is_day;

    if (isDay === 1) {
        cityHero.style.backgroundImage = "url('./images/day.jpg')";
    } else {
        cityHero.style.backgroundImage = "url('./images/night.jpg')";
    }

    cityHero.innerHTML = `
        <p><strong>${name}</strong></p>
        <p>Temperature: <strong>${weatherData.current.temperature_2m}${weatherData.current_units.temperature_2m}</strong></p>
    `;

    cityData.innerHTML = `
        <table>
            <tr><td><strong>Country</strong></td><td>${country}</td></tr>
            <tr><td><strong>Timezone</strong></td><td>${weatherData.timezone}</td></tr>
            <tr><td><strong>Population</strong></td><td>${population}</td></tr>
            <tr>
                <td><strong>Tomorrow's Forecast</strong></td>
                <td>Low: ${weatherData.daily.temperature_2m_min[1]}${weatherData.current_units.temperature_2m}<br>
                    Max: ${weatherData.daily.temperature_2m_max[1]}${weatherData.current_units.temperature_2m}</td>
            </tr>
        </table>
    `;
});

