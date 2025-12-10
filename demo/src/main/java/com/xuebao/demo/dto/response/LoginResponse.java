package com.xuebao.demo.dto.response;


/**
 * 登录响应数据传输对象
 */
public class LoginResponse {
    private boolean success;
    private String message;
    private String token; // JWT令牌
    private UserProfileDto user; // 用户公开信息

    // 登录失败时使用的构造器
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // 登录成功时使用的构造器
    public LoginResponse(boolean success, String message, String token, UserProfileDto user) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.user = user;
    }

    // Getter 和 Setter 方法
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public UserProfileDto getUser() { return user; }
    public void setUser(UserProfileDto user) { this.user = user; }
}