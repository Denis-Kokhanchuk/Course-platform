// data.js - повністю виправлена версія
const siteData = {
    courses: [],
    lessons: [],
    settings: {
        siteName: "Algorithmic Anchor",
        siteDescription: "Навчальна платформа з алгоритмів та програмування",
        githubRepo: "",
        githubToken: ""
    }
};

// Базові функції для отримання даних
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

function getImageUrl(fileId) {
    const file = getFile(fileId);
    if (file && file.content && file.type.startsWith('image/')) {
        return file.content;
    }
    return 'default-course.jpg';
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

// Функції для адмінки
function saveData(newData) {
    if (newData.courses) siteData.courses = newData.courses;
    if (newData.lessons) siteData.lessons = newData.lessons;
    if (newData.settings) siteData.settings = newData.settings;
    return true;
}

function exportData() {
    return JSON.stringify(siteData, null, 2);
}

function importData(jsonData) {
    try {
        const newData = JSON.parse(jsonData);
        return saveData(newData);
    } catch (error) {
        console.error('Помилка імпорту даних:', error);
        return false;
    }
}// data.js - повністю виправлена версія
const siteData = {
    courses: [],
    lessons: [],
    settings: {
        siteName: "Algorithmic Anchor",
        siteDescription: "Навчальна платформа з алгоритмів та програмування",
        githubRepo: "",
        githubToken: ""
    }
};

// Базові функції для отримання даних
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

function getImageUrl(fileId) {
    const file = getFile(fileId);
    if (file && file.content && file.type.startsWith('image/')) {
        return file.content;
    }
    return 'default-course.jpg';
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

// Функції для адмінки
function saveData(newData) {
    if (newData.courses) siteData.courses = newData.courses;
    if (newData.lessons) siteData.lessons = newData.lessons;
    if (newData.settings) siteData.settings = newData.settings;
    return true;
}

function exportData() {
    return JSON.stringify(siteData, null, 2);
}

function importData(jsonData) {
    try {
        const newData = JSON.parse(jsonData);
        return saveData(newData);
    } catch (error) {
        console.error('Помилка імпорту даних:', error);
        return false;
    }
}
