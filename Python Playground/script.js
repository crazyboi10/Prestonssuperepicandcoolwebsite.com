const examples = {
    hello: 'name = "Preston"\nprint("Hello, " + name + "!")\nprint("Welcome to Python.")',
    loop: 'for number in range(1, 6):\n    print("Number", number)',
    math: 'apples = 7\nfriends = 3\nleftovers = apples % friends\nprint("Apples left over:", leftovers)'
};

const code = document.getElementById('code');
const output = document.getElementById('output');
const status = document.getElementById('status');
const lineNumbers = document.getElementById('line-numbers');

function updateLineNumbers() {
    const lineCount = code.value.split('\n').length;
    lineNumbers.textContent = Array.from({ length: lineCount }, (_, index) => index + 1).join('\n');
}

function writeOutput(text) {
    output.textContent += text;
}

function builtinRead(filename) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[filename] === undefined) {
        throw new Error(`File not found: '${filename}'`);
    }
    return Sk.builtinFiles.files[filename];
}

async function runCode() {
    output.textContent = '';
    status.textContent = 'Running...';
    document.getElementById('run').disabled = true;
    try {
        Sk.configure({ output: writeOutput, read: builtinRead });
        await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody('<stdin>', false, code.value, true));
        if (!output.textContent) output.textContent = 'Code finished with no output.';
        status.textContent = 'Finished';
    } catch (error) {
        output.textContent = error.toString();
        status.textContent = 'Error';
    } finally {
        document.getElementById('run').disabled = false;
    }
}

document.getElementById('run').addEventListener('click', runCode);
document.getElementById('clear').addEventListener('click', () => { code.value = ''; updateLineNumbers(); code.focus(); });
document.getElementById('clear-output').addEventListener('click', () => { output.textContent = 'Output cleared.'; status.textContent = 'Ready'; });
document.getElementById('example').addEventListener('change', (event) => { code.value = examples[event.target.value]; updateLineNumbers(); });
code.addEventListener('input', updateLineNumbers);
code.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        event.preventDefault();
        const start = code.selectionStart;
        code.value = `${code.value.slice(0, start)}    ${code.value.slice(code.selectionEnd)}`;
        code.selectionStart = code.selectionEnd = start + 4;
        updateLineNumbers();
    }
});

code.value = examples.hello;
updateLineNumbers();
