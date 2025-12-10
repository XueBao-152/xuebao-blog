// js/post.js
class PostManager {
    // 获取文章列表
   // 🔧 修复后的 loadPost 方法
static async loadPost(id) {
    try {
        console.log(`📄 PostManager.loadPost: 加载文章 id=${id}`);
        
        // 显示加载状态
        Utils.showLoading('加载中...');
        
        // 检查API状态
        console.log('检查API状态:');
        console.log('- window.API:', window.API);
        console.log('- window.API.getPost:', typeof window.API?.getPost);
        
        if (!window.API || typeof window.API.getPost !== 'function') {
            throw new Error('API.getPost 方法不可用');
        }
        
        console.log(`📡 调用 window.API.getPost(${id})...`);
        const response = await window.API.getPost(id);
        
        console.log('✅ API响应:', response);
        
        // 🔥 关键修复：处理不同的响应格式
        let postData = response;
        if (response && response.data !== undefined) {
            // 情况1: ResponseWrapper格式 { success: true, data: {...}, message: '' }
            console.log('📦 识别为ResponseWrapper格式');
            postData = response.data;
        } else if (response && response.id !== undefined) {
            // 情况2: 直接Post对象
            console.log('📦 识别为直接Post对象');
            postData = response;
        } else {
            // 情况3: 未知格式，尝试查找文章数据
            console.warn('⚠️ 未知的响应格式，尝试直接使用:', response);
            postData = response;
        }
        
        console.log('📄 最终文章数据:', postData);
        
        if (!postData || !postData.id) {
            throw new Error('文章数据无效或格式错误');
        }
        
        Utils.hideLoading();
        
        // 渲染文章
        this.renderSinglePost(postData);
        
        // 🔧 修复：使用CommentManager加载评论
        console.log('🚀 加载评论...');
        setTimeout(() => {
            if (window.CommentManager && typeof window.CommentManager.loadComments === 'function') {
                console.log('✅ 调用CommentManager.loadComments');
                window.CommentManager.loadComments(id);
            } else {
                console.error('❌ CommentManager.loadComments不可用');
                // 应急处理：显示空评论状态
                const commentsContainer = document.getElementById('commentsContainer');
                if (commentsContainer) {
                    commentsContainer.innerHTML = '<div class="no-comments">评论加载中...</div>';
                }
            }
        }, 500);
        
    } catch (error) {
        Utils.hideLoading();
        console.error('加载文章失败:', error);
        this.showPostError('文章加载失败: ' + error.message);
    }
}
    
    // 直接使用fetch获取数据
    static async fetchDirectly(page, size) {
        try {
            console.log(`直接调用fetch: http://localhost:8081/api/posts?page=${page}&size=${size}`);
            
            const response = await fetch(`http://localhost:8081/api/posts?page=${page}&size=${size}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                mode: 'cors'
            });
            
            console.log('fetch响应状态:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('fetch返回的原始数据:', data);
            return data;
            
        } catch (fetchError) {
            console.error('直接fetch失败:', fetchError);
            throw fetchError;
        }
    }
    
    // 处理文章响应
    static handlePostsResponse(response, page, size) {
        console.log('处理文章响应，响应结构:', typeof response, response);
        
        // 处理不同的响应格式
        let postsArray = [];
        let paginationData = null;
        
        if (response && typeof response === 'object') {
            // 情况1: 标准Spring Data分页格式
            if (response.content && Array.isArray(response.content)) {
                console.log('识别为分页格式');
                postsArray = response.content;
                paginationData = {
                    totalElements: response.totalElements || 0,
                    totalPages: response.totalPages || 1,
                    currentPage: response.number || page,
                    pageSize: response.size || size,
                    first: response.first || true,
                    last: response.last || false
                };
            } 
            // 情况2: 直接是文章数组
            else if (Array.isArray(response)) {
                console.log('识别为数组格式');
                postsArray = response;
                paginationData = {
                    totalElements: response.length,
                    totalPages: 1,
                    currentPage: page,
                    pageSize: size
                };
            }
            // 情况3: 包含data字段
            else if (response.data && Array.isArray(response.data.content)) {
                console.log('识别为ResponseWrapper格式');
                postsArray = response.data.content;
                paginationData = {
                    totalElements: response.data.totalElements || 0,
                    totalPages: response.data.totalPages || 1,
                    currentPage: response.data.number || page,
                    pageSize: response.data.size || size
                };
            }
            // 情况4: 单篇文章对象
            else if (response.id) {
                console.log('识别为单篇文章');
                postsArray = [response];
                paginationData = {
                    totalElements: 1,
                    totalPages: 1,
                    currentPage: page,
                    pageSize: size
                };
            }
            // 情况5: 未知格式
            else {
                console.warn('未知的响应格式:', response);
                this.showEmptyState('服务器返回了未知的数据格式');
                return;
            }
        } else {
            console.warn('响应不是对象:', response);
            this.showEmptyState('服务器返回了无效的数据');
            return;
        }
        
        console.log('解析出的文章数量:', postsArray.length);
        console.log('解析出的分页数据:', paginationData);
        
        // 清理文章数据
        const cleanedPosts = this.cleanPostsData(postsArray);
        
        if (cleanedPosts.length === 0) {
            this.showEmptyState('暂无文章，快来写一篇吧！');
        } else {
            this.renderPosts(cleanedPosts, paginationData);
        }
        
        if (paginationData && paginationData.totalPages > 1) {
            this.renderPagination(paginationData);
        }
    }
    
    // 清理文章数据
    static cleanPostsData(posts) {
        if (!Array.isArray(posts) || posts.length === 0) {
            return [];
        }
        
        console.log(`清理 ${posts.length} 篇文章数据`);
        
        return posts.map((post, index) => {
            console.log(`处理第 ${index + 1} 篇文章:`, post.id, post.title);
            
            // 处理author字段
            let author = {};
            if (typeof post.author === 'object' && post.author !== null) {
                author = {
                    id: post.author.id || 0,
                    username: post.author.username || '未知用户',
                    nickname: post.author.nickname || post.author.username || '匿名',
                    avatarUrl: post.author.avatarUrl || '',
                    email: post.author.email || ''
                };
            } else if (typeof post.author === 'string') {
                // 如果author是字符串，尝试解析
                try {
                    const parsedAuthor = JSON.parse(post.author);
                    author = {
                        id: parsedAuthor.id || 0,
                        username: parsedAuthor.username || '未知用户',
                        nickname: parsedAuthor.nickname || parsedAuthor.username || '匿名',
                        avatarUrl: parsedAuthor.avatarUrl || ''
                    };
                } catch (e) {
                    console.warn('解析作者信息失败:', e.message);
                    author = { username: '未知用户' };
                }
            } else {
                console.warn('作者信息格式未知:', typeof post.author, post.author);
                author = { username: '未知用户' };
            }
            
            // 处理时间
            const createdAt = post.createdAt || new Date().toISOString();
            
            return {
                id: post.id || 0,
                title: this.escapeHtml(post.title || '无标题'),
                content: this.escapeHtml(post.content || ''),
                author: author,
                createdAt: createdAt,
                updatedAt: post.updatedAt || post.createdAt || createdAt,
                viewCount: post.viewCount || post.views || 0,
                likeCount: post.likeCount || 0,
                commentCount: post.commentCount || 0,
                status: post.status || 'PUBLISHED',
                keywords: post.keywords || []
            };
        });
    }
    
    // 渲染文章列表
    static renderPosts(posts, pagination = null) {
        const container = document.getElementById('postsContainer');
        if (!container) {
            console.error('未找到文章容器元素 #postsContainer');
            return;
        }
        
        console.log(`渲染 ${posts.length} 篇文章`);
        
        if (!posts || posts.length === 0) {
            console.log('文章数组为空，显示空状态');
            this.showEmptyState('暂无文章');
            return;
        }
        
        try {
            // 创建文章卡片
            container.innerHTML = posts.map(post => `
                <article class="post-card fade-in" data-post-id="${post.id}">
                    <div class="post-header">
                        <a href="post.html?id=${post.id}" class="post-title" data-testid="post-title">
                            ${post.title}
                        </a>
                        <div class="post-meta">
                            <span class="post-author">
                                <i class="fas fa-user"></i>
                                <a href="#" class="author-link" data-testid="post-author">${post.author.nickname || post.author.username}</a>
                            </span>
                            <span><i class="far fa-clock"></i> ${this.formatDate(post.createdAt)}</span>
                            <span><i class="far fa-eye"></i> ${post.viewCount}</span>
                        </div>
                    </div>
                    
                    <div class="post-excerpt" data-testid="post-excerpt">
                        ${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}
                    </div>
                    
                    <div class="post-footer">
                        <div class="post-stats">
                            <span><i class="far fa-comment"></i> ${post.commentCount} 评论</span>
                            <span><i class="far fa-heart"></i> ${post.likeCount} 点赞</span>
                        </div>
                        <div class="post-actions">
                            <a href="post.html?id=${post.id}" class="btn btn-outline btn-sm" data-testid="read-more">阅读全文</a>
                            <button class="btn btn-text btn-sm" onclick="PostManager.likePost(${post.id}, this)" data-testid="like-btn">
                                <i class="far fa-heart"></i> 点赞
                            </button>
                        </div>
                    </div>
                    
                    ${post.keywords && post.keywords.length > 0 ? `
                        <div class="post-tags">
                            ${post.keywords.map(keyword => 
                                `<span class="tag" data-testid="post-tag">${this.escapeHtml(keyword)}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </article>
            `).join('');
            
            console.log('文章渲染完成');
            
            // 添加动画效果
            setTimeout(() => {
                const fadeElements = document.querySelectorAll('.fade-in');
                console.log(`找到 ${fadeElements.length} 个淡入元素`);
                fadeElements.forEach((element, index) => {
                    element.style.animationDelay = `${index * 0.1}s`;
                });
            }, 100);
            
        } catch (error) {
            console.error('渲染文章时出错:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>渲染文章失败</h3>
                    <p>${error.message}</p>
                    <button onclick="PostManager.loadPosts(0, 10)" class="btn btn-primary">重试</button>
                </div>
            `;
        }
    }
    
    // 渲染分页
    static renderPagination(pagination) {
        const container = document.getElementById('pagination');
        if (!container || !pagination || pagination.totalPages <= 1) {
            if (container) {
                container.innerHTML = '';
                console.log('不渲染分页');
            }
            return;
        }
        
        const currentPage = pagination.currentPage || 0;
        const totalPages = pagination.totalPages || 1;
        
        console.log(`渲染分页: 当前页 ${currentPage + 1}, 总页数 ${totalPages}`);
        
        let html = '<div class="pagination-container">';
        
        // 上一页按钮
        if (currentPage > 0) {
            html += `
                <button class="btn btn-outline" onclick="PostManager.goToPage(${currentPage - 1})" data-testid="prev-page">
                    <i class="fas fa-chevron-left"></i> 上一页
                </button>
            `;
        }
        
        // 页码按钮
        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }
        
        // 第一页
        if (startPage > 0) {
            html += `<button class="btn btn-outline" onclick="PostManager.goToPage(0)" data-testid="first-page">1</button>`;
            if (startPage > 1) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
        }
        
        // 中间页码
        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                html += `<button class="btn btn-primary active" data-testid="current-page">${i + 1}</button>`;
            } else {
                html += `<button class="btn btn-outline" onclick="PostManager.goToPage(${i})" data-testid="page-${i}">${i + 1}</button>`;
            }
        }
        
        // 最后一页
        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) {
                html += `<span class="pagination-ellipsis">...</span>`;
            }
            html += `<button class="btn btn-outline" onclick="PostManager.goToPage(${totalPages - 1})" data-testid="last-page">${totalPages}</button>`;
        }
        
        // 下一页按钮
        if (currentPage < totalPages - 1) {
            html += `
                <button class="btn btn-outline" onclick="PostManager.goToPage(${currentPage + 1})" data-testid="next-page">
                    下一页 <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
        
        // 显示总条数
        if (pagination.totalElements) {
            container.insertAdjacentHTML('beforeend', `
                <div class="pagination-info">
                    共 ${pagination.totalElements} 篇文章
                </div>
            `);
        }
        
        console.log('分页渲染完成');
    }
    
    // 跳转到指定页面
    static goToPage(page) {
        console.log(`跳转到第 ${page} 页`);
        this.loadPosts(page, 10);
        window.scrollTo(0, 0);
    }
    
    // 搜索文章
    static async searchPosts(keyword) {
        if (!keyword) {
            Utils.showMessage('请输入搜索关键词', 'warning');
            return;
        }
        
        try {
            Utils.showLoading('搜索中...');
            const result = await API.searchPosts(keyword);
            Utils.hideLoading();
            
            if (result && result.content) {
                this.renderPosts(result.content);
                Utils.showMessage(`找到 ${result.totalElements || 0} 条相关结果`, 'success');
            } else {
                this.showEmptyState('未找到相关文章');
            }
        } catch (error) {
            Utils.hideLoading();
            console.error('搜索文章失败:', error);
            this.showEmptyState('搜索失败: ' + error.message);
        }
    }
    
    // 显示空状态
    static showEmptyState(message, showCreateButton = true) {
        const container = document.getElementById('postsContainer');
        if (container) {
            console.log(`显示空状态: ${message}`);
            container.innerHTML = `
                <div class="empty-state" data-testid="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>${message}</h3>
                    <p>暂时没有内容</p>
                    ${showCreateButton ? `
                        <a href="create-post.html" class="btn btn-primary" data-testid="create-first-post">写第一篇文章</a>
                    ` : ''}
                </div>
            `;
        }
        
        // 隐藏分页
        const pagination = document.getElementById('pagination');
        if (pagination) {
            pagination.innerHTML = '';
        }
    }
    
    // 格式化日期
    static formatDate(dateString) {
        try {
            if (!dateString) return '未知时间';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn('无效的日期:', dateString);
                return '未知时间';
            }
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('日期格式化失败:', error, dateString);
            return '未知时间';
        }
    }
    
    // HTML转义
    static escapeHtml(unsafe) {
        if (!unsafe) return '';
        if (typeof unsafe !== 'string') {
            unsafe = String(unsafe);
        }
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // 加载单篇文章
    // 加载单篇文章
static async loadPost(id) {
    try {
        console.log(`📄 PostManager.loadPost: 加载文章 id=${id}`);
        
        // 显示加载状态
        Utils.showLoading('加载中...');
        
        // 检查API状态
        console.log('检查API状态:');
        console.log('- window.API:', window.API);
        console.log('- window.API.getPost:', typeof window.API?.getPost);
        
        if (!window.API || typeof window.API.getPost !== 'function') {
            throw new Error('API.getPost 方法不可用');
        }
        
        console.log(`📡 调用 window.API.getPost(${id})...`);
        const response = await window.API.getPost(id);
        
        console.log('✅ API响应:', response);
        
        // 🔥 关键修复：处理不同的响应格式
        let postData = response;
        if (response && response.data !== undefined) {
            // 情况1: ResponseWrapper格式 { success: true, data: {...}, message: '' }
            console.log('📦 识别为ResponseWrapper格式');
            postData = response.data;
        } else if (response && response.id !== undefined) {
            // 情况2: 直接Post对象
            console.log('📦 识别为直接Post对象');
            postData = response;
        } else {
            // 情况3: 未知格式，尝试查找文章数据
            console.warn('⚠️ 未知的响应格式，尝试直接使用:', response);
            postData = response;
        }
        
        console.log('📄 最终文章数据:', postData);
        
        if (!postData || !postData.id) {
            throw new Error('文章数据无效或格式错误');
        }
        
        Utils.hideLoading();
        
        // 渲染文章
        this.renderSinglePost(postData);
        
        // 加载评论
        setTimeout(() => {
    if (window.CommentManager?.loadComments) {
        window.CommentManager.loadComments(id);  // 优先使用CommentManager
    } else {
        this.loadComments(id);  // 备用方案
    }
}, 1000);
        
    } catch (error) {
        Utils.hideLoading();
        console.error('加载文章失败:', error);
        this.showPostError('文章加载失败: ' + error.message);
    }
}
    
    // 渲染单篇文章
   // 渲染单篇文章
static renderSinglePost(post) {
    const container = document.getElementById('postContainer');
    if (!container) {
        console.error('未找到文章容器元素 #postContainer');
        return;
    }
    
    console.log('🎨 渲染单篇文章:', post);
    
    // 🔥 修复：确保数据格式正确
    let postData = post;
    if (post && post.data !== undefined) {
        postData = post.data;
    }
    
    if (!postData || !postData.id) {
        console.error('❌ 文章数据无效:', postData);
        this.showPostError('文章数据格式错误');
        return;
    }
    
    // 清理文章数据
    const cleanPost = this.cleanSinglePostData(postData);
    
    console.log('📄 清理后的文章:', cleanPost);
    
    // 渲染HTML
    container.innerHTML = `
        <article class="post-detail" data-post-id="${cleanPost.id}">
            <div class="post-header">
                <h1 class="post-title">${cleanPost.title || '无标题'}</h1>
                <div class="post-meta">
                    <div class="author-info">
                        <div class="author-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div>
                            <div class="author-name">${cleanPost.author.nickname || cleanPost.author.username || '匿名用户'}</div>
                            <div class="post-time">${this.formatDate(cleanPost.createdAt)}</div>
                        </div>
                    </div>
                    <div class="post-stats">
                        <span><i class="far fa-eye"></i> ${cleanPost.viewCount || 0} 阅读</span>
                        <span><i class="far fa-comment"></i> ${cleanPost.commentCount || 0} 评论</span>
                        <span><i class="far fa-heart"></i> ${cleanPost.likeCount || 0} 点赞</span>
                    </div>
                </div>
            </div>
            
            <div class="post-content">
                ${(cleanPost.content || '').replace(/\n/g, '<br>')}
            </div>
            
            <div class="post-footer">
                <button onclick="location.href='index.html'" class="btn btn-primary">返回首页</button>
            </div>
        </article>
    `;
    
    console.log('✅ 单篇文章渲染完成');
}
    
    // 清理单篇文章数据
    static cleanSinglePostData(post) {
        if (!post) return {};
        
        console.log('清理单篇文章数据:', post);
        
        // 处理author字段
        let author = {};
        if (typeof post.author === 'object' && post.author !== null) {
            author = {
                id: post.author.id || 0,
                username: post.author.username || '未知用户',
                nickname: post.author.nickname || post.author.username || '匿名',
                avatarUrl: post.author.avatarUrl || ''
            };
        } else if (typeof post.author === 'string') {
            try {
                const parsedAuthor = JSON.parse(post.author);
                author = {
                    id: parsedAuthor.id || 0,
                    username: parsedAuthor.username || '未知用户',
                    nickname: parsedAuthor.nickname || parsedAuthor.username || '匿名',
                    avatarUrl: parsedAuthor.avatarUrl || ''
                };
            } catch (e) {
                console.warn('解析作者信息失败:', e.message);
                author = { username: '未知用户' };
            }
        } else {
            author = { username: '未知用户' };
        }
        
        return {
            id: post.id || 0,
            title: this.escapeHtml(post.title || '无标题'),
            content: this.escapeHtml(post.content || ''),
            author: author,
            createdAt: post.createdAt || new Date().toISOString(),
            updatedAt: post.updatedAt || post.createdAt || new Date().toISOString(),
            viewCount: post.viewCount || post.views || 0,
            likeCount: post.likeCount || 0,
            commentCount: post.commentCount || 0,
            status: post.status || 'PUBLISHED',
            keywords: post.keywords || []
        };
    }
    
    // 显示文章错误
    static showPostError(message) {
        const container = document.getElementById('postContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>文章加载失败</h3>
                    <p>${message}</p>
                    <a href="index.html" class="btn btn-primary">返回首页</a>
                </div>
            `;
        }
    }
    
    // 点赞文章
    static async likePost(postId, button) {
        if (!Auth.protectPage()) return;
        
        try {
            console.log('点赞文章:', postId);
            Utils.showMessage('点赞功能开发中...', 'info');
            
            if (button) {
                const likeCountSpan = button.querySelector('.like-count') || 
                                     button.closest('.post-card')?.querySelector('.like-count') ||
                                     button.closest('.post-detail')?.querySelector('.like-count');
                
                if (likeCountSpan) {
                    const currentCount = parseInt(likeCountSpan.textContent) || 0;
                    likeCountSpan.textContent = currentCount + 1;
                }
            }
        } catch (error) {
            Utils.showMessage('点赞失败: ' + error.message, 'error');
        }
    }
    
    // 检查是否是作者
    static isAuthor(post) {
        const user = Auth.getCurrentUser();
        if (!user || !post.author) return false;
        return user.id === post.author.id || user.username === post.author.username;
    }
    
    // 删除文章
    static async deletePost(postId) {
        const confirmed = await Utils.confirm('确定要删除这篇文章吗？此操作不可恢复。');
        if (!confirmed) return;
        
        try {
            Utils.showLoading('删除中...');
            await API.deletePost(postId);
            Utils.hideLoading();
            Utils.showMessage('文章删除成功', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } catch (error) {
            Utils.hideLoading();
            Utils.showMessage('删除失败: ' + error.message, 'error');
        }
    }
    
   // 加载评论
// js/post.js 中的评论相关方法（备份）
static async loadComments(postId) {
    try {
        console.log('加载评论，文章ID:', postId);
        const comments = await API.getPostComments(postId);
        this.renderComments(comments);
    } catch (error) {
        console.error('加载评论失败:', error);
    }
}

static renderComments(comments) {
    const container = document.getElementById('commentsContainer');
    if (!container) return;
   
    if (!comments || comments.length === 0) {
        container.innerHTML = '<p class="no-comments">暂无评论</p>';
        return;
    }
   
    const html = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="comment-author">${comment.author?.username || '匿名'}</span>
                <span class="comment-time">${this.formatDate(comment.createdAt)}</span>
            </div>
            <div class="comment-content">${this.escapeHtml(comment.content)}</div>
        </div>
    `).join('');
   
    container.innerHTML = html;
}
}

// 添加到全局
window.PostManager = PostManager;