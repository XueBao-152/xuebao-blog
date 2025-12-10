// js/main.js - 修复版
class App {
    static currentPage = 0;
    static pageSize = 10;
    static currentFilter = 'all';
    static currentKeyword = '';
    
   // js/main.js - 修改 init 方法
static init() {
    console.log('🚀 学宝博客初始化开始...');
    console.log('当前页面:', window.location.pathname);
    
    // ✅ 修复：检查当前页面类型
    const currentPage = window.location.pathname.split('/').pop();
    console.log('页面文件名:', currentPage);
    
    // 等待页面完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📄 DOM加载完成，延迟初始化...');
            this.delayedInit(currentPage);
        });
    } else {
        console.log('📄 DOM已加载，延迟初始化...');
        this.delayedInit(currentPage);
    }
}

// ✅ 修改：添加页面类型参数
static delayedInit(pageType) {
    console.log(`⏰ 延迟初始化开始，页面类型: ${pageType}`);
    
    setTimeout(() => {
        this.initUserStatus();
        this.bindEvents();
        
        // ✅ 修复：只在首页加载文章列表
        if (pageType === 'index.html' || pageType === '' || pageType === '/') {
            console.log('🏠 首页，加载文章列表...');
            this.loadPosts();
        } else {
            console.log(`📄 非首页(${pageType})，跳过加载文章列表`);
        }
    }, 500);
}
    
    // 🔥 修复：加载文章 - 处理多种数据格式
    static async loadPosts() {
        console.log('📚 开始加载文章...');
        
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) {
            console.error('❌ 找不到文章容器');
            this.showError('找不到文章容器');
            return;
        }
        
        try {
            // 显示加载状态
            postsContainer.innerHTML = this.createLoadingHTML();
            
            console.log('🔍 检查API状态...');
            console.log('API对象:', window.API);
            console.log('API.getPosts类型:', typeof window.API?.getPosts);
            
            if (!window.API || typeof window.API.getPosts !== 'function') {
                throw new Error('API.getPosts 方法不可用');
            }
            
            console.log('📡 调用API.getPosts...');
            const response = await window.API.getPosts(this.currentPage, this.pageSize);
            console.log('✅ API原始响应:', response);
            
            // 🔥 修复：处理多种数据格式
            let posts = [];
            let totalPages = 1;
            let currentPage = this.currentPage;
            
            if (response) {
                console.log('🔍 分析响应数据结构...');
                console.log('响应类型:', typeof response);
                console.log('响应键名:', Object.keys(response));
                
                // 情况1: { success: true, data: [...], code: 200, message: '获取成功' }
                if (response.success !== undefined && response.data && Array.isArray(response.data)) {
                    console.log('✅ 格式1: success/data 格式');
                    posts = response.data;
                    totalPages = response.totalPages || Math.ceil((response.totalElements || posts.length) / this.pageSize) || 1;
                    currentPage = response.number || response.page || this.currentPage;
                }
                // 情况2: { content: [...], totalPages: 1, number: 0 }
                else if (response.content && Array.isArray(response.content)) {
                    console.log('✅ 格式2: content 格式');
                    posts = response.content;
                    totalPages = response.totalPages || 1;
                    currentPage = response.number || this.currentPage;
                }
                // 情况3: 直接是数组
                else if (Array.isArray(response)) {
                    console.log('✅ 格式3: 直接数组');
                    posts = response;
                    totalPages = 1;
                    currentPage = 0;
                }
                // 情况4: { data: { content: [...] } } 嵌套格式
                else if (response.data && response.data.content && Array.isArray(response.data.content)) {
                    console.log('✅ 格式4: 嵌套 data.content 格式');
                    posts = response.data.content;
                    totalPages = response.data.totalPages || response.totalPages || 1;
                    currentPage = response.data.number || response.number || this.currentPage;
                }
                // 情况5: 其他未知格式
                else {
                    console.warn('⚠️ 未知数据格式，尝试查找文章数组...');
                    console.log('完整响应:', response);
                    
                    // 尝试在所有属性中查找数组
                    for (let key in response) {
                        if (Array.isArray(response[key]) && response[key].length > 0) {
                            console.log(`🔍 在属性 "${key}" 中找到文章数组`);
                            posts = response[key];
                            break;
                        }
                    }
                    
                    if (posts.length === 0) {
                        console.log('❌ 未找到文章数组');
                    }
                }
            } else {
                console.log('❌ API返回空响应');
            }
            
            console.log(`📊 解析结果: ${posts.length} 篇文章, ${totalPages} 页`);
            
            if (posts && posts.length > 0) {
                console.log(`🎯 渲染 ${posts.length} 篇文章`);
                this.renderPosts(posts);
                this.renderPagination(totalPages, currentPage);
            } else {
                console.log('📭 没有文章数据');
                this.renderNoPosts();
            }
            
        } catch (error) {
            console.error('❌ 加载文章失败:', error);
            this.renderError('加载失败: ' + error.message);
        }
    }
    
    // 渲染文章
    static renderPosts(posts) {
        console.log('🎨 渲染文章...');
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) return;
        
        if (!posts || posts.length === 0) {
            this.renderNoPosts();
            return;
        }
        
        let html = '<div class="posts-grid">';
        
        posts.forEach((post, index) => {
            console.log(`📝 渲染文章 ${index + 1}:`, post.title || '无标题');
            
            // 安全处理日期
            let dateStr = '未知时间';
            try {
                if (post.createdAt) {
                    const date = new Date(post.createdAt);
                    dateStr = date.toLocaleDateString('zh-CN') + ' ' + 
                             date.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'});
                } else if (post.createTime) {
                    const date = new Date(post.createTime);
                    dateStr = date.toLocaleDateString('zh-CN');
                } else if (post.createDate) {
                    const date = new Date(post.createDate);
                    dateStr = date.toLocaleDateString('zh-CN');
                }
            } catch (e) {
                console.warn('日期解析失败:', e);
                dateStr = '未知时间';
            }
            
            // 安全处理作者
            let author = '匿名';
            if (post.author) {
                if (typeof post.author === 'string') {
                    author = post.author;
                } else if (post.author.username) {
                    author = post.author.username;
                } else if (post.author.name) {
                    author = post.author.name;
                } else if (post.author.nickname) {
                    author = post.author.nickname;
                } else if (post.author.email) {
                    author = post.author.email.split('@')[0];
                }
            }
            
            // 安全处理内容
            let summary = '暂无内容';
            if (post.summary) {
                summary = post.summary;
            } else if (post.content) {
                summary = post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content;
            } else if (post.body) {
                summary = post.body.length > 150 ? post.body.substring(0, 150) + '...' : post.body;
            } else if (post.description) {
                summary = post.description.length > 150 ? post.description.substring(0, 150) + '...' : post.description;
            }
            
            html += `
                <div class="post-card" data-id="${post.id || index}">
                    <div class="post-header">
                        <h3 class="post-title">
                            <a href="post.html?id=${post.id || '#'}" class="post-link">
                                ${post.title || '无标题'}
                            </a>
                        </h3>
                        <div class="post-meta">
                            <span class="post-author">
                                <i class="fas fa-user"></i> ${author}
                            </span>
                            <span class="post-date">
                                <i class="fas fa-clock"></i> ${dateStr}
                            </span>
                            <span class="post-views">
                                <i class="fas fa-eye"></i> ${post.viewCount || post.views || 0}
                            </span>
                        </div>
                    </div>
                    
                    <div class="post-excerpt">
                        <p>${summary}</p>
                    </div>
                    
                    <div class="post-footer">
                        <div class="post-stats">
                            <span class="post-stat">
                                <i class="fas fa-thumbs-up"></i> ${post.likeCount || post.likes || 0}
                            </span>
                            <span class="post-stat">
                                <i class="fas fa-comment"></i> ${post.commentCount || post.comments || 0}
                            </span>
                        </div>
                        <a href="post.html?id=${post.id || '#'}" class="btn btn-outline btn-sm">
                            阅读全文 <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        postsContainer.innerHTML = html;
        
        console.log('✅ 文章渲染完成');
    }
    
    // 渲染分页
    static renderPagination(totalPages, currentPage) {
        console.log(`📄 渲染分页: 共${totalPages}页，当前第${currentPage + 1}页`);
        const pagination = document.getElementById('pagination');
        if (!pagination || totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination-nav"><ul class="pagination">';
        
        // 上一页
        if (currentPage > 0) {
            html += `
                <li class="page-item">
                    <a class="page-link" onclick="App.goToPage(${currentPage - 1})" href="javascript:void(0)">
                        <i class="fas fa-chevron-left"></i> 上一页
                    </a>
                </li>
            `;
        }
        
        // 页码
        for (let i = 0; i < totalPages; i++) {
            if (i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 2) {
                html += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" onclick="App.goToPage(${i})" href="javascript:void(0)">${i + 1}</a>
                    </li>
                `;
            } else if (i === 1 || i === totalPages - 2) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        // 下一页
        if (currentPage < totalPages - 1) {
            html += `
                <li class="page-item">
                    <a class="page-link" onclick="App.goToPage(${currentPage + 1})" href="javascript:void(0)">
                        下一页 <i class="fas fa-chevron-right"></i>
                    </a>
                </li>
            `;
        }
        
        html += '</ul></div>';
        pagination.innerHTML = html;
    }
    
    // 渲染无文章
    static renderNoPosts() {
        console.log('📭 渲染无文章状态');
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) return;
        
        postsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <h3>暂无文章</h3>
                <p>还没有发布任何文章，快来创建第一篇吧！</p>
                <a href="create-post.html" class="btn btn-primary">
                    <i class="fas fa-plus"></i> 创建文章
                </a>
            </div>
        `;
    }
    
    // 渲染错误
    static renderError(message) {
        console.error('❌ 渲染错误:', message);
        const postsContainer = document.getElementById('postsContainer');
        if (!postsContainer) return;
        
        postsContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>加载失败</h3>
                <p>${message}</p>
                <div class="error-actions">
                    <button onclick="App.loadPosts()" class="btn btn-outline">
                        <i class="fas fa-redo"></i> 重新加载
                    </button>
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-sync"></i> 刷新页面
                    </button>
                </div>
            </div>
        `;
    }
    
    // 创建加载中HTML
    static createLoadingHTML() {
        return `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>正在加载文章...</p>
            </div>
        `;
    }
    
    // 初始化用户状态
    static initUserStatus() {
        console.log('👤 初始化用户状态...');
        this.updateUserStatus();
    }
    
    // 更新用户状态
    static updateUserStatus() {
        console.log('🔄 更新用户状态...');
        
        const token = localStorage.getItem('xuebao_token');
        const userStr = localStorage.getItem('xuebao_user');
        
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                this.showLoggedInState(user);
            } catch (error) {
                console.error('解析用户信息失败:', error);
                this.showGuestState();
            }
        } else {
            this.showGuestState();
        }
    }
    
    // 显示已登录状态
    static showLoggedInState(user) {
        console.log('✅ 显示已登录状态:', user);
        const username = user.username || user.email || '用户';
        const firstLetter = username.charAt(0).toUpperCase();
        
        // 更新导航栏用户状态
        const userStatus = document.getElementById('userStatus');
        if (userStatus) {
            userStatus.innerHTML = `
                <div class="user-menu">
                    <div class="user-info" onclick="App.toggleUserMenu()">
                        <div class="user-avatar">${firstLetter}</div>
                        <span class="user-name">${username}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-menu" id="userDropdownMenu">
                        <a href="profile.html" class="dropdown-item">
                            <i class="fas fa-user-circle"></i> 个人中心
                        </a>
                        <a href="my-posts.html" class="dropdown-item">
                            <i class="fas fa-file-alt"></i> 我的文章
                        </a>
                        <a href="create-post.html" class="dropdown-item">
                            <i class="fas fa-edit"></i> 写文章
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item" onclick="App.logout()">
                            <i class="fas fa-sign-out-alt"></i> 退出登录
                        </a>
                    </div>
                </div>
            `;
        }
        
        // 更新登录按钮区域
        const authButtons = document.getElementById('authButtons');
        if (authButtons) {
            authButtons.innerHTML = '';
        }
        
        console.log('✅ 用户状态更新完成');
    }
    
    // 显示访客状态
    static showGuestState() {
        console.log('👤 显示访客状态');
        
        const userStatus = document.getElementById('userStatus');
        const authButtons = document.getElementById('authButtons');
        
        if (userStatus) {
            userStatus.innerHTML = '';
        }
        
        if (authButtons) {
            authButtons.innerHTML = `
                <a href="login.html" class="btn btn-outline">登录</a>
                <a href="register.html" class="btn btn-primary">注册</a>
            `;
        }
    }
    
    // 切换用户菜单
    static toggleUserMenu() {
        console.log('📋 切换用户菜单');
        const dropdown = document.getElementById('userDropdownMenu');
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
    
    // 退出登录
    static logout() {
        console.log('🚪 退出登录');
        if (confirm('确定要退出登录吗？')) {
            localStorage.removeItem('xuebao_token');
            localStorage.removeItem('xuebao_user');
            
            if (window.Utils && typeof Utils.showMessage === 'function') {
                Utils.showMessage('已退出登录', 'success');
            }
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }
    
    // 分页导航
    static prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.loadPosts();
        }
    }
    
    static nextPage() {
        this.currentPage++;
        this.loadPosts();
    }
    
    static goToPage(page) {
        this.currentPage = page;
        this.loadPosts();
    }
    
    // 绑定事件
    static bindEvents() {
        console.log('🔗 绑定事件...');
        
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchPosts();
                }
            });
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', () => this.searchPosts());
        }
        
        // 过滤按钮
        const filterButtons = document.querySelectorAll('.filter-buttons .btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const filter = e.target.textContent.trim();
                switch (filter) {
                    case '热门':
                        this.currentFilter = 'popular';
                        break;
                    case '最新':
                        this.currentFilter = 'latest';
                        break;
                    default:
                        this.currentFilter = 'all';
                }
                
                this.loadPosts();
            });
        });
        
        console.log('✅ 事件绑定完成');
    }
    
    // 搜索文章
    static async searchPosts() {
        console.log('🔍 搜索文章...');
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const keyword = searchInput.value.trim();
        if (!keyword) {
            this.loadPosts();
            return;
        }
        
        this.currentKeyword = keyword;
        this.currentPage = 0;
        
        try {
            const postsContainer = document.getElementById('postsContainer');
            postsContainer.innerHTML = this.createLoadingHTML();
            
            const response = await window.API.searchPosts(keyword, this.currentPage, this.pageSize);
            
            // 🔥 修复：搜索也使用相同的格式处理
            let posts = [];
            if (response) {
                if (response.success !== undefined && response.data) {
                    posts = response.data;
                } else if (response.content) {
                    posts = response.content;
                } else if (Array.isArray(response)) {
                    posts = response;
                }
            }
            
            if (posts && posts.length > 0) {
                this.renderPosts(posts);
                this.renderPagination(response.totalPages || 1, response.number || 0);
            } else {
                this.renderNoPosts();
            }
        } catch (error) {
            console.error('搜索失败:', error);
            this.renderError('搜索失败: ' + error.message);
        }
    }
}

// 页面加载完成后初始化
console.log('📄 main.js 加载完成，等待初始化...');

// 使用DOMContentLoaded确保DOM就绪
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM加载完成，启动App...');
    App.init();
});

// 全局导出
window.App = App;
console.log('✅ App类已注册到全局');