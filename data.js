// github.js - спрощений
class GitHubAPI {
    constructor(token, repo, branch = 'main') {
        this.token = token;
        this.repo = repo;
        this.branch = branch;
        this.baseURL = 'https://api.github.com';
    }
    
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/user`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                return { 
                    success: true, 
                    username: user.login,
                    name: user.name || user.login
                };
            } else {
                const error = await response.json();
                return { 
                    success: false, 
                    error: error.message || 'Помилка підключення до GitHub' 
                };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Мережева помилка' 
            };
        }
    }
    
    async updateFile(path, content, message) {
        try {
            const response = await fetch(`${this.baseURL}/repos/${this.repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    content: btoa(content),
                    branch: this.branch
                })
            });
            
            if (response.ok) {
                return { success: true };
            } else {
                const error = await response.json();
                return { success: false, error: error.message };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

console.log("✅ github.js завантажено");
