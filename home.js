const clock = document.querySelector('#clock');
const count = document.querySelector('#link-count');
const visitCount = document.querySelector('#visit-count');
const statusText = document.querySelector('#status-text');
const themeToggle = document.querySelector('#theme-toggle');
const launches = document.querySelectorAll('.launch-card');
const progress = document.querySelector('#scroll-progress');
const intro = document.querySelector('.intro');
const weatherDescriptions = { 0: 'Clear skies', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy', 45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 61: 'Rainy', 71: 'Snowy', 80: 'Showers', 95: 'Stormy' };

function updateClock() {
    clock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

count.textContent = `${launches.length.toString().padStart(2, '0')} destinations`;
const visits = Number(localStorage.getItem('preston-visits') || 0) + 1;
localStorage.setItem('preston-visits', visits);
visitCount.textContent = `VISITOR ${visits.toString().padStart(3, '0')}`;
document.querySelector('#dash-destinations').textContent = launches.length.toString().padStart(2, '0');
document.querySelector('#dash-visits').textContent = `Visitor ${visits.toString().padStart(3, '0')}`;
const dateNow = new Date();
document.querySelector('#today-date').textContent = dateNow.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
document.querySelector('#daily-signal').textContent = ['MAKE SOMETHING', 'TRY A NEW LINK', 'PLAY A GAME', 'BE CURIOUS'][dateNow.getDate() % 4];
updateClock();
setInterval(updateClock, 1000);

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('night');
    themeToggle.textContent = document.body.classList.contains('night') ? 'Day colors' : 'Switch colors';
});

launches.forEach(launch => launch.addEventListener('mousemove', event => { const bounds = launch.getBoundingClientRect(); const rotateX = ((event.clientY - bounds.top) / bounds.height - .5) * -5; const rotateY = ((event.clientX - bounds.left) / bounds.width - .5) * 5; launch.style.transform = `translate(-4px, -5px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotate(-1deg)`; }));
launches.forEach(launch => launch.addEventListener('mouseleave', () => { launch.style.transform = ''; }));

document.addEventListener('pointermove', event => {
    document.body.style.setProperty('--pointer-x', `${event.clientX}px`);
    document.body.style.setProperty('--pointer-y', `${event.clientY}px`);
});
document.addEventListener('click', event => {
    const spark = document.createElement('span');
    spark.className = 'click-spark';
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    document.body.append(spark);
    setTimeout(() => spark.remove(), 650);
    for (let index = 0; index < 7; index += 1) {
        const particle = document.createElement('span');
        particle.className = 'click-particle';
        particle.style.left = `${event.clientX}px`;
        particle.style.top = `${event.clientY}px`;
        particle.style.setProperty('--angle', `${index * 51.4}deg`);
        document.body.append(particle);
        setTimeout(() => particle.remove(), 700);
    }
});

launches.forEach(launch => launch.classList.add('scroll-hidden'));
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
}), { threshold: .12 });
launches.forEach(launch => revealObserver.observe(launch));

function updateScrollEffects() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = `scaleX(${amount})`;
    document.body.style.setProperty('--scroll-depth', `${window.scrollY * .06}px`);
    if (window.innerWidth > 760) intro.style.transform = `translateY(${Math.min(window.scrollY * .08, 28)}px)`;
}
window.addEventListener('scroll', updateScrollEffects, { passive: true });
updateScrollEffects();

function updateDayProgress() {
    const minutes = new Date().getHours() * 60 + new Date().getMinutes();
    document.querySelector('#day-progress').textContent = `${Math.round(minutes / 14.4)}% of today complete`;
}
updateDayProgress();
setInterval(updateDayProgress, 60000);

async function loadWeather(latitude, longitude, locationName = 'Your area') {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=sunrise,sunset&temperature_unit=fahrenheit&timezone=auto`);
        const data = await response.json();
        document.querySelector('#weather-temp').textContent = `${Math.round(data.current.temperature_2m)}°F`;
        document.querySelector('#weather-description').textContent = weatherDescriptions[data.current.weather_code] || 'Interesting weather';
        document.querySelector('#weather-location').textContent = locationName;
        document.querySelector('#wind-status').textContent = `Wind ${Math.round(data.current.wind_speed_10m)} km/h`;
        document.querySelector('#sun-times').textContent = `Sunrise ${new Date(data.daily.sunrise[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} / Sunset ${new Date(data.daily.sunset[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } catch (_error) { document.querySelector('#weather-description').textContent = 'Weather unavailable'; document.querySelector('#weather-location').textContent = 'Try again later'; }
}
if (navigator.geolocation) navigator.geolocation.getCurrentPosition(position => loadWeather(position.coords.latitude, position.coords.longitude), () => loadWeather(40.7128, -74.006, 'Weather fallback')); else loadWeather(40.7128, -74.006, 'Weather fallback');
setTimeout(() => { if (document.querySelector('#weather-temp').textContent === '--°') loadWeather(40.7128, -74.006, 'Weather fallback'); }, 3500);