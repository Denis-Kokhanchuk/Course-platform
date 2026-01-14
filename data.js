// Базова структура даних
const siteData = {
  "courses": [
    {
      "id": "python-junior-senior",
      "title": "Python з Junior до Senior",
      "description": "На цьому курсі ти почнеш свій шлях у вивченні Python",
      "fullDescription": "Цей курс створений для тих, хто хоче пройти повний шлях розвитку Python-розробника — від рівня Junior до впевненого Senior. Програма побудована поетапно та логічно: від фундаментальних основ мови до складних архітектурних рішень і практик, які використовуються в реальних комерційних проєктах.\n\nНа курсі ви:\n\nҐрунтовно вивчите Python (синтаксис, типи даних, ООП, стандартну бібліотеку)\n\nНавчитеся писати чистий, читабельний та масштабований код\n\nРозберетеся з алгоритмами та структурами даних\n\nОсвоїте роботу з базами даних, SQL та ORM\n\nДізнаєтеся, як працюють веб-фреймворки (Django / FastAPI)\n\nНавчитеся тестуванню, логуванню та дебагінгу\n\nОтримаєте розуміння архітектури застосунків і принципів Senior-рівня\n\nПопрацюєте з реальними кейсами та практичними завданнями\n\nКурс підходить:\n\nПочатківцям, які вже знають основи Python\n\nJunior-розробникам, що хочуть зростати до Middle і Senior\n\nТим, хто готується до технічних співбесід та роботи в IT-команді\n\nРезультат курсу — не просто знання, а системне мислення Python-розробника, готового до складних задач і професійного росту.",
      "image": "default-course.jpg",
      "lessonsCount": 0
    }
  ],
  "lessons": [],
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