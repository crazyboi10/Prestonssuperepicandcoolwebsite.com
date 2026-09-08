const osProfiles = {
    windows: { title: 'Windows Desktop', mark: '⊞', welcome: 'Welcome to your desktop', copy: 'Click an app to open it.', accent: '#62d3c5' },
    macos: { title: 'macOS Desktop', mark: '●', welcome: 'Welcome to your desktop', copy: 'A calm little Mac-like workspace.', accent: '#e6b7d2' },
    linux: { title: 'Linux Desktop', mark: '◆', welcome: 'Welcome to your desktop', copy: 'A flexible little Linux-like workspace.', accent: '#f2a65a' }
};

const body = document.body;
const windowElement = document.getElementById('window');
const windowTitle = document.getElementById('window-title');
const windowBody = document.getElementById('window-body');
const content = {
    files: ['Documents', 'Pictures', 'Projects', 'Read me.txt'],
    terminal: '<code>$ neofetch</code><br><br>Browser VM Simulator<br>OS: selected profile<br>Shell: pretend-shell<br><br><code>$ _</code>',
    browser: '<div class="browser-card"><strong>Mini Browser</strong><span>Nothing leaves this simulator.</span><input value="https://example.local" aria-label="Fake browser address"><button type="button">Go nowhere</button></div>'
};

function openWindow(name) {
    windowElement.hidden = false;
    windowTitle.textContent = name[0].toUpperCase() + name.slice(1);
    if (name === 'files') {
        windowBody.innerHTML = `<div class="file-list">${content.files.map((file) => `<span>▤ &nbsp; ${file}</span>`).join('')}</div>`;
    } else {
        windowBody.innerHTML = content[name];
    }
}

function selectOs(os) {
    const profile = osProfiles[os];
    body.dataset.os = os;
    document.documentElement.style.setProperty('--accent', profile.accent);
    document.getElementById('vm-title').textContent = profile.title;
    document.getElementById('os-mark').textContent = profile.mark;
    document.getElementById('welcome-title').textContent = profile.welcome;
    document.getElementById('welcome-copy').textContent = profile.copy;
    document.querySelectorAll('[data-os-choice]').forEach((button) => button.classList.toggle('active', button.dataset.osChoice === os));
    windowElement.hidden = true;
}

document.querySelectorAll('[data-os-choice]').forEach((button) => button.addEventListener('click', () => selectOs(button.dataset.osChoice)));
document.querySelectorAll('[data-window]').forEach((button) => button.addEventListener('click', () => openWindow(button.dataset.window)));
document.getElementById('close-window').addEventListener('click', () => { windowElement.hidden = true; });
document.getElementById('restart').addEventListener('click', () => { windowElement.hidden = true; document.getElementById('welcome-copy').textContent = 'Restarted. Click an app to open it.'; });

function updateClock() {
    document.getElementById('clock').textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
updateClock();
setInterval(updateClock, 30000);
