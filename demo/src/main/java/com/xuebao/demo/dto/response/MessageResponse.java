package com.xuebao.demo.dto.response;

public class MessageResponse<T> {
    private int code;
    private String msg;
    private T data;

    // 构造方法、成功/失败的静态工厂方法、getter和setter...
    public MessageResponse(int code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    public static <T> MessageResponse<T> success(T data) {
        return new MessageResponse<>(200, "成功", data);
    }

    public static <T> MessageResponse<T> error(int code, String msg) {
        return new MessageResponse<>(code, msg, null);
    }

    // 省略 getter 和 setter

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}