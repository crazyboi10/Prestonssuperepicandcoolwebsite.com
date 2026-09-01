const links = document.querySelectorAll('.links a');
const clock = document.querySelector('#clock');

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

function updateClock() {
    clock.textContent = new Date().toLocaleTimeString();
}
updateClock();
setInterval(updateClock, 1000);
