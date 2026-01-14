



// Функції для отримання даних
function getCourses() {
    return siteData.courses;
}

function getCourse(courseId) {
    return siteData.courses.find(course => course.id === courseId);
}

function getLessons(courseId) {
    return siteData.lessons.filter(lesson => lesson.courseId === courseId);
}

function getLesson(lessonId) {
    return siteData.lessons.find(lesson => lesson.id === lessonId);
}

function getCourseLessonsCount(courseId) {
    return getLessons(courseId).length;
}

function getSettings() {
    return siteData.settings;
}

// Функції для адмінки
function saveData(newData) {
    siteData.courses = newData.courses || siteData.courses;
    siteData.lessons = newData.lessons || siteData.lessons;
    siteData.settings = newData.settings || siteData.settings;
    return true;
}

function exportData() {
    return JSON.stringify(siteData, null, 2);
}

function importData(jsonData) {
    try {
        const newData = JSON.parse(jsonData);
        saveData(newData);
        return true;
    } catch (error) {
        console.error('Помилка імпорту даних:', error);
        return false;
    }
}
<<<<<<< HEAD
=======

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
    if (file && file.content) {
        return file.content;
    }
    return null;
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
}

// Функція для завантаження файлів (для адмінки)
function saveFile(file, type) {
    return `uploads/${type}/${Date.now()}_${file.name}`;
}
>>>>>>> 667a075 (Оновлення адмін-панелі: виправлено видалення уроків та завантаження файлів)
