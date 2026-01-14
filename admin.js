// admin.js - робоча версія
class AdminPanel {
    constructor() {
        // Перевірка чи існує siteData
        if (typeof siteData === 'undefined') {
            console.error('siteData is not defined!');
            this.data = {
                courses: [],
                lessons: [],
                settings: {}
            };
        } else {
            this.data = { ...siteData };
        }
        
        this.unsavedChanges = false;
        this.github = null;
        this.mediaFiles = [];
        
        console.log('AdminPanel initialized with data:', this.data);
    }
    
    init() {
        console.log('Initializing admin panel...');
        this.bindEvents();
        this.loadData();
        this.renderCourses();
        this.setupBasicUI();
    }
    
    bindEvents() {
        console.log('Binding events...');
        
        // Вкладки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // Кнопки додавання курсу
        const addCourseBtn = document.getElementById('add-course-btn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', () => {
                console.log('Add course clicked');
                this.openCourseModal();
            });
        }
        
        // Кнопки додавання уроку
        const addLessonBtn = document.getElementById('add-lesson-btn');
        if (addLessonBtn) {
            addLessonBtn.addEventListener('click', () => {
                console.log('Add lesson clicked');
                this.openLessonModal();
            });
        }
        
        // GitHub connection
        const connectGitHubBtn = document.getElementById('connect-github');
        if (connectGitHubBtn) {
            connectGitHubBtn.addEventListener('click', () => this.connectGitHub());
        }
        
        // Збереження
        const saveLocalBtn = document.getElementById('save-local');
        if (saveLocalBtn) {
            saveLocalBtn.addEventListener('click', () => this.saveLocal());
        }
        
        // Push to GitHub
        const pushGitHubBtn = document.getElementById('push-github');
        if (pushGitHubBtn) {
            pushGitHubBtn.addEventListener('click', () => this.pushToGitHub());
        }
        
        // Тема
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Модальні вікна закриття
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        // Форма курсу
        const courseForm = document.getElementById('course-form');
        if (courseForm) {
            courseForm.addEventListener('submit', (e) => this.saveCourse(e));
        }
        
        // Форма уроку
        const lessonForm = document.getElementById('lesson-form');
        if (lessonForm) {
            lessonForm.addEventListener('submit', (e) => this.saveLesson(e));
        }
    }
    
    setupBasicUI() {
        // Активація першої вкладки
        this.switchTab('courses');
        
        // Оновлення статусу змін
        this.updateChangesStatus();
    }
    
    loadData() {
        // Завантаження з localStorage
        try {
            const savedData = localStorage.getItem('adminData');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed.courses) this.data.courses = parsed.courses;
                if (parsed.lessons) this.data.lessons = parsed.lessons;
                if (parsed.settings) this.data.settings = parsed.settings;
            }
            
            const mediaData = localStorage.getItem('mediaFiles');
            if (mediaData) {
                this.mediaFiles = JSON.parse(mediaData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    switchTab(tabId) {
        console.log('Switching to tab:', tabId);
        
        // Оновлення кнопок вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });
        
        // Оновлення контенту вкладок
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `tab-${tabId}`) {
                pane.classList.add('active');
            }
        });
    }
    
    openCourseModal(courseId = null) {
        console.log('Opening course modal, ID:', courseId);
        const modal = document.getElementById('course-modal');
        const title = document.getElementById('course-modal-title');
        
        if (courseId) {
            // Редагування існуючого курсу
            const course = this.data.courses.find(c => c.id === courseId);
            if (course) {
                title.textContent = 'Редагувати курс';
                document.getElementById('course-id').value = course.id;
                document.getElementById('course-title').value = course.title;
                document.getElementById('course-slug').value = course.id;
                document.getElementById('course-description').value = course.description;
                document.getElementById('course-full-description').value = course.fullDescription || '';
            }
        } else {
            // Новий курс
            title.textContent = 'Новий курс';
            document.getElementById('course-form').reset();
            document.getElementById('course-id').value = '';
        }
        
        modal.classList.remove('hidden');
    }
    
    saveCourse(e) {
        e.preventDefault();
        console.log('Saving course...');
        
        const courseId = document.getElementById('course-id').value;
        const title = document.getElementById('course-title').value;
        const slug = document.getElementById('course-slug').value || this.generateSlug(title);
        const description = document.getElementById('course-description').value;
        const fullDescription = document.getElementById('course-full-description').value;
        
        if (!title || !description) {
            this.showMessage('Заповніть обов\'язкові поля', 'error');
            return;
        }
        
        const courseData = {
            id: courseId || slug,
            title: title,
            description: description,
            fullDescription: fullDescription || description,
            image: 'default-course.jpg'
        };
        
        if (courseId) {
            // Оновлення існуючого курсу
            const index = this.data.courses.findIndex(c => c.id === courseId);
            if (index !== -1) {
                this.data.courses[index] = courseData;
            }
        } else {
            // Додавання нового курсу
            this.data.courses.push(courseData);
        }
        
        this.markChanges();
        this.renderCourses();
        this.closeModals();
        this.showMessage('Курс збережено', 'success');
    }
    
    openLessonModal(lessonId = null) {
        console.log('Opening lesson modal');
        const modal = document.getElementById('lesson-modal');
        
        // Заповнення випадаючого списку курсів
        const courseSelect = document.getElementById('lesson-course');
        courseSelect.innerHTML = '<option value="">Виберіть курс</option>';
        this.data.courses.forEach(course => {
            courseSelect.innerHTML += `<option value="${course.id}">${course.title}</option>`;
        });
        
        modal.classList.remove('hidden');
    }
    
    saveLesson(e) {
        e.preventDefault();
        console.log('Saving lesson...');
        
        const courseId = document.getElementById('lesson-course').value;
        const title = document.getElementById('lesson-title').value;
        const videoId = document.getElementById('lesson-video-id').value;
        const description = document.getElementById('lesson-description').value;
        
        if (!courseId || !title || !videoId || !description) {
            this.showMessage('Заповніть обов\'язкові поля', 'error');
            return;
        }
        
        const lessonData = {
            id: this.generateId('lesson'),
            courseId: courseId,
            title: title,
            videoId: videoId,
            description: description,
            fullDescription: description,
            order: this.data.lessons.filter(l => l.courseId === courseId).length + 1
        };
        
        this.data.lessons.push(lessonData);
        this.markChanges();
        this.renderLessons();
        this.closeModals();
        this.showMessage('Урок збережено', 'success');
    }
    
    async connectGitHub() {
        console.log('Connecting to GitHub...');
        const token = document.getElementById('github-token').value;
        const repo = document.getElementById('github-repo').value;
        const branch = document.getElementById('github-branch').value || 'main';
        
        if (!token || !repo) {
            this.showMessage('Введіть токен та репозиторій', 'error');
            return;
        }
        
        try {
            this.github = new GitHubAPI(token, repo, branch);
            const result = await this.github.testConnection();
            
            if (result.success) {
                this.showMessage(`Підключено до GitHub як ${result.username}`, 'success');
                localStorage.setItem('githubToken', token);
                localStorage.setItem('githubRepo', repo);
                localStorage.setItem('githubBranch', branch);
                
                // Активація кнопки публікації
                document.getElementById('push-github').disabled = false;
            } else {
                this.showMessage('Помилка підключення: ' + result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Помилка: ' + error.message, 'error');
        }
    }
    
    async pushToGitHub() {
        if (!this.github) {
            this.showMessage('Спочатку підключіться до GitHub', 'error');
            return;
        }
        
        try {
            const dataContent = `const siteData = ${JSON.stringify(this.data, null, 2)};\n\n// Додайте ваші функції з data.js тут`;
            
            const result = await this.github.updateFile(
                'data.js',
                dataContent,
                'Оновлення даних через адмін-панель'
            );
            
            if (result.success) {
                this.unsavedChanges = false;
                this.updateChangesStatus();
                document.getElementById('save-local').disabled = true;
                document.getElementById('push-github').disabled = true;
                this.showMessage('Дані успішно опубліковані на GitHub!', 'success');
            } else {
                this.showMessage('Помилка публікації: ' + result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Помилка: ' + error.message, 'error');
        }
    }
    
    renderCourses() {
        const container = document.getElementById('courses-management');
        if (!container) return;
        
        if (this.data.courses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-graduation-cap fa-3x"></i>
                    <h3>Курси відсутні</h3>
                    <p>Створіть перший курс</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="courses-grid-admin">';
        this.data.courses.forEach(course => {
            const lessonsCount = this.data.lessons.filter(l => l.courseId === course.id).length;
            html += `
                <div class="course-card-admin" data-id="${course.id}">
                    <div class="course-image-admin">
                        <img src="${course.image || 'default-course.jpg'}" alt="${course.title}">
                        <div class="course-actions">
                            <button class="action-btn edit-btn" onclick="admin.editCourse('${course.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="admin.deleteCourse('${course.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="course-info-admin">
                        <h4>${course.title}</h4>
                        <p>${course.description.substring(0, 80)}...</p>
                        <div class="course-meta">
                            <span><i class="fas fa-play-circle"></i> ${lessonsCount} уроків</span>
                            <span class="course-id">ID: ${course.id}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    }
    
    renderLessons() {
        // Базова реалізація
        const container = document.getElementById('lessons-management');
        if (container) {
            container.innerHTML = `<p>Загальна кількість уроків: ${this.data.lessons.length}</p>`;
        }
    }
    
    saveLocal() {
        try {
            localStorage.setItem('adminData', JSON.stringify(this.data));
            localStorage.setItem('mediaFiles', JSON.stringify(this.mediaFiles));
            
            this.unsavedChanges = false;
            this.updateChangesStatus();
            document.getElementById('save-local').disabled = true;
            
            this.showMessage('Дані збережено локально', 'success');
        } catch (error) {
            this.showMessage('Помилка збереження: ' + error.message, 'error');
        }
    }
    
    markChanges() {
        this.unsavedChanges = true;
        this.updateChangesStatus();
        document.getElementById('save-local').disabled = false;
        if (this.github) {
            document.getElementById('push-github').disabled = false;
        }
    }
    
    updateChangesStatus() {
        const countElement = document.getElementById('changes-count');
        const savedElement = document.getElementById('last-saved');
        
        if (countElement) {
            countElement.textContent = this.unsavedChanges ? 'Є незбережені зміни' : 'Змін немає';
            countElement.style.color = this.unsavedChanges ? '#ff9800' : '#4caf50';
        }
        
        if (savedElement) {
            savedElement.textContent = this.unsavedChanges ? 'Не збережено' : 'Збережено';
            savedElement.style.color = this.unsavedChanges ? '#ff9800' : '#4caf50';
        }
    }
    
    showMessage(text, type = 'info') {
        const status = document.getElementById('github-status');
        if (status) {
            status.textContent = text;
            status.className = `status-message ${type}`;
            status.classList.remove('hidden');
            
            setTimeout(() => {
                status.classList.add('hidden');
            }, 3000);
        } else {
            alert(`${type.toUpperCase()}: ${text}`);
        }
    }
    
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
    
    toggleTheme() {
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
    }
    
    generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateSlug(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }
}

// Ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing admin panel...');
    
    // Створення глобального об'єкта адмінки
    window.admin = new AdminPanel();
    window.admin.init();
    
    // Глобальні функції
    window.clearCourseImage = function() {
        const preview = document.getElementById('course-image-preview');
        if (preview) {
            preview.innerHTML = `
                <i class="fas fa-image"></i>
                <span>Натисніть для завантаження зображення</span>
            `;
        }
    };
    
    console.log('Admin panel ready!');
});
