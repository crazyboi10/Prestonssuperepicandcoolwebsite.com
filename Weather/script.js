import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient('https://gqcvoqemwsaptfcztani.supabase.co', 'sb_publishable_FOdYR9QBjHAQAhh52WuM6A_N4mWCfUJ');
const message = document.querySelector('#message');
const townName = document.querySelector('#town-name');
const weatherText = { 0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy', 45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 61: 'Rainy', 71: 'Snowy', 80: 'Showers', 95: 'Thunderstorms' };
const map = L.map('map').setView([39.8283, -98.5795], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
let marker;
let currentPlace;
let currentUser;

async function loadWeather(latitude, longitude, name) {
    message.textContent = 'Loading weather...';
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`);
        const data = await response.json();
        currentPlace = { latitude, longitude, name };
        townName.textContent = name;
        document.querySelector('#temperature').textContent = `${Math.round(data.current.temperature_2m)}°F`;
        document.querySelector('#condition').textContent = weatherText[data.current.weather_code] || 'Interesting weather';
        document.querySelector('#location').textContent = name;
        document.querySelector('#feels').textContent = `${Math.round(data.current.apparent_temperature)}°F`;
        document.querySelector('#wind').textContent = `${Math.round(data.current.wind_speed_10m)} mph`;
        document.querySelector('#humidity').textContent = `${data.current.relative_humidity_2m}%`;
        document.querySelector('#high-low').textContent = `${Math.round(data.daily.temperature_2m_max[0])}° / ${Math.round(data.daily.temperature_2m_min[0])}°`;
        document.querySelector('#rain-chance').textContent = `${data.daily.precipitation_probability_max[0]}%`;
        document.querySelector('#uv-index').textContent = Math.round(data.current.uv_index * 10) / 10;
        document.querySelector('#forecast').innerHTML = data.daily.time.map((date, index) => `<div class="day"><small>${new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: 'short' })}</small><strong>${weatherText[data.daily.weather_code[index]] || 'Mixed'}</strong><span>${Math.round(data.daily.temperature_2m_max[index])}° / ${Math.round(data.daily.temperature_2m_min[index])}°</span></div>`).join('');
        const hour = new Date().getHours();
        document.querySelector('#hourly').innerHTML = data.hourly.time.slice(hour, hour + 12).map((time, index) => `<div class="hour"><small>${new Date(time).toLocaleTimeString([], { hour: 'numeric' })}</small><strong>${Math.round(data.hourly.temperature_2m[hour + index])}°</strong><span>${data.hourly.precipitation_probability[hour + index]}% rain</span></div>`).join('');
        document.querySelector('#sun-times').textContent = `Sunrise ${new Date(data.daily.sunrise[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} / Sunset ${new Date(data.daily.sunset[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
        if (marker) marker.setLatLng([latitude, longitude]); else marker = L.marker([latitude, longitude]).addTo(map);
        map.setView([latitude, longitude], 7);
        document.querySelector('#save-place').hidden = !currentUser;
        message.textContent = 'Weather updated.';
        if (currentUser) await supabase.from('last_locations').upsert({ user_id: currentUser.id, place_name: name, latitude, longitude, updated_at: new Date().toISOString() });
    } catch (_error) { message.textContent = 'Weather could not be loaded. Check your internet connection.'; }
}
async function searchPlace(place) { message.textContent = 'Finding that place...'; const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`); const data = await response.json(); if (!data.results?.length) { message.textContent = 'I could not find that place.'; return; } const result = data.results[0]; loadWeather(result.latitude, result.longitude, `${result.name}, ${result.country}`); }
async function renderSavedPlaces() { const { data } = await supabase.from('saved_locations').select('*').order('created_at'); document.querySelector('#saved-places').innerHTML = data?.length ? data.map(place => `<div class="saved-place"><button data-place="${place.id}" type="button"><strong>${place.label}</strong><span>${place.place_name}</span></button><button class="remove-place" data-remove="${place.id}" type="button">X</button></div>`).join('') : '<p class="map-note">No saved places yet.</p>'; document.querySelectorAll('[data-place]').forEach(button => button.addEventListener('click', () => { const place = data.find(item => item.id === Number(button.dataset.place)); loadWeather(place.latitude, place.longitude, place.place_name); })); document.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', async () => { await supabase.from('saved_locations').delete().eq('id', button.dataset.remove); renderSavedPlaces(); })); }
async function updateAccount() { const { data: { session } } = await supabase.auth.getSession(); currentUser = session?.user || null; document.querySelector('#signed-out').hidden = Boolean(currentUser); document.querySelector('#signed-in').hidden = !currentUser; document.querySelector('#account-button').textContent = currentUser ? currentUser.email.split('@')[0] : 'Account'; document.querySelector('#save-place').hidden = !currentUser; if (currentUser) { document.querySelector('#account-email').textContent = currentUser.email; renderSavedPlaces(); const { data } = await supabase.from('last_locations').select('*').eq('user_id', currentUser.id).maybeSingle(); if (data) loadWeather(data.latitude, data.longitude, data.place_name); } }

document.querySelector('#search-form').addEventListener('submit', event => { event.preventDefault(); searchPlace(document.querySelector('#place').value); });
document.querySelector('#my-location').addEventListener('click', () => navigator.geolocation.getCurrentPosition(position => loadWeather(position.coords.latitude, position.coords.longitude, 'Your location'), () => { message.textContent = 'Location permission was not given. Search for a city instead.'; }));
document.querySelector('#save-place').addEventListener('click', async () => { const label = prompt('Name this place (Home, Work, or Other):'); if (!label || !currentPlace || !currentUser) return; await supabase.from('saved_locations').insert({ user_id: currentUser.id, label, place_name: currentPlace.name, latitude: currentPlace.latitude, longitude: currentPlace.longitude }); renderSavedPlaces(); });
document.querySelector('#account-button').addEventListener('click', () => document.querySelector('#account-dialog').showModal());
document.querySelector('#account-close').addEventListener('click', () => document.querySelector('#account-dialog').close());
document.querySelector('#weather-login').addEventListener('submit', async event => { event.preventDefault(); const { error } = await supabase.auth.signInWithPassword({ email: document.querySelector('#login-email').value, password: document.querySelector('#login-password').value }); document.querySelector('#account-message').textContent = error?.message || 'Signed in.'; if (!error) document.querySelector('#account-dialog').close(); });
document.querySelector('#weather-signup').addEventListener('submit', async event => { event.preventDefault(); const { error } = await supabase.auth.signUp({ email: document.querySelector('#signup-email').value, password: document.querySelector('#signup-password').value }); document.querySelector('#account-message').textContent = error?.message || 'Check your email to confirm your account.'; });
document.querySelector('#sign-out').addEventListener('click', async () => { await supabase.auth.signOut(); document.querySelector('#account-dialog').close(); });
supabase.auth.onAuthStateChange(() => updateAccount());
fetch('https://api.rainviewer.com/public/weather-maps.json').then(response => response.json()).then(data => { const latest = data.radar.past[data.radar.past.length - 1]; L.tileLayer(`${data.host}${data.path}${latest.time}/256/{z}/{x}/{y}/2/1_1.png`, { opacity: .45, attribution: 'RainViewer' }).addTo(map); });
if (navigator.geolocation) navigator.geolocation.getCurrentPosition(position => loadWeather(position.coords.latitude, position.coords.longitude, 'Your location'), () => loadWeather(39.8283, -98.5795, 'Weather fallback')); else loadWeather(39.8283, -98.5795, 'Weather fallback');
