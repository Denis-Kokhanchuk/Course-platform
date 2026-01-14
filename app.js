// Додайте цей код до функції loadLessonPage() в app.js
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
    
    // ... (існуючий код для breadcrumb, header, video) ...
    
    // Додаємо секцію для завантаження файлів після опису уроку
    const description = document.getElementById('lesson-full-description');
    if (description) {
        let descriptionHTML = lesson.fullDescription || lesson.description || '';
        
        // Додаємо секцію з файлами
        descriptionHTML += `
            <div class="lesson-files-section">
                <h3><i class="fas fa-paperclip"></i> Матеріали уроку</h3>
                <div class="files-grid">
        `;
        
        // Презентація
        if (lesson.presentation && lesson.presentation.startsWith('file:')) {
            const fileId = lesson.presentation.replace('file:', '');
            const file = getFile(fileId);
            if (file) {
                descriptionHTML += `
                    <div class="file-card">
                        <div class="file-icon">
                            <i class="fas fa-file-powerpoint"></i>
                        </div>
                        <div class="file-info">
                            <h4>Презентація</h4>
                            <p class="file-name">${file.name}</p>
                            <p class="file-size">${formatFileSize(file.size)}</p>
                        </div>
                        <button class="btn btn-outline download-btn" onclick="downloadLessonFile('${fileId}', '${file.name.replace(/'/g, "\\'")}')">
                            <i class="fas fa-download"></i> Завантажити
                        </button>
                    </div>
                `;
            }
        }
        
        // Файл коду
        if (lesson.codeFile && lesson.codeFile.startsWith('file:')) {
            const fileId = lesson.codeFile.replace('file:', '');
            const file = getFile(fileId);
            if (file) {
                descriptionHTML += `
                    <div class="file-card">
                        <div class="file-icon">
                            <i class="fas fa-code"></i>
                        </div>
                        <div class="file-info">
                            <h4>Файл коду</h4>
                            <p class="file-name">${file.name}</p>
                            <p class="file-size">${formatFileSize(file.size)}</p>
                        </div>
                        <button class="btn btn-outline download-btn" onclick="downloadLessonFile('${fileId}', '${file.name.replace(/'/g, "\\'")}')">
                            <i class="fas fa-download"></i> Завантажити
                        </button>
                    </div>
                `;
            }
        }
        
        // Код у текстовому полі
        if (lesson.code && lesson.code.trim()) {
            descriptionHTML += `
                <div class="file-card">
                    <div class="file-icon">
                        <i class="fas fa-code"></i>
                    </div>
                    <div class="file-info">
                        <h4>Код уроку</h4>
                        <p class="file-name">Код з поля введення</p>
                        <p class="file-size">${lesson.code.length} символів</p>
                    </div>
                    <button class="btn btn-outline download-btn" onclick="downloadTextFile('lesson-code-${lessonId}.txt', \`${lesson.code.replace(/`/g, '\\`')}\`)">
                        <i class="fas fa-download"></i> Завантажити
                    </button>
                </div>
            `;
        }
        
        descriptionHTML += `
                </div>
            </div>
        `;
        
        description.innerHTML = descriptionHTML;
    }
    
    // ... (решта коду) ...
}

// Додайте ці функції до app.js
function downloadLessonFile(fileId, fileName) {
    if (downloadFile(fileId, fileName)) {
        showMessage('Файл завантажується...', 'success');
    } else {
        showMessage('Не вдалося завантажити файл', 'error');
    }
}

function downloadTextFile(fileName, content) {
    try {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showMessage('Файл завантажується...', 'success');
        return true;
    } catch (error) {
        console.error('Помилка завантаження текстового файлу:', error);
        showMessage('Не вдалося завантажити файл', 'error');
        return false;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showMessage(text, type = 'info') {
    // Проста функція для показу повідомлень
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

// Додайте цю функцію в app.js
function checkForUpdates() {
    // Перевіряємо чи є нові дані в localStorage
    const lastUpdate = localStorage.getItem('lastUpdate');
    const currentData = JSON.stringify(siteData);
    
    if (lastUpdate !== currentData) {
        console.log('Виявлено оновлені дані, перезавантажую...');
        // Якщо це сторінка курсу або уроку - перезавантажити
        if (window.location.pathname.includes('course.html') || 
            window.location.pathname.includes('lesson.html')) {
            location.reload();
        }
    }
}

// Викликати кожні 10 секунд
setInterval(checkForUpdates, 10000);

// Або при фокусі на вікні
window.addEventListener('focus', checkForUpdates);

// Додайте стилі для файлів до style.css
.lesson-files-section {
    margin-top: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
}

.files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 15px;
}

.file-card {
    display: flex;
    align-items: center;
    padding: 15px;
    background: white;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    transition: transform 0.2s;
}

.file-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.file-icon {
    margin-right: 15px;
}

.file-icon i {
    font-size: 24px;
    color: #007bff;
}

.file-info {
    flex: 1;
}

.file-info h4 {
    margin: 0 0 5px 0;
    color: #333;
}

.file-name {
    margin: 0;
    color: #666;
    font-size: 14px;
}

.file-size {
    margin: 0;
    color: #999;
    font-size: 12px;
}

.download-btn {
    white-space: nowrap;
}
