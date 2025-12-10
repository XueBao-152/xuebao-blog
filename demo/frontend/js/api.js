// js/api.js - 修复版（包含正确的评论创建格式）
class API {
    constructor() {
        this.baseURL = 'http://localhost:8081';
        console.log('✅ API构造函数调用，baseURL:', this.baseURL);
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('xuebao_token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            credentials: 'include',
            mode: 'cors'
        };
        
        try {
            console.log(`📡 API请求: ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            console.log('📡 响应状态:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API错误详情:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ API响应成功:', data);
            
            return data;
            
        } catch (error) {
            console.error('❌ API请求失败:', error);
            if (window.Utils && typeof Utils.showMessage === 'function') {
                Utils.showMessage('请求失败: ' + error.message, 'error');
            }
            throw error;
        }
    }
    
    // ========== 认证相关 ==========
    async login(credentials) {
        return this.request('/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
    
    async register(userData) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    async logout() {
        return this.request('/logout', { method: 'POST' });
    }
    
    async getCurrentUser() {
        return this.request('/api/users/me');
    }
    
    // ========== 文章相关 ==========
    async getPosts(page = 0, size = 10, sort = 'createdAt,desc') {
        console.log(`📄 调用getPosts: page=${page}, size=${size}`);
        return this.request(`/api/posts?page=${page}&size=${size}&sort=${sort}`);
    }
    
    // ✅ 获取单篇文章
    async getPost(id) {
        console.log(`📄 调用getPost: id=${id}`);
        try {
            const response = await this.request(`/api/posts/${id}`);
            console.log('✅ getPost请求成功:', response);
            return response;
        } catch (error) {
            console.error('❌ getPost请求失败:', error);
            throw error;
        }
    }
    
    async createPost(postData) {
        console.log('📝 创建文章:', { 
            title: postData.title,
            contentLength: postData.content?.length 
        });
        
        try {
            const response = await this.request('/api/posts', {
                method: 'POST',
                body: JSON.stringify(postData)
            });
            
            console.log('✅ 后端响应:', response);
            
            // 处理不同响应格式
            if (response && response.data) {
                // ResponseWrapper 格式
                return {
                    success: true,
                    id: response.data.id,
                    data: response.data,
                    message: response.message || '文章创建成功'
                };
            } else if (response && response.id) {
                // 直接返回Post对象
                return {
                    success: true,
                    id: response.id,
                    data: response,
                    message: '文章创建成功'
                };
            } else {
                throw new Error('无效的响应格式: ' + JSON.stringify(response));
            }
            
        } catch (error) {
            console.error('❌ 创建文章失败:', error);
            
            // 调试模式：返回模拟数据
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('🚧 调试模式：返回模拟数据');
                return {
                    success: true,
                    id: Date.now(),
                    data: {
                        id: Date.now(),
                        title: postData.title || '测试文章',
                        content: postData.content || '测试内容',
                        author: { username: 'admin' },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        views: 0,
                        likes: 0,
                        comments: 0
                    },
                    message: '文章创建成功！(测试模式)'
                };
            }
            
            throw error;
        }
    }
    
    async updatePost(id, postData) {
        return this.request(`/api/posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(postData)
        });
    }
    
    async deletePost(id) {
        return this.request(`/api/posts/${id}`, { method: 'DELETE' });
    }
    
    async searchPosts(keyword, page = 0, size = 10) {
        return this.request(`/api/posts/search?keyword=${keyword}&page=${page}&size=${size}`);
    }
    
    async getMyPosts(page = 0, size = 10) {
        return this.request(`/api/users/me/posts?page=${page}&size=${size}`);
    }
    
    async likePost(postId) {
        return this.request(`/api/posts/${postId}/like`, { method: 'POST' });
    }
    
    async unlikePost(postId) {
        return this.request(`/api/posts/${postId}/like`, { method: 'DELETE' });
    }
    
    // ========== 评论相关 ==========
    // ✅ 获取文章评论
    async getPostComments(postId, page = 0, size = 20) {
        console.log(`💬 获取文章评论: postId=${postId}, page=${page}, size=${size}`);
        
        try {
            const response = await this.request(`/api/comments/post/${postId}?page=${page}&size=${size}`);
            
            // 🔥 处理不同的响应格式
            if (response && response.success !== undefined) {
                // 格式: { success, data, message }
                console.log('📦 响应格式: ResponseWrapper');
                return response;
            } else if (Array.isArray(response)) {
                // 格式: 直接数组
                console.log('📦 响应格式: 直接数组');
                return { success: true, data: response };
            } else if (response && response.data !== undefined) {
                // 格式: { data: [...] }
                console.log('📦 响应格式: 数据对象');
                return { success: true, data: response.data, message: response.message };
            } else {
                // 未知格式
                console.log('📦 响应格式: 未知');
                return { success: true, data: [] };
            }
            
        } catch (error) {
            console.error('❌ 获取评论失败:', error);
            throw error;
        }
    }
    
    // 获取评论的回复
    async getCommentReplies(commentId, page = 0, size = 20) {
        console.log(`💬 获取评论回复: commentId=${commentId}`);
        return this.request(`/api/comments/${commentId}/replies?page=${page}&size=${size}`);
    }
    
    // 🔥 关键修复：创建评论 - 使用正确的数据格式
    async createComment(commentData) {
        console.log('📝 创建评论，原始数据:', commentData);
        
        // 🔥 关键修复：确保使用后端期望的对象格式
        let requestData;
        
        if (commentData.post && commentData.author) {
            // 情况1：已经是正确的对象格式（从comment.js发送的）
            console.log('✅ 数据格式正确，直接使用');
            requestData = commentData;
        } else {
            // 情况2：需要转换格式
            console.log('🔄 转换数据格式...');
            requestData = {
                content: commentData.content,
                post: { id: parseInt(commentData.postId || commentData.post?.id) },
                author: { id: parseInt(commentData.authorId || commentData.author?.id) },
                parentComment: commentData.parentCommentId ? 
                    { id: parseInt(commentData.parentCommentId) } : null
            };
        }
        
        console.log('📤 最终提交的评论数据:', requestData);
        
        // 🔥 验证数据格式
        console.log('🧪 数据格式验证:');
        console.log('- post 类型:', typeof requestData.post);
        console.log('- post.id 值:', requestData.post?.id);
        console.log('- author 类型:', typeof requestData.author);
        console.log('- author.id 值:', requestData.author?.id);
        console.log('- parentComment 类型:', typeof requestData.parentComment);
        console.log('- parentComment.id 值:', requestData.parentComment?.id);
        
        try {
            const response = await this.request('/api/comments', {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
            
            console.log('✅ 评论创建成功:', response);
            return response;
            
        } catch (error) {
            console.error('❌ 创建评论失败:', error);
            
            // 🔥 详细错误分析
            if (error.message.includes('评论必须关联文章')) {
                console.error('❌ 文章关联问题分析:');
                console.error('- 提交的文章ID:', requestData.post?.id);
                console.error('- 文章是否存在: 需要验证');
                
                // 测试文章是否存在
                if (requestData.post?.id) {
                    try {
                        const postResponse = await fetch(`${this.baseURL}/api/posts/${requestData.post.id}`);
                        console.log('📡 文章检查结果:', postResponse.status);
                        if (postResponse.ok) {
                            console.log('✅ 文章存在');
                        } else {
                            console.error('❌ 文章不存在');
                        }
                    } catch (postError) {
                        console.error('❌ 检查文章失败:', postError);
                    }
                }
            }
            
            throw error;
        }
    }
    
    // 更新评论
    async updateComment(commentId, content) {
        console.log(`✏️ 更新评论: ${commentId}`);
        return this.request(`/api/comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify({ content })
        });
    }
    
    // 删除评论
    async deleteComment(commentId) {
        console.log(`🗑️ 删除评论: ${commentId}`);
        return this.request(`/api/comments/${commentId}`, { 
            method: 'DELETE' 
        });
    }
    
    // 点赞评论
    async likeComment(commentId) {
        console.log(`❤️ 点赞评论: ${commentId}`);
        return this.request(`/api/comments/${commentId}/like`, { 
            method: 'POST' 
        });
    }
    
    // 取消点赞评论
    async unlikeComment(commentId) {
        console.log(`💔 取消点赞评论: ${commentId}`);
        return this.request(`/api/comments/${commentId}/like`, { 
            method: 'DELETE' 
        });
    }
    
    // 用户评论列表
    async getUserComments(userId, page = 0, size = 20) {
        console.log(`👤 获取用户评论: userId=${userId}`);
        return this.request(`/api/users/${userId}/comments?page=${page}&size=${size}`);
    }
    
    // ========== 用户相关 ==========
    async getUserProfile(userId) {
        return this.request(`/api/users/${userId}`);
    }
    
    async updateUserProfile(userId, profileData) {
        return this.request(`/api/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }
    
    async changePassword(passwordData) {
        return this.request('/api/users/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData)
        });
    }
    
    async followUser(userId) {
        return this.request(`/api/users/${userId}/follow`, { method: 'POST' });
    }
    
    async unfollowUser(userId) {
        return this.request(`/api/users/${userId}/follow`, { method: 'DELETE' });
    }
    
    // ========== 文件上传 ==========
    async uploadFile(formData) {
        const url = `${this.baseURL}/api/upload`;
        const token = localStorage.getItem('xuebao_token');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            body: formData
        });
        
        if (!response.ok) throw new Error(`上传失败: ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(data.message || '上传失败');
        return data.data;
    }
    
    // 🔥 新增：测试评论创建功能
    async testCreateComment(postId, authorId, content = '测试评论') {
        console.log('🧪 测试评论创建功能...');
        
        const testData = {
            content: content,
            post: { id: parseInt(postId) },
            author: { id: parseInt(authorId) },
            parentComment: null
        };
        
        console.log('🧪 测试数据:', testData);
        
        try {
            const result = await this.createComment(testData);
            console.log('✅ 测试评论创建成功:', result);
            return result;
        } catch (error) {
            console.error('❌ 测试评论创建失败:', error);
            throw error;
        }
    }
}

// 创建全局实例
window.API = new API();
console.log('✅ API实例创建完成');

// 🔥 添加调试功能
window.debugAPI = {
    // 测试评论创建
    testComment: async function(postId, authorId, content = '调试评论') {
        console.log('🧪 调试评论创建...');
        
        const testData = {
            content: content,
            post: { id: parseInt(postId) },
            author: { id: parseInt(authorId) },
            parentComment: null
        };
        
        console.log('📤 调试数据:', testData);
        
        try {
            const response = await fetch('http://localhost:8081/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('xuebao_token')}`
                },
                body: JSON.stringify(testData)
            });
            
            console.log('📡 调试响应状态:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ 调试失败:', errorText);
                return { success: false, error: errorText };
            }
            
            const result = await response.json();
            console.log('✅ 调试成功:', result);
            return { success: true, data: result };
            
        } catch (error) {
            console.error('❌ 调试错误:', error);
            return { success: false, error: error.message };
        }
    },
    
    // 检查文章是否存在
    checkPost: async function(postId) {
        console.log('🔍 检查文章是否存在:', postId);
        
        try {
            const response = await fetch(`http://localhost:8081/api/posts/${postId}`);
            console.log('📡 文章检查状态:', response.status);
            
            if (response.ok) {
                const post = await response.json();
                console.log('✅ 文章存在:', post);
                return { exists: true, data: post };
            } else {
                console.error('❌ 文章不存在或无法访问');
                return { exists: false, status: response.status };
            }
        } catch (error) {
            console.error('❌ 检查文章失败:', error);
            return { exists: false, error: error.message };
        }
    },
    
    // 创建调试面板
    createDebugPanel: function() {
        const panel = document.createElement('div');
        panel.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #2c3e50; color: white; padding: 15px; border-radius: 8px; z-index: 10000; font-family: Arial; max-width: 300px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                <h4 style="margin: 0 0 10px 0;">🐛 API调试面板</h4>
                <div style="font-size: 12px; margin-bottom: 10px; background: rgba(255,255,255,0.1); padding: 8px; border-radius: 4px;">
                    <div>文章ID: <input id="debug-post-id" type="number" value="15" style="width: 60px; padding: 2px;"></div>
                    <div>用户ID: <input id="debug-user-id" type="number" value="1" style="width: 60px; padding: 2px;"></div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <button onclick="debugAPI.testDebugComment()" style="padding: 8px 12px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        测试评论
                    </button>
                    <button onclick="debugAPI.checkDebugPost()" style="padding: 8px 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        检查文章
                    </button>
                    <button onclick="this.parentElement.parentElement.remove()" style="padding: 8px 12px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        关闭
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }
};

// 调试方法
window.debugAPI.testDebugComment = async function() {
    const postId = document.getElementById('debug-post-id').value || 15;
    const userId = document.getElementById('debug-user-id').value || 1;
    
    console.log('🧪 开始调试评论创建...');
    const result = await window.debugAPI.testComment(postId, userId, '这是调试评论内容');
    
    if (result.success) {
        alert('✅ 调试评论创建成功！');
    } else {
        alert('❌ 调试评论创建失败: ' + result.error);
    }
};

window.debugAPI.checkDebugPost = async function() {
    const postId = document.getElementById('debug-post-id').value || 15;
    
    console.log('🔍 开始检查文章...');
    const result = await window.debugAPI.checkPost(postId);
    
    if (result.exists) {
        alert('✅ 文章存在: ' + result.data.title);
    } else {
        alert('❌ 文章不存在或无法访问');
    }
};

// 自动创建调试面板
setTimeout(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.debugAPI.createDebugPanel();
        console.log('✅ 调试面板已创建');
    }
}, 2000);

// 验证API方法
setTimeout(() => {
    console.log('🔍 验证API方法:');
    console.log('API对象:', window.API);
    console.log('API.createComment:', typeof window.API?.createComment);
    console.log('API.getPostComments:', typeof window.API?.getPostComments);
    
    // 验证数据格式
    console.log('🧪 验证数据格式示例:');
    const exampleData = {
        content: "测试评论",
        post: { id: 15 },           // ✅ 对象格式
        author: { id: 1 },          // ✅ 对象格式
        parentComment: null         // ✅ 对象格式
    };
    console.log('✅ 正确数据格式示例:', exampleData);
}, 100);