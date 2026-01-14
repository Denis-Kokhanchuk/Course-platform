// Algorithmic Anchor - Основний JavaScript файл
let isInitialized = false;

// Функція для відображення курсів
function renderCourses() {
    console.log('🔄 Оновлення списку курсів...');
    
    const coursesGrid = document.getElementById('courses-grid');
    const courses = getCourses();
    
    if (!coursesGrid) {
        console.error('❌ Не знайдено елемент #courses-grid');
        return;
    }
    
    console.log(`📊 Знайдено курсів у даних: ${courses?.length || 0}`);
    
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
    console.log(`✅ Відображено курсів: ${courses.length}`);
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
    
    console.log(`📈 Статистика: ${totalVideos} уроків, ${totalFiles} файлів`);
}

// Функція для автоматичного оновлення даних з GitHub
async function updateDataFromGitHub() {
    try {
        console.log('🔄 Перевірка оновлень на GitHub...');
        
        const response = await fetch(
            'https://raw.githubusercontent.com/Denis-Kokhanchuk/Course-platform/main/data.js?nocache=' + Date.now(),
            { cache: 'no-store' }
        );
        
        if (!response.ok) {
            console.error(`❌ HTTP помилка: ${response.status}`);
            return false;
        }
        
        const text = await response.text();
        
        // Знаходимо siteData в тексті
        const match = text.match(/const siteData = (\{[\s\S]*?\});/s);
        if (!match) {
            console.error('❌ Не вдалося знайти siteData у файлі');
            return false;
        }
        
        try {
            const newData = JSON.parse(match[1]);
            
            // Перевіряємо, чи дані дійсно змінилися
            const oldData = JSON.stringify(window.siteData);
            const newDataStr = JSON.stringify(newData);
            
            if (oldData === newDataStr) {
                console.log('ℹ️ Дані не змінилися');
                return false;
            }
            
            // Оновлюємо глобальні дані
            window.siteData = newData;
            
            console.log(`✅ Дані оновлено! Курсів: ${newData.courses?.length || 0}`);
            
            // Автоматично перемальовуємо курси
            renderCourses();
            
            return true;
        } catch (parseError) {
            console.error('❌ Помилка парсингу даних:', parseError);
            return false;
        }
    } catch (error) {
        console.error('❌ Помилка завантаження з GitHub:', error);
        return false;
    }
}

// Примусове оновлення з GitHub
async function forceUpdateFromGitHub() {
    console.log('🔁 Примусове оновлення з GitHub...');
    
    // Видаляємо кеш
    localStorage.removeItem('adminData');
    
    // Оновлюємо дані
    const updated = await updateDataFromGitHub();
    
    if (updated) {
        console.log('✅ Примусове оновлення успішне');
        alert('✅ Дані успішно оновлено!');
    } else {
        console.log('ℹ️ Дані не потребують оновлення');
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
async function initApp() {
    if (isInitialized) {
        console.log('ℹ️ Додаток вже ініціалізовано');
        return;
    }
    
    console.log('🚀 Algorithmic Anchor завантажується...');
    
    // Налаштовуємо тему
    setupThemeToggle();
    
    // Спершу завантажуємо свіжі дані з GitHub
    console.log('📥 Завантаження початкових даних...');
    await updateDataFromGitHub();
    
    // Якщо дані не завантажилися, використовуємо локальні
    if (!window.siteData || !window.siteData.courses) {
        console.log('⚠️ Використовуються локальні дані');
    }
    
    // Відображаємо курси
    renderCourses();
    
    // Встановлюємо періодичну перевірку оновлень
    setInterval(updateDataFromGitHub, 30000); // Кожні 30 секунд
    
    // Перевіряємо оновлення при поверненні на сторінку
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            console.log('👀 Сторінка стала видимою, перевіряю оновлення...');
            updateDataFromGitHub();
        }
    });
    
    // Додаємо кнопку оновлення в інтерфейс
    addUpdateButton();
    
    // Робимо функції доступними глобально
    window.updateDataFromGitHub = updateDataFromGitHub;
    window.forceUpdateFromGitHub = forceUpdateFromGitHub;
    window.renderCourses = renderCourses;
    
    isInitialized = true;
    console.log('✅ Додаток успішно ініціалізовано');
    console.log('💡 Команди для консолі: updateDataFromGitHub(), forceUpdateFromGitHub()');
}

// Додаємо кнопку оновлення на сторінку
function addUpdateButton() {
    const pageHeader = document.querySelector('.page-header');
    if (!pageHeader) return;
    
    const updateBtn = document.createElement('button');
    updateBtn.className = 'btn btn-outline update-btn';
    updateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Оновити';
    updateBtn.style.cssText = 'margin-left: 15px; position: relative;';
    
    updateBtn.addEventListener('click', async () => {
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Оновлення...';
        
        await forceUpdateFromGitHub();
        
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Оновити';
    });
    
    pageHeader.appendChild(updateBtn);
}

// Запускаємо додаток після завантаження DOM
document.addEventListener('DOMContentLoaded', initApp);

// Стилі для повідомлень
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
    
    .update-btn {
        transition: all 0.3s;
    }
`;
document.head.appendChild(style);
