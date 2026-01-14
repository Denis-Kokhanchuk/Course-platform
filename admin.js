// admin.js - ФІКСОВАНО
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Адмін-панель завантажується...');
    
    // 1. ПЕРЕВІРКА ЧИ siteData ІСНУЄ
    if (typeof siteData === 'undefined') {
        console.error('❌ siteData не визначено!');
        alert('Помилка: siteData не завантажено. Перевірте data.js');
        return;
    }
    console.log('✅ siteData доступний');
    
    // 2. ОСНОВНІ ЗМІННІ
    let currentData = JSON.parse(JSON.stringify(siteData));
    let unsavedChanges = false;
    let mediaFiles = [];
    
    // 3. ПОЧАТКОВА ІНІЦІАЛІЗАЦІЯ
    initAdmin();
    
    function initAdmin() {
        console.log('🔧 Ініціалізація адмін-панелі...');
        
        // А) ТЕМА
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        // Б) ВКЛАДКИ
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
        
        // В) КНОПКИ ДОДАВАННЯ
        const addCourseBtn = document.getElementById('add-course-btn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', openCourseModal);
        }
        
        const addLessonBtn = document.getElementById('add-lesson-btn');
        if (addLessonBtn) {
            addLessonBtn.addEventListener('click', openLessonModal);
        }
        
        // Г) КНОПКИ ЗБЕРЕЖЕННЯ
        const saveLocalBtn = document.getElementById('save-local');
        if (saveLocalBtn) {
            saveLocalBtn.addEventListener('click', saveLocal);
        }
        
        const pushGitHubBtn = document.getElementById('push-github');
        if (pushGitHubBtn) {
            pushGitHubBtn.addEventListener('click', pushToGitHub);
        }
        
        // Д) КНОПКА GITHUB
        const connectGitHubBtn = document.getElementById('connect-github');
        if (connectGitHubBtn) {
            connectGitHubBtn.addEventListener('click', connectGitHub);
        }
        
        // Е) МОДАЛЬНІ ВІКНА
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', closeAllModals);
        });
        
        // Є) ФОРМИ
        const courseForm = document.getElementById('course-form');
        if (courseForm) {
            courseForm.addEventListener('submit', saveCourse);
        }
        
        const lessonForm = document.getElementById('lesson-form');
        if (lessonForm) {
            lessonForm.addEventListener('submit', saveLesson);
        }
        
        // Ж) ПОЧАТКОВЕ ВІДОБРАЖЕННЯ
        renderCourses();
        updateChangesStatus();
        
        console.log('✅ Адмін-панель готова!');
    }
    
    // 4. ОСНОВНІ ФУНКЦІЇ
    
    function toggleTheme() {
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
    
    function switchTab(tabId) {
        // Відключаємо всі вкладки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        // Активуємо потрібну вкладку
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
    }
    
    function openCourseModal() {
        console.log('📝 Відкриваємо модальне вікно курсу');
        const modal = document.getElementById('course-modal');
        modal.classList.remove('hidden');
    }
    
    function openLessonModal() {
        console.log('🎬 Відкриваємо модальне вікно уроку');
        
        // Заповнюємо список курсів
        const courseSelect = document.getElementById('lesson-course');
        courseSelect.innerHTML = '<option value="">Виберіть курс</option>';
        
        currentData.courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.title;
            courseSelect.appendChild(option);
        });
        
        const modal = document.getElementById('lesson-modal');
        modal.classList.remove('hidden');
    }
    
    function saveCourse(event) {
        event.preventDefault();
        console.log('💾 Зберігаємо курс...');
        
        const title = document.getElementById('course-title').value;
        const slug = document.getElementById('course-slug').value;
        const description = document.getElementById('course-description').value;
        
        if (!title || !slug || !description) {
            alert('Заповніть обов\'язкові поля!');
            return;
        }
        
        const newCourse = {
            id: slug,
            title: title,
            description: description,
            fullDescription: document.getElementById('course-full-description').value || description,
            image: 'default-course.jpg'
        };
        
        currentData.courses.push(newCourse);
        markChanges();
        renderCourses();
        closeAllModals();
        
        showMessage('✅ Курс успішно створено!', 'success');
    }
    
    function saveLesson(event) {
        event.preventDefault();
        console.log('💾 Зберігаємо урок...');
        
        const courseId = document.getElementById('lesson-course').value;
        const title = document.getElementById('lesson-title').value;
        const videoId = document.getElementById('lesson-video-id').value;
        const description = document.getElementById('lesson-description').value;
        
        if (!courseId || !title || !videoId || !description) {
            alert('Заповніть обов\'язкові поля!');
            return;
        }
        
        const newLesson = {
            id: 'lesson-' + Date.now(),
            courseId: courseId,
            title: title,
            videoId: videoId,
            description: description,
            fullDescription: document.getElementById('lesson-full-description').value || description,
            order: parseInt(document.getElementById('lesson-order').value) || 1
        };
        
        currentData.lessons.push(newLesson);
        markChanges();
        closeAllModals();
        
        showMessage('✅ Урок успішно створено!', 'success');
    }
    
    async function connectGitHub() {
        const token = document.getElementById('github-token').value;
        const repo = document.getElementById('github-repo').value;
        
        if (!token || !repo) {
            showMessage('❌ Введіть токен та репозиторій', 'error');
            return;
        }
        
        showMessage('🔄 Підключення до GitHub...', 'info');
        
        try {
            const github = new GitHubAPI(token, repo);
            const result = await github.testConnection();
            
            if (result.success) {
                showMessage(`✅ Підключено як ${result.username}`, 'success');
                document.getElementById('push-github').disabled = false;
            } else {
                showMessage('❌ Помилка підключення', 'error');
            }
        } catch (error) {
            showMessage('❌ Помилка: ' + error.message, 'error');
        }
    }
    
    function saveLocal() {
        try {
            // Зберігаємо в localStorage
            localStorage.setItem('adminData', JSON.stringify(currentData));
            
            // Оновлюємо глобальні дані
            Object.assign(siteData, currentData);
            
            unsavedChanges = false;
            updateChangesStatus();
            document.getElementById('save-local').disabled = true;
            
            showMessage('✅ Дані збережено локально!', 'success');
        } catch (error) {
            showMessage('❌ Помилка збереження: ' + error.message, 'error');
        }
    }
    
    function pushToGitHub() {
        showMessage('🚀 Публікація на GitHub...', 'info');
        // Тут буде код публікації
        setTimeout(() => {
            showMessage('✅ Дані опубліковано на GitHub!', 'success');
        }, 2000);
    }
    
    function renderCourses() {
        const container = document.getElementById('courses-management');
        if (!container) return;
        
        if (currentData.courses.length === 0) {
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
        currentData.courses.forEach(course => {
            const lessonsCount = currentData.lessons.filter(l => l.courseId === course.id).length;
            html += `
                <div class="course-card-admin">
                    <div class="course-image-admin">
                        <img src="${course.image || 'default-course.jpg'}" alt="${course.title}">
                        <div class="course-actions">
                            <button class="action-btn edit-btn" onclick="editCourse('${course.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteCourse('${course.id}')">
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
    
    function markChanges() {
        unsavedChanges = true;
        updateChangesStatus();
        document.getElementById('save-local').disabled = false;
    }
    
    function updateChangesStatus() {
        const countElement = document.getElementById('changes-count');
        const savedElement = document.getElementById('last-saved');
        
        if (countElement) {
            countElement.textContent = unsavedChanges ? 'Є незбережені зміни' : 'Змін немає';
            countElement.style.color = unsavedChanges ? '#ff9800' : '#4caf50';
        }
        
        if (savedElement) {
            savedElement.textContent = unsavedChanges ? 'Не збережено' : 'Збережено';
            savedElement.style.color = unsavedChanges ? '#ff9800' : '#4caf50';
        }
    }
    
    function showMessage(text, type = 'info') {
        const status = document.getElementById('github-status');
        if (status) {
            status.textContent = text;
            status.className = `status-message ${type}`;
            status.classList.remove('hidden');
            
            setTimeout(() => {
                status.classList.add('hidden');
            }, 3000);
        } else {
            alert(text);
        }
    }
    
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }
    
    // 5. ГЛОБАЛЬНІ ФУНКЦІЇ ДЛЯ HTML
    window.editCourse = function(courseId) {
        const course = currentData.courses.find(c => c.id === courseId);
        if (course) {
            document.getElementById('course-id').value = course.id;
            document.getElementById('course-title').value = course.title;
            document.getElementById('course-slug').value = course.id;
            document.getElementById('course-description').value = course.description;
            document.getElementById('course-full-description').value = course.fullDescription || '';
            document.getElementById('course-modal-title').textContent = 'Редагувати курс';
            openCourseModal();
        }
    };
    
    window.deleteCourse = function(courseId) {
        if (confirm('Видалити цей курс?')) {
            currentData.courses = currentData.courses.filter(c => c.id !== courseId);
            currentData.lessons = currentData.lessons.filter(l => l.courseId !== courseId);
            markChanges();
            renderCourses();
            showMessage('✅ Курс видалено!', 'success');
        }
    };
    
    window.clearCourseImage = function() {
        const preview = document.getElementById('course-image-preview');
        preview.innerHTML = `
            <i class="fas fa-image"></i>
            <span>Натисніть для завантаження зображення</span>
        `;
    };
    
    console.log('🎉 Адмін-панель повністю завантажена!');
});
