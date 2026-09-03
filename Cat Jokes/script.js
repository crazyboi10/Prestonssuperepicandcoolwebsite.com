const content = document.querySelector('#content');
const source = document.querySelector('#source');
const message = document.querySelector('#message');
const regenerate = document.querySelector('#regenerate');
const endpoint = 'https://v2.jokeapi.dev/joke/Any?contains=cat&safe-mode&type=single';

async function loadJoke() {
    const previous = sessionStorage.getItem('cat-joke');
    regenerate.disabled = true;
    message.textContent = 'Fetching something fresh...';
    try {
        let joke;
        for (let attempt = 0; attempt < 4; attempt += 1) {
            const response = await fetch(`${endpoint}&refresh=${Date.now()}-${attempt}`, { cache: 'no-store' });
            if (!response.ok) throw new Error('The API did not respond.');
            const data = await response.json();
            joke = data.joke || [data.setup, data.delivery].filter(Boolean).join(' ');
            if (joke && joke !== previous) break;
        }
        if (!joke) throw new Error('The API returned no joke.');
        content.textContent = joke;
        source.textContent = 'Fresh result from JokeAPI';
        sessionStorage.setItem('cat-joke', joke);
        message.textContent = '';
    } catch (error) { message.textContent = 'Could not fetch a new joke right now. Try again in a moment.'; }
    finally { regenerate.disabled = false; }
}

regenerate.addEventListener('click', loadJoke);
loadJoke();
