const links = document.querySelectorAll('.links a');
const clock = document.querySelector('#clock');
const adContent = document.getElementById('adContent');

const adColors = [
    'linear-gradient(135deg, #ffde59, #ff9f1c)',
    'linear-gradient(135deg, #7dd3fc, #38bdf8)',
    'linear-gradient(135deg, #c4b5fd, #8b5cf6)',
    'linear-gradient(135deg, #86efac, #16a34a)',
    'linear-gradient(135deg, #f8d477, #ff6b4a)',
    'linear-gradient(135deg, #a8d5ba, #3d9970)'
];

let ads = [];
let adIndex = 0;

function renderAd() {
    if (!adContent || !ads.length) {
        return;
    }

    const ad = ads[adIndex];
    adContent.style.background = ad.color;
    adContent.innerHTML = `
        <a class="ad-link" href="${ad.link}">
            <span class="ad-label">Sponsored</span>
            <h3>${ad.title}</h3>
            <p>${ad.text}</p>
            <span class="ad-button">${ad.button}</span>
        </a>
    `;

    adIndex = (adIndex + 1) % ads.length;
}

function fixLocalFileLinks() {
    links.forEach((link) => {
        const originalHref = link.getAttribute('href');

        if (originalHref?.startsWith('../') && originalHref.toLowerCase().includes('index.html')) {
            link.setAttribute('href', originalHref.slice(3).replaceAll(' ', '%20'));
        }
    });
}

fixLocalFileLinks();

ads = Array.from(links)
    .filter((link) => {
        const href = link.getAttribute('href') || '';
        return href.toLowerCase().includes('index.html') && !href.startsWith('http');
    })
    .map((link, index) => ({
        title: link.textContent.trim(),
        text: 'Explore this page from Preston\'s website.',
        button: 'Open Page',
        link: link.getAttribute('href'),
        color: adColors[index % adColors.length]
    }));

links.forEach((link, index) => {
    link.style.setProperty('--delay', `${index * 70}ms`);
    link.classList.add('show-link');
});

renderAd();
setInterval(renderAd, 5000);

const dateDisplay = document.getElementById('dateDisplay');
const dayDisplay = document.getElementById('dayDisplay');
const timezoneDisplay = document.getElementById('timezoneDisplay');

function updateClock() {
    const now = new Date();

    clock.textContent = now.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
    });

    dateDisplay.textContent = now.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    dayDisplay.textContent = now.toLocaleDateString([], { weekday: 'long' });
    timezoneDisplay.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
}

updateClock();
setInterval(updateClock, 1000);
