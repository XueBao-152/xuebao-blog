// js/auth.js
class Auth {
    // 检查登录状态
    static checkAuth() {
        const token = localStorage.getItem('xuebao_token');
        const user = localStorage.getItem('xuebao_user');
        
        console.log('🔍 Auth.checkAuth检查:');
        console.log('- token存在:', !!token);
        console.log('- user存在:', !!user);
        
        if (token && user) {
            try {
                const userData = JSON.parse(user);
                return {
                    isLoggedIn: true,
                    token: token,
                    user: userData
                };
            } catch (error) {
                console.error('解析用户信息失败:', error);
                return { isLoggedIn: false, token: null, user: null };
            }
        }
        
        return { isLoggedIn: false, token: null, user: null };
    }
    
    // ✅ 修复的登录方法
    static async login(credentials) {
        console.log('=== Auth.login 开始 ===');
        console.log('登录参数:', { ...credentials, password: credentials.password ? '***' : 'empty' });
        
        // 验证参数
        if (!credentials || !credentials.username || !credentials.password) {
            console.error('登录参数不完整:', credentials);
            Utils.showMessage('请输入用户名和密码', 'error');
            return false;
        }
        
        const username = credentials.username;
        const password = credentials.password;
        
        if (!username || !password) {
            Utils.showMessage('请输入用户名和密码', 'error');
            return false;
        }
        
        try {
            // 显示加载状态
            Utils.showLoading('登录中...');
            
            // 检查登录按钮状态
            const loginBtn = document.getElementById('loginBtn');
            let originalText = '登录';
            if (loginBtn) {
                originalText = loginBtn.innerHTML;
                loginBtn.disabled = true;
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
            }
            
            console.log('调用API.login...');
            
            // 检查API对象
            if (!window.API || typeof window.API.login !== 'function') {
                throw new Error('API.login 不可用，请检查API配置');
            }
            
            const result = await window.API.login({ username, password });
            console.log('API.login响应:', result);
            
            // 隐藏加载状态
            Utils.hideLoading();
            
            // 恢复按钮状态
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
            }
            
            if (result && (result.token || result.success)) {
                console.log('✅ 登录成功');
                
                // 🔥 关键修复：确保保存所有必要信息
                let tokenToSave = null;
                let userToSave = null;
                
                // 提取token
                if (result.token) {
                    tokenToSave = result.token;
                } else if (result.data && result.data.token) {
                    tokenToSave = result.data.token;
                } else if (result.access_token) {
                    tokenToSave = result.access_token;
                }
                
                if (tokenToSave) {
                    localStorage.setItem('xuebao_token', tokenToSave);
                    console.log('✅ Token已保存:', tokenToSave.substring(0, 20) + '...');
                } else {
                    console.warn('⚠️ 响应中没有找到token字段');
                }
                
                // 🔥 提取并保存用户信息
                if (result.user) {
                    userToSave = result.user;
                } else if (result.data) {
                    if (result.data.user) {
                        userToSave = result.data.user;
                    } else if (typeof result.data === 'object') {
                        // 如果data本身就是用户对象
                        userToSave = result.data;
                    }
                } else if (result.username) {
                    // 如果只有基础字段
                    userToSave = {
                        username: result.username,
                        email: result.email || result.username || '',
                        name: result.name || result.username
                    };
                }
                
                // 如果还没有用户信息，创建一个默认的
                if (!userToSave) {
                    userToSave = {
                        id: Date.now(),
                        username: username,
                        email: username.includes('@') ? username : `${username}@example.com`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    console.log('⚠️ 响应中没有用户信息，创建默认用户:', userToSave);
                } else {
                    console.log('✅ 保存返回的用户信息:', userToSave);
                }
                
                localStorage.setItem('xuebao_user', JSON.stringify(userToSave));
                localStorage.setItem('xuebao_login_time', new Date().toISOString());
                
                // 🔥 验证保存
                console.log('🔍 验证本地存储:');
                console.log('- xuebao_token:', localStorage.getItem('xuebao_token') ? '✅ 已保存' : '❌ 未保存');
                console.log('- xuebao_user:', localStorage.getItem('xuebao_user') ? '✅ 已保存' : '❌ 未保存');
                
                Utils.showMessage('登录成功！正在跳转...', 'success');
                
                // 触发用户状态更新
                if (window.UserManager && typeof window.UserManager.updateUserStatus === 'function') {
                    window.UserManager.updateUserStatus();
                } else if (window.UserManager && typeof window.UserManager.renderUserStatus === 'function') {
                    window.UserManager.renderUserStatus();
                }
                
                // 延迟跳转到首页
                setTimeout(() => {
                    const redirect = window.location.search.includes('redirect=') 
                        ? new URLSearchParams(window.location.search).get('redirect')
                        : 'index.html';
                    window.location.href = redirect;
                }, 1500);
                
                return true;
            } else {
                const errorMsg = result?.message || result?.error || '登录失败';
                console.error('❌ 登录失败:', errorMsg);
                Utils.showMessage(errorMsg, 'error');
                return false;
            }
            
        } catch (error) {
            console.error('登录过程出错:', error);
            Utils.hideLoading();
            
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalText;
            }
            
            let errorMessage = '登录失败';
            if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                errorMessage = '网络连接失败，请检查后端服务';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                errorMessage = '用户名或密码错误';
            } else if (error.message.includes('API.login')) {
                errorMessage = 'API服务不可用，请刷新页面';
            } else {
                errorMessage = error.message || '登录失败';
            }
            
            Utils.showMessage(errorMessage, 'error');
            return false;
        }
    }
    
    // ✅ 登出
    static async logout() {
        try {
            Utils.showLoading('退出中...');
            
            // 调用后端退出接口
            if (window.API && typeof window.API.logout === 'function') {
                await window.API.logout();
            }
            
        } catch (error) {
            console.log('后端退出失败:', error);
        } finally {
            // 无论后端是否成功，都清除本地存储
            localStorage.removeItem('xuebao_token');
            localStorage.removeItem('xuebao_user');
            localStorage.removeItem('remember_username');
            
            Utils.hideLoading();
            Utils.showMessage('已退出登录', 'info');
            
            // 触发用户状态更新
            if (window.UserManager && typeof window.UserManager.updateUserStatus === 'function') {
                window.UserManager.updateUserStatus();
            } else if (window.UserManager && typeof window.UserManager.renderUserStatus === 'function') {
                window.UserManager.renderUserStatus();
            }
            
            // 跳转到登录页
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    }
    
    // ✅ 自动填充记住的用户名
    static fillRememberedUsername() {
        const rememberedUsername = localStorage.getItem('remember_username');
        const usernameInput = document.getElementById('username');
        
        if (rememberedUsername && usernameInput) {
            usernameInput.value = rememberedUsername;
            
            // 自动聚焦到密码框
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.focus();
            }
        }
    }
    
    // ✅ 更新导航栏认证状态
    static updateNavbar() {
        console.log('Auth.updateNavbar 被调用');
        const auth = this.checkAuth();
        console.log('当前认证状态:', auth);
        
        const authButtons = document.getElementById('authButtons');
        const authCard = document.getElementById('authCard');
        const createPostLink = document.getElementById('createPostLink');
        const profileLink = document.getElementById('profileLink');
        
        if (!authButtons) {
            console.warn('未找到 authButtons 元素');
            return;
        }
        
        if (auth.isLoggedIn && auth.user) {
            console.log('✅ 用户已登录，更新导航栏为登录状态');
            const username = auth.user.username || auth.user.email || '用户';
            const firstLetter = username.charAt(0).toUpperCase();
            
            // 已登录状态
            authButtons.innerHTML = `
                <div class="user-menu">
                    <div class="user-info" onclick="toggleUserMenu()">
                        <div class="user-avatar">${firstLetter}</div>
                        <span class="user-name">${username}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-menu" id="userDropdownMenu">
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
                        <a href="#" onclick="UserManager.switchUser()" class="dropdown-item">
                            <i class="fas fa-exchange-alt"></i> 切换用户
                        </a>
                        <a href="#" onclick="Auth.logout()" class="dropdown-item">
                            <i class="fas fa-sign-out-alt"></i> 退出登录
                        </a>
                    </div>
                </div>
            `;
            
            // 显示下拉菜单交互
            const userMenu = authButtons.querySelector('.user-info');
            const dropdownMenu = authButtons.querySelector('.dropdown-menu');
            
            if (userMenu && dropdownMenu) {
                const toggleUserMenu = () => {
                    dropdownMenu.classList.toggle('show');
                };
                
                userMenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleUserMenu();
                });
                
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.user-menu')) {
                        dropdownMenu.classList.remove('show');
                    }
                });
            }
            
            // 隐藏登录卡片
            if (authCard) {
                authCard.style.display = 'none';
            }
            
            // 显示创建文章和个人中心链接
            if (createPostLink && profileLink) {
                createPostLink.style.display = 'block';
                profileLink.style.display = 'block';
            }
            
        } else {
            console.log('👤 用户未登录，显示登录按钮');
            // 未登录状态
            authButtons.innerHTML = `
                <a href="login.html" class="btn btn-outline">登录</a>
                <a href="register.html" class="btn btn-primary">注册</a>
            `;
            
            // 显示登录卡片
            if (authCard) {
                authCard.style.display = 'block';
            }
            
            // 隐藏创建文章和个人中心链接
            if (createPostLink && profileLink) {
                createPostLink.style.display = 'none';
                profileLink.style.display = 'none';
            }
        }
    }
    
    // ✅ 保护需要认证的页面
    static protectPage() {
        const auth = this.checkAuth();
        console.log('🔐 protectPage 检查:', auth);
        
        if (!auth.isLoggedIn) {
            Utils.showMessage('请先登录', 'error');
            
            // 记录当前页面以便登录后跳转回来
            const currentPath = window.location.pathname;
            setTimeout(() => {
                window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
            }, 1000);
            return false;
        }
        return true;
    }
    
    // ✅ 获取当前用户
    static getCurrentUser() {
        const auth = this.checkAuth();
        return auth.user;
    }
    
    // ✅ 初始化
    static init() {
        console.log('=== Auth.init 开始 ===');
        
        // 检查登录状态
        const authInfo = this.checkAuth();
        console.log('当前登录状态:', authInfo);
        
        // 更新导航栏
        this.updateNavbar();
        
        // 如果是登录页，填充记住的用户名
        if (window.location.pathname.includes('login.html')) {
            this.fillRememberedUsername();
        }
        
        // 如果已登录，跳过登录页
        if (authInfo.isLoggedIn && window.location.pathname.includes('login.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const redirect = urlParams.get('redirect') || 'index.html';
            
            console.log('✅ 用户已登录，跳转到:', redirect);
            Utils.showMessage('您已登录，正在跳转...', 'info');
            
            setTimeout(() => {
                window.location.href = redirect;
            }, 1500);
        }
        
        console.log('=== Auth.init 完成 ===');
    }
    
    // ✅ 刷新用户状态
    static refreshUserStatus() {
        console.log('🔄 Auth.refreshUserStatus 被调用');
        
        // 重新检查状态
        const authInfo = this.checkAuth();
        console.log('刷新状态:', authInfo);
        
        // 更新导航栏
        this.updateNavbar();
        
        return authInfo;
    }
}

// 添加到全局
window.Auth = Auth;
console.log('✅ Auth类已加载');
console.log('🔍 Auth方法:');
console.log('- Auth.login类型:', typeof Auth.login);
console.log('- Auth.checkAuth类型:', typeof Auth.checkAuth);
console.log('- Auth.logout类型:', typeof Auth.logout);