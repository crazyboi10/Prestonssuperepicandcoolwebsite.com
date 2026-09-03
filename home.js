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
        title: 'Hangman',
        text: 'Guess the word before the hangman is complete.',
        button: 'Play Now',
        link: 'Hangman/index.html',
        color: 'linear-gradient(135deg, #c4b5fd, #8b5cf6)'
    },
    {
        title: 'Connect 4',
        text: 'Drop discs and connect four in a row.',
        button: 'Play Now',
        link: 'Connect4/index.html',
        color: 'linear-gradient(135deg, #7dd3fc, #2563eb)'
    },
    {
        title: 'Rock Paper Scissors',
        text: 'Challenge the computer or a friend to a quick showdown.',
        button: 'Play Now',
        link: 'RPS/index.html',
        color: 'linear-gradient(135deg, #fcd34d, #f59e0b)'
    },
    {
        title: 'Pong',
        text: 'Jump into a retro arcade match against AI or a friend.',
        button: 'Play Now',
        link: 'Pong/index.html',
        color: 'linear-gradient(135deg, #86efac, #16a34a)'
    },
    {
        title: '2048',
        text: 'Slide, combine, and chase the legendary 2048 tile.',
        button: 'Play Now',
        link: '2048/index.html',
        color: 'linear-gradient(135deg, #f8d477, #ff6b4a)'
    },
    {
        title: 'Typing Test',
        text: 'Race the clock and discover your words per minute.',
        button: 'Try It',
        link: 'Typing%20Test/index.html',
        color: 'linear-gradient(135deg, #a8d5ba, #3d9970)'
    },
    {
        title: 'Drawing Pad',
        text: 'Make something strange with a color and a brush.',
        button: 'Draw Now',
        link: 'Drawing%20Pad/index.html',
        color: 'linear-gradient(135deg, #fff0b3, #f4bd4f)'
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
