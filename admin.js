// admin.js - ФІКС ДЛЯ GITHUB PAGES
(function() {
    console.log('🚀 Адмін-панель запускається на GitHub Pages...');
    
    // Затримка для завантаження всіх файлів
    setTimeout(initAdmin, 100);
    
    function initAdmin() {
        console.log('🔧 Ініціалізація адмін-панелі...');
        
        // 1. ПЕРЕВІРКА ЧИ siteData ІСНУЄ
        if (typeof siteData === 'undefined') {
            console.warn('⚠️ siteData не знайдено, створюємо порожні дані');
            window.siteData = {
                courses: [],
                lessons: [],
                settings: {}
            };
        }
        
        // 2. СТВОРЮЄМО ГЛОБАЛЬНИЙ ОБ'ЄКТ АДМІНКИ
        window.admin = {
            data: JSON.parse(JSON.stringify(siteData)),
            unsavedChanges: false,
            mediaFiles: [],
            
            // ОСНОВНІ ФУНКЦІЇ
            init: function() {
                this.bindEvents();
                this.renderCourses();
                this.updateUI();
                console.log('✅ Адмін-панель готова до роботи!');
            },
            
            bindEvents: function() {
                console.log('🔗 Прив\'язка подій...');
                
                // ТЕМА
                const themeToggle = document.querySelector('.theme-toggle');
                if (themeToggle) {
                    themeToggle.addEventListener('click', () => this.toggleTheme());
                }
                
                // ВКЛАДКИ
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const tabId = e.target.getAttribute('data-tab');
                        this.switchTab(tabId);
                    });
                });
                
                // КНОПКА ДОДАВАННЯ КУРСУ
                const addCourseBtn = document.getElementById('add-course-btn');
                if (addCourseBtn) {
                    addCourseBtn.addEventListener('click', () => this.openCourseModal());
                }
                
                // КНОПКА ДОДАВАННЯ УРОКУ
                const addLessonBtn = document.getElementById('add-lesson-btn');
                if (addLessonBtn) {
                    addLessonBtn.addEventListener('click', () => this.openLessonModal());
                }
                
                // GITHUB
                const connectGitHubBtn = document.getElementById('connect-github');
                if (connectGitHubBtn) {
                    connectGitHubBtn.addEventListener('click', () => this.connectGitHub());
                }
                
                // ЗБЕРЕЖЕННЯ
                const saveLocalBtn = document.getElementById('save-local');
                if (saveLocalBtn) {
                    saveLocalBtn.addEventListener('click', () => this.saveLocal());
                }
                
                const pushGitHubBtn = document.getElementById('push-github');
                if (pushGitHubBtn) {
                    pushGitHubBtn.addEventListener('click', () => this.pushToGitHub());
                }
                
                // МОДАЛЬНІ ВІКНА
                document.querySelectorAll('.modal-close').forEach(btn => {
                    btn.addEventListener('click', () => this.closeModals());
                });
                
                // ФОРМИ
                const courseForm = document.getElementById('course-form');
                if (courseForm) {
                    courseForm.addEventListener('submit', (e) => this.saveCourse(e));
                }
                
                const lessonForm = document.getElementById('lesson-form');
                if (lessonForm) {
                    lessonForm.addEventListener('submit', (e) => this.saveLesson(e));
                }
                
                // КНОПКА ОНОВЛЕННЯ ПЕРЕГЛЯДУ
                const refreshBtn = document.getElementById('refresh-preview');
                if (refreshBtn) {
                    refreshBtn.addEventListener('click', () => this.updatePreview());
                }
            },
            
            toggleTheme: function() {
                const body = document.body;
                const isDark = body.classList.contains('dark-theme');
                
                if (isDark) {
                    body.classList.remove('dark-theme');
                    body.classList.add('light-theme');
                } else {
                    body.classList.remove('light-theme');
                    body.classList.add('dark-theme');
                }
                
                const icon = document.querySelector('.theme-toggle i');
                if (icon) {
                    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
                }
            },
            
            switchTab: function(tabId) {
                // Відключаємо всі вкладки
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                });
                
                // Активуємо потрібну
                const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
                const tabPane = document.getElementById(`tab-${tabId}`);
                
                if (tabBtn) tabBtn.classList.add('active');
                if (tabPane) tabPane.classList.add('active');
            },
            
            openCourseModal: function(courseId = null) {
                console.log('📝 Відкриваємо модальне вікно курсу');
                const modal = document.getElementById('course-modal');
                modal.classList.remove('hidden');
            },
            
            openLessonModal: function() {
                console.log('🎬 Відкриваємо модальне вікно уроку');
                const modal = document.getElementById('lesson-modal');
                modal.classList.remove('hidden');
            },
            
            saveCourse: function(e) {
                e.preventDefault();
                alert('✅ Курс збережено! (Демо-режим на GitHub Pages)');
                this.closeModals();
            },
            
            saveLesson: function(e) {
                e.preventDefault();
                alert('✅ Урок збережено! (Демо-режим на GitHub Pages)');
                this.closeModals();
            },
            
            connectGitHub: function() {
                const token = document.getElementById('github-token').value;
                const repo = document.getElementById('github-repo').value;
                
                if (!token || !repo) {
                    this.showMessage('❌ Введіть токен та репозиторій', 'error');
                    return;
                }
                
                this.showMessage('✅ Підключено до GitHub (демо)', 'success');
            },
            
            saveLocal: function() {
                this.showMessage('✅ Дані збережено локально (демо)', 'success');
            },
            
            pushToGitHub: function() {
                this.showMessage('🚀 Дані опубліковано на GitHub (демо)', 'success');
            },
            
            renderCourses: function() {
                const container = document.getElementById('courses-management');
                if (!container) return;
                
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-graduation-cap fa-3x"></i>
                        <h3>Курси відсутні</h3>
                        <p>Створіть перший курс, щоб почати</p>
                        <button class="btn btn-primary" onclick="admin.openCourseModal()">
                            <i class="fas fa-plus"></i> Створити перший курс
                        </button>
                    </div>
                `;
            },
            
            updatePreview: function() {
                const preview = document.getElementById('site-preview');
                if (preview) {
                    preview.innerHTML = `
                        <div class="preview-placeholder">
                            <i class="fas fa-laptop-code fa-3x"></i>
                            <h4>Попередній перегляд сайту</h4>
                            <p>На GitHub Pages перегляд працює в демо-режимі</p>
                        </div>
                    `;
                }
            },
            
            updateUI: function() {
                // Активуємо першу вкладку
                this.switchTab('courses');
                
                // Оновлюємо статус
                this.updateChangesStatus();
            },
            
            updateChangesStatus: function() {
                const countElement = document.getElementById('changes-count');
                const savedElement = document.getElementById('last-saved');
                
                if (countElement) {
                    countElement.textContent = 'Змін немає';
                    countElement.style.color = '#4caf50';
                }
                
                if (savedElement) {
                    savedElement.textContent = 'Готово до роботи';
                    savedElement.style.color = '#4caf50';
                }
            },
            
            showMessage: function(text, type = 'info') {
                const status = document.getElementById('github-status');
                if (status) {
                    status.textContent = text;
                    status.className = `status-message ${type}`;
                    status.classList.remove('hidden');
                    
                    setTimeout(() => {
                        status.classList.add('hidden');
                    }, 3000);
                }
            },
            
            closeModals: function() {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.classList.add('hidden');
                });
            }
        };
        
        // 3. ЗАПУСКАЄМО АДМІН-ПАНЕЛЬ
        window.admin.init();
        
        // 4. ГЛОБАЛЬНІ ФУНКЦІЇ ДЛЯ HTML
        window.clearCourseImage = function() {
            const preview = document.getElementById('course-image-preview');
            if (preview) {
                preview.innerHTML = `
                    <i class="fas fa-image"></i>
                    <span>Натисніть для завантаження зображення</span>
                `;
            }
        };
        
        console.log('🎉 Адмін-панель успішно запущена на GitHub Pages!');
    }
})();
