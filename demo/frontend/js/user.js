// js/user.js
class UserManager {
    // 获取当前用户
    static getCurrentUser() {
        const userData = localStorage.getItem('xuebao_user');
        if (!userData) return null;
        
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('解析用户数据失败:', error);
            return null;
        }
    }
    
    // 获取token
    static getToken() {
        return localStorage.getItem('xuebao_token');
    }
    
    // 检查是否登录
    static isLoggedIn() {
        return !!this.getToken();
    }
    
    // 获取用户头像
    static getUserAvatar(user) {
        if (user && user.avatarUrl) {
            return user.avatarUrl;
        }
        
        // 生成默认头像
        const username = user?.username || '用户';
        const firstChar = username.charAt(0).toUpperCase();
        return null; // 返回null使用CSS生成
    }
    
    // 获取用户姓名
    static getUserName(user) {
        if (!user) return '游客';
        return user.nickname || user.username || '用户';
    }
    
    // 获取用户角色
    static getUserRole(user) {
        if (!user) return '游客';
        if (user.role === 'ADMIN') return '管理员';
        if (user.role === 'EDITOR') return '编辑';
        return '用户';
    }
    
    // 获取用户角色样式
    static getRoleStyle(role) {
        const styles = {
            '管理员': { bg: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', color: 'white' },
            '编辑': { bg: 'linear-gradient(135deg, #48cae4, #0096c7)', color: 'white' },
            '用户': { bg: 'linear-gradient(135deg, #52b788, #2d6a4f)', color: 'white' },
            '游客': { bg: '#f8f9fa', color: '#6c757d' }
        };
        return styles[role] || styles['游客'];
    }
    
    // 渲染用户状态
    static renderUserStatus() {
        const userStatusContainer = document.getElementById('userStatus');
        const authButtonsContainer = document.getElementById('authButtons');
        
        if (!userStatusContainer) return;
        
        const user = this.getCurrentUser();
        const isLoggedIn = this.isLoggedIn();
        
        if (isLoggedIn && user) {
            // 已登录状态
            const username = this.getUserName(user);
            const role = this.getUserRole(user);
            const avatar = this.getUserAvatar(user);
            const roleStyle = this.getRoleStyle(role);
            
            userStatusContainer.innerHTML = `
                <div class="user-menu" id="userMenu">
                    <div class="user-info" onclick="UserManager.toggleUserMenu()">
                        <div class="user-avatar" id="userAvatar">
                            ${avatar ? 
                                `<img src="${avatar}" alt="${username}" />` : 
                                `<span>${username.charAt(0).toUpperCase()}</span>`
                            }
                        </div>
                        <div class="user-name">${username}</div>
                    </div>
                    <div class="dropdown-menu" id="dropdownMenu">
                        <div class="dropdown-header">当前角色: ${role}</div>
                        <a href="profile.html" class="dropdown-item">
                            <i class="fas fa-user"></i> 个人中心
                        </a>
                        <a href="my-posts.html" class="dropdown-item">
                            <i class="fas fa-book"></i> 我的文章
                        </a>
                        <a href="create-post.html" class="dropdown-item">
                            <i class="fas fa-edit"></i> 写文章
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item" onclick="UserManager.logout()">
                            <i class="fas fa-sign-out-alt"></i> 退出登录
                        </a>
                    </div>
                </div>
            `;
            
            // 隐藏登录注册按钮
            if (authButtonsContainer) {
                authButtonsContainer.style.display = 'none';
            }
            
        } else {
            // 未登录状态
            userStatusContainer.innerHTML = `
                <div class="guest-status">
                    <i class="fas fa-user-circle"></i> 游客
                </div>
            `;
            
            // 显示登录注册按钮
            if (authButtonsContainer) {
                authButtonsContainer.style.display = 'flex';
            }
        }
        
        // 更新CSS变量
        this.updateUserTheme(user);
    }
    
    // 切换用户菜单
    static toggleUserMenu() {
        const dropdown = document.getElementById('dropdownMenu');
        if (dropdown) {
            dropdown.classList.toggle('show');
            
            // 点击其他地方关闭
            document.addEventListener('click', function closeMenu(e) {
                if (!e.target.closest('.user-menu')) {
                    dropdown.classList.remove('show');
                    document.removeEventListener('click', closeMenu);
                }
            });
        }
    }
    
    // 更新用户主题
    static updateUserTheme(user) {
        if (user && user.role === 'ADMIN') {
            document.documentElement.style.setProperty('--primary-color', '#dc3545');
            document.documentElement.style.setProperty('--primary-hover', '#c82333');
        } else {
            document.documentElement.style.setProperty('--primary-color', '#007bff');
            document.documentElement.style.setProperty('--primary-hover', '#0056b3');
        }
    }
    
    // 退出登录
    static logout() {
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('xuebao_token');
            localStorage.removeItem('xuebao_user');
            
            // 显示消息
            Utils.showMessage('已退出登录', 'success');
            
            // 重新加载页面
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
    
    // 初始化用户状态
    static init() {
        this.renderUserStatus();
        
        // 定期检查登录状态
        setInterval(() => {
            this.renderUserStatus();
        }, 30000); // 每30秒更新一次
        
        console.log('用户管理器初始化完成');
    }
}

// 全局导出
window.UserManager = UserManager;