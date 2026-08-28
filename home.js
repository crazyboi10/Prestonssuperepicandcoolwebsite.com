const links = document.querySelectorAll('.links a');
const clock = document.querySelector('#clock');

links.forEach((link, index) => {
    link.style.setProperty('--delay', `${index * 70}ms`);
    link.classList.add('show-link');
});

function updateClock() {
    clock.textContent = new Date().toLocaleTimeString();
}
updateClock();
setInterval(updateClock, 1000);
