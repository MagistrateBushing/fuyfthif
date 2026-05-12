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
        const saved = localStorage.getItem('informatika_progress');
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
        localStorage.setItem('informatika_progress', JSON.stringify(this.progress));
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

    // === Lectures ===

    renderLecturesList() {
        const container = document.getElementById('lectures-list');
        container.innerHTML = LECTURES.map(lecture => {
            const isRead = this.progress.lecturesRead.includes(lecture.id);
            const badge = isRead
                ? '<span class="card-badge badge-done">Прочитано</span>'
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
                        <span>Лекция ${lecture.id} из ${LECTURES.length}</span>
                        <span>${isRead ? 'Прочитано' : 'Не прочитано'}</span>
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
            btn.textContent = 'Уже прочитано';
            btn.disabled = true;
        } else {
            btn.textContent = 'Отметить как прочитано';
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
        btn.textContent = 'Уже прочитано';
        btn.disabled = true;
    },

    goToTestFromLecture() {
        const test = TESTS.find(t => t.lectureId === this.currentLectureId);
        if (test) {
            this.startTest(test.id);
        }
    },

    // === Tests ===

    renderTestsList() {
        const container = document.getElementById('tests-list');
        container.innerHTML = TESTS.map(test => {
            const result = this.progress.testResults[test.id];
            let badge = '<span class="card-badge badge-new">Не пройден</span>';
            let footerRight = 'Не пройден';

            if (result) {
                const pct = result.percentage;
                let badgeClass = 'badge-done';
                if (pct < 60) badgeClass = 'badge-score';
                badge = `<span class="card-badge ${badgeClass}">${pct}%</span>`;
                footerRight = `Лучший результат: ${pct}%`;
            }

            const lecture = LECTURES.find(l => l.id === test.lectureId);

            return `
                <div class="card" onclick="App.startTest(${test.id})">
                    <div class="card-header">
                        <div class="card-number">${test.id}</div>
                        ${badge}
                    </div>
                    <div class="card-body">
                        <h3>${test.title}</h3>
                        <p>${test.questions.length} вопросов | К лекции: ${lecture ? lecture.title : ''}</p>
                    </div>
                    <div class="card-footer">
                        <span>${test.questions.length} вопросов</span>
                        <span>${footerRight}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    startTest(testId) {
        const test = TESTS.find(t => t.id === testId);
        if (!test) return;

        this.currentTestId = testId;
        this.currentQuestionIndex = 0;
        this.testAnswers = new Array(test.questions.length).fill(null);

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-test-run').classList.add('active');

        document.getElementById('test-title').textContent = test.title;
        this.renderQuestion();
        window.scrollTo(0, 0);
    },

    renderQuestion() {
        const test = TESTS.find(t => t.id === this.currentTestId);
        if (!test) return;

        const q = test.questions[this.currentQuestionIndex];
        const total = test.questions.length;
        const current = this.currentQuestionIndex + 1;

        const progressPct = (current / total) * 100;
        document.getElementById('test-progress-fill').style.width = progressPct + '%';
        document.getElementById('test-progress-text').textContent = `Вопрос ${current} из ${total}`;

        document.getElementById('test-question').innerHTML = `<p><strong>Вопрос ${current}.</strong> ${q.question}</p>`;

        const optionsContainer = document.getElementById('test-options');
        optionsContainer.innerHTML = q.options.map((opt, idx) => `
            <div class="test-option" data-index="${idx}" onclick="App.selectOption(${idx})">
                ${opt}
            </div>
        `).join('');

        document.getElementById('test-feedback').classList.add('hidden');
        document.getElementById('test-feedback').className = 'test-feedback hidden';
        document.getElementById('btn-next-q').classList.add('hidden');
    },

    selectOption(optionIndex) {
        const test = TESTS.find(t => t.id === this.currentTestId);
        const q = test.questions[this.currentQuestionIndex];

        this.testAnswers[this.currentQuestionIndex] = optionIndex;

        const options = document.querySelectorAll('.test-option');
        options.forEach(opt => {
            opt.classList.add('disabled');
            const idx = parseInt(opt.dataset.index);
            if (idx === q.correct) {
                opt.classList.add('correct');
            } else if (idx === optionIndex && idx !== q.correct) {
                opt.classList.add('wrong');
            }
        });

        const feedback = document.getElementById('test-feedback');
        feedback.classList.remove('hidden');

        if (optionIndex === q.correct) {
            feedback.className = 'test-feedback correct';
            feedback.innerHTML = `<strong>Верно!</strong> ${q.explanation}`;
        } else {
            feedback.className = 'test-feedback wrong';
            feedback.innerHTML = `<strong>Неверно.</strong> ${q.explanation}`;
        }

        const nextBtn = document.getElementById('btn-next-q');
        nextBtn.classList.remove('hidden');

        if (this.currentQuestionIndex === test.questions.length - 1) {
            nextBtn.textContent = 'Завершить тест';
        } else {
            nextBtn.textContent = 'Следующий вопрос';
        }
    },

    nextQuestion() {
        const test = TESTS.find(t => t.id === this.currentTestId);

        if (this.currentQuestionIndex >= test.questions.length - 1) {
            this.finishTest();
        } else {
            this.currentQuestionIndex++;
            this.renderQuestion();
            window.scrollTo(0, 0);
        }
    },

    finishTest() {
        const test = TESTS.find(t => t.id === this.currentTestId);
        let correctCount = 0;

        test.questions.forEach((q, idx) => {
            if (this.testAnswers[idx] === q.correct) {
                correctCount++;
            }
        });

        const percentage = Math.round((correctCount / test.questions.length) * 100);

        const existing = this.progress.testResults[this.currentTestId];
        if (!existing || percentage > existing.percentage) {
            this.progress.testResults[this.currentTestId] = {
                correct: correctCount,
                total: test.questions.length,
                percentage: percentage,
                date: new Date().toISOString()
            };
            this.saveProgress();
        }

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById('page-test-results').classList.add('active');

        const scoreEl = document.getElementById('results-score');
        scoreEl.textContent = percentage + '%';
        scoreEl.className = 'results-score';

        if (percentage >= 90) scoreEl.classList.add('excellent');
        else if (percentage >= 70) scoreEl.classList.add('good');
        else if (percentage >= 50) scoreEl.classList.add('average');
        else scoreEl.classList.add('poor');

        let grade = '';
        if (percentage >= 90) grade = 'Отлично!';
        else if (percentage >= 70) grade = 'Хорошо';
        else if (percentage >= 50) grade = 'Удовлетворительно';
        else grade = 'Необходимо повторить материал';

        document.getElementById('results-details').innerHTML = `
            <p>Правильных ответов: ${correctCount} из ${test.questions.length}</p>
            <p><strong>${grade}</strong></p>
        `;

        window.scrollTo(0, 0);
    },

    retakeTest() {
        if (this.currentTestId) {
            this.startTest(this.currentTestId);
        }
    },

    // === Progress ===

    renderProgress() {
        const totalLectures = LECTURES.length;
        const totalTests = TESTS.length;
        const totalItems = totalLectures + totalTests;
        const completedLectures = this.progress.lecturesRead.length;
        const completedTests = Object.keys(this.progress.testResults).length;
        const completed = completedLectures + completedTests;
        const percent = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;

        document.getElementById('progress-percent').textContent = percent + '%';

        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (percent / 100) * circumference;
        document.getElementById('progress-arc').style.strokeDashoffset = offset;

        const table = document.getElementById('progress-table');
        table.innerHTML = LECTURES.map(lecture => {
            const isRead = this.progress.lecturesRead.includes(lecture.id);
            const test = TESTS.find(t => t.lectureId === lecture.id);
            const testResult = test ? this.progress.testResults[test.id] : null;

            let lectBadge = isRead
                ? '<span class="progress-badge read">Прочитано</span>'
                : '<span class="progress-badge unread">Не прочитано</span>';

            let testBadge = '';
            if (testResult) {
                testBadge = `<span class="progress-badge tested">${testResult.percentage}%</span>`;
            } else {
                testBadge = '<span class="progress-badge unread">Тест не пройден</span>';
            }

            let status = '';
            if (isRead && testResult) {
                status = `Лекция прочитана, тест: ${testResult.percentage}%`;
            } else if (isRead) {
                status = 'Лекция прочитана, тест не пройден';
            } else {
                status = 'Не начато';
            }

            return `
                <div class="progress-row">
                    <div class="progress-row-num">${lecture.id}</div>
                    <div class="progress-row-info">
                        <div class="progress-row-title">${lecture.title}</div>
                        <div class="progress-row-status">${status}</div>
                    </div>
                    <div class="progress-row-badges">
                        ${lectBadge}
                        ${testBadge}
                    </div>
                </div>
            `;
        }).join('');
    },

    resetProgress() {
        if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
            this.progress = {
                lecturesRead: [],
                testResults: {}
            };
            this.saveProgress();
            this.renderProgress();
            this.updateHomeStats();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
