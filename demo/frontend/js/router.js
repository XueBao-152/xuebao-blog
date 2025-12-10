// 简单路由管理
class Router {
    constructor() {
        this.routes = new Map();
        this.currentPath = '';
        this.init();
    }
    
    // 初始化路由
    init() {
        // 监听URL变化
        window.addEventListener('popstate', (e) => {
            this.handleRouteChange();
        });
        
        // 监听链接点击
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.isInternalLink(link)) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
        
        // 初始路由处理
        this.handleRouteChange();
    }
    
    // 检查是否是内部链接
    isInternalLink(link) {
        const href = link.getAttribute('href');
        return href && 
               !href.startsWith('http') && 
               !href.startsWith('mailto:') && 
               !href.startsWith('tel:') &&
               !link.getAttribute('target') &&
               !link.getAttribute('download');
    }
    
    // 导航到指定路径
    navigate(path, replace = false) {
        if (path === this.currentPath) return;
        
        if (replace) {
            window.history.replaceState(null, '', path);
        } else {
            window.history.pushState(null, '', path);
        }
        
        this.handleRouteChange();
    }
    
    // 处理路由变化
    handleRouteChange() {
        const path = window.location.pathname + window.location.search;
        this.currentPath = path;
        
        // 触发路由变化事件
        window.dispatchEvent(new CustomEvent('routechange', {
            detail: { path }
        }));
        
        // 更新页面内容
        this.loadPage();
    }
    
    // 加载页面内容
    async loadPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        
        try {
            // 显示加载状态
            App.showLoading('content', '加载中...');
            
            // 这里可以实现SPA（单页应用）的页面加载
            // 目前我们使用多页面，所以直接跳转
            
        } catch (error) {
            console.error('页面加载失败:', error);
            Utils.showMessage('页面加载失败', 'error');
        }
    }
    
    // 注册路由
    addRoute(path, handler) {
        this.routes.set(path, handler);
    }
    
    // 获取当前路由参数
    getRouteParams() {
        const searchParams = new URLSearchParams(window.location.search);
        const params = {};
        
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        
        return params;
    }
}

// 创建全局路由实例
window.Router = new Router();