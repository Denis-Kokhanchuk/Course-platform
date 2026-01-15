// Базова структура даних
const siteData = {
  "courses": [
    {
      "id": "p",
      "title": "Python Junior to Senior",
      "description": "Python Junior до Senior розробника — це повний курс з Python, який проводить студента від абсолютних основ до рівня впевненого розробника з реальними проєктами, практикою та розумінням, як працює Python у професійній розробці.",
      "fullDescription": "Курс «Python Junior до Senior розробника» створений для тих, хто хоче з нуля або з базовими знаннями вирости до професійного Python-розробника.\n\nНавчання починається з фундаменту: синтаксису Python, змінних, типів даних, умов, циклів та функцій. Далі курс переходить до більш складних тем: роботи з файлами, модулями, помилками, об’єктно-орієнтованого програмування (OOP), колекцій, алгоритмів і структур даних.\n\nНа рівні Middle студенти вивчають роботу з бібліотеками, віртуальними середовищами, Git, тестуванням, базами даних, API та принципами чистого коду.\nНа рівні Senior увага приділяється архітектурі, оптимізації, масштабуванню, асинхронності, кращим практикам розробки та підготовці до реальної роботи в команді.\n\nКурс побудований на практиці:\n✔ реальні приклади\n✔ завдання після кожного модуля\n✔ проєкти для портфоліо\n✔ пояснення «чому так, а не просто як»\n\nКому підійде курс:\n\nповним новачкам у програмуванні\n\nтим, хто знає Python на базовому рівні\n\nстудентам та школярам\n\nтим, хто хоче працювати Python-розробником або зрости до Senior-рівня\n\nРезультат після курсу:\n\nвпевнене володіння Python\n\nрозуміння рівнів Junior / Middle / Senior\n\nпрактичний досвід та проєкти\n\nготовність до співбесід і реальної роботи",
      "image": "default-course.jpg",
      "lessonsCount": 1
    }
  ],
  "lessons": [
    {
      "id": "lesson-1768502902474-bgnbwbpe5",
      "courseId": "p",
      "title": "Основи Python: вивід, введення даних та змінні",
      "order": 1,
      "videoId": "I0uWXbkRs0k",
      "description": "У цьому відео я пояснюю базові речі мови програмування Python:\n🔹 що таке print() і як виводити інформацію на екран\n🔹 як працює input() і як отримувати дані від користувача\n🔹 що таке змінні та як їх використовувати",
      "fullDescription": "У цьому відео я пояснюю базові речі мови програмування Python:\n🔹 що таке print() і як виводити інформацію на екран\n🔹 як працює input() і як отримувати дані від користувача\n🔹 що таке змінні та як їх використовувати\n\n\nВідео підійде для початківців, які тільки починають вивчати Python або програмування загалом.\n\n📌 Підписуйся на канал, щоб не пропустити наступні уроки!\n📌 Пиши питання в коментарях — із задоволенням відповім.",
      "presentation": "file:file-1768502902144-4aatx6ykp",
      "codeFile": "file:file-1768502902400-uf0k0fk1k",
      "code": ""
    }
  ],
  "settings": {
    "siteName": "Algorithmic Anchor",
    "theme": "dark"
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

// Функція для автоматичного оновлення даних з GitHub
async function updateDataFromGitHub() {
    try {
        console.log('Оновлення даних з GitHub...');
        const response = await fetch(
            'https://raw.githubusercontent.com/Denis-Kokhanchuk/Course-platform/main/data.js?t=' + Date.now()
        );
        const text = await response.text();
        
        // Знаходимо siteData в тексті
        const match = text.match(/const siteData = (\{.*?\});/s);
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
}