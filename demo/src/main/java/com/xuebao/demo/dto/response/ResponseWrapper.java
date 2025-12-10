package com.xuebao.demo.dto.response;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ResponseWrapper<T> {
    private boolean success;
    private String code;
    private String message;
    private T data;
    private String timestamp;
    private String path;

    public ResponseWrapper() {
        this.timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    // Getter和Setter方法
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    // ✅ 成功响应静态方法
    public static <T> ResponseWrapper<T> success(T data) {
        ResponseWrapper<T> wrapper = new ResponseWrapper<>();
        wrapper.setSuccess(true);
        wrapper.setCode("200");
        wrapper.setMessage("操作成功");
        wrapper.setData(data);
        return wrapper;
    }

    public static <T> ResponseWrapper<T> success(String message, T data) {
        ResponseWrapper<T> wrapper = new ResponseWrapper<>();
        wrapper.setSuccess(true);
        wrapper.setCode("200");
        wrapper.setMessage(message);
        wrapper.setData(data);
        return wrapper;
    }

    public static <T> ResponseWrapper<T> created(T data) {
        ResponseWrapper<T> wrapper = new ResponseWrapper<>();
        wrapper.setSuccess(true);
        wrapper.setCode("201");
        wrapper.setMessage("创建成功");
        wrapper.setData(data);
        return wrapper;
    }

    public static <T> ResponseWrapper<T> created(String message, T data) {
        ResponseWrapper<T> wrapper = new ResponseWrapper<>();
        wrapper.setSuccess(true);
        wrapper.setCode("201");
        wrapper.setMessage(message);
        wrapper.setData(data);
        return wrapper;
    }

    // ✅ 修正：支持int类型状态码
    public static <T> ResponseWrapper<T> error(int code, String message) {
        ResponseWrapper<T> wrapper = new ResponseWrapper<>();
        wrapper.setSuccess(false);
        wrapper.setCode(String.valueOf(code));  // 将int转换为String
        wrapper.setMessage(message);
        wrapper.setData(null);
        return wrapper;
    }

    // ✅ 保持原有的String类型方法
    public static <T> ResponseWrapper<T> error(String code, String message) {
        ResponseWrapper<T> wrapper = new ResponseWrapper<>();
        wrapper.setSuccess(false);
        wrapper.setCode(code);
        wrapper.setMessage(message);
        wrapper.setData(null);
        return wrapper;
    }

    // ✅ 支持HttpStatus枚举
    public static <T> ResponseWrapper<T> error(HttpStatus status, String message) {
        return error(String.valueOf(status.value()), message);
    }

    public static <T> ResponseWrapper<T> error(HttpStatusCode status, String message) {
        return error(String.valueOf(status.value()), message);
    }

    // ✅ 带数据的错误响应（int类型）
    public static <T> ResponseWrapper<T> error(int code, String message, T data) {
        ResponseWrapper<T> wrapper = new ResponseWrapper<>();
        wrapper.setSuccess(false);
        wrapper.setCode(String.valueOf(code));  // 将int转换为String
        wrapper.setMessage(message);
        wrapper.setData(data);
        return wrapper;
    }

    // ✅ 带数据的错误响应（String类型）
    public static <T> ResponseWrapper<T> error(String code, String message, T data) {
        ResponseWrapper<T> wrapper = new ResponseWrapper<>();
        wrapper.setSuccess(false);
        wrapper.setCode(code);
        wrapper.setMessage(message);
        wrapper.setData(data);
        return wrapper;
    }

    // ✅ 带数据的错误响应（HttpStatus类型）
    public static <T> ResponseWrapper<T> error(HttpStatus status, String message, T data) {
        return error(String.valueOf(status.value()), message, data);
    }

    // 链式构建器模式
    public ResponseWrapper<T> success(boolean success) {
        this.success = success;
        return this;
    }

    public ResponseWrapper<T> code(String code) {
        this.code = code;
        return this;
    }

    public ResponseWrapper<T> message(String message) {
        this.message = message;
        return this;
    }

    public ResponseWrapper<T> data(T data) {
        this.data = data;
        return this;
    }

    public ResponseWrapper<T> path(String path) {
        this.path = path;
        return this;
    }

    public ResponseWrapper<T> timestamp(String timestamp) {
        this.timestamp = timestamp;
        return this;
    }

    // toString方法
    @Override
    public String toString() {
        return "ResponseWrapper{" +
                "success=" + success +
                ", code='" + code + '\'' +
                ", message='" + message + '\'' +
                ", data=" + data +
                ", timestamp='" + timestamp + '\'' +
                ", path='" + path + '\'' +
                '}';
    }
}