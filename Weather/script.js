import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

async function loadWeatherAlerts(latitude, longitude) {
    const alertsSection = document.querySelector('#alerts-section');
    const alertsContainer = document.querySelector('#weather-alerts');

    try {
        const response = await fetch(
            `https://api.weather.gov/alerts/active?point=${latitude},${longitude}`,
            {
                headers: {
                    'Accept': 'application/geo+json',
                    'User-Agent': 'PrestonsWeatherWebsite/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Could not load weather alerts.');
        }

        const data = await response.json();
        const alerts = data.features || [];

        if (!alerts.length) {
            alertsSection.hidden = false;

            alertsContainer.innerHTML = `
                <p class="no-alerts">
                    No active weather alerts for this location.
                </p>
            `;

            return;
        }

        alertsSection.hidden = false;

        alertsContainer.innerHTML = alerts.map(alert => {
            const properties = alert.properties;

            let alertClass = 'alert-info';

            if (
                properties.severity === 'Extreme' ||
                properties.severity === 'Severe'
            ) {
                alertClass = 'alert-danger';
            } else if (properties.severity === 'Moderate') {
                alertClass = 'alert-warning';
            } else if (
                properties.event?.includes('Watch') ||
                properties.event?.includes('Advisory')
            ) {
                alertClass = 'alert-watch';
            }

            const expires = properties.expires
                ? new Date(properties.expires).toLocaleString()
                : 'Unknown';

            return `
                <article class="alert ${alertClass}">
                    <h3>${properties.event || 'Weather Alert'}</h3>

                    <p>
                        ${properties.headline || 'Active weather alert.'}
                    </p>

                    ${
                        properties.description
                            ? `<p>${properties.description}</p>`
                            : ''
                    }

                    <div class="alert-meta">
                        Severity: ${properties.severity || 'Unknown'}
                        <br>
                        Expires: ${expires}
                    </div>
                </article>
            `;
        }).join('');

    } catch (error) {
        console.error('Weather alerts error:', error);

        alertsSection.hidden = false;

        alertsContainer.innerHTML = `
            <p class="no-alerts">
                Weather alerts could not be loaded right now.
            </p>
        `;
    }
}
const supabase = createClient('https://gqcvoqemwsaptfcztani.supabase.co', 'sb_publishable_FOdYR9QBjHAQAhh52WuM6A_N4mWCfUJ');
const message = document.querySelector('#message');
const townName = document.querySelector('#town-name');
const weatherText = { 0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy', 45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 61: 'Rainy', 71: 'Snowy', 80: 'Showers', 95: 'Thunderstorms' };
const map = L.map('map').setView([39.8283, -98.5795], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
let marker;
let currentPlace;
let currentUser;
let useCelsius = false;
let latestWeather;
const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const seasons = { winter: { name: 'Winter', note: 'Watch for icy roads, cold wind, and changing snow conditions.', watch: 'Snow and freezing weather can change quickly.' }, spring: { name: 'Spring', note: 'Rain, warming days, and occasional thunderstorms are common.', watch: 'Keep an eye on rain and storm chances.' }, summer: { name: 'Summer', note: 'Long bright days can bring heat, humidity, and strong storms.', watch: 'Check the heat and UV index before going out.' }, autumn: { name: 'Autumn', note: 'Cooler air and shorter days arrive with changing leaves.', watch: 'Wind and chilly evenings may arrive early.' } };
let suggestionTimer;

async function loadWeather(latitude, longitude, name) {
    message.textContent = 'Loading weather...';
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,surface_pressure,visibility,dew_point_2m,cloud_cover,precipitation,snow_depth&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,precipitation_sum,snowfall_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`);
        const data = await response.json();
        latestWeather = { data, latitude, longitude, name };
        currentPlace = { latitude, longitude, name };
        await loadWeatherAlerts(latitude, longitude);
        townName.textContent = name;
        const temperatureUnit = useCelsius ? '°C' : '°F';
        const temperature = value => useCelsius ? Math.round((value - 32) * 5 / 9) : Math.round(value);
        document.querySelector('#temperature').textContent = `${temperature(data.current.temperature_2m)}${temperatureUnit}`;
        document.querySelector('#condition').textContent = weatherText[data.current.weather_code] || 'Interesting weather';
        document.querySelector('#location').textContent = name;
        document.querySelector('#feels').textContent = `${temperature(data.current.apparent_temperature)}${temperatureUnit}`;
        document.querySelector('#wind').textContent = `${Math.round(data.current.wind_speed_10m)} mph`;
        document.querySelector('#humidity').textContent = `${data.current.relative_humidity_2m}%`;
        document.querySelector('#high-low').textContent = `${Math.round(data.daily.temperature_2m_max[0])}° / ${Math.round(data.daily.temperature_2m_min[0])}°`;
        document.querySelector('#rain-chance').textContent = `${data.daily.precipitation_probability_max[0]}%`;
        document.querySelector('#uv-index').textContent = Math.round(data.current.uv_index * 10) / 10;
        document.querySelector('#pressure').textContent = `${Math.round(data.current.surface_pressure)} hPa`;
        document.querySelector('#visibility').textContent = `${(data.current.visibility / 1609.34).toFixed(1)} mi`;
        document.querySelector('#dew-point').textContent = `${Math.round(data.current.dew_point_2m)}°F`;
        document.querySelector('#cloud-cover').textContent = `${data.current.cloud_cover}%`;
        document.querySelector('#precipitation').textContent = `${data.current.precipitation} mm`;
        document.querySelector('#wind-direction').textContent = `${directions[Math.round(data.current.wind_direction_10m / 45) % 8]} (${Math.round(data.current.wind_direction_10m)}°)`;
        document.querySelector('#wind-gusts').textContent = `${Math.round(data.current.wind_gusts_10m)} mph`;
        const month = new Date().getMonth();
        const seasonKey = month < 2 || month === 11 ? 'winter' : month < 5 ? 'spring' : month < 8 ? 'summer' : 'autumn';
        const season = seasons[seasonKey];
        const daylightHours = (new Date(data.daily.sunset[0]) - new Date(data.daily.sunrise[0])) / 3600000;
        document.querySelector('#season-name').textContent = season.name;
        document.querySelector('#season-note').textContent = season.note;
        document.querySelector('#season-watch').textContent = season.watch;
        document.querySelector('#daylight-length').textContent = `${Math.floor(daylightHours)}h ${Math.round((daylightHours % 1) * 60)}m`;
        document.querySelector('#snow-depth-card').hidden = data.current.snow_depth <= 0 && seasonKey !== 'winter';
        document.querySelector('#snow-depth').textContent = data.current.snow_depth > 0 ? `${data.current.snow_depth} m` : 'No snow now';
        document.querySelector('#forecast').innerHTML = data.daily.time.map((date, index) => `<div class="day"><small>${new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: 'short' })}</small><strong>${weatherText[data.daily.weather_code[index]] || 'Mixed'}</strong><span>${temperature(data.daily.temperature_2m_max[index])}° / ${temperature(data.daily.temperature_2m_min[index])}°</span><small>${data.daily.precipitation_sum[index]} mm rain</small></div>`).join('');
        const hour = new Date().getHours();
        document.querySelector('#hourly').innerHTML = data.hourly.time.slice(hour, hour + 12).map((time, index) => `<div class="hour"><small>${new Date(time).toLocaleTimeString([], { hour: 'numeric' })}</small><strong>${temperature(data.hourly.temperature_2m[hour + index])}${temperatureUnit}</strong><span>${data.hourly.precipitation_probability[hour + index]}% rain</span></div>`).join('');
        const sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        const sunset = new Date(data.daily.sunset[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        document.querySelector('#sun-times').textContent = `Sunrise ${sunrise} / Sunset ${sunset}`;
        document.querySelector('#extra-sun-times').textContent = `${sunrise} / ${sunset}`;
        if (marker) marker.setLatLng([latitude, longitude]); else marker = L.marker([latitude, longitude]).addTo(map);
        map.setView([latitude, longitude], 7);
        document.querySelector('#save-place').hidden = !currentUser;
        message.textContent = 'Weather updated.';
        if (currentUser) await supabase.from('last_locations').upsert({ user_id: currentUser.id, place_name: name, latitude, longitude, updated_at: new Date().toISOString() });
    } catch (_error) { message.textContent = 'Weather could not be loaded. Check your internet connection.'; }
}
async function searchPlace(place) { message.textContent = 'Finding that place...'; const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`); const data = await response.json(); if (!data.results?.length) { message.textContent = 'I could not find that place.'; return; } const result = data.results[0]; const fullName = [result.name, result.admin1, result.country].filter((part, index, parts) => part && parts.indexOf(part) === index).join(', '); loadWeather(result.latitude, result.longitude, fullName); }
function showSuggestions(results) { const box = document.querySelector('#suggestions'); box.innerHTML = results.map(result => { const name = [result.name, result.admin1, result.country].filter((part, index, parts) => part && parts.indexOf(part) === index).join(', '); return `<button type="button" data-suggestion-name="${name}" data-suggestion-lat="${result.latitude}" data-suggestion-lon="${result.longitude}">${name}</button>`; }).join(''); box.hidden = !results.length; box.querySelectorAll('[data-suggestion-name]').forEach(button => button.addEventListener('click', () => { document.querySelector('#place').value = button.dataset.suggestionName; box.hidden = true; loadWeather(Number(button.dataset.suggestionLat), Number(button.dataset.suggestionLon), button.dataset.suggestionName); })); }
async function getSuggestions(value) { clearTimeout(suggestionTimer); if (value.trim().length < 2) { showSuggestions([]); return; } suggestionTimer = setTimeout(async () => { const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=5&language=en&format=json`); const data = await response.json(); showSuggestions(data.results || []); }, 250); }
async function renderSavedPlaces() { const { data, error } = await supabase.from('saved_locations').select('*').order('created_at'); if (error) { document.querySelector('#saved-places').innerHTML = '<p class="map-note">Saved places need the latest Supabase database setup.</p>'; return; } document.querySelector('#saved-places').innerHTML = data?.length ? data.map(place => `<div class="saved-place"><button data-place="${place.id}" type="button"><strong>${place.label}</strong><span>${place.place_name}</span></button><button class="remove-place" data-remove="${place.id}" type="button">X</button></div>`).join('') : '<p class="map-note">No saved places yet.</p>'; document.querySelectorAll('[data-place]').forEach(button => button.addEventListener('click', () => { const place = data.find(item => item.id === Number(button.dataset.place)); loadWeather(place.latitude, place.longitude, place.place_name); })); document.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', async () => { const { error: deleteError } = await supabase.from('saved_locations').delete().eq('id', button.dataset.remove); if (deleteError) message.textContent = 'This place could not be removed.'; else renderSavedPlaces(); })); }
async function updateAccount() { const { data: { session } } = await supabase.auth.getSession(); currentUser = session?.user || null; document.querySelector('#signed-out').hidden = Boolean(currentUser); document.querySelector('#signed-in').hidden = !currentUser; document.querySelector('#account-button').textContent = currentUser ? currentUser.email.split('@')[0] : 'Account'; document.querySelector('#save-place').hidden = !currentUser; if (currentUser) { document.querySelector('#account-email').textContent = currentUser.email; renderSavedPlaces(); const { data } = await supabase.from('last_locations').select('*').eq('user_id', currentUser.id).maybeSingle(); if (data) loadWeather(data.latitude, data.longitude, data.place_name); } }

document.querySelector('#search-form').addEventListener('submit', event => { event.preventDefault(); searchPlace(document.querySelector('#place').value); });
document.querySelector('#unit-toggle').addEventListener('click', () => { useCelsius = !useCelsius; document.querySelector('#unit-toggle').textContent = useCelsius ? '°C / °F' : '°F / °C'; if (latestWeather) loadWeather(latestWeather.latitude, latestWeather.longitude, latestWeather.name); });
document.querySelector('#place').addEventListener('input', event => getSuggestions(event.target.value));
document.addEventListener('click', event => { if (!event.target.closest('#search-form')) document.querySelector('#suggestions').hidden = true; });
async function loadLocationName(latitude, longitude) { try { const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`); const data = await response.json(); const address = data.address || {}; return [address.city || address.town || address.village || address.hamlet, address.state, address.country].filter(Boolean).join(', ') || 'Your location'; } catch (_error) { return 'Your location'; } }
document.querySelector('#my-location').addEventListener('click', () => navigator.geolocation.getCurrentPosition(async position => loadWeather(position.coords.latitude, position.coords.longitude, await loadLocationName(position.coords.latitude, position.coords.longitude)), () => { message.textContent = 'Location permission was not given. Search for a city instead.'; }));
document.querySelector('#save-place').addEventListener('click', () => { if (!currentUser || !currentPlace) return; document.querySelector('#save-place-name').textContent = currentPlace.name; document.querySelector('#save-place-label').value = ''; document.querySelector('#save-place-message').textContent = ''; document.querySelector('#save-place-dialog').showModal(); });
document.querySelector('#save-place-close').addEventListener('click', () => document.querySelector('#save-place-dialog').close());
document.querySelector('#save-place-form').addEventListener('submit', async event => { event.preventDefault(); if (!currentPlace || !currentUser) return; const label = document.querySelector('#save-place-label').value.trim(); const { error } = await supabase.from('saved_locations').insert({ user_id: currentUser.id, label, place_name: currentPlace.name, latitude: currentPlace.latitude, longitude: currentPlace.longitude }); if (error) { document.querySelector('#save-place-message').textContent = 'Could not save this place. Run the latest supabase-schema.sql first.'; return; } document.querySelector('#save-place-dialog').close(); renderSavedPlaces(); });
document.querySelector('#account-button').addEventListener('click', () => document.querySelector('#account-dialog').showModal());
document.querySelector('#account-close').addEventListener('click', () => document.querySelector('#account-dialog').close());
document.querySelector('#weather-login').addEventListener('submit', async event => { event.preventDefault(); const { error } = await supabase.auth.signInWithPassword({ email: document.querySelector('#login-email').value, password: document.querySelector('#login-password').value }); document.querySelector('#account-message').textContent = error?.message || 'Signed in.'; if (!error) document.querySelector('#account-dialog').close(); });
document.querySelector('#weather-signup').addEventListener('submit', async event => { event.preventDefault(); const { error } = await supabase.auth.signUp({ email: document.querySelector('#signup-email').value, password: document.querySelector('#signup-password').value }); document.querySelector('#account-message').textContent = error?.message || 'Check your email to confirm your account.'; });
document.querySelector('#sign-out').addEventListener('click', async () => { await supabase.auth.signOut(); document.querySelector('#account-dialog').close(); });
supabase.auth.onAuthStateChange(() => updateAccount());
fetch('https://api.rainviewer.com/public/weather-maps.json').then(response => response.json()).then(data => { const latest = data.radar.past[data.radar.past.length - 1]; L.tileLayer(`${data.host}${data.path}${latest.time}/256/{z}/{x}/{y}/2/1_1.png`, { opacity: .45, attribution: 'RainViewer' }).addTo(map); });
if (navigator.geolocation) navigator.geolocation.getCurrentPosition(async position => loadWeather(position.coords.latitude, position.coords.longitude, await loadLocationName(position.coords.latitude, position.coords.longitude)), () => loadWeather(39.8283, -98.5795, 'Weather fallback')); else loadWeather(39.8283, -98.5795, 'Weather fallback');
