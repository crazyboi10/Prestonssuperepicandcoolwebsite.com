const links = document.querySelectorAll('.links a');
const clock = document.querySelector('#clock');
const adContent = document.getElementById('adContent');

const ads = [
    {
        title: '3D Prints',
        text: 'Custom designs for your desk, home, and gifts.',
        button: 'Shop Now',
        link: 'Shop/index.html',
        color: 'linear-gradient(135deg, #ffde59, #ff9f1c)'
    },
    {
        title: 'Weather',
        text: 'Check today’s conditions before heading out.',
        button: 'View Weather',
        link: 'Weather/index.html',
        color: 'linear-gradient(135deg, #7dd3fc, #38bdf8)'
    },
    {
        title: 'Tic Tac Toe',
        text: 'Challenge a friend in a quick classic game.',
        button: 'Play Now',
        link: 'Tic%20Tac%20Toe/index.html',
        color: 'linear-gradient(135deg, #86efac, #22c55e)'
    },
    {
        title: 'Minesweeper',
        text: 'Test your focus with a fast puzzle challenge.',
        button: 'Play Now',
        link: 'Minesweeper/index.html',
        color: 'linear-gradient(135deg, #f9a8d4, #ec4899)'
    }
];

let adIndex = 0;

function renderAd() {
    const ad = ads[adIndex];

    if (!adContent) {
        return;
    }

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
    if (window.location.protocol !== 'file:') {
        return;
    }

    const localHrefMap = {
        '../Mom/index.html': 'Mom/index.html',
        '../PC Bomb/index.html': 'PC%20Bomb/index.html',
        '../Calculator/index.html': 'Calculator/index.html',
        '../Cat/index.html': 'Cat/index.html',
        '../Frog/index.html': 'Frog/index.html',
        '../Google Snake/index.html': 'Google%20Snake/index.html',
        '../Minesweeper/index.html': 'Minesweeper/index.html',
        '../Tic Tac Toe/index.html': 'Tic%20Tac%20Toe/index.html',
        '../Login/index.html': 'Login/index.html'
    };

    links.forEach((link) => {
        const originalHref = link.getAttribute('href');
        const mappedHref = localHrefMap[originalHref];

        if (mappedHref) {
            link.setAttribute('href', mappedHref);
        }
    });
}

fixLocalFileLinks();

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
