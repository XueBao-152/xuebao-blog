package com.xuebao.demo.handler;

import com.xuebao.demo.dto.response.ResponseWrapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 处理参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseWrapper<?>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getAllErrors().stream()
                .map(ObjectError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        // ✅ 使用int类型状态码
        ResponseWrapper<?> response = ResponseWrapper.error(400, message);
        return ResponseEntity.badRequest().body(response);
    }

    // 处理业务异常
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResponseWrapper<?>> handleBusinessException(BusinessException e) {
        // ✅ 使用int类型状态码
        ResponseWrapper<?> response = ResponseWrapper.error(e.getCode(), e.getMessage());
        return new ResponseEntity<>(response, HttpStatus.valueOf(e.getCode()));
    }

    // 处理认证异常
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ResponseWrapper<?>> handleAuthenticationException(AuthenticationException e) {
        // ✅ 使用int类型状态码
        ResponseWrapper<?> response = ResponseWrapper.error(401, "未认证或认证已过期");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    // 处理权限不足异常
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseWrapper<?>> handleAccessDeniedException(AccessDeniedException e) {
        // ✅ 使用int类型状态码
        ResponseWrapper<?> response = ResponseWrapper.error(403, "权限不足");
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    // 处理404异常
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ResponseWrapper<?>> handleNotFoundException(NoHandlerFoundException e) {
        // ✅ 使用int类型状态码
        ResponseWrapper<?> response = ResponseWrapper.error(404, "接口不存在");
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    // 处理其他所有异常
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseWrapper<?>> handleException(Exception e) {
        e.printStackTrace();
        // ✅ 使用int类型状态码
        ResponseWrapper<?> response = ResponseWrapper.error(500, "服务器内部错误");
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}