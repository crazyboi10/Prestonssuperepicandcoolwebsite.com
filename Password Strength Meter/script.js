const passwordInput = document.getElementById('password');
const strengthLabel = document.getElementById('strength-label');
const meterFill = document.getElementById('meter-fill');
const feedback = document.getElementById('feedback');
const generated = document.getElementById('generated');
const lengthInput = document.getElementById('length');
const lengthLabel = document.getElementById('length-label');
const copyStatus = document.getElementById('copy-status');

const characterSets = {
    lower: 'abcdefghijkmnopqrstuvwxyz',
    upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
    numbers: '23456789',
    symbols: '!@#$%^&*()-_=+[]{}?'
};

function randomIndex(max) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
}

function randomCharacter(characters) {
    return characters[randomIndex(characters.length)];
}

function shuffle(characters) {
    const result = [...characters];
    for (let index = result.length - 1; index > 0; index--) {
        const swapIndex = randomIndex(index + 1);
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result.join('');
}

function checkStrength(password) {
    const checks = {
        length: password.length >= 12,
        lower: /[a-z]/.test(password),
        upper: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password)
    };
    const passed = Object.values(checks).filter(Boolean).length;
    let score = passed + (password.length >= 16 ? 1 : 0) + (password.length >= 24 ? 1 : 0);
    if (password.length < 8) score = Math.min(score, 1);
    if (!password) score = 0;

    const levels = ['Start typing', 'Very weak', 'Weak', 'Okay', 'Strong', 'Very strong'];
    const level = !password ? 0 : Math.min(Math.max(score, 1), 5);
    strengthLabel.textContent = levels[level];
    meterFill.style.width = `${level * 20}%`;
    meterFill.style.background = ['#dedede', '#e85d75', '#f08b54', '#ffd166', '#78c091', '#36a269'][level];
    feedback.textContent = !password ? 'Your password is checked only in this browser.' : level >= 4 ? 'Nice. Length and variety make this much harder to guess.' : 'Add length and a missing character type to make it stronger.';

    Object.entries(checks).forEach(([name, passedCheck]) => {
        document.querySelector(`[data-check="${name}"]`).classList.toggle('pass', passedCheck);
    });
}

function generatePassword() {
    const sets = [characterSets.lower];
    if (document.getElementById('include-uppercase').checked) sets.push(characterSets.upper);
    if (document.getElementById('include-numbers').checked) sets.push(characterSets.numbers);
    if (document.getElementById('include-symbols').checked) sets.push(characterSets.symbols);
    const length = Number(lengthInput.value);
    const required = sets.map(randomCharacter);
    const allCharacters = sets.join('');
    while (required.length < length) required.push(randomCharacter(allCharacters));
    generated.textContent = shuffle(required);
    copyStatus.textContent = '';
}

passwordInput.addEventListener('input', () => checkStrength(passwordInput.value));
document.getElementById('toggle-password').addEventListener('click', (event) => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    event.currentTarget.textContent = isHidden ? 'Hide' : 'Show';
    event.currentTarget.setAttribute('aria-label', `${isHidden ? 'Hide' : 'Show'} password`);
});
lengthInput.addEventListener('input', () => {
    lengthLabel.textContent = `${lengthInput.value} characters`;
    generatePassword();
});
document.querySelectorAll('.options input').forEach((input) => input.addEventListener('change', generatePassword));
document.getElementById('generate').addEventListener('click', generatePassword);
document.getElementById('copy-generated').addEventListener('click', async () => {
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(generated.textContent);
    } else {
        const helper = document.createElement('textarea');
        helper.value = generated.textContent;
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
    }
    copyStatus.textContent = 'Copied to your clipboard.';
});

generatePassword();
checkStrength('');
