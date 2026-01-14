// Базова структура даних
const siteData = {
    courses: [
        {
            id: "algorithms",
            title: "Алгоритми та структури даних",
            description: "Основи алгоритмів та структур даних для початківців",
            fullDescription: "Повний курс з алгоритмів та структур даних. Вивчайте основні концепції та практичне застосування.",
            image: "default-course.jpg",
            lessonsCount: 0
        }
    ],
    lessons: [
        {
            id: "intro-algorithms",
            courseId: "algorithms",
            title: "Вступ до алгоритмів",
            order: 1,
            videoId: "dQw4w9WgXcQ",
            description: "Основи алгоритмів та їх значення в програмуванні",
            fullDescription: "<p>У цьому уроці ми розглянемо:</p><ul><li>Що таке алгоритми</li><li>Чому вони важливі</li><li>Основні типи алгоритмів</li></ul>",
            thumbnail: null,
            code: "// Приклад простого алгоритму\nfunction findMax(numbers) {\n    let max = numbers[0];\n    for (let i = 1; i < numbers.length; i++) {\n        if (numbers[i] > max) {\n            max = numbers[i];\n        }\n    }\n    return max;\n}"
        }
    ],
    settings: {
        siteName: "Algorithmic Anchor",
        theme: "dark"
    }
};

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
}
