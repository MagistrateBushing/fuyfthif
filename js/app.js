// ===========================
// Информатика — Интерактивный курс
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initNumberSystems();
    initLogic();
    initAlgorithms();
    initEncoding();
    initArchitecture();
    initQuiz();
    initProgress();
});

// ===================== NAVIGATION =====================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const cards = document.querySelectorAll('.card[data-goto]');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // Create overlay for mobile
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    function showSection(id) {
        sections.forEach(s => s.classList.remove('active'));
        navLinks.forEach(l => l.classList.remove('active'));
        const section = document.getElementById(id);
        if (section) section.classList.add('active');
        const link = document.querySelector(`[data-section="${id}"]`);
        if (link) link.classList.add('active');
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            showSection(link.dataset.section);
        });
    });

    cards.forEach(card => {
        card.addEventListener('click', () => showSection(card.dataset.goto));
    });

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    });
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
}

// ===================== NUMBER SYSTEMS =====================

function initNumberSystems() {
    const input = document.getElementById('conv-input');
    const fromSel = document.getElementById('conv-from');
    const results = document.getElementById('conv-results');

    function convert() {
        const val = input.value.trim().toUpperCase();
        const base = parseInt(fromSel.value);
        results.innerHTML = '';
        if (!val) return;

        const dec = parseInt(val, base);
        if (isNaN(dec) || dec < 0) {
            results.innerHTML = '<div class="conv-result-item" style="color:var(--danger)">Некорректное число для данной системы</div>';
            return;
        }

        const bases = [
            { name: 'Двоичная (2)', base: 2 },
            { name: 'Восьмеричная (8)', base: 8 },
            { name: 'Десятичная (10)', base: 10 },
            { name: 'Шестнадцатеричная (16)', base: 16 }
        ];

        bases.forEach(b => {
            const converted = dec.toString(b.base).toUpperCase();
            results.innerHTML += `<div class="conv-result-item"><span class="label">${b.name}:</span> ${converted}</div>`;
        });
    }

    input.addEventListener('input', convert);
    fromSel.addEventListener('change', convert);

    // Practice
    const questionEl = document.getElementById('ns-question');
    const answerEl = document.getElementById('ns-answer');
    const checkBtn = document.getElementById('ns-check');
    const nextBtn = document.getElementById('ns-next');
    const feedbackEl = document.getElementById('ns-feedback');

    let currentPractice = {};

    function generatePractice() {
        const bases = [2, 8, 10, 16];
        const baseNames = { 2: 'двоичную', 8: 'восьмеричную', 10: 'десятичную', 16: 'шестнадцатеричную' };
        const baseNamesFrom = { 2: 'двоичной', 8: 'восьмеричной', 10: 'десятичной', 16: 'шестнадцатеричной' };
        const from = bases[Math.floor(Math.random() * bases.length)];
        let to;
        do { to = bases[Math.floor(Math.random() * bases.length)]; } while (to === from);

        const num = Math.floor(Math.random() * 200) + 1;
        const numStr = num.toString(from).toUpperCase();
        const answer = num.toString(to).toUpperCase();

        currentPractice = { answer, from, to };
        questionEl.textContent = `Переведите число ${numStr} из ${baseNamesFrom[from]} системы в ${baseNames[to]}:`;
        answerEl.value = '';
        feedbackEl.className = 'feedback';
        feedbackEl.style.display = 'none';
    }

    checkBtn.addEventListener('click', () => {
        const userAnswer = answerEl.value.trim().toUpperCase();
        if (userAnswer === currentPractice.answer) {
            feedbackEl.textContent = 'Правильно!';
            feedbackEl.className = 'feedback correct';
        } else {
            feedbackEl.textContent = `Неправильно. Правильный ответ: ${currentPractice.answer}`;
            feedbackEl.className = 'feedback incorrect';
        }
    });

    nextBtn.addEventListener('click', generatePractice);

    answerEl.addEventListener('keydown', e => {
        if (e.key === 'Enter') checkBtn.click();
    });

    generatePractice();
}

// ===================== LOGIC =====================

function initLogic() {
    // Truth table builder
    const exprInput = document.getElementById('logic-expr');
    const buildBtn = document.getElementById('logic-build');
    const tableContainer = document.getElementById('logic-table-container');

    buildBtn.addEventListener('click', buildTruthTable);
    exprInput.addEventListener('keydown', e => { if (e.key === 'Enter') buildTruthTable(); });

    function buildTruthTable() {
        const expr = exprInput.value.trim();
        if (!expr) return;

        const vars = [...new Set(expr.match(/[A-Z]/g))].sort();
        if (vars.length === 0 || vars.length > 5) {
            tableContainer.innerHTML = '<p style="color:var(--danger)">Используйте от 1 до 5 переменных (A-Z)</p>';
            return;
        }

        const rows = Math.pow(2, vars.length);
        let html = '<table><thead><tr>';
        vars.forEach(v => html += `<th>${v}</th>`);
        html += `<th>${expr}</th></tr></thead><tbody>`;

        for (let i = 0; i < rows; i++) {
            html += '<tr>';
            const values = {};
            vars.forEach((v, idx) => {
                const val = (i >> (vars.length - 1 - idx)) & 1;
                values[v] = val;
                html += `<td class="truth-${val}">${val}</td>`;
            });

            try {
                const result = evaluateLogic(expr, values);
                html += `<td class="truth-${result}">${result}</td>`;
            } catch {
                tableContainer.innerHTML = '<p style="color:var(--danger)">Ошибка в выражении. Проверьте синтаксис.</p>';
                return;
            }
            html += '</tr>';
        }
        html += '</tbody></table>';
        tableContainer.innerHTML = html;
    }

    function evaluateLogic(expr, values) {
        let e = expr;
        for (const [k, v] of Object.entries(values)) {
            e = e.replace(new RegExp(k, 'g'), v);
        }
        e = e.replace(/!/g, ' !').replace(/&/g, ' && ').replace(/\|/g, ' || ').replace(/\^/g, ' !== ');
        // eslint-disable-next-line no-eval
        const result = eval(e) ? 1 : 0;
        return result;
    }

    // Gate simulator
    const gateA = document.getElementById('gate-a');
    const gateB = document.getElementById('gate-b');
    const gateOp = document.getElementById('gate-op');
    const gateAVal = document.getElementById('gate-a-val');
    const gateBVal = document.getElementById('gate-b-val');
    const gateResult = document.getElementById('gate-result');
    const gateDiagram = document.getElementById('gate-diagram');

    function updateGate() {
        const a = gateA.checked ? 1 : 0;
        const b = gateB.checked ? 1 : 0;
        gateAVal.textContent = a;
        gateBVal.textContent = b;

        let result;
        const op = gateOp.value;
        switch (op) {
            case 'and': result = a & b; break;
            case 'or': result = a | b; break;
            case 'not': result = a ? 0 : 1; break;
            case 'xor': result = a ^ b; break;
            case 'nand': result = (a & b) ? 0 : 1; break;
            case 'nor': result = (a | b) ? 0 : 1; break;
        }

        gateResult.textContent = result;
        gateResult.className = 'gate-result-value ' + (result ? 'on' : 'off');

        const opSymbols = {
            and: '∧', or: '∨', not: '¬', xor: '⊕', nand: '↑', nor: '↓'
        };

        if (op === 'not') {
            gateDiagram.textContent = `  A = ${a}\n  ¬A = ${result}\n\n  A ──┤ NOT ├── ${result}`;
        } else {
            gateDiagram.textContent = `  A = ${a},  B = ${b}\n  A ${opSymbols[op]} B = ${result}\n\n  A ──┐\n      ├─┤ ${op.toUpperCase()} ├── ${result}\n  B ──┘`;
        }
    }

    [gateA, gateB, gateOp].forEach(el => el.addEventListener('change', updateGate));
    updateGate();
}

// ===================== ALGORITHMS =====================

function initAlgorithms() {
    const canvas = document.getElementById('sort-canvas');
    const algoSelect = document.getElementById('sort-algo');
    const generateBtn = document.getElementById('sort-generate');
    const startBtn = document.getElementById('sort-start');
    const speedSlider = document.getElementById('sort-speed');
    const sortInfo = document.getElementById('sort-info');
    const sortStats = document.getElementById('sort-stats');

    let array = [];
    let sorting = false;

    const algoDescriptions = {
        bubble: '<strong>Пузырьковая сортировка:</strong> Поочерёдно сравниваются соседние элементы, если порядок неправильный — меняются местами. Сложность: O(n²).',
        selection: '<strong>Сортировка выбором:</strong> На каждом шаге выбирается минимальный элемент из неотсортированной части и ставится на место. Сложность: O(n²).',
        insertion: '<strong>Сортировка вставками:</strong> Каждый элемент вставляется на правильное место в уже отсортированную часть массива. Сложность: O(n²).'
    };

    function generateArray() {
        const count = 40;
        array = [];
        for (let i = 0; i < count; i++) {
            array.push(Math.floor(Math.random() * 190) + 10);
        }
        renderArray();
        sortStats.textContent = '';
    }

    function renderArray(comparing = [], swapping = [], sorted = []) {
        canvas.innerHTML = '';
        const max = Math.max(...array);
        array.forEach((val, idx) => {
            const bar = document.createElement('div');
            bar.className = 'sort-bar';
            bar.style.height = `${(val / max) * 100}%`;
            if (sorted.includes(idx)) bar.classList.add('sorted');
            else if (swapping.includes(idx)) bar.classList.add('swapping');
            else if (comparing.includes(idx)) bar.classList.add('comparing');
            canvas.appendChild(bar);
        });
    }

    function getDelay() {
        return Math.max(5, 200 - speedSlider.value * 1.8);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function bubbleSort() {
        let comparisons = 0, swaps = 0;
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array.length - i - 1; j++) {
                if (!sorting) return;
                comparisons++;
                renderArray([j, j + 1], [], Array.from({ length: i }, (_, k) => array.length - 1 - k));
                await sleep(getDelay());
                if (array[j] > array[j + 1]) {
                    swaps++;
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    renderArray([], [j, j + 1], Array.from({ length: i }, (_, k) => array.length - 1 - k));
                    await sleep(getDelay());
                }
            }
        }
        renderArray([], [], array.map((_, i) => i));
        sortStats.textContent = `Сравнений: ${comparisons}, Перестановок: ${swaps}`;
    }

    async function selectionSort() {
        let comparisons = 0, swaps = 0;
        const sorted = [];
        for (let i = 0; i < array.length; i++) {
            let minIdx = i;
            for (let j = i + 1; j < array.length; j++) {
                if (!sorting) return;
                comparisons++;
                renderArray([minIdx, j], [], sorted);
                await sleep(getDelay());
                if (array[j] < array[minIdx]) minIdx = j;
            }
            if (minIdx !== i) {
                swaps++;
                [array[i], array[minIdx]] = [array[minIdx], array[i]];
                renderArray([], [i, minIdx], sorted);
                await sleep(getDelay());
            }
            sorted.push(i);
        }
        renderArray([], [], array.map((_, i) => i));
        sortStats.textContent = `Сравнений: ${comparisons}, Перестановок: ${swaps}`;
    }

    async function insertionSort() {
        let comparisons = 0, swaps = 0;
        const sorted = [0];
        for (let i = 1; i < array.length; i++) {
            let j = i;
            while (j > 0 && array[j - 1] > array[j]) {
                if (!sorting) return;
                comparisons++;
                swaps++;
                [array[j - 1], array[j]] = [array[j], array[j - 1]];
                renderArray([], [j - 1, j], sorted);
                await sleep(getDelay());
                j--;
            }
            comparisons++;
            sorted.push(i);
        }
        renderArray([], [], array.map((_, i) => i));
        sortStats.textContent = `Сравнений: ${comparisons}, Перестановок: ${swaps}`;
    }

    generateBtn.addEventListener('click', () => {
        sorting = false;
        generateArray();
    });

    startBtn.addEventListener('click', async () => {
        if (sorting) {
            sorting = false;
            startBtn.textContent = 'Запустить';
            return;
        }
        sorting = true;
        startBtn.textContent = 'Остановить';
        sortInfo.style.display = 'block';
        sortInfo.innerHTML = algoDescriptions[algoSelect.value];

        switch (algoSelect.value) {
            case 'bubble': await bubbleSort(); break;
            case 'selection': await selectionSort(); break;
            case 'insertion': await insertionSort(); break;
        }
        sorting = false;
        startBtn.textContent = 'Запустить';
    });

    algoSelect.addEventListener('change', () => {
        sortInfo.style.display = 'block';
        sortInfo.innerHTML = algoDescriptions[algoSelect.value];
    });

    generateArray();
}

// ===================== ENCODING =====================

function initEncoding() {
    const input = document.getElementById('enc-input');
    const results = document.getElementById('enc-results');

    function encode() {
        const text = input.value;
        if (!text) { results.innerHTML = ''; return; }

        const ascii = [...text].map(c => c.charCodeAt(0)).join(' ');
        const binary = [...text].map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        const hex = [...text].map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');
        const utf8bytes = new TextEncoder().encode(text);
        const utf8hex = [...utf8bytes].map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');

        results.innerHTML = `
            <div class="enc-result-block"><h4>ASCII / Unicode коды:</h4><div class="enc-value">${ascii}</div></div>
            <div class="enc-result-block"><h4>Двоичный код:</h4><div class="enc-value">${binary}</div></div>
            <div class="enc-result-block"><h4>Шестнадцатеричный код:</h4><div class="enc-value">${hex}</div></div>
            <div class="enc-result-block"><h4>UTF-8 (байты hex):</h4><div class="enc-value">${utf8hex}</div></div>
            <div class="enc-result-block"><h4>Размер в UTF-8:</h4><div class="enc-value">${utf8bytes.length} байт (${utf8bytes.length * 8} бит)</div></div>
        `;
    }

    input.addEventListener('input', encode);

    // Image calculator
    const imgW = document.getElementById('img-w');
    const imgH = document.getElementById('img-h');
    const imgDepth = document.getElementById('img-depth');
    const imgResult = document.getElementById('img-result');

    function calcImage() {
        const w = parseInt(imgW.value) || 0;
        const h = parseInt(imgH.value) || 0;
        const d = parseInt(imgDepth.value) || 0;
        const bits = w * h * d;
        const bytes = bits / 8;
        imgResult.innerHTML = formatSize(bytes);
    }

    [imgW, imgH, imgDepth].forEach(el => el.addEventListener('input', calcImage));
    calcImage();

    // Sound calculator
    const sndFreq = document.getElementById('snd-freq');
    const sndBits = document.getElementById('snd-bits');
    const sndChannels = document.getElementById('snd-channels');
    const sndDuration = document.getElementById('snd-duration');
    const sndResult = document.getElementById('snd-result');

    function calcSound() {
        const freq = parseInt(sndFreq.value) || 0;
        const bits = parseInt(sndBits.value) || 0;
        const ch = parseInt(sndChannels.value) || 0;
        const dur = parseInt(sndDuration.value) || 0;
        const bytes = (freq * bits * ch * dur) / 8;
        sndResult.innerHTML = formatSize(bytes);
    }

    [sndFreq, sndBits, sndChannels, sndDuration].forEach(el => el.addEventListener('input', calcSound));
    calcSound();

    function formatSize(bytes) {
        if (bytes < 1024) return `${bytes.toFixed(0)} байт`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} Кбайт (${bytes.toFixed(0)} байт)`;
        if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} Мбайт (${(bytes / 1024).toFixed(1)} Кбайт)`;
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Гбайт`;
    }
}

// ===================== ARCHITECTURE =====================

function initArchitecture() {
    const components = document.querySelectorAll('.arch-component, .cpu-part');
    const infoDiv = document.getElementById('arch-info');

    const descriptions = {
        cpu: {
            title: 'Центральный процессор (CPU)',
            text: 'Главный компонент компьютера, выполняющий обработку данных и управление всеми устройствами. Состоит из арифметико-логического устройства (АЛУ), устройства управления (УУ) и регистров. Характеристики: тактовая частота (ГГц), количество ядер, разрядность.'
        },
        alu: {
            title: 'Арифметико-логическое устройство (АЛУ)',
            text: 'Часть процессора, выполняющая арифметические (сложение, вычитание, умножение, деление) и логические (AND, OR, NOT) операции над данными.'
        },
        cu: {
            title: 'Устройство управления (УУ)',
            text: 'Управляет работой всех компонентов компьютера. Извлекает команды из памяти, декодирует их и координирует выполнение. Определяет последовательность операций.'
        },
        registers: {
            title: 'Регистры',
            text: 'Сверхбыстрая память внутри процессора. Хранят данные и адреса, непосредственно используемые при выполнении текущей команды. Примеры: аккумулятор, счётчик команд, регистр состояния.'
        },
        ram: {
            title: 'Оперативная память (ОЗУ / RAM)',
            text: 'Энергозависимая память для временного хранения данных и программ во время работы. При выключении компьютера содержимое теряется. Характеристики: объём (Гбайт), тип (DDR4, DDR5), частота.'
        },
        rom: {
            title: 'Постоянная память (ПЗУ / ROM)',
            text: 'Энергонезависимая память, хранящая программы, которые не должны изменяться (BIOS/UEFI). Содержимое сохраняется при выключении питания. Записывается однократно или ограниченное число раз.'
        },
        input: {
            title: 'Устройства ввода',
            text: 'Служат для ввода информации в компьютер. Примеры: клавиатура, мышь, сканер, микрофон, веб-камера, сенсорный экран, графический планшет.'
        },
        output: {
            title: 'Устройства вывода',
            text: 'Служат для вывода обработанной информации. Примеры: монитор, принтер, колонки/наушники, проектор. Монитор — основное устройство вывода, характеризуется разрешением, диагональю, типом матрицы.'
        },
        storage: {
            title: 'Внешние запоминающие устройства (ВЗУ)',
            text: 'Энергонезависимые устройства для долговременного хранения данных. Примеры: жёсткий диск (HDD), твердотельный накопитель (SSD), USB-флеш-накопитель, оптические диски (CD/DVD/Blu-ray).'
        }
    };

    components.forEach(comp => {
        comp.addEventListener('click', e => {
            e.stopPropagation();
            const key = comp.dataset.comp;
            if (!descriptions[key]) return;

            document.querySelectorAll('.arch-component').forEach(c => c.classList.remove('active-comp'));
            if (comp.classList.contains('arch-component')) comp.classList.add('active-comp');
            else comp.closest('.arch-component')?.classList.add('active-comp');

            infoDiv.innerHTML = `<h3>${descriptions[key].title}</h3><p>${descriptions[key].text}</p>`;
        });
    });
}

// ===================== QUIZ =====================

function initQuiz() {
    const quizBtns = document.querySelectorAll('.quiz-topic-btn');
    const quizArea = document.getElementById('quiz-area');
    const quizResult = document.getElementById('quiz-result');
    const quizProgress = document.getElementById('quiz-progress');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.getElementById('quiz-options');
    const quizFeedback = document.getElementById('quiz-feedback');
    const quizNext = document.getElementById('quiz-next');

    let currentQuiz = [];
    let currentIdx = 0;
    let score = 0;

    const quizData = {
        ns: [
            { q: 'Сколько цифр используется в двоичной системе счисления?', opts: ['2', '8', '10', '16'], ans: 0 },
            { q: 'Чему равно число 1101₂ в десятичной системе?', opts: ['11', '13', '14', '15'], ans: 1 },
            { q: 'Какое основание имеет шестнадцатеричная система?', opts: ['6', '8', '10', '16'], ans: 3 },
            { q: 'Число FF₁₆ в десятичной системе равно:', opts: ['255', '256', '15', '16'], ans: 0 },
            { q: 'Какая цифра НЕ используется в восьмеричной системе?', opts: ['5', '7', '8', '0'], ans: 2 },
            { q: 'Чему равно 10₁₀ в двоичной системе?', opts: ['1010', '1100', '1001', '1110'], ans: 0 },
            { q: 'Сколько бит нужно для записи одной восьмеричной цифры?', opts: ['2', '3', '4', '8'], ans: 1 },
            { q: 'Число 77₈ в десятичной системе равно:', opts: ['63', '56', '49', '77'], ans: 0 },
            { q: 'Переведите A3₁₆ в десятичную систему:', opts: ['163', '143', '173', '103'], ans: 0 },
            { q: 'В какой системе счисления записано число 1011?', opts: ['Только двоичная', 'Только десятичная', 'Любая с основанием ≥ 2', 'Только восьмеричная'], ans: 2 }
        ],
        logic: [
            { q: 'Чему равно 1 AND 0?', opts: ['0', '1'], ans: 0 },
            { q: 'Чему равно 0 OR 1?', opts: ['0', '1'], ans: 1 },
            { q: 'Чему равно NOT 1?', opts: ['0', '1'], ans: 0 },
            { q: 'Чему равно 1 XOR 1?', opts: ['0', '1'], ans: 0 },
            { q: 'Какой закон утверждает: ¬(A ∧ B) = ¬A ∨ ¬B?', opts: ['Закон де Моргана', 'Коммутативный', 'Дистрибутивный', 'Ассоциативный'], ans: 0 },
            { q: 'При каком значении A импликация A → B ложна?', opts: ['A=1, B=0', 'A=0, B=0', 'A=0, B=1', 'A=1, B=1'], ans: 0 },
            { q: 'Чему равно 1 NAND 1?', opts: ['0', '1'], ans: 0 },
            { q: 'A ∨ 0 равно:', opts: ['0', '1', 'A', 'Не определено'], ans: 2 },
            { q: 'Операция эквивалентности истинна, когда:', opts: ['Оба операнда равны', 'Хотя бы один истинен', 'Оба ложны', 'Операнды различны'], ans: 0 },
            { q: 'Сколько строк в таблице истинности для 3 переменных?', opts: ['4', '6', '8', '16'], ans: 2 }
        ],
        algo: [
            { q: 'Какое свойство алгоритма означает, что он завершается за конечное число шагов?', opts: ['Результативность', 'Массовость', 'Дискретность', 'Определённость'], ans: 0 },
            { q: 'Какой тип алгоритма содержит условие?', opts: ['Линейный', 'Разветвляющийся', 'Циклический', 'Рекурсивный'], ans: 1 },
            { q: 'Какой фигурой в блок-схеме обозначается условие?', opts: ['Прямоугольник', 'Ромб', 'Овал', 'Параллелограмм'], ans: 1 },
            { q: 'Какова временная сложность пузырьковой сортировки?', opts: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'], ans: 2 },
            { q: 'Что обозначает овал в блок-схеме?', opts: ['Действие', 'Условие', 'Начало/Конец', 'Ввод/Вывод'], ans: 2 },
            { q: 'Какой алгоритм на каждом шаге выбирает минимальный элемент?', opts: ['Пузырьковая сортировка', 'Сортировка вставками', 'Сортировка выбором', 'Быстрая сортировка'], ans: 2 },
            { q: 'Свойство массовости алгоритма означает:', opts: ['Он работает быстро', 'Применим к различным входным данным', 'Содержит много шагов', 'Использует массивы'], ans: 1 },
            { q: 'Какой тип алгоритма повторяет действия?', opts: ['Линейный', 'Разветвляющийся', 'Циклический', 'Вспомогательный'], ans: 2 },
            { q: 'Параллелограмм в блок-схеме обозначает:', opts: ['Действие', 'Условие', 'Начало/Конец', 'Ввод/Вывод'], ans: 3 },
            { q: 'Какое свойство алгоритма означает однозначность каждого шага?', opts: ['Дискретность', 'Определённость', 'Массовость', 'Понятность'], ans: 1 }
        ],
        enc: [
            { q: 'Сколько бит в одном байте?', opts: ['4', '8', '16', '32'], ans: 1 },
            { q: 'Сколько символов кодирует стандартная таблица ASCII?', opts: ['64', '128', '256', '512'], ans: 1 },
            { q: 'Какая кодировка поддерживает все языки мира?', opts: ['ASCII', 'Windows-1251', 'Unicode', 'КОИ-8'], ans: 2 },
            { q: '1 Кбайт равен:', opts: ['1000 байт', '1024 байт', '1024 бит', '8192 бит'], ans: 1 },
            { q: 'Глубина цвета True Color составляет:', opts: ['8 бит', '16 бит', '24 бит', '32 бит'], ans: 2 },
            { q: 'Какой параметр НЕ влияет на размер звукового файла?', opts: ['Частота дискретизации', 'Разрядность', 'Цвет обложки', 'Количество каналов'], ans: 2 },
            { q: 'Изображение 100×100 пикселей с глубиной цвета 24 бит занимает:', opts: ['240000 бит', '10000 байт', '240000 байт', '30000 байт'], ans: 3 },
            { q: 'Частота дискретизации CD-качества составляет:', opts: ['22050 Гц', '44100 Гц', '96000 Гц', '8000 Гц'], ans: 1 },
            { q: 'Сколько Кбайт в 1 Мбайт?', opts: ['100', '512', '1000', '1024'], ans: 3 },
            { q: 'В UTF-8 один символ может занимать:', opts: ['Всегда 1 байт', 'Всегда 2 байта', 'От 1 до 4 байт', 'Всегда 4 байта'], ans: 2 }
        ],
        arch: [
            { q: 'Кто сформулировал основные принципы архитектуры ЭВМ?', opts: ['Алан Тьюринг', 'Джон фон Нейман', 'Чарльз Бэббидж', 'Ада Лавлейс'], ans: 1 },
            { q: 'Какой компонент выполняет арифметические и логические операции?', opts: ['УУ', 'ОЗУ', 'АЛУ', 'ПЗУ'], ans: 2 },
            { q: 'ОЗУ — это:', opts: ['Энергозависимая память', 'Энергонезависимая память', 'Внешняя память', 'Постоянная память'], ans: 0 },
            { q: 'Какой принцип фон Неймана говорит о хранении программ в памяти?', opts: ['Двоичного кодирования', 'Программного управления', 'Однородности памяти', 'Адресности'], ans: 1 },
            { q: 'Клавиатура относится к устройствам:', opts: ['Ввода', 'Вывода', 'Хранения', 'Обработки'], ans: 0 },
            { q: 'BIOS/UEFI хранится в:', opts: ['ОЗУ', 'ПЗУ', 'HDD', 'CPU'], ans: 1 },
            { q: 'Какое устройство является основным для обработки данных?', opts: ['ОЗУ', 'Жёсткий диск', 'Процессор', 'Монитор'], ans: 2 },
            { q: 'SSD — это:', opts: ['Устройство ввода', 'Оперативная память', 'Внешнее запоминающее устройство', 'Процессор'], ans: 2 },
            { q: 'Регистры процессора — это:', opts: ['Медленная внешняя память', 'Сверхбыстрая память внутри CPU', 'Постоянная память', 'Оперативная память'], ans: 1 },
            { q: 'Устройство управления (УУ) отвечает за:', opts: ['Выполнение вычислений', 'Хранение данных', 'Координацию работы всех компонентов', 'Ввод данных'], ans: 2 }
        ]
    };

    quizBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const topic = btn.dataset.quiz;
            currentQuiz = [...quizData[topic]];
            currentIdx = 0;
            score = 0;
            quizArea.style.display = 'block';
            quizResult.style.display = 'none';
            showQuestion();
        });
    });

    function showQuestion() {
        if (currentIdx >= currentQuiz.length) {
            showResult();
            return;
        }
        const q = currentQuiz[currentIdx];
        quizProgress.textContent = `Вопрос ${currentIdx + 1} из ${currentQuiz.length}`;
        quizQuestion.textContent = q.q;
        quizFeedback.style.display = 'none';
        quizFeedback.className = 'feedback';
        quizNext.style.display = 'none';

        quizOptions.innerHTML = '';
        q.opts.forEach((opt, idx) => {
            const div = document.createElement('div');
            div.className = 'quiz-option';
            div.textContent = opt;
            div.addEventListener('click', () => checkAnswer(idx, q.ans));
            quizOptions.appendChild(div);
        });
    }

    function checkAnswer(selected, correct) {
        const options = quizOptions.querySelectorAll('.quiz-option');
        options.forEach((opt, idx) => {
            opt.classList.add('disabled');
            if (idx === correct) opt.classList.add('correct');
            if (idx === selected && selected !== correct) opt.classList.add('wrong');
        });

        if (selected === correct) {
            score++;
            quizFeedback.textContent = 'Правильно!';
            quizFeedback.className = 'feedback correct';
        } else {
            quizFeedback.textContent = `Неправильно. Правильный ответ: ${currentQuiz[currentIdx].opts[correct]}`;
            quizFeedback.className = 'feedback incorrect';
        }
        quizNext.style.display = 'inline-block';
    }

    quizNext.addEventListener('click', () => {
        currentIdx++;
        showQuestion();
    });

    function showResult() {
        quizArea.style.display = 'none';
        quizResult.style.display = 'block';
        const pct = Math.round((score / currentQuiz.length) * 100);
        let cls = 'bad';
        let msg = 'Нужно повторить материал!';
        if (pct >= 80) { cls = 'good'; msg = 'Отлично! Вы хорошо усвоили тему!'; }
        else if (pct >= 50) { cls = 'ok'; msg = 'Неплохо, но есть над чем поработать.'; }

        quizResult.innerHTML = `
            <h2>Результат теста</h2>
            <div class="quiz-score ${cls}">${score} / ${currentQuiz.length}</div>
            <p>${msg}</p>
            <p>Правильных ответов: ${pct}%</p>
            <button class="btn btn-primary" onclick="this.closest('.section').querySelector('.quiz-selector').scrollIntoView({behavior:'smooth'}); document.getElementById('quiz-result').style.display='none';">Пройти другой тест</button>
        `;
    }
}

// ===================== PROGRESS =====================

function initProgress() {
    const topics = ['number-systems', 'logic', 'algorithms', 'encoding', 'architecture'];
    const progressFill = document.getElementById('course-progress');
    const progressText = document.getElementById('progress-text');

    // Load saved progress
    const completed = JSON.parse(localStorage.getItem('informatika_progress') || '[]');

    function updateProgress() {
        const pct = Math.round((completed.length / topics.length) * 100);
        progressFill.style.width = pct + '%';
        progressText.textContent = pct + '%';
    }

    // Mark buttons
    document.querySelectorAll('.btn-complete').forEach(btn => {
        const topic = btn.dataset.topic;
        if (completed.includes(topic)) {
            btn.textContent = 'Тема изучена';
            btn.classList.add('completed');
        }
        btn.addEventListener('click', () => {
            if (completed.includes(topic)) return;
            completed.push(topic);
            localStorage.setItem('informatika_progress', JSON.stringify(completed));
            btn.textContent = 'Тема изучена';
            btn.classList.add('completed');
            updateProgress();
        });
    });

    updateProgress();
}
