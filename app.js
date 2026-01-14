// Головний файл для сайту
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    
    if (document.getElementById('courses-grid')) {
        loadHomePage();
    }
    
    if (document.getElementById('course-header')) {
        loadCoursePage();
    }
    
    if (document.getElementById('lesson-breadcrumb')) {
        loadLessonPage();
    }
});

function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        
        const savedTheme = localStorage.getItem('theme') || 'dark-theme';
        document.body.className = savedTheme;
        updateThemeIcon(savedTheme);
    }
}

function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light-theme');
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    }
    
    updateThemeIcon(body.className);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    if (icon) {
        icon.className = theme === 'dark-theme' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function loadHomePage() {
    const courses = getCourses();
    const coursesGrid = document.getElementById('courses-grid');
    const totalVideos = document.getElementById('total-videos');
    
    if (!coursesGrid || !totalVideos) return;
    
    let totalLessons = 0;
    courses.forEach(course => {
        totalLessons += getCourseLessonsCount(course.id);
    });
    
    totalVideos.textContent = totalLessons;
    document.getElementById('total-files').textContent = totalLessons * 3;
    
    if (courses.length === 0) {
        coursesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-graduation-cap fa-3x"></i>
                <h3>Курси готуються</h3>
                <p>Скоро тут з'являться навчальні курси</p>
            </div>
        `;
        return;
    }
    
    coursesGrid.innerHTML = courses.map(course => {
        const lessonsCount = getCourseLessonsCount(course.id);
        const courseUrl = `course.html?id=${course.id}`;
        
        let imageUrl = course.image || 'default-course.jpg';
        if (imageUrl.startsWith('file:')) {
            const fileId = imageUrl.replace('file:', '');
            imageUrl = getImageUrl(fileId) || 'default-course.jpg';
        }
        
        return `
            <div class="course-card">
                <div class="course-image">
                    <a href="${courseUrl}">
                        <img src="${imageUrl}" 
                             alt="${course.title}"
                             onerror="this.src='default-course.jpg'">
                        <div class="course-badge">${lessonsCount} уроків</div>
                    </a>
                </div>
                <div class="course-content">
                    <h3><a href="${courseUrl}">${course.title}</a></h3>
                    <p class="course-description">${course.description}</p>
                    <div class="course-meta">
                        <div class="lessons-count">
                            <i class="fas fa-play-circle"></i>
                            <span>${lessonsCount} уроків</span>
                        </div>
                        <a href="${courseUrl}" class="btn btn-primary">
                            Почати навчання <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function loadCoursePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    
    if (!courseId) {
        window.location.href = 'index.html';
        return;
    }
    
    const course = getCourse(courseId);
    const lessons = getLessons(courseId);
    
    if (!course) {
        window.location.href = 'index.html';
        return;
    }
    
    const courseHeader = document.getElementById('course-header');
    courseHeader.innerHTML = `
        <h1 class="course-title">${course.title}</h1>
        <p class="course-full-description">${course.fullDescription || course.description}</p>
        <div class="course-stats">
            <span class="stat-badge">
                <i class="fas fa-video"></i> ${lessons.length} уроків
            </span>
        </div>
    `;
    
    const lessonsList = document.getElementById('lessons-list');
    
    if (lessons.length === 0) {
        lessonsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-video-slash fa-3x"></i>
                <h3>Уроки готуються</h3>
                <p>Скоро тут з'являться навчальні матеріали</p>
            </div>
        `;
        return;
    }
    
    const sortedLessons = lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    lessonsList.innerHTML = sortedLessons.map((lesson, index) => {
        let thumbnailUrl = lesson.thumbnail || `https://img.youtube.com/vi/${lesson.videoId}/hqdefault.jpg`;
        if (thumbnailUrl.startsWith('file:')) {
            const fileId = thumbnailUrl.replace('file:', '');
            thumbnailUrl = getImageUrl(fileId) || `https://img.youtube.com/vi/${lesson.videoId}/hqdefault.jpg`;
        }
        
        return `
            <div class="lesson-preview">
                <div class="lesson-video-preview">
                    <a href="lesson.html?id=${lesson.id}">
                        <img src="${thumbnailUrl}" 
                             alt="${lesson.title}"
                             onerror="this.src='default-course.jpg'">
                        <div class="lesson-number">Урок ${index + 1}</div>
                        <div class="play-overlay">
                            <i class="fas fa-play"></i>
                        </div>
                    </a>
                </div>
                <div class="lesson-info">
                    <h3><a href="lesson.html?id=${lesson.id}">${lesson.title}</a></h3>
                    <p class="lesson-preview-description">${lesson.description}</p>
                    <a href="lesson.html?id=${lesson.id}" class="btn btn-outline">
                        Дивитися урок <i class="fas fa-play"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

function loadLessonPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('id');
    const isPreview = urlParams.has('preview');
    
    if (!lessonId) {
        window.location.href = 'index.html';
        return;
    }
    
    const lesson = getLesson(lessonId);
    
    if (!lesson) {
        window.location.href = 'index.html';
        return;
    }
    
    const course = getCourse(lesson.courseId);
    
    const breadcrumb = document.getElementById('lesson-breadcrumb');
    if (breadcrumb) {
        breadcrumb.innerHTML = `
            <a href="index.html"><i class="fas fa-home"></i> Курси</a>
            <i class="fas fa-chevron-right"></i>
            <a href="course.html?id=${course.id}">${course.title}</a>
            <i class="fas fa-chevron-right"></i>
            <span>${lesson.title}</span>
        `;
    }
    
    const lessonHeader = document.getElementById('lesson-header');
    if (lessonHeader) {
        lessonHeader.innerHTML = `
            <h1>${lesson.title}</h1>
            <div class="lesson-meta">
                <span class="meta-item">
                    <i class="fas fa-clock"></i> ~30 хв
                </span>
                <span class="meta-item">
                    <i class="fas fa-calendar"></i> ${new Date().toLocaleDateString('uk-UA')}
                </span>
            </div>
        `;
    }
    
    const videoPlayer = document.getElementById('video-player');
    if (videoPlayer) {
        videoPlayer.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${lesson.videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>
        `;
    }
    
    const description = document.getElementById('lesson-full-description');
    if (description) {
        description.innerHTML = lesson.fullDescription;
    }
    
    loadLessonMaterials(lesson);
    
    if (isPreview) {
        const previewNotice = document.createElement('div');
        previewNotice.className = 'preview-notice';
        previewNotice.innerHTML = `
            <div class="preview-banner">
                <i class="fas fa-eye"></i>
                <span>Попередній перегляд</span>
                <small>Ця сторінка не опублікована</small>
            </div>
        `;
        document.querySelector('main')?.prepend(previewNotice);
    }
}

function loadLessonMaterials(lesson) {
    const presentationSection = document.getElementById('presentation-section');
    if (presentationSection) {
        if (lesson.presentation) {
            if (lesson.presentation.startsWith('file:')) {
                const fileId = lesson.presentation.replace('file:', '');
                presentationSection.innerHTML = `
                    <div class="material-card">
                        <div class="material-icon">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="material-info">
                            <h4>Презентація уроку</h4>
                            <p>Завантажте презентацію для детального вивчення</p>
                            <button onclick="downloadLessonFile('${fileId}')" 
                                    class="btn btn-outline">
                                <i class="fas fa-download"></i> Завантажити
                            </button>
                        </div>
                    </div>
                `;
            } else if (lesson.presentation.startsWith('http')) {
                presentationSection.innerHTML = `
                    <div class="material-card">
                        <div class="material-icon">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="material-info">
                            <h4>Презентація уроку</h4>
                            <p>Завантажте презентацію для детального вивчення</p>
                            <a href="${lesson.presentation}" 
                               download 
                               class="btn btn-outline">
                                <i class="fas fa-download"></i> Завантажити
                            </a>
                        </div>
                    </div>
                `;
            }
        } else {
            presentationSection.innerHTML = `
                <div class="empty-material">
                    <i class="fas fa-file-powerpoint"></i>
                    <p>Презентація не додана</p>
                </div>
            `;
        }
    }
    
    const codeSection = document.getElementById('code-section');
    if (codeSection) {
        if (lesson.code) {
            if (lesson.code.startsWith('file:')) {
                const fileId = lesson.code.replace('file:', '');
                codeSection.innerHTML = `
                    <div class="code-header">
                        <div>
                            <i class="fas fa-code"></i>
                            <span>Файли коду</span>
                        </div>
                        <button onclick="downloadLessonFile('${fileId}')" 
                                class="btn btn-outline">
                            <i class="fas fa-download"></i> Завантажити
                        </button>
                    </div>
                    <div class="code-info">
                        <p>Завантажте файли з кодом для практики</p>
                    </div>
                `;
            } else if (lesson.code.startsWith('http')) {
                codeSection.innerHTML = `
                    <div class="code-header">
                        <div>
                            <i class="fas fa-code"></i>
                            <span>Файли коду</span>
                        </div>
                        <a href="${lesson.code}" download class="btn btn-outline">
                            <i class="fas fa-download"></i> Завантажити
                        </a>
                    </div>
                    <div class="code-info">
                        <p>Завантажте файли з кодом для практики</p>
                    </div>
                `;
            } else {
                codeSection.innerHTML = `
                    <div class="code-header">
                        <div>
                            <i class="fas fa-code"></i>
                            <span>Код уроку</span>
                        </div>
                        <button onclick="downloadCode()" class="btn btn-outline">
                            <i class="fas fa-download"></i> Завантажити
                        </button>
                    </div>
                    <div class="code-block">
                        <pre><code class="language-python">${lesson.code}</code></pre>
                    </div>
                `;
                
                if (typeof hljs !== 'undefined') {
                    setTimeout(() => hljs.highlightAll(), 100);
                }
            }
        } else {
            codeSection.innerHTML = `
                <div class="empty-material">
                    <i class="fas fa-code"></i>
                    <p>Код не доданий</p>
                </div>
            `;
        }
    }
}

function downloadLessonFile(fileId) {
    const success = downloadFile(fileId);
    if (!success) {
        alert('Не вдалося завантажити файл. Спробуйте ще раз.');
    }
}

function downloadCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('id');
    const lesson = getLesson(lessonId);
    
    if (!lesson || !lesson.code) return;
    
    const blob = new Blob([lesson.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lesson.title.replace(/\s+/g, '_')}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

window.downloadCode = downloadCode;
window.downloadLessonFile = downloadLessonFile;