// GitHub API інтеграція для Algorithmic Anchor
class GitHubAPI {
    constructor(token, repo, branch = 'main') {
        this.token = token;
        this.repo = repo;
        this.branch = branch;
        this.baseURL = 'https://api.github.com';
        this.headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }
    
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/user`, {
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const userData = await response.json();
            return {
                success: true,
                username: userData.login,
                name: userData.name,
                avatar: userData.avatar_url
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async getFileContent(path) {
        try {
            const url = `${this.baseURL}/repos/${this.repo}/contents/${path}?ref=${this.branch}`;
            const response = await fetch(url, {
                headers: this.headers
            });
            
            if (response.status === 404) {
                return {
                    success: true,
                    content: null,
                    sha: null
                };
            }
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            return {
                success: true,
                content: data.content ? atob(data.content) : null,
                sha: data.sha,
                url: data.download_url
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async updateFile(path, content, message) {
        try {
            // Спочатку отримуємо поточний SHA (якщо файл існує)
            const existingFile = await this.getFileContent(path);
            
            const body = {
                message: message,
                content: btoa(unescape(encodeURIComponent(content))),
                branch: this.branch,
                committer: {
                    name: 'Algorithmic Anchor Admin',
                    email: 'admin@algorithmicanchor.com'
                }
            };
            
            if (existingFile.success && existingFile.sha) {
                body.sha = existingFile.sha;
            }
            
            const url = `${this.baseURL}/repos/${this.repo}/contents/${path}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
            
            const result = await response.json();
            return {
                success: true,
                data: result,
                url: result.content.download_url
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async uploadFile(path, content, message) {
        return await this.updateFile(path, content, message);
    }
    
    async deleteFile(path, message) {
        try {
            // Отримуємо SHA файлу
            const existingFile = await this.getFileContent(path);
            
            if (!existingFile.success || !existingFile.sha) {
                return {
                    success: false,
                    error: 'Файл не знайдено'
                };
            }
            
            const body = {
                message: message,
                sha: existingFile.sha,
                branch: this.branch,
                committer: {
                    name: 'Algorithmic Anchor Admin',
                    email: 'admin@algorithmicanchor.com'
                }
            };
            
            const url = `${this.baseURL}/repos/${this.repo}/contents/${path}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.headers,
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
            
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async listFiles(path = '') {
        try {
            const url = `${this.baseURL}/repos/${this.repo}/contents/${path}?ref=${this.branch}`;
            const response = await fetch(url, {
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const files = await response.json();
            return {
                success: true,
                files: Array.isArray(files) ? files : [files]
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async createDirectory(path, message = 'Create directory') {
        try {
            // Створюємо пустий .gitkeep файл для створення папки
            const filePath = `${path}/.gitkeep`;
            const body = {
                message: message,
                content: btoa(''),
                branch: this.branch,
                committer: {
                    name: 'Algorithmic Anchor Admin',
                    email: 'admin@algorithmicanchor.com'
                }
            };
            
            const url = `${this.baseURL}/repos/${this.repo}/contents/${filePath}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }
            
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Функція для публікації даних на GitHub
async function publishToGitHub(data, githubAPI) {
    try {
        // Конвертуємо дані у формат для data.js
        const jsContent = `// Дані курсів, згенеровані через адмінку
const siteData = ${JSON.stringify(data, null, 2)};

${getDataFunctions}`;
        
        // Перевіряємо і створюємо папки для завантажень
        const uploadsDirs = ['uploads/images', 'uploads/files', 'uploads/code'];
        for (const dir of uploadsDirs) {
            await githubAPI.createDirectory(dir, `Create ${dir} directory`);
        }
        
        // Оновлюємо data.js файл
        const result = await githubAPI.updateFile(
            'data.js',
            jsContent,
            'Оновлення даних курсів через адмін-панель'
        );
        
        return result;
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// Експорт для використання в інших файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GitHubAPI, publishToGitHub };
}