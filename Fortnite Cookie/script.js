const cookieButton = document.querySelector('#cookieButton');
const anotherButton = document.querySelector('#anotherButton');
const fortunePaper = document.querySelector('#fortunePaper');
const fortuneText = document.querySelector('#fortuneText');
const tip = document.querySelector('#tip');

const fortunes = [
    'A surprise victory is closer than you think.',
    'Your next bright idea will be your best one yet.',
    'The best adventures start with one brave step.',
    'Someone is about to notice how awesome you are.',
    'Good luck is landing nearby. Keep your eyes open.',
    'Today is a great day to try something completely new.',
    'Your kindness will come back to you at just the right time.',
    'A small choice today will lead to a big win tomorrow.',
    'You have everything you need for the next challenge.',
    'The answer you are looking for is closer than it seems.'
];

let unusedFortunes = [...fortunes];

function revealFortune() {
    if (!unusedFortunes.length) unusedFortunes = [...fortunes];
    const fortuneIndex = Math.floor(Math.random() * unusedFortunes.length);
    const [fortune] = unusedFortunes.splice(fortuneIndex, 1);
    fortuneText.textContent = fortune;
    fortunePaper.classList.remove('revealed');
    window.requestAnimationFrame(() => fortunePaper.classList.add('revealed'));
    tip.textContent = 'Your fortune has been revealed. The future looks good!';
}

cookieButton.addEventListener('click', revealFortune);
anotherButton.addEventListener('click', revealFortune);