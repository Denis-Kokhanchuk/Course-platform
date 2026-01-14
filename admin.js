// Адмін-панель для Algorithmic Anchor
class AdminPanel {
    constructor() {
        this.data = { ...siteData };
        this.unsavedChanges = false;
        this.github = null;
        this.mediaFiles = [];
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.renderCourses();
        this.renderLessons();
        this.renderMediaLibrary();
        this.updateSelectors();
        this.checkGitHubStatus();
        this.bindEvents();
    }
    
    bindEvents() {
        // Навігація по вкладках
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(e.target.dataset.tab || e.target.closest('.tab-btn').dataset.tab);
            });
        });
        
        // Кнопки додавання
        document.getElementById('add-course-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openCourseModal();
        });
        
        document.getElementById('add-lesson-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openLessonModal();
        });
        
        // GitHub
        document.getElementById('connect-github')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.connectGitHub();
        });
        
        // Збереження
        document.getElementById('save-local')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveLocal();
        });
        
        document.getElementById('push-github')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.pushToGitHub();
        });
        
        // Форми
        document.getElementById('course-form')?.addEventListener('submit', (e) => this.saveCourse(e));
        document.getElementById('lesson-form')?.addEventListener('submit', (e) => this.saveLesson(e));
        
        // Фільтри
        document.getElementById('lesson-course-filter')?.addEventListener('change', () => this.renderLessons());
        
        // Попередній перегляд
        document.getElementById('refresh-preview')?.addEventListener('click', () => this.updatePreview());
        document.getElementById('preview-page')?.addEventListener('change', () => this.updatePreview());
        document.getElementById('preview-course')?.addEventListener('change', () => this.updatePreviewLessons());
        document.getElementById('preview-lesson')?.addEventListener('change', () => this.updatePreview());
        
        // Модальні вікна
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        document.getElementById('confirm-cancel')?.addEventListener('click', () => this.closeModals());
        
        // Тема
        document.querySelector('.theme-toggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Завантаження файлів
        this.setupFileUploads();
        
        // Делегування подій
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-btn') && e.target.closest('.course-card-admin')) {
                const courseId = e.target.closest('.course-card-admin').dataset.id;
                if (courseId) this.editCourse(courseId);
            }
            
            if (e.target.closest('.delete-btn') && e.target.closest('.course-card-admin')) {
                const courseId = e.target.closest('.course-card-admin').dataset.id;
                if (courseId) this.deleteCourse(courseId);
            }
            
            if (e.target.closest('.edit-btn') && e.target.closest('.management-item[data-lesson-id]')) {
                const lessonId = e.target.closest('.management-item').dataset.lessonId;
                if (lessonId) this.editLesson(lessonId);
            }
            
            if (e.target.closest('.delete-btn') && e.target.closest('.management-item[data-lesson-id]')) {
                const lessonId = e.target.closest('.management-item').dataset.lessonId;
                if (lessonId) this.deleteLesson(lessonId);
            }
        });
    }
    
    // Завантаження даних
    loadData() {
        try {
            const saved = localStorage.getItem('adminData');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && parsed.courses) {
                    this.data = parsed;
                }
            }
        } catch (e) {
            console.error('Помилка завантаження даних:', e);
            this.data = { ...siteData };
        }
        
        try {
            const media = localStorage.getItem('mediaFiles');
            if (media) {
                this.mediaFiles = JSON.parse(media) || [];
            }
        } catch (e) {
            console.error('Помилка завантаження медіа:', e);
            this.mediaFiles = [];
        }
        
        this.updateChangesStatus();
    }
    
    // GitHub
    async connectGitHub() {
        const token = document.getElementById('github-token').value.trim();
        const repo = document.getElementById('github-repo').value.trim();
        const branch = document.getElementById('github-branch').value.trim() || 'main';
        
        if (!token || !repo) {
            this.showMessage('Введіть токен та репозиторій', 'error');
            return;
        }
        
        this.showLoading('Підключення до GitHub...');
        
        try {
            this.github = new GitHubAPI(token, repo, branch);
            const result = await this.github.testConnection();
            
            if (result.success) {
                this.showMessage(`Підключено як ${result.username}`, 'success');
                localStorage.setItem('githubToken', token);
                localStorage.setItem('githubRepo', repo);
                localStorage.setItem('githubBranch', branch);
                document.getElementById('push-github').disabled = !this.unsavedChanges;
            } else {
                this.showMessage('Помилка підключення: ' + result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Помилка: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    checkGitHubStatus() {
        const token = localStorage.getItem('githubToken');
        const repo = localStorage.getItem('githubRepo');
        const branch = localStorage.getItem('githubBranch') || 'main';
        
        if (token && repo) {
            document.getElementById('github-token').value = token;
            document.getElementById('github-repo').value = repo;
            document.getElementById('github-branch').value = branch;
            this.github = new GitHubAPI(token, repo, branch);
        }
        document.getElementById('push-github').disabled = !this.github || !this.unsavedChanges;
    }
    
    async pushToGitHub() {
        if (!this.github) {
            this.showMessage('Спочатку підключіться до GitHub', 'error');
            return;
        }
        
        if (!this.unsavedChanges) {
            this.showMessage('Немає змін для публікації', 'info');
            return;
        }
        
        this.showConfirm(
            'Опублікувати зміни на GitHub?',
            'Всі зміни будуть завантажені на GitHub.',
            async () => {
                this.showLoading('Публікація на GitHub...');
                
                try {
                    // Створюємо вміст для data.js
                    const dataContent = this.generateDataJSContent();
                    
                    // Публікуємо data.js
                    const result = await this.github.updateFile(
                        'data.js',
                        dataContent,
                        'Оновлення даних курсу через адмін-панель'
                    );
                    
                    if (result.success) {
                        // Тепер публікуємо media файли
                        await this.uploadMediaFilesToGitHub();
                        
                        this.unsavedChanges = false;
                        this.updateChangesStatus();
                        
                        // Показуємо інструкції для оновлення сайту
                        this.showSiteUpdateInstructions();
                        
                        this.showMessage('Зміни опубліковано на GitHub!', 'success');
                    } else {
                        this.showMessage('Помилка публікації: ' + result.error, 'error');
                    }
                } catch (error) {
                    this.showMessage('Помилка: ' + error.message, 'error');
                } finally {
                    this.hideLoading();
                }
            }
        );
    }
    
    // НОВИЙ МЕТОД: показує інструкції для оновлення сайту
    showSiteUpdateInstructions() {
        const siteUrl = window.location.origin.includes('admin') 
            ? window.location.origin.replace('/admin', '')
            : window.location.origin;
        
        const instructionsHtml = `
            <div class="update-instructions">
                <h3 style="margin-top: 0; color: var(--success-color);">
                    <i class="fas fa-check-circle"></i> Дані опубліковано на GitHub
                </h3>
                <p>Щоб оновити дані на сайті:</p>
                
                <div class="instructions" style="margin-top: 15px;">
                    <h4 style="margin-bottom: 10px;">Спосіб 1: Відкрити сайт</h4>
                    <p>Сайт має автоматично оновити дані при завантаженні.</p>
                    <button id="open-site-btn" class="btn btn-primary" style="margin: 10px 0;">
                        <i class="fas fa-external-link-alt"></i> Відкрити сайт
                    </button>
                    
                    <h4 style="margin-top: 20px; margin-bottom: 10px;">Спосіб 2: Оновити вручну</h4>
                    <p>Якщо дані не оновилися:</p>
                    <ol style="margin-left: 20px; margin-bottom: 15px;">
                        <li>Відкрийте сайт: <a href="${siteUrl}" target="_blank" style="color: var(--primary-color);">${siteUrl}</a></li>
                        <li>Натисніть <strong>F12</strong> для відкриття DevTools</li>
                        <li>Перейдіть на вкладку <strong>Console</strong></li>
                        <li>Введіть команду: <code style="background: #f0f0f0; padding: 2px 5px; border-radius: 3px;">updateDataFromGitHub()</code></li>
                    </ol>
                    
                    <h4 style="margin-top: 20px; margin-bottom: 10px;">Спосіб 3: Копіювати команду</h4>
                    <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                        <code id="update-command" style="font-family: monospace;">
fetch('https://raw.githubusercontent.com/Denis-Kokhanchuk/Course-platform/main/data.js')
  .then(r => r.text())
  .then(d => {
    const match = d.match(/const siteData = (\\{.*?\\});/s);
    if (match) {
      window.siteData = JSON.parse(match[1]);
      console.log('✅ Дані оновлено!');
      if (typeof renderCourses === 'function') renderCourses();
    }
  })
                        </code>
                        <button id="copy-command-btn" class="btn btn-secondary" style="margin-top: 10px;">
                            <i class="fas fa-copy"></i> Копіювати команду
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.getElementById('instructions-modal');
        if (!modal) {
            // Створюємо модальне вікно для інструкцій
            const modalHtml = `
                <div id="instructions-modal" class="modal" style="display: block;">
                    <div class="modal-content" style="max-width: 600px;">
                        <div class="modal-header">
                            <h3>Оновлення сайту</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body" id="instructions-content">
                            ${instructionsHtml}
                        </div>
                        <div class="modal-footer">
                            <button id="close-instructions" class="btn">Закрити</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Додаємо обробники подій
            document.getElementById('open-site-btn')?.addEventListener('click', () => {
                window.open(siteUrl, '_blank');
            });
            
            document.getElementById('copy-command-btn')?.addEventListener('click', () => {
                const command = document.getElementById('update-command').textContent;
                navigator.clipboard.writeText(command);
                this.showMessage('Команду скопійовано', 'success');
            });
            
            document.getElementById('close-instructions')?.addEventListener('click', () => {
                document.getElementById('instructions-modal').remove();
            });
            
            document.querySelector('#instructions-modal .modal-close')?.addEventListener('click', () => {
                document.getElementById('instructions-modal').remove();
            });
        }
    }
    
    generateDataJSContent() {
        // Оновлюємо lessonsCount для кожного курсу
        const courses = JSON.parse(JSON.stringify(this.data.courses || []));
        courses.forEach(course => {
            course.lessonsCount = (this.data.lessons || []).filter(l => l.courseId === course.id).length;
        });
        
        // Створюємо чистий об'єкт без зайвих методів
        const cleanData = {
            courses: courses,
            lessons: JSON.parse(JSON.stringify(this.data.lessons || [])),
            settings: {
                siteName: "Algorithmic Anchor",
                theme: "dark"
            }
        };
        
        // Додаємо стандартні функції
        return `// Базова структура даних
const siteData = ${JSON.stringify(cleanData, null, 2)};

// Функції для отримання даних
function getCourses() {
    return siteData.courses || [];
}

function getCourse(courseId) {
    return (siteData.courses || []).find(course => course.id === courseId);
}

function getLessons(courseId) {
    return (siteData.lessons || []).filter(lesson => lesson.courseId === courseId);
}

function getLesson(lessonId) {
    return (siteData.lessons || []).find(lesson => lesson.id === lessonId);
}

function getCourseLessonsCount(courseId) {
    return getLessons(courseId).length;
}

function getSettings() {
    return siteData.settings || {};
}

// Функція для автоматичного оновлення даних з GitHub
async function updateDataFromGitHub() {
    try {
        console.log('Оновлення даних з GitHub...');
        const response = await fetch(
            'https://raw.githubusercontent.com/Denis-Kokhanchuk/Course-platform/main/data.js?t=' + Date.now()
        );
        const text = await response.text();
        
        // Знаходимо siteData в тексті
        const match = text.match(/const siteData = (\\{.*?\\});/s);
        if (match) {
            try {
                const newData = JSON.parse(match[1]);
                window.siteData = newData;
                
                console.log('✅ Дані оновлено з GitHub!');
                
                // Оновлюємо UI
                if (typeof window.renderCourses === 'function') {
                    window.renderCourses();
                }
                
                // Повідомляємо користувача
                if (window.showNotification) {
                    window.showNotification('Дані успішно оновлено!', 'success');
                }
                
                return true;
            } catch (parseError) {
                console.error('Помилка парсингу:', parseError);
                return false;
            }
        }
        return false;
    } catch (error) {
        console.error('Помилка завантаження:', error);
        return false;
    }
}

// Автоматичне оновлення при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    // Оновлюємо кожні 5 хвилин
    setInterval(updateDataFromGitHub, 5 * 60 * 1000);
    
    // Оновлюємо якщо в URL є параметр update
    if (new URLSearchParams(window.location.search).has('update')) {
        updateDataFromGitHub();
    }
});

// Функції для роботи з файлами
function getFile(fileId) {
    try {
        const mediaFiles = JSON.parse(localStorage.getItem('mediaFiles')) || [];
        return mediaFiles.find(f => f.id === fileId);
    } catch (error) {
        console.error('Помилка завантаження файлу:', error);
        return null;
    }
}

function getFileUrl(fileId) {
    const file = getFile(fileId);
    return file?.content || null;
}

function downloadFile(fileId, fileName = null) {
    const file = getFile(fileId);
    if (!file || !file.content) return false;
    
    try {
        let content = file.content;
        if (content.includes('base64,')) {
            content = content.split('base64,')[1];
        }
        
        const byteCharacters = atob(content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.type });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error('Помилка завантаження файлу:', error);
        return false;
    }
}

function getImageUrl(fileId) {
    const file = getFile(fileId);
    if (file && file.type.startsWith('image/') && file.content) {
        return file.content;
    }
    return 'default-course.jpg';
}`;
    }
    
    async uploadMediaFilesToGitHub() {
        if (!this.github || this.mediaFiles.length === 0) return;
        
        try {
            // Створюємо JSON файл з медіа файлами
            const mediaData = this.mediaFiles.map(file => ({
                id: file.id,
                name: file.name,
                type: file.type,
                size: file.size,
                category: file.category,
                uploaded: file.uploaded
                // Не включаємо content, бо воно дуже велике для GitHub
            }));
            
            await this.github.updateFile(
                'media-files.json',
                JSON.stringify(mediaData, null, 2),
                'Оновлення медіа-файлів'
            );
            
        } catch (error) {
            console.error('Помилка публікації медіа-файлів:', error);
        }
    }
    
    // Курси
    renderCourses() {
        const container = document.getElementById('courses-management');
        if (!container) return;
        
        if (!this.data.courses || this.data.courses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-graduation-cap fa-3x"></i>
                    <h3>Курси відсутні</h3>
                    <p>Створіть перший курс, щоб почати</p>
                    <button id="create-first-course" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Створити курс
                    </button>
                </div>
            `;
            document.getElementById('create-first-course')?.addEventListener('click', () => this.openCourseModal());
            return;
        }
        
        let html = '<div class="courses-grid-admin">';
        this.data.courses.forEach(course => {
            if (!course || !course.id) return;
            
            const lessonsCount = this.data.lessons?.filter(l => l.courseId === course.id).length || 0;
            const imageUrl = course.image && course.image.startsWith('file:') 
                ? this.getImageUrl(course.image.replace('file:', ''))
                : (course.image || 'default-course.jpg');
            
            html += `
                <div class="course-card-admin" data-id="${course.id}">
                    <div class="course-image-admin">
                        <img src="${imageUrl}" alt="${course.title || 'Курс'}" onerror="this.src='default-course.jpg'">
                        <div class="course-actions">
                            <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="course-info-admin">
                        <h4>${course.title || 'Без назви'}</h4>
                        <p class="course-desc">${(course.description || '').substring(0, 80)}...</p>
                        <div class="course-meta">
                            <span class="lessons-count"><i class="fas fa-play-circle"></i> ${lessonsCount} уроків</span>
                            <span class="course-id">ID: ${course.id}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
        
        this.updateSelectors();
    }
    
    openCourseModal(courseId = null) {
        const modal = document.getElementById('course-modal');
        const title = document.getElementById('course-modal-title');
        const form = document.getElementById('course-form');
        
        if (courseId) {
            const course = this.data.courses.find(c => c.id === courseId);
            if (!course) return;
            
            title.textContent = 'Редагувати курс';
            document.getElementById('course-id').value = course.id;
            document.getElementById('course-title').value = course.title || '';
            document.getElementById('course-slug').value = course.id;
            document.getElementById('course-description').value = course.description || '';
            document.getElementById('course-full-description').value = course.fullDescription || '';
            
            if (course.image && course.image.startsWith('file:')) {
                const fileId = course.image.replace('file:', '');
                const file = this.getFile(fileId);
                if (file && file.content) {
                    const preview = document.getElementById('course-image-preview');
                    preview.innerHTML = `<img src="${file.content}" alt="Preview">`;
                }
            } else if (course.image) {
                const preview = document.getElementById('course-image-preview');
                preview.innerHTML = `<img src="${course.image}" alt="Preview">`;
            }
        } else {
            title.textContent = 'Новий курс';
            form.reset();
            document.getElementById('course-id').value = '';
            
            const titleInput = document.getElementById('course-title');
            const slugInput = document.getElementById('course-slug');
            
            titleInput?.addEventListener('input', () => {
                if (!slugInput.value || slugInput.value === '') {
                    slugInput.value = this.generateSlug(titleInput.value);
                }
            });
        }
        
        const imageUpload = document.getElementById('course-image-upload');
        imageUpload.onchange = (e) => this.handleImageUpload(e, 'course-image-preview');
        
        modal.classList.remove('hidden');
    }
    
    async saveCourse(e) {
        e.preventDefault();
        
        const courseId = document.getElementById('course-id').value;
        const title = document.getElementById('course-title').value.trim();
        const slug = document.getElementById('course-slug').value.trim();
        const description = document.getElementById('course-description').value.trim();
        const fullDescription = document.getElementById('course-full-description').value.trim();
        
        if (!title || !slug || !description) {
            this.showMessage('Заповніть обов\'язкові поля', 'error');
            return;
        }
        
        const imageFile = document.getElementById('course-image-upload').files[0];
        let imageUrl = this.data.courses.find(c => c.id === courseId)?.image || 'default-course.jpg';
        
        if (imageFile) {
            const fileId = await this.saveFileToLocalStorage(imageFile);
            imageUrl = `file:${fileId}`;
        }
        
        const courseData = {
            id: courseId || slug,
            title,
            description,
            fullDescription: fullDescription || description,
            image: imageUrl,
            lessonsCount: 0
        };
        
        if (!this.data.courses) this.data.courses = [];
        
        if (courseId) {
            const index = this.data.courses.findIndex(c => c.id === courseId);
            if (index !== -1) {
                this.data.courses[index] = courseData;
            }
        } else {
            this.data.courses.push(courseData);
        }
        
        this.markChanges();
        this.renderCourses();
        this.updateSelectors();
        this.closeModals();
        this.showMessage('Курс збережено', 'success');
    }
    
    editCourse(courseId) {
        this.openCourseModal(courseId);
    }
    
    deleteCourse(courseId) {
        this.showConfirm(
            'Видалити курс?',
            'Ця дія видалить курс та всі пов\'язані уроки. Дію не можна скасувати.',
            () => {
                this.data.courses = (this.data.courses || []).filter(c => c.id !== courseId);
                this.data.lessons = (this.data.lessons || []).filter(l => l.courseId !== courseId);
                this.markChanges();
                this.renderCourses();
                this.renderLessons();
                this.updateSelectors();
                this.showMessage('Курс видалено', 'success');
            }
        );
    }
    
    // Уроки
    renderLessons() {
        const container = document.getElementById('lessons-management');
        const filter = document.getElementById('lesson-course-filter')?.value;
        
        if (!container) return;
        
        let lessons = this.data.lessons || [];
        if (filter) {
            lessons = lessons.filter(l => l.courseId === filter);
        }
        
        if (lessons.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-video-slash fa-3x"></i>
                    <h3>Уроки відсутні</h3>
                    <p>${filter ? 'Додайте перший урок для вибраного курсу' : 'Додайте перший урок'}</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        lessons.forEach(lesson => {
            if (!lesson || !lesson.id) return;
            
            const course = (this.data.courses || []).find(c => c.id === lesson.courseId);
            const thumbnailUrl = lesson.thumbnail && lesson.thumbnail.startsWith('file:') 
                ? this.getImageUrl(lesson.thumbnail.replace('file:', ''))
                : (lesson.thumbnail || `https://img.youtube.com/vi/${lesson.videoId}/hqdefault.jpg`);
            
            html += `
                <div class="management-item" data-lesson-id="${lesson.id}">
                    <div class="item-info">
                        <div class="lesson-thumbnail">
                            <img src="${thumbnailUrl}" alt="${lesson.title || 'Урок'}" onerror="this.src='default-course.jpg'">
                        </div>
                        <div class="item-details">
                            <h4>${lesson.title || 'Без назви'}</h4>
                            <p class="item-description">${lesson.description || ''}</p>
                            <div class="item-meta">
                                <span class="course-name">${course?.title || 'Невідомий курс'}</span>
                                <span class="lesson-id">ID: ${lesson.id}</span>
                            </div>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    openLessonModal(lessonId = null) {
        const modal = document.getElementById('lesson-modal');
        const title = document.getElementById('lesson-modal-title');
        const form = document.getElementById('lesson-form');
        
        const courseSelect = document.getElementById('lesson-course');
        courseSelect.innerHTML = '<option value="">Виберіть курс</option>';
        (this.data.courses || []).forEach(course => {
            if (course && course.id) {
                courseSelect.innerHTML += `<option value="${course.id}">${course.title}</option>`;
            }
        });
        
        if (lessonId) {
            const lesson = (this.data.lessons || []).find(l => l.id === lessonId);
            if (!lesson) return;
            
            title.textContent = 'Редагувати урок';
            document.getElementById('lesson-id').value = lesson.id;
            document.getElementById('lesson-course').value = lesson.courseId;
            document.getElementById('lesson-title').value = lesson.title || '';
            document.getElementById('lesson-order').value = lesson.order || 1;
            document.getElementById('lesson-video-id').value = lesson.videoId || '';
            document.getElementById('lesson-description').value = lesson.description || '';
            document.getElementById('lesson-full-description').value = lesson.fullDescription || '';
            document.getElementById('lesson-code-text').value = lesson.code || '';
            
            if (lesson.thumbnail && lesson.thumbnail.startsWith('file:')) {
                const fileId = lesson.thumbnail.replace('file:', '');
                const file = this.getFile(fileId);
                if (file && file.content) {
                    const preview = document.getElementById('lesson-thumbnail-preview');
                    preview.innerHTML = `<img src="${file.content}" alt="Preview">`;
                }
            }
            
            if (lesson.presentation && lesson.presentation.startsWith('file:')) {
                const fileId = lesson.presentation.replace('file:', '');
                const file = this.getFile(fileId);
                if (file) {
                    const preview = document.getElementById('presentation-preview');
                    preview.innerHTML = `<i class="fas fa-file-powerpoint"></i><span>${file.name}</span>`;
                }
            }
            
            if (lesson.codeFile && lesson.codeFile.startsWith('file:')) {
                const fileId = lesson.codeFile.replace('file:', '');
                const file = this.getFile(fileId);
                if (file) {
                    const preview = document.getElementById('code-preview');
                    preview.innerHTML = `<i class="fas fa-code"></i><span>${file.name}</span>`;
                }
            }
        } else {
            title.textContent = 'Новий урок';
            form.reset();
            document.getElementById('lesson-id').value = '';
            document.getElementById('lesson-order').value = (this.data.lessons?.filter(l => l.courseId === document.getElementById('lesson-course').value).length || 0) + 1;
        }
        
        const thumbnailUpload = document.getElementById('lesson-thumbnail-upload');
        thumbnailUpload.onchange = (e) => this.handleImageUpload(e, 'lesson-thumbnail-preview');
        
        const presentationUpload = document.getElementById('presentation-upload');
        presentationUpload.onchange = (e) => this.handleFileUpload(e, 'presentation-preview', 'fa-file-powerpoint');
        
        const codeUpload = document.getElementById('code-upload');
        codeUpload.onchange = (e) => this.handleFileUpload(e, 'code-preview', 'fa-code');
        
        modal.classList.remove('hidden');
    }
    
    async saveLesson(e) {
        e.preventDefault();
        
        const lessonId = document.getElementById('lesson-id').value;
        const courseId = document.getElementById('lesson-course').value;
        const title = document.getElementById('lesson-title').value.trim();
        const order = parseInt(document.getElementById('lesson-order').value) || 1;
        const videoId = document.getElementById('lesson-video-id').value.trim();
        const description = document.getElementById('lesson-description').value.trim();
        const fullDescription = document.getElementById('lesson-full-description').value.trim();
        const code = document.getElementById('lesson-code-text').value.trim();
        
        if (!courseId || !title || !videoId || !description || !fullDescription) {
            this.showMessage('Заповніть обов\'язкові поля', 'error');
            return;
        }
        
        const thumbnailFile = document.getElementById('lesson-thumbnail-upload').files[0];
        const presentationFile = document.getElementById('presentation-upload').files[0];
        const codeFile = document.getElementById('code-upload').files[0];
        
        let thumbnailUrl = (this.data.lessons || []).find(l => l.id === lessonId)?.thumbnail;
        let presentationUrl = (this.data.lessons || []).find(l => l.id === lessonId)?.presentation;
        let codeFileUrl = (this.data.lessons || []).find(l => l.id === lessonId)?.codeFile;
        
        if (thumbnailFile) {
            const fileId = await this.saveFileToLocalStorage(thumbnailFile);
            thumbnailUrl = `file:${fileId}`;
        }
        
        if (presentationFile) {
            const fileId = await this.saveFileToLocalStorage(presentationFile);
            presentationUrl = `file:${fileId}`;
        }
        
        if (codeFile) {
            const fileId = await this.saveFileToLocalStorage(codeFile);
            codeFileUrl = `file:${fileId}`;
        }
        
        const lessonData = {
            id: lessonId || this.generateId('lesson'),
            courseId,
            title,
            order,
            videoId,
            description,
            fullDescription,
            thumbnail: thumbnailUrl,
            presentation: presentationUrl,
            codeFile: codeFileUrl,
            code: code
        };
        
        if (!this.data.lessons) this.data.lessons = [];
        
        if (lessonId) {
            const index = this.data.lessons.findIndex(l => l.id === lessonId);
            if (index !== -1) {
                this.data.lessons[index] = lessonData;
            }
        } else {
            this.data.lessons.push(lessonData);
        }
        
        this.markChanges();
        this.renderLessons();
        this.updateSelectors();
        this.closeModals();
        this.showMessage('Урок збережено', 'success');
    }
    
    editLesson(lessonId) {
        this.openLessonModal(lessonId);
    }
    
    deleteLesson(lessonId) {
        this.showConfirm(
            'Видалити урок?',
            'Ця дія не видалить файли з сервера.',
            () => {
                this.data.lessons = (this.data.lessons || []).filter(l => l.id !== lessonId);
                this.markChanges();
                this.renderLessons();
                this.updateSelectors();
                this.showMessage('Урок видалено', 'success');
            }
        );
    }
    
    // Файли
    setupFileUploads() {
        const imageUpload = document.getElementById('image-upload');
        const fileUpload = document.getElementById('file-upload');
        
        ['image-upload-zone', 'file-upload-zone'].forEach(zoneId => {
            const zone = document.getElementById(zoneId);
            if (!zone) return;
            
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('dragover');
            });
            
            zone.addEventListener('drop', async (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
                
                const files = Array.from(e.dataTransfer.files);
                for (const file of files) {
                    await this.handleDroppedFile(file);
                }
                
                this.renderMediaLibrary();
            });
        });
        
        if (imageUpload) {
            imageUpload.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                for (const file of files) {
                    await this.handleDroppedFile(file);
                }
                this.renderMediaLibrary();
                e.target.value = '';
            });
        }
        
        if (fileUpload) {
            fileUpload.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                for (const file of files) {
                    await this.handleDroppedFile(file);
                }
                this.renderMediaLibrary();
                e.target.value = '';
            });
        }
    }
    
    handleFileUpload(event, previewId, iconClass = 'fa-file') {
        const file = event.target.files[0];
        if (!file) return;
        
        const preview = document.getElementById(previewId);
        preview.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <span>${file.name}</span>
        `;
    }
    
    async handleDroppedFile(file) {
        this.showLoading(`Завантаження ${file.name}...`);
        
        try {
            await this.saveFileToLocalStorage(file);
            this.showMessage(`Файл ${file.name} завантажено`, 'success');
        } catch (error) {
            this.showMessage(`Помилка завантаження ${file.name}: ${error.message}`, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async saveFileToLocalStorage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = {
                    id: this.generateId('file'),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    content: e.target.result,
                    category: file.type.startsWith('image/') ? 'images' : 'files',
                    uploaded: new Date().toISOString()
                };
                
                this.mediaFiles.push(fileData);
                localStorage.setItem('mediaFiles', JSON.stringify(this.mediaFiles));
                
                resolve(fileData.id);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    handleImageUpload(event, previewId) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById(previewId);
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
    
    getFile(fileId) {
        return this.mediaFiles.find(f => f.id === fileId);
    }
    
    getImageUrl(fileId) {
        const file = this.getFile(fileId);
        if (file && file.type.startsWith('image/') && file.content) {
            return file.content;
        }
        return 'default-course.jpg';
    }
    
    renderMediaLibrary() {
        const container = document.getElementById('media-grid');
        if (!container) return;
        
        if (this.mediaFiles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-images fa-3x"></i>
                    <h3>Немає файлів</h3>
                    <p>Завантажте перші файли</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.mediaFiles.forEach(file => {
            const icon = file.type.startsWith('image/') ? 'fa-image' :
                        file.type.includes('pdf') ? 'fa-file-pdf' :
                        file.type.includes('presentation') || file.name.match(/\.(ppt|pptx|key)$/i) ? 'fa-file-powerpoint' :
                        file.type.includes('code') || file.name.match(/\.(py|js|html|css|txt|json)$/i) ? 'fa-code' :
                        'fa-file';
            
            const previewContent = file.type.startsWith('image/') 
                ? `<img src="${file.content}" alt="${file.name}">` 
                : `<i class="fas ${icon} fa-2x"></i>`;
            
            html += `
                <div class="media-item" data-id="${file.id}">
                    <div class="media-preview">
                        ${previewContent}
                    </div>
                    <div class="media-info">
                        <div class="media-name">${file.name}</div>
                        <div class="media-meta">
                            <span>${this.formatFileSize(file.size)}</span>
                            <span>${new Date(file.uploaded).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="media-actions">
                        <button class="action-btn" onclick="admin.copyMediaUrl('${file.id}')">
                            <i class="fas fa-link"></i>
                        </button>
                        <button class="action-btn" onclick="admin.downloadFile('${file.id}', '${file.name.replace(/'/g, "\\'")}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="admin.deleteMedia('${file.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    copyMediaUrl(fileId) {
        const file = this.getFile(fileId);
        if (file && file.content) {
            navigator.clipboard.writeText(file.content);
            this.showMessage('URL скопійовано', 'success');
        }
    }
    
    downloadFile(fileId, fileName = null) {
        const file = this.getFile(fileId);
        if (!file || !file.content) {
            this.showMessage('Файл не знайдено', 'error');
            return false;
        }
        
        try {
            let content = file.content;
            if (content.includes('base64,')) {
                content = content.split('base64,')[1];
            }
            
            const byteCharacters = atob(content);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: file.type });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage(`Файл ${file.name} завантажується`, 'success');
            return true;
        } catch (error) {
            console.error('Помилка завантаження файлу:', error);
            this.showMessage('Помилка завантаження файлу', 'error');
            return false;
        }
    }
    
    deleteMedia(fileId) {
        this.showConfirm(
            'Видалити файл?',
            'Файл буде видалено з медіа-бібліотеки.',
            () => {
                this.mediaFiles = this.mediaFiles.filter(f => f.id !== fileId);
                localStorage.setItem('mediaFiles', JSON.stringify(this.mediaFiles));
                this.markChanges();
                this.renderMediaLibrary();
                this.showMessage('Файл видалено', 'success');
            }
        );
    }
    
    // Попередній перегляд
    updatePreview() {
        const page = document.getElementById('preview-page').value;
        const courseId = document.getElementById('preview-course').value;
        const lessonId = document.getElementById('preview-lesson').value;
        
        let url = 'index.html';
        
        switch (page) {
            case 'course':
                if (courseId) url = `course.html?id=${courseId}`;
                break;
            case 'lesson':
                if (lessonId) url = `lesson.html?id=${lessonId}`;
                break;
        }
        
        const preview = document.getElementById('site-preview');
        preview.innerHTML = `
            <iframe src="${url}?preview=true" class="preview-iframe" sandbox="allow-same-origin allow-scripts"></iframe>
        `;
    }
    
    updatePreviewLessons() {
        const courseId = document.getElementById('preview-course').value;
        const lessonSelect = document.getElementById('preview-lesson');
        
        lessonSelect.innerHTML = '<option value="">Виберіть урок</option>';
        
        if (courseId) {
            const lessons = (this.data.lessons || []).filter(l => l.courseId === courseId);
            lessons.forEach(lesson => {
                lessonSelect.innerHTML += `<option value="${lesson.id}">${lesson.title}</option>`;
            });
        }
    }
    
    updateSelectors() {
        const courseSelects = ['lesson-course-filter', 'lesson-course', 'preview-course'];
        
        courseSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            const currentValue = select.value;
            select.innerHTML = '<option value="">Виберіть курс</option>';
            
            (this.data.courses || []).forEach(course => {
                if (course && course.id) {
                    select.innerHTML += `<option value="${course.id}">${course.title}</option>`;
                }
            });
            
            if (currentValue && [...select.options].some(opt => opt.value === currentValue)) {
                select.value = currentValue;
            }
        });
    }
    
    // Збереження
    markChanges() {
        this.unsavedChanges = true;
        this.updateChangesStatus();
        document.getElementById('save-local').disabled = false;
        document.getElementById('push-github').disabled = !this.github;
    }
    
    updateChangesStatus() {
        const count = document.getElementById('changes-count');
        const saved = document.getElementById('last-saved');
        
        if (this.unsavedChanges) {
            count.textContent = 'Є незбережені зміни';
            saved.textContent = 'Не збережено';
            document.getElementById('push-github').disabled = !this.github;
        } else {
            count.textContent = 'Змін немає';
            saved.textContent = 'Збережено';
            document.getElementById('push-github').disabled = true;
        }
        
        document.getElementById('save-local').disabled = !this.unsavedChanges;
    }
    
    saveLocal() {
        try {
            localStorage.setItem('adminData', JSON.stringify(this.data));
            localStorage.setItem('mediaFiles', JSON.stringify(this.mediaFiles));
            
            // Оновлюємо глобальний siteData для швидкого доступу
            window.siteData = this.data;
            
            this.unsavedChanges = false;
            this.updateChangesStatus();
            
            this.showMessage('Дані збережено локально', 'success');
        } catch (error) {
            this.showMessage('Помилка збереження: ' + error.message, 'error');
        }
    }
    
    // Допоміжні функції
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `tab-${tabId}`);
        });
        
        if (tabId === 'media') {
            this.renderMediaLibrary();
        }
    }
    
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
    
    showConfirm(title, message, callback) {
        const modal = document.getElementById('confirm-modal');
        const confirmMessage = document.getElementById('confirm-message');
        
        if (!modal || !confirmMessage) return;
        
        confirmMessage.textContent = message;
        modal.classList.remove('hidden');
        
        const handleConfirm = () => {
            modal.classList.add('hidden');
            document.getElementById('confirm-ok').removeEventListener('click', handleConfirm);
            document.getElementById('confirm-cancel').removeEventListener('click', handleCancel);
            callback();
        };
        
        const handleCancel = () => {
            modal.classList.add('hidden');
            document.getElementById('confirm-ok').removeEventListener('click', handleConfirm);
            document.getElementById('confirm-cancel').removeEventListener('click', handleCancel);
        };
        
        document.getElementById('confirm-ok').addEventListener('click', handleConfirm);
        document.getElementById('confirm-cancel').addEventListener('click', handleCancel);
    }
    
    showLoading(message = 'Завантаження...') {
        const modal = document.getElementById('loading-modal');
        const loadingMessage = document.getElementById('loading-message');
        
        if (!modal || !loadingMessage) return;
        
        loadingMessage.textContent = message;
        modal.classList.remove('hidden');
    }
    
    hideLoading() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    showMessage(text, type = 'info') {
        const status = document.getElementById('github-status');
        if (!status) return;
        
        status.textContent = text;
        status.className = `status-message ${type}`;
        status.classList.remove('hidden');
        
        setTimeout(() => {
            status.classList.add('hidden');
        }, 3000);
    }
    
    generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateSlug(text) {
        if (!text) return '';
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');
        
        if (isDark) {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light-theme');
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        }
        
        const icon = document.querySelector('.theme-toggle i');
        if (icon) {
            icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

// Глобальна функція для оновлення даних (доступна в консолі браузера)
window.updateDataFromGitHub = async function() {
    try {
        console.log('🔄 Оновлення даних з GitHub...');
        
        const response = await fetch(
            'https://raw.githubusercontent.com/Denis-Kokhanchuk/Course-platform/main/data.js?t=' + Date.now()
        );
        const text = await response.text();
        
        // Знаходимо siteData в тексті
        const match = text.match(/const siteData = (\{[\s\S]*?\});/);
        if (match) {
            try {
                const newData = JSON.parse(match[1]);
                window.siteData = newData;
                
                console.log('✅ Дані успішно оновлено з GitHub!', newData);
                
                // Оновлюємо UI якщо функція існує
                if (typeof window.renderCourses === 'function') {
                    window.renderCourses();
                    console.log('🎨 Інтерфейс оновлено');
                }
                
                // Показуємо повідомлення
                alert('✅ Дані успішно оновлено з GitHub!');
                return true;
            } catch (parseError) {
                console.error('❌ Помилка парсингу:', parseError);
                alert('❌ Помилка обробки даних');
                return false;
            }
        } else {
            console.error('❌ Не вдалося знайти siteData у файлі');
            alert('❌ Не вдалося знайти дані у файлі');
            return false;
        }
    } catch (error) {
        console.error('❌ Помилка завантаження:', error);
        alert('❌ Помилка завантаження даних з GitHub');
        return false;
    }
};

// Ініціалізація
let admin;

document.addEventListener('DOMContentLoaded', () => {
    try {
        admin = new AdminPanel();
        window.admin = admin;
        
        // Глобальні функції
        window.clearCourseImage = () => {
            const preview = document.getElementById('course-image-preview');
            preview.innerHTML = `
                <i class="fas fa-image"></i>
                <span>Натисніть для завантаження зображення</span>
            `;
            document.getElementById('course-image-upload').value = '';
        };
        
        // Функція для швидкого тестування GitHub
        window.testGitHubUpdate = () => {
            const testCommand = `
fetch('https://raw.githubusercontent.com/Denis-Kokhanchuk/Course-platform/main/data.js')
  .then(r => r.text())
  .then(d => {
    console.log('Довжина файлу:', d.length);
    const match = d.match(/const siteData = (\\{.*?\\});/s);
    if (match) {
      console.log('siteData знайдено!');
      console.log('Перші 500 символів:', match[1].substring(0, 500));
    } else {
      console.log('siteData не знайдено');
    }
  });
            `;
            console.log('Команда для тестування:');
            console.log(testCommand);
            alert('Команда скопійована в консоль! Відкрийте DevTools (F12) та вставте в консолі.');
        };
        
        console.log('🚀 Адмін-панель успішно завантажена');
        console.log('💡 Для оновлення даних на сайті використовуйте: updateDataFromGitHub()');
        
    } catch (error) {
        console.error('❌ Помилка завантаження адмін-панелі:', error);
        alert('Помилка завантаження адмін-панелі: ' + error.message);
    }
});
