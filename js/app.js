const App = {
    currentPage: 'home',
    currentLectureId: null,
    currentTestId: null,
    currentQuestionIndex: 0,
    testAnswers: [],
    progress: null,

    init() {
        this.loadProgress();
        this.bindNavigation();
        this.updateHomeStats();
    },

    loadProgress() {
        const saved = localStorage.getItem('rm_sto_ved_progress');
        if (saved) {
            this.progress = JSON.parse(saved);
        } else {
            this.progress = {
                lecturesRead: [],
                testResults: {}
            };
        }
    },

    saveProgress() {
        localStorage.setItem('rm_sto_ved_progress', JSON.stringify(this.progress));
    },

    bindNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.navigateTo(page);
            });
        });
    },

    navigateTo(page) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

        const pageEl = document.getElementById('page-' + page);
        if (pageEl) {
            pageEl.classList.add('active');
        }

        const navBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }

        this.currentPage = page;

        switch (page) {
            case 'home':
                this.updateHomeStats();
                break;
            case 'lectures':
                this.renderLecturesList();
                break;
            case 'tests':
                this.renderTestsList();
                break;
            case 'progress':
                this.renderProgress();
                break;
        }
    },

    updateHomeStats() {
        const completedLectures = this.progress.lecturesRead.length;
        const completedTests = Object.keys(this.progress.testResults).length;
        const totalItems = LECTURES.length * 2;
        const completed = completedLectures + completedTests;

        document.getElementById('stat-completed').textContent = completed;

        let avgScore = 0;
        const results = Object.values(this.progress.testResults);
        if (results.length > 0) {
            avgScore = Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length);
        }
        document.getElementById('stat-score').textContent = avgScore + '%';
    },

    renderLecturesList() {
        const container = document.getElementById('lectures-list');
        container.innerHTML = LECTURES.map(lecture => {
            const isRead = this.progress.lecturesRead.includes(lecture.id);
            const badge = isRead
                ? '<span class="card-badge badge-done">Изучено</span>'
                : '<span class="card-badge badge-new">Новое</span>';

            return `
                <div class="card" onclick="App.openLecture(${lecture.id})">
                    <div class="card-header">
                        <div class="card-number">${lecture.id}</div>
                        ${badge}
                    </div>
                    <div class="card-body">
                        <h3>${lecture.title}</h3>
                        <p>${lecture.description}</p>
                    </div>
                    <div class="card-footer">
                        <span>Раздел ${lecture.id} из ${LECTURES.length}</span>
                        <span>${isRead ? 'Изучено' : 'Не изучено'}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    openLecture(id) {
        const lecture = LECTURES.find(l => l.id === id);
        if (!lecture) return;

        this.currentLectureId = id;

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-lecture-view').classList.add('active');
        document.getElementById('lecture-content').innerHTML = lecture.content;

        const isRead = this.progress.lecturesRead.includes(id);
        const btn = document.getElementById('btn-mark-read');
        if (isRead) {
            btn.textContent = 'Уже изучено';
            btn.disabled = true;
        } else {
            btn.textContent = 'Отметить как изученное';
            btn.disabled = false;
        }

        window.scrollTo(0, 0);
    },

    markLectureRead() {
        if (!this.currentLectureId) return;
        if (!this.progress.lecturesRead.includes(this.currentLectureId)) {
            this.progress.lecturesRead.push(this.currentLectureId);
            this.saveProgress();
        }

        const btn = document.getElementById('btn-mark-read');
        btn.textContent = 'Уже изучено';
        btn.disabled = true;
    },

    renderTestsList() {
        const container = document.getElementById('tests-list');
        container.innerHTML = TESTS.map(test => {
            const result = this.progress.testResults[test.id];
            let badge = '<span class="card-badge badge-new">Не пройден</span>';
            if (result) {
                badge = `<span class="card-badge badge-score">${result.percentage}%</span>`;
            }

            return `
                <div class="card" onclick="App.startTest(${test.id})">
                    <div class="card-header">
                        <div class="card-number">${test.id}</div>
                        ${badge}
                    </div>
                    <div class="card-body">
                        <h3>${test.title}</h3>
                        <p>${test.questions.length} вопросов</p>
                    </div>
                    <div class="card-footer">
                        <span>Тест ${test.id} из ${TESTS.length}</span>
                        <span>${result ? 'Пройден' : 'Не пройден'}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    startTest(id) {
        const test = TESTS.find(t => t.id === id);
        if (!test) return;

        this.currentTestId = id;
        this.currentQuestionIndex = 0;
        this.testAnswers = new Array(test.questions.length).fill(-1);

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-test-take').classList.add('active');

        this.renderQuestion();
    },

    renderQuestion() {
        const test = TESTS.find(t => t.id === this.currentTestId);
        if (!test) return;

        const q = test.questions[this.currentQuestionIndex];
        const total = test.questions.length;
        const current = this.currentQuestionIndex + 1;
        const answered = this.testAnswers[this.currentQuestionIndex];

        document.getElementById('test-header').innerHTML = `
            <h2>${test.title}</h2>
            <div class="test-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(current / total) * 100}%"></div>
                </div>
                <span class="progress-text">${current} / ${total}</span>
            </div>
        `;

        document.getElementById('test-question').innerHTML = `<p>${q.question}</p>`;

        const letters = ['А', 'Б', 'В', 'Г', 'Д', 'Е'];
        document.getElementById('test-options').innerHTML = q.options.map((opt, i) => {
            let cls = 'option-btn';
            if (answered >= 0) {
                cls += ' disabled';
                if (i === q.correct) cls += ' correct';
                else if (i === answered && answered !== q.correct) cls += ' wrong';
            }
            return `
                <button class="${cls}" onclick="App.selectAnswer(${i})" ${answered >= 0 ? 'disabled' : ''}>
                    <span class="option-letter">${letters[i]}</span>
                    <span>${opt}</span>
                </button>
            `;
        }).join('');

        const explEl = document.getElementById('test-explanation');
        if (answered >= 0) {
            explEl.style.display = 'block';
            explEl.innerHTML = `<strong>Пояснение:</strong> ${q.explanation}`;
        } else {
            explEl.style.display = 'none';
        }

        const isLast = this.currentQuestionIndex === total - 1;
        const hasAnswer = answered >= 0;
        document.getElementById('test-nav').innerHTML = `
            ${this.currentQuestionIndex > 0 ? '<button class="btn btn-primary" onclick="App.prevQuestion()">&larr; Назад</button>' : ''}
            ${hasAnswer ? (isLast
                ? '<button class="btn btn-success" onclick="App.finishTest()">Завершить тест</button>'
                : '<button class="btn btn-primary" onclick="App.nextQuestion()">Далее &rarr;</button>'
            ) : ''}
        `;
    },

    selectAnswer(index) {
        if (this.testAnswers[this.currentQuestionIndex] >= 0) return;
        this.testAnswers[this.currentQuestionIndex] = index;
        this.renderQuestion();
    },

    nextQuestion() {
        const test = TESTS.find(t => t.id === this.currentTestId);
        if (this.currentQuestionIndex < test.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuestion();
            window.scrollTo(0, 0);
        }
    },

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderQuestion();
            window.scrollTo(0, 0);
        }
    },

    finishTest() {
        const test = TESTS.find(t => t.id === this.currentTestId);
        if (!test) return;

        let correct = 0;
        test.questions.forEach((q, i) => {
            if (this.testAnswers[i] === q.correct) correct++;
        });

        const percentage = Math.round((correct / test.questions.length) * 100);

        this.progress.testResults[test.id] = {
            correct: correct,
            total: test.questions.length,
            percentage: percentage,
            date: new Date().toISOString()
        };
        this.saveProgress();

        let scoreClass = 'poor';
        let message = 'Рекомендуется повторить материал';
        if (percentage >= 90) { scoreClass = 'excellent'; message = 'Отличный результат!'; }
        else if (percentage >= 70) { scoreClass = 'good'; message = 'Хороший результат!'; }
        else if (percentage >= 50) { scoreClass = 'average'; message = 'Удовлетворительно. Рекомендуется повторить материал.'; }

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-test-result').classList.add('active');

        document.getElementById('test-result-content').innerHTML = `
            <div class="result-card">
                <h2>${test.title}</h2>
                <div class="result-score ${scoreClass}">${percentage}%</div>
                <div class="result-details">
                    <p>Правильных ответов: ${correct} из ${test.questions.length}</p>
                    <p>${message}</p>
                </div>
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="App.startTest(${test.id})">Пройти заново</button>
                    <button class="btn btn-success" onclick="App.navigateTo('tests')">К списку тестов</button>
                </div>
            </div>
        `;
    },

    renderProgress() {
        const totalLectures = LECTURES.length;
        const totalTests = TESTS.length;
        const readLectures = this.progress.lecturesRead.length;
        const passedTests = Object.keys(this.progress.testResults).length;
        const totalItems = totalLectures + totalTests;
        const completedItems = readLectures + passedTests;
        const overallPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        let avgScore = 0;
        const results = Object.values(this.progress.testResults);
        if (results.length > 0) {
            avgScore = Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length);
        }

        let html = `
            <div class="progress-overview">
                <div class="progress-card">
                    <div class="stat-number">${overallPercent}%</div>
                    <div class="stat-label">Общий прогресс</div>
                </div>
                <div class="progress-card">
                    <div class="stat-number">${readLectures}/${totalLectures}</div>
                    <div class="stat-label">Разделов изучено</div>
                </div>
                <div class="progress-card">
                    <div class="stat-number">${avgScore}%</div>
                    <div class="stat-label">Средний балл тестов</div>
                </div>
            </div>
        `;

        html += `<div class="progress-section"><h2>Учебные материалы</h2>`;
        LECTURES.forEach(l => {
            const done = this.progress.lecturesRead.includes(l.id);
            html += `
                <div class="progress-item">
                    <span class="progress-item-title">${l.id}. ${l.title}</span>
                    <span class="progress-item-status ${done ? 'status-done' : 'status-pending'}">${done ? 'Изучено' : 'Не изучено'}</span>
                </div>
            `;
        });
        html += `</div>`;

        html += `<div class="progress-section"><h2>Тесты</h2>`;
        TESTS.forEach(t => {
            const result = this.progress.testResults[t.id];
            html += `
                <div class="progress-item">
                    <span class="progress-item-title">${t.id}. ${t.title}</span>
                    <span class="progress-item-status ${result ? 'status-done' : 'status-pending'}">${result ? result.percentage + '%' : 'Не пройден'}</span>
                </div>
            `;
        });
        html += `</div>`;

        html += `<button class="reset-btn" onclick="App.resetProgress()">Сбросить прогресс</button>`;

        document.getElementById('progress-content').innerHTML = html;
    },

    resetProgress() {
        if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
            this.progress = { lecturesRead: [], testResults: {} };
            this.saveProgress();
            this.renderProgress();
        }
    }
};
