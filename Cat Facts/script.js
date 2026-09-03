const content = document.querySelector('#content');
const source = document.querySelector('#source');
const message = document.querySelector('#message');
const regenerate = document.querySelector('#regenerate');
const endpoint = 'https://catfact.ninja/fact?max_length=300';

async function loadFact() {
    const previous = sessionStorage.getItem('cat-fact');
    regenerate.disabled = true;
    message.textContent = 'Fetching something fresh...';
    try {
        let fact;
        for (let attempt = 0; attempt < 4; attempt += 1) {
            const response = await fetch(`${endpoint}&refresh=${Date.now()}-${attempt}`, { cache: 'no-store' });
            if (!response.ok) throw new Error('The API did not respond.');
            const data = await response.json();
            fact = data.fact;
            if (fact && fact !== previous) break;
        }
        if (!fact) throw new Error('The API returned no fact.');
        content.textContent = fact;
        source.textContent = 'Fresh result from Cat Facts API';
        sessionStorage.setItem('cat-fact', fact);
        message.textContent = '';
    } catch (error) { message.textContent = 'Could not fetch a new fact right now. Try again in a moment.'; }
    finally { regenerate.disabled = false; }
}

regenerate.addEventListener('click', loadFact);
loadFact();
