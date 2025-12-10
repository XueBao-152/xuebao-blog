package com.xuebao.demo.dto.response;
public class RegisterResponse {
    private Boolean success;
    private String message;
    private Long userId;    // 成功时返回
    private String token;   // 成功时返回，用于自动登录

    // 成功时的构造函数
    public RegisterResponse(Boolean success, String message, Long userId, String token) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.token = token;
    }

    // 失败时的构造函数
    public RegisterResponse(Boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
// ... 省略 getter 和 setter
}