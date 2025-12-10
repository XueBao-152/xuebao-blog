// 应用配置
const Config = {
    // API配置
    API_BASE_URL: 'http://localhost:8081/api',
    
    // 应用配置
    APP_NAME: '学宝博客',
    APP_VERSION: '1.0.0',
    
    // 分页配置
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        MAX_PAGE_SIZE: 50
    },
    
    // 本地存储键名
    STORAGE_KEYS: {
        TOKEN: 'xuebao_token',
        USER: 'xuebao_user',
        SETTINGS: 'xuebao_settings'
    },
    
    // 主题配置
    THEME: {
        PRIMARY_COLOR: '#2563eb',
        SUCCESS_COLOR: '#10b981',
        DANGER_COLOR: '#ef4444',
        WARNING_COLOR: '#f59e0b'
    },
    
    // 功能开关
    FEATURES: {
        REGISTRATION: true,
        COMMENTS: true,
        LIKES: true,
        SEARCH: true
    }
};

// 添加到全局
window.Config = Config;