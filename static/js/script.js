// --- Password generator logic ---
const VOWELS = ['A', 'E', 'I', 'O', 'U', 'Y'];
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CONSONANTS = ALPHABET.filter(char => !VOWELS.includes(char));
const FIGURES = '0123456789'.split('');
const SPECIALS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'.split('');
const SYLLABES = [];
for (const c of CONSONANTS) { for (const v of VOWELS) { SYLLABES.push(c + v); } }
const SYLLABES_COMPLEXES = [
    'TRE', 'TRI', 'TRO', 'TRA', 'DRE', 'DRI', 'DRO', 'DRA', 'BRE', 'BRI', 'BRO', 'BRA',
    'CRE', 'CRI', 'CRO', 'CRA', 'FRE', 'FRI', 'FRO', 'FRA', 'GRE', 'GRI', 'GRO', 'GRA',
    'PRE', 'PRI', 'PRO', 'PRA', 'SRE', 'SRI', 'SRO', 'SRA', 'VRE', 'VRI', 'VRO', 'VRA',
    'ZRE', 'ZRI', 'ZRO', 'ZRA', 'LON', 'LEN', 'LIN', 'LAN', 'MON', 'MEN', 'MIN', 'MAN',
    'NON', 'NEN', 'NIN', 'NAN', 'PON', 'PEN', 'PIN', 'PAN', 'RON', 'REN', 'RIN', 'RAN',
    'SON', 'SEN', 'SIN', 'SAN', 'TON', 'TEN', 'TIN', 'TAN', 'VON', 'VEN', 'VIN', 'VAN',
    'ZON', 'ZEN', 'ZIN', 'ZAN'
];
const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randint = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choices = (arr, k) => Array.from({ length: k }, () => choice(arr));
function generatePronounceableWord(minLength = 4, maxLength = 8) {
    let word = "";
    const length = randint(minLength, maxLength);
    word += choice(SYLLABES);
    while (word.length < length) {
        word += choice([true, false]) ? choice(SYLLABES) : choice(SYLLABES_COMPLEXES);
    }
    return word;
}
function generateNumberBlock(length = 3) { return choices(FIGURES, length).join(''); }
function generateSpecialCharactersBlock(length = 3) { return choices(SPECIALS, length).join(''); }
function generateSeparator() { return choice(['-', '_']); }
function normal() {
    const parts = [];
    for (let i = 0; i < 3; i++) { parts.push(generatePronounceableWord(randint(3, 5), randint(6, 8))); }
    return parts.join(generateSeparator());
}
function strong() {
    const parts = [];
    for (let i = 0; i < 3; i++) {
        parts.push(generatePronounceableWord(randint(4, 6), randint(8, 10)));
        if (i < 2) { parts.push(generateNumberBlock(randint(2, 4))); }
    }
    return parts.join(generateSeparator());
}
function superStrong() {
    const parts = [
        generatePronounceableWord(randint(4, 6), randint(8, 12)),
        generateSpecialCharactersBlock(randint(2, 4)),
        generateNumberBlock(randint(3, 5)),
        generatePronounceableWord(randint(4, 6), randint(8, 12)),
        generateSpecialCharactersBlock(randint(2, 4)),
        generatePronounceableWord(randint(4, 6), randint(8, 12))
    ];
    return parts.join(generateSeparator());
}
function buildPasswordToLength(generatorFn, length) {
    let password = '';
    const separator = generateSeparator();
    while (password.length < length) { password += generatorFn() + separator; }
    return password.substring(0, length);
}
const passwordGenerators = { normal, strong, super_strong: superStrong };

// --- User interface logic ---
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const passwordDisplay = document.getElementById('password-display');
    const copyButton = document.getElementById('copy-button');
    const copyFeedback = document.getElementById('copy-feedback');
    const lengthSlider = document.getElementById('length-slider');
    const lengthValue = document.getElementById('length-value');
    const quantityInput = document.getElementById('quantity-input');
    const themeToggleButton = document.getElementById('theme-toggle');

    function generateAndDisplayPasswords() {
        const selectedType = document.querySelector('input[name="password_type"]:checked').value;
        const desiredLength = parseInt(lengthSlider.value, 10);
        const desiredQuantity = parseInt(quantityInput.value, 10);
        
        const baseGenerator = passwordGenerators[selectedType];
        if (!baseGenerator) return;
        const passwords = [];
        for (let i = 0; i < desiredQuantity; i++) {
            passwords.push(buildPasswordToLength(baseGenerator, desiredLength));
        }
        passwordDisplay.value = passwords.join('\n'); 
    }

    function copyToClipboard() {
        if (!passwordDisplay.value) return;
        passwordDisplay.select();
        passwordDisplay.setSelectionRange(0, passwordDisplay.value.length);
        try {
            document.execCommand('copy');
            copyFeedback.textContent = 'Copié !';
            copyFeedback.classList.add('fade-in-out');
            setTimeout(() => {
                copyFeedback.classList.remove('fade-in-out');
            }, 2000);
        } catch (err) {
            console.error('Erreur lors de la copie : ', err);
        }
        window.getSelection().removeAllRanges();
    }

    // --- Theme logic ---
    function applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('clinkey-theme', theme);
    }

    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        console.log('Toggle theme:', currentTheme, '->', newTheme);
        applyTheme(newTheme);
    }

    // Apply theme on load
    const savedTheme = localStorage.getItem('clinkey-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        // L'utilisateur a explicitement choisi un thème
        applyTheme(savedTheme);
    } else if (prefersDark) {
        // Utiliser la préférence système de l'utilisateur
        applyTheme('dark');
    } else {
        // Thème clair par défaut
        applyTheme('light');
    }
    // Event listeners
    generateButton.addEventListener('click', generateAndDisplayPasswords);
    copyButton.addEventListener('click', copyToClipboard);
    lengthSlider.addEventListener('input', (e) => { lengthValue.textContent = e.target.value; });
    
    // Debug: vérifier que le bouton toggle existe
    console.log('Theme toggle button:', themeToggleButton);
    themeToggleButton.addEventListener('click', toggleTheme);
    
    // Generate passwords at initial load
    generateAndDisplayPasswords();
});