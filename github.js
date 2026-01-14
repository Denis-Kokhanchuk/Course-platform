// github.js - виправлена версія
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
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
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
            let content = null;
            if (data.content) {
                content = atob(data.content.replace(/\n/g, ''));
            }
            
            return {
                success: true,
                content: content,
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
}
