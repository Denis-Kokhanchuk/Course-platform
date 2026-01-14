// Algorithmic Anchor - Основний JavaScript файл
let currentPage = 'home';

// Функція для відображення курсів
function renderCourses() {
    const coursesGrid = document.getElementById('courses-grid');
    const courses = getCourses();
    
    if (!coursesGrid) {
        console.error('Не знайдено елемент #courses-grid');
        return;
    }
    
    if (!courses || courses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-graduation-cap fa-3x"></i>
                <h3>Курси відсутні</h3>
                <p>Наразі немає доступних курсів</p>
            </div>
        `;
        updateStats();
        return;
    }
    
    let html = '';
    courses.forEach(course => {
        if (!course || !course.id) return;
        
        const lessonsCount = getCourseLessonsCount(course.id);
        const imageUrl = course.image && course.image.startsWith('file:') 
            ? getImageUrl(course.image.replace('file:', ''))
            : (course.image || 'default-course.jpg');
        
        html += `
            <a href="course.html?id=${course.id}" class="course-card">
                <div class="course-image">
                    <img src="${imageUrl}" alt="${course.title || 'Курс'}" onerror="this.src='default-course.jpg'">
                    <div class="course-overlay">
                        <span class="course-lessons"><i class="fas fa-play-circle"></i> ${lessonsCount} уроків</span>
                    </div>
                </div>
                <div class="course-info">
                    <h3>${course.title || 'Без назви'}</h3>
                    <p class="course-description">${course.description || ''}</p>
                    <div class="course-meta">
                        <span class="course-id">ID: ${course.id}</span>
                        <button class="btn btn-outline course-btn">Перейти до курсу</button>
                    </div>
                </div>
            </a>
        `;
    });
    
    coursesGrid.innerHTML = html;
    updateStats();
}

// Оновлення статистики
function updateStats() {
    const courses = getCourses();
    let totalVideos = 0;
    let totalFiles = 0;
    
    courses.forEach(course => {
        const lessons = getLessons(course.id);
        totalVideos += lessons.length;
        totalFiles += lessons.filter(l => l.presentation || l.codeFile || l.code).length;
    });
    
    const totalVideosEl = document.getElementById('total-videos');
    const totalFilesEl = document.getElementById('total-files');
    
    if (totalVideosEl) totalVideosEl.textContent = totalVideos;
    if (totalFilesEl) totalFilesEl.textContent = totalFiles;
}

// Функція для автоматичного оновлення даних з GitHub
async function updateDataFromGitHub() {
    try {
        console.log('🔄 Перевірка оновлень на GitHub...');
        
        const response = await fetch(
            'https://raw.githubusercontent.com/Denis-Kokhanchuk/Course-platform/main/data.js?t=' + Date.now()
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        // Знаходимо siteData в тексті
        const match = text.match(/const siteData = (\{[\s\S]*?\});/);
        if (match) {
            try {
                const newData = JSON.parse(match[1]);
                
                // Оновлюємо глобальні дані
                window.siteData = newData;
                
                console.log('✅ Дані оновлено з GitHub! Знайдено курсів:', newData.courses?.length || 0);
                
                // Автоматично перемальовуємо курси
                renderCourses();
                
                return true;
            } catch (parseError) {
                console.error('❌ Помилка парсингу даних:', parseError);
                return false;
            }
        } else {
            console.error('❌ Не вдалося знайти siteData у файлі');
            return false;
        }
    } catch (error) {
        console.error('❌ Помилка завантаження з GitHub:', error);
        return false;
    }
}

// Перемикач теми
function setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    
    if (!themeToggle) return;
    
    // Перевіряємо збережену тему
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark-theme' || (!savedTheme && body.classList.contains('dark-theme'));
    
    if (isDark) {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
    
    // Оновлюємо іконку
    const icon = themeToggle.querySelector('i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    themeToggle.addEventListener('click', () => {
        const isDarkNow = body.classList.contains('dark-theme');
        
        if (isDarkNow) {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light-theme');
            if (icon) icon.className = 'fas fa-moon';
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark-theme');
            if (icon) icon.className = 'fas fa-sun';
        }
    });
}

// Основна функція ініціалізації
function initApp() {
    console.log('🚀 Algorithmic Anchor завантажується...');
    
    // Налаштовуємо тему
    setupThemeToggle();
    
    // Відображаємо курси при завантаженні
    renderCourses();
    
    // Встановлюємо періодичну перевірку оновлень
    setInterval(updateDataFromGitHub, 60000); // Кожну хвилину
    
    // Перевіряємо оновлення при поверненні на сторінку
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            updateDataFromGitHub();
        }
    });
    
    // Робимо функцію доступною глобально для виклику з консолі
    window.updateDataFromGitHub = updateDataFromGitHub;
    window.renderCourses = renderCourses;
    
    console.log('✅ Додаток ініціалізовано. Курсів завантажено:', getCourses().length);
    console.log('💡 Команда для оновлення вручну: updateDataFromGitHub()');
}

// Запускаємо додаток після завантаження DOM
document.addEventListener('DOMContentLoaded', initApp);

// Додаткові утиліти
function showMessage(text, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.textContent = text;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
        border-radius: 5px;
        z-index: 1000;
        animation: fadeIn 0.3s;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Додамо CSS для анімацій
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);
