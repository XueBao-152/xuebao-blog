// js/comment.js - 修复版（包含正确的回复功能）
class CommentManager {
    // 🔥 修复后的 loadComments 方法
    static async loadComments(postId) {
        try {
            console.log(`💬 加载评论: id=${postId}`);
            
            const container = document.getElementById('commentsContainer');
            if (container) {
                container.innerHTML = `
                    <div class="loading">
                        <div class="loading-spinner"></div>
                        <p>正在加载评论...</p>
                    </div>
                `;
            }
            
            // 调用 API
            console.log(`📡 调用 API.getPostComments(${postId})`);
            const response = await window.API.getPostComments(postId);
            console.log('📦 API 响应:', response);
            
            // 🔥 关键修复：处理不同的响应格式
            let commentsData = [];
            
            if (response && typeof response === 'object') {
                // 情况1: { success: true, data: [...], message: "获取成功" }
                if (response.success !== undefined && response.data !== undefined) {
                    commentsData = response.data || [];
                }
                // 情况2: 直接数组
                else if (Array.isArray(response)) {
                    commentsData = response;
                }
                // 情况3: 其他格式
                else {
                    commentsData = response || [];
                }
            }
            
            console.log(`📊 解析后的评论数据:`, commentsData);
            console.log(`📊 评论数量: ${commentsData.length}`);
            
            // 渲染评论
            this.renderComments(commentsData);
            
            // 🔥 新增：为每个评论加载回复
            setTimeout(() => {
                commentsData.forEach(comment => {
                    const commentData = comment.data || comment;
                    if (commentData.id) {
                        this.loadAndShowReplies(commentData.id);
                    }
                });
            }, 500);
            
        } catch (error) {
            console.error('❌ 加载评论失败:', error);
            this.showEmptyComments('加载评论失败: ' + error.message);
        }
    }
    
    // 🔥 修复后的 renderComments 方法
    static renderComments(comments) {
        const container = document.getElementById('commentsContainer');
        if (!container) {
            console.error('❌ 找不到评论容器');
            return;
        }
        
        console.log('🎨 渲染评论，数量:', comments.length);
        
        if (!comments || comments.length === 0) {
            container.innerHTML = `
                <div class="no-comments" style="text-align: center; padding: 40px; color: #666;">
                    <i class="far fa-comment-slash" style="font-size: 48px; opacity: 0.5; margin-bottom: 20px;"></i>
                    <p style="font-size: 18px; margin: 10px 0;">暂无评论</p>
                    <p style="color: #888;">快来发表第一条评论吧！</p>
                </div>
            `;
            return;
        }
        
        // 渲染评论列表
        container.innerHTML = comments.map(comment => this.renderCommentItem(comment)).join('');
    }
    
    // 🔥 修复后的 renderCommentItem 方法
    static renderCommentItem(comment) {
        // 🔥 安全地获取数据
        const commentData = comment.data || comment;
        const author = commentData.author || {};
        const authorName = author.username || author.nickname || '匿名用户';
        const content = commentData.content || '';
        const createdAt = commentData.createdAt || commentData.created_at || new Date().toISOString();
        const likeCount = commentData.likeCount || commentData.likes || 0;
        const commentId = commentData.id;
        
        return `
            <div class="comment-item" data-comment-id="${commentId}" style="border-bottom: 1px solid #eee; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                    <div style="width: 40px; height: 40px; background: #3498db; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-right: 10px;">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div style="font-weight: bold; color: #2c3e50;">${this.escapeHtml(authorName)}</div>
                        <div style="font-size: 12px; color: #888;">
                            ${new Date(createdAt).toLocaleDateString()} ${new Date(createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>
                <div style="line-height: 1.6; color: #333; margin: 10px 0 15px 0;">
                    ${this.escapeHtml(content).replace(/\n/g, '<br>')}
                </div>
                <div style="display: flex; gap: 20px; color: #666;">
                    <button class="btn btn-text" onclick="CommentManager.toggleLike(${commentId})" style="background: none; border: none; color: #e74c3c; cursor: pointer;">
                        <i class="far fa-heart"></i> 点赞
                    </button>
                    <button class="btn btn-text" onclick="CommentManager.showReplyForm(${commentId}, '${this.escapeHtml(authorName)}')" style="background: none; border: none; color: #3498db; cursor: pointer;">
                        <i class="fas fa-reply"></i> 回复
                    </button>
                </div>
                
                <!-- 🔥 回复表单 -->
                <div class="reply-form" id="reply-form-${commentId}" style="display: none; margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <textarea id="reply-input-${commentId}" 
                              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px; font-family: inherit;" 
                              rows="3" 
                              placeholder="回复 ${this.escapeHtml(authorName)}..."></textarea>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn btn-primary btn-sm" onclick="CommentManager.submitReply(${commentId})" style="padding: 8px 16px;">
                            发表回复
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="CommentManager.hideReplyForm(${commentId})" style="padding: 8px 16px;">
                            取消
                        </button>
                    </div>
                </div>
                
                <!-- 🔥 回复列表容器 -->
                <div class="replies-container" id="replies-${commentId}" style="margin-left: 30px; margin-top: 10px;"></div>
            </div>
        `;
    }
    
    // 🔥 修复后的 submitComment 方法 - 关键修改
    static async submitComment(event, postId) {
        event.preventDefault();
        console.log('📝 提交评论，文章ID:', postId);
        
        try {
            // 1. 确保获取用户ID
            const user = JSON.parse(localStorage.getItem('user_info') || '{}');
            if (!user.id) {
                alert('请先登录后再评论');
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                return;
            }
            
            // 2. 获取评论内容
            const contentInput = document.getElementById('commentContent');
            if (!contentInput) {
                alert('找不到评论输入框');
                return;
            }
            
            const content = contentInput.value.trim();
            if (!content) {
                alert('请输入评论内容');
                contentInput.focus();
                return;
            }
            
            console.log('📤 准备提交评论:', { 
                content: content, 
                postId: postId, 
                userId: user.id 
            });
            
            // 3. 🔥 关键修复：使用后端期望的对象格式
            const commentData = {
                content: content,
                post: { id: parseInt(postId) },      // 🔥 对象格式
                author: { id: parseInt(user.id) },   // 🔥 对象格式
                parentComment: null                  // 🔥 对象格式
            };
            
            console.log('📤 提交数据:', commentData);
            
            // 4. 显示加载状态
            if (window.Utils && window.Utils.showLoading) {
                window.Utils.showLoading('发表中...');
            }
            
            // 5. 调用API
            const result = await window.API.createComment(commentData);
            console.log('✅ 评论创建成功:', result);
            
            // 6. 处理成功
            if (window.Utils && window.Utils.hideLoading) {
                window.Utils.hideLoading();
            }
            
            alert('评论发表成功！');
            contentInput.value = '';
            
            // 7. 刷新评论列表
            await this.loadComments(postId);
            
        } catch (error) {
            console.error('❌ 发表评论失败:', error);
            
            if (window.Utils && window.Utils.hideLoading) {
                window.Utils.hideLoading();
            }
            
            // 处理401错误
            if (error.message.includes('401') || error.status === 401) {
                alert('登录已过期，请重新登录');
                localStorage.removeItem('xuebao_token');
                localStorage.removeItem('user_info');
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            } else {
                alert('发表评论失败: ' + error.message);
            }
        }
    }
    
    // 🔥 新增：显示回复表单
    static showReplyForm(commentId, authorName) {
        console.log('💬 显示回复表单，评论ID:', commentId, '作者:', authorName);
        
        try {
            // 隐藏其他所有回复表单
            document.querySelectorAll('.reply-form').forEach(form => {
                form.style.display = 'none';
            });
            
            // 显示当前评论的回复表单
            const replyForm = document.getElementById(`reply-form-${commentId}`);
            if (replyForm) {
                replyForm.style.display = 'block';
                const textarea = replyForm.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                    textarea.placeholder = `回复 ${authorName}...`;
                }
            } else {
                console.error('❌ 找不到回复表单:', `reply-form-${commentId}`);
            }
            
        } catch (error) {
            console.error('❌ 显示回复表单失败:', error);
        }
    }
    
    // 🔥 新增：隐藏回复表单
    static hideReplyForm(commentId) {
        const replyForm = document.getElementById(`reply-form-${commentId}`);
        if (replyForm) {
            replyForm.style.display = 'none';
            const textarea = document.getElementById(`reply-input-${commentId}`);
            if (textarea) textarea.value = '';
        }
    }
    
    // 🔥 修复后的 submitReply 方法 - 关键修改
    static async submitReply(commentId) {
        console.log('📤 提交回复，目标评论ID:', commentId);
        
        try {
            const textarea = document.getElementById(`reply-input-${commentId}`);
            if (!textarea) {
                throw new Error('找不到回复输入框');
            }
            
            const content = textarea.value.trim();
            if (!content) {
                alert('请输入回复内容');
                textarea.focus();
                return;
            }
            
            // 检查登录状态
            const user = JSON.parse(localStorage.getItem('user_info') || '{}');
            if (!user.id) {
                alert('请先登录后再回复');
                window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                return;
            }
            
            // 获取文章ID
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id') || 15;
            
            console.log('📤 准备提交回复数据...');
            
            // 🔥 关键修复：使用后端期望的对象格式
            const replyData = {
                content: content,
                post: { id: parseInt(postId) },           // 🔥 对象格式
                author: { id: parseInt(user.id) },        // 🔥 对象格式
                parentComment: { id: parseInt(commentId) } // 🔥 对象格式
            };
            
            console.log('📤 回复数据:', replyData);
            
            // 显示加载状态
            if (window.Utils && window.Utils.showLoading) {
                window.Utils.showLoading('发表回复中...');
            }
            
            // 调用API创建回复
            const response = await fetch('http://localhost:8081/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('xuebao_token')}`
                },
                body: JSON.stringify(replyData)
            });
            
            console.log('📡 回复响应状态:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('回复失败: HTTP ' + response.status + ' - ' + errorText);
            }
            
            const result = await response.json();
            console.log('✅ 回复成功:', result);
            
            // 隐藏加载状态
            if (window.Utils && window.Utils.hideLoading) {
                window.Utils.hideLoading();
            }
            
            // 清空输入框并隐藏表单
            textarea.value = '';
            this.hideReplyForm(commentId);
            
            alert('回复发表成功！');
            
            // 🔥 重新加载整个评论列表
            await this.loadComments(postId);
            
        } catch (error) {
            console.error('❌ 回复失败:', error);
            
            if (window.Utils && window.Utils.hideLoading) {
                window.Utils.hideLoading();
            }
            
            if (error.message.includes('401')) {
                alert('登录已过期，请重新登录');
                localStorage.removeItem('xuebao_token');
                localStorage.removeItem('user_info');
                window.location.href = 'login.html';
            } else {
                alert('回复失败: ' + error.message);
            }
        }
    }
    
    // 🔥 新增：加载回复
    static async loadReplies(commentId) {
        console.log('📥 加载回复，评论ID:', commentId);
        
        try {
            const response = await fetch(`http://localhost:8081/api/comments/${commentId}/replies`);
            
            if (!response.ok) {
                console.log('该评论暂无回复或API不可用');
                return [];
            }
            
            const result = await response.json();
            console.log('📥 回复数据:', result);
            
            if (result.success && result.data) {
                return result.data;
            }
            return [];
            
        } catch (error) {
            console.error('❌ 加载回复失败:', error);
            return [];
        }
    }
    
    // 🔥 新增：加载并显示回复
    static async loadAndShowReplies(commentId) {
        console.log('📥 加载并显示回复，评论ID:', commentId);
        
        try {
            const replies = await this.loadReplies(commentId);
            if (replies.length === 0) {
                console.log('该评论暂无回复');
                return;
            }
            
            this.renderReplies(commentId, replies);
            
        } catch (error) {
            console.error('❌ 加载回复失败:', error);
        }
    }
    
    // 🔥 新增：渲染回复列表
    static renderReplies(commentId, replies) {
        console.log('🎨 渲染回复，评论ID:', commentId, '数量:', replies.length);
        
        const container = document.getElementById(`replies-${commentId}`);
        if (!container) {
            console.error('❌ 找不到回复容器:', `replies-${commentId}`);
            return;
        }
        
        const html = replies.map(reply => {
            const replyData = reply.data || reply;
            const author = replyData.author || {};
            const authorName = author.username || author.nickname || '用户';
            const content = replyData.content || '';
            const createdAt = replyData.createdAt || replyData.created_at || new Date().toISOString();
            
            return `
                <div class="comment-reply" data-comment-id="${replyData.id}" style="padding: 10px; margin-bottom: 8px; background: white; border-radius: 6px; border-left: 3px solid #3498db;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-weight: bold; color: #2c3e50;">${this.escapeHtml(authorName)}</span>
                        <span style="color: #7f8c8d; font-size: 0.85em;">${new Date(createdAt).toLocaleDateString()} ${new Date(createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div style="color: #34495e; line-height: 1.5; margin-bottom: 8px;">${this.escapeHtml(content).replace(/\n/g, '<br>')}</div>
                    <div style="display: flex; gap: 15px; font-size: 0.85em;">
                        <button class="btn-like" onclick="CommentManager.toggleLike(${replyData.id})" style="background: none; border: none; color: #e74c3c; cursor: pointer;">
                            <i class="far fa-heart"></i> 点赞
                        </button>
                        <button class="btn-reply" onclick="CommentManager.showReplyForm(${replyData.id}, '${this.escapeHtml(authorName)}')" style="background: none; border: none; color: #3498db; cursor: pointer;">
                            <i class="fas fa-reply"></i> 回复
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    }
    
    // 删除评论
    static async deleteComment(commentId) {
        const confirmed = await Utils.confirm('确定要删除这条评论吗？');
        if (!confirmed) return;
        
        try {
            Utils.showLoading('删除中...');
            await API.deleteComment(commentId);
            Utils.hideLoading();
            Utils.showMessage('评论删除成功', 'success');
            
            // 重新加载评论
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            this.loadComments(postId);
            
        } catch (error) {
            Utils.hideLoading();
            console.error('❌ 删除评论失败:', error);
            Utils.showMessage('删除失败: ' + error.message, 'error');
        }
    }
    
    // 编辑评论
    static editComment(commentId) {
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (!commentElement) return;
        
        const contentElement = commentElement.querySelector('.comment-content');
        const currentContent = contentElement.textContent;
        
        contentElement.innerHTML = `
            <form onsubmit="CommentManager.saveComment(event, ${commentId})" class="edit-form">
                <textarea class="form-control" required>${this.escapeHtml(currentContent)}</textarea>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline btn-sm" 
                            onclick="CommentManager.cancelEdit(${commentId})">取消</button>
                    <button type="submit" class="btn btn-primary btn-sm">保存</button>
                </div>
            </form>
        `;
    }
    
    // 保存编辑的评论
    static async saveComment(event, commentId) {
        event.preventDefault();
        
        const form = event.target;
        const content = form.querySelector('textarea').value.trim();
        
        if (!content) {
            Utils.showMessage('评论内容不能为空', 'error');
            return;
        }
        
        try {
            Utils.showLoading('保存中...');
            await API.updateComment(commentId, { content });
            Utils.hideLoading();
            Utils.showMessage('评论更新成功', 'success');
            
            // 重新加载评论
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');
            this.loadComments(postId);
            
        } catch (error) {
            Utils.hideLoading();
            console.error('❌ 保存评论失败:', error);
            Utils.showMessage('保存失败: ' + error.message, 'error');
        }
    }
    
    // 取消编辑
    static cancelEdit(commentId) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        this.loadComments(postId);
    }
    
    // 点赞/取消点赞评论
    static async toggleLike(commentId) {
        if (!Auth.protectPage()) return;
        
        try {
            Utils.showMessage('点赞功能开发中...', 'info');
        } catch (error) {
            console.error('❌ 点赞失败:', error);
        }
    }
    
    // 回复功能
    static replyTo(commentId, authorName) {
        console.log('💬 回复评论:', commentId, authorName);
        this.showReplyForm(commentId, authorName);
    }
    
    // 检查是否可以编辑评论
    static canEditComment(comment) {
        const auth = Auth.checkAuth();
        if (!auth.isLoggedIn) return false;
        
        const commentData = comment.data || comment;
        const commentAuthorId = commentData.authorId || commentData.author?.id;
        return commentAuthorId === auth.user.id;
    }
    
    // 显示空评论状态
    static showEmptyComments(message) {
        const container = document.getElementById('commentsContainer');
        if (container) {
            container.innerHTML = `
                <div class="no-comments" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; opacity: 0.5; margin-bottom: 20px;"></i>
                    <p style="font-size: 18px; margin: 10px 0;">${this.escapeHtml(message)}</p>
                </div>
            `;
        }
    }
    
    // HTML转义
    static escapeHtml(unsafe) {
        if (!unsafe) return '';
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // 格式化评论内容（支持换行）
    static formatCommentContent(content) {
        if (!content) return '';
        return this.escapeHtml(content).replace(/\n/g, '<br>');
    }
}

// 添加到全局
window.CommentManager = CommentManager;
console.log('✅ CommentManager 已加载（包含正确的回复功能）');