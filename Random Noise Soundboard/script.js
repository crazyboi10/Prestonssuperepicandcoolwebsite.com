const AudioContext = window.AudioContext || window.webkitAudioContext;
const audio = new AudioContext();
const volumeControl = document.getElementById('volume');
const nowPlaying = document.getElementById('now-playing');
const soundButtons = [...document.querySelectorAll('[data-sound]')];
const soundNames = soundButtons.map((button) => button.dataset.sound);

function output() {
    const gain = audio.createGain();
    gain.gain.value = Number(volumeControl.value);
    gain.connect(audio.destination);
    return gain;
}

function tone(start, end, duration, type = 'sine', volume = 0.3) {
    const oscillator = audio.createOscillator();
    const gain = output();
    const now = audio.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(end, 20), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + duration);
}

function noise(duration, filterType, frequency, volume = 0.35) {
    const buffer = audio.createBuffer(1, audio.sampleRate * duration, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index++) data[index] = Math.random() * 2 - 1;
    const source = audio.createBufferSource();
    const filter = audio.createBiquadFilter();
    const gain = output();
    const now = audio.currentTime;
    source.buffer = buffer;
    filter.type = filterType;
    filter.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter).connect(gain);
    source.start(now);
}

const sounds = {
    fart() {
        const oscillator = audio.createOscillator();
        const gain = output();
        const now = audio.currentTime;
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(105, now);
        oscillator.frequency.exponentialRampToValueAtTime(38, now + 0.8);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.08);
        gain.gain.setValueAtTime(0.3, now + 0.45);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.82);
        oscillator.connect(gain);
        oscillator.start(now);
        oscillator.stop(now + 0.84);
        noise(0.48, 'lowpass', 850, 0.2);
    },
    boing() { tone(180, 720, 0.55, 'sine', 0.45); tone(720, 120, 0.7, 'triangle', 0.25); },
    honk() { tone(180, 180, 0.35, 'square', 0.35); tone(125, 125, 0.42, 'sawtooth', 0.2); },
    squeak() { tone(500, 1550, 0.18, 'triangle', 0.4); },
    pop() { tone(240, 70, 0.12, 'sine', 0.55); noise(0.08, 'highpass', 1400, 0.3); },
    bloop() { tone(520, 115, 0.75, 'sine', 0.4); },
    airhorn() { tone(230, 230, 0.8, 'sawtooth', 0.38); tone(310, 310, 0.8, 'square', 0.18); },
    laser() { tone(1100, 90, 0.48, 'sawtooth', 0.3); }
};

async function playSound(name) {
    if (audio.state === 'suspended') await audio.resume();
    sounds[name]();
    nowPlaying.textContent = name === 'fart' ? 'FART: a bold choice.' : `Now playing: ${name}.`;
}

soundButtons.forEach((button) => button.addEventListener('click', () => playSound(button.dataset.sound)));
document.getElementById('random-noise').addEventListener('click', () => {
    const randomName = soundNames[Math.floor(Math.random() * soundNames.length)];
    playSound(randomName);
});
