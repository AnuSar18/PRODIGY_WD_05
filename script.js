const apiKey = '7c08dacd3601db15ba8fa25a91f7bec1';

function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherData(`lat=${lat}&lon=${lon}`);
            fetchForecastData(`lat=${lat}&lon=${lon}`);
            fetchAQIData(lat, lon);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function getWeatherByInput() {
    const location = document.getElementById('location-input').value;
    if (location) {
        fetchWeatherData(`q=${location}`);
        fetchForecastData(`q=${location}`);
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const lat = data.coord.lat;
                const lon = data.coord.lon;
                fetchAQIData(lat, lon);
            });
    } else {
        alert('Please enter a location.');
    }
}

function fetchWeatherData(query) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            displayWeatherData(data);
        })
        .catch(error => {
            console.error('Failed to fetch weather data:', error);
        });
}

function fetchForecastData(query) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?${query}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            displayForecastData(data);
            displayForecastChart(data);
        })
        .catch(error => {
            console.error('Failed to fetch forecast data:', error);
        });
}

function fetchAQIData(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            displayAQIData(data);
        })
        .catch(error => {
            console.error('Failed to fetch AQI data:', error);
        });
}

function displayWeatherData(data) {
    const weatherInfoBox = document.getElementById('weather-info');
    const weatherIcon = getWeatherIcon(data.weather[0].main);
    const suggestion = generateSuggestion(data);

    if (data.cod === 200) {
        weatherInfoBox.innerHTML = `
            <h2>${weatherIcon} ${data.main.temp}°C</h2>
            <p>${data.name}, ${data.sys.country}</p>
            <div class="weather-details">
                <div class="weather-detail"><strong>Description:</strong> ${data.weather[0].description}</div>
                <div class="weather-detail"><strong>Real Feel:</strong> ${data.main.feels_like} °C</div>
                <div class="weather-detail"><strong>Humidity:</strong> ${data.main.humidity} %</div>
                <div class="weather-detail"><strong>Pressure:</strong> ${data.main.pressure} hPa</div>
                <div class="weather-detail"><strong>Wind Speed:</strong> ${data.wind.speed} m/s</div>
                <div class="weather-detail"><strong>Chance of Rain:</strong> ${data.clouds.all} %</div>
                <div class="weather-detail"><strong>Sunrise:</strong> ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</div>
                <div class="weather-detail"><strong>Sunset:</strong> ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</div>
            </div>
            <div class="suggestion-box">${suggestion}</div>
        `;
    } else {
        weatherInfoBox.innerHTML = `<p>${data.message}</p>`;
    }
}

function displayForecastData(data) {
    const forecastInfo = document.getElementById('forecast-info');
    if (data.cod === "200") {
        let forecastHTML = '<h3>5-Day Forecast</h3>';
        data.list.filter((item, index) => index % 8 === 0).forEach(item => {
            forecastHTML += `
                <div class="weather-info-box">
                    <p>${new Date(item.dt_txt).toDateString()}</p>
                    <p>${getWeatherIcon(item.weather[0].main)} ${item.weather[0].description}</p>
                    <p><strong>Temp:</strong> ${item.main.temp}°C</p>
                    <p><strong>Real Feel:</strong> ${item.main.feels_like} °C</p>
                    <p><strong>Humidity:</strong> ${item.main.humidity} %</p>
                    <p><strong>Pressure:</strong> ${item.main.pressure} hPa</p>
                    <p><strong>Rain:</strong> ${item.clouds.all} %</p>
                    ${item.snow ? `<p><strong>Snow:</strong> ${item.snow['3h']} mm</p>` : ''}
                </div>
            `;
        });
        forecastInfo.innerHTML = forecastHTML;
    } else {
        forecastInfo.innerHTML = `<p>${data.message}</p>`;
    }
}

function displayAQIData(data) {
    const aqi = data.list[0].main.aqi;
    const aqiCategory = getAQICategory(aqi);
    const aqiElement = document.createElement('div');
    aqiElement.innerHTML = `<strong>Air Quality Index (AQI):</strong> ${aqiCategory}`;
    aqiElement.classList.add('weather-detail');
    document.querySelector('.weather-details').appendChild(aqiElement);
}

function getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Fair';
    if (aqi <= 150) return 'Moderate';
    if (aqi <= 200) return 'Poor';
    if (aqi <= 300) return 'Very Poor';
    return 'Severe';
}

function displayForecastChart(data) {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    const labels = data.list.filter(item => item.dt_txt.includes("12:00:00")).map(item => new Date(item.dt_txt).toDateString());
    const temps = data.list.filter(item => item.dt_txt.includes("12:00:00")).map(item => item.main.temp);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getWeatherIcon(description) {
    switch (description.toLowerCase()) {
        case 'clear':
            return '☀️';
        case 'clouds':
            return '☁️';
        case 'rain':
            return '🌧️';
        case 'snow':
            return '❄️';
        case 'thunderstorm':
            return '⛈️';
        case 'drizzle':
            return '🌦️';
        case 'mist':
        case 'fog':
        case 'haze':
            return '🌫️';
        default:
            return '🌡️';
    }
}

function generateSuggestion(data) {
    const temp = data.main.temp;
    const weatherCondition = data.weather[0].main.toLowerCase();
    let suggestions = [];

    if (temp > 30) {
        suggestions.push("It's quite hot outside. Stay hydrated and wear light clothing.");
    } else if (temp > 20) {
        suggestions.push("The weather is warm. A good day for outdoor activities.");
    } else if (temp > 10) {
        suggestions.push("It's a bit cool outside. Consider wearing a light jacket.");
    } else if (temp > 0) {
        suggestions.push("It's cold outside. Wear a warm jacket and layers.");
    } else {
        suggestions.push("It's very cold outside. Dress warmly and limit time outdoors.");
    }

    switch (weatherCondition) {
        case 'rain':
            suggestions.push('Carry an umbrella. Drive carefully.');
            break;
        case 'snow':
            suggestions.push('Wear warm clothes. Drive safely.');
            break;
        case 'thunderstorm':
            suggestions.push('Stay indoors and avoid using electronic devices.');
            break;
        case 'fog':
        case 'mist':
            suggestions.push('Drive carefully and use fog lights.');
            break;
        case 'drizzle':
            suggestions.push('A light raincoat or umbrella would be useful.');
            break;
        case 'haze':
            suggestions.push('Avoid outdoor activities if you have respiratory issues.');
            break;
        default:
            suggestions.push('Enjoy your day!');
            break;
    }

    let suggestionHTML = '<ul>';
    suggestions.forEach(suggestion => {
        suggestionHTML += `<li>${suggestion}</li>`;
    });
    suggestionHTML += '</ul>';

    return suggestionHTML;
}
