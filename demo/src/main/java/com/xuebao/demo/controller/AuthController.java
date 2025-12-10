package com.xuebao.demo.controller;

import com.xuebao.demo.dto.request.LoginRequest;
import com.xuebao.demo.dto.request.RegisterRequest;
import com.xuebao.demo.dto.response.LoginResponse;
import com.xuebao.demo.dto.response.RegisterResponse;
import com.xuebao.demo.dto.response.ResponseWrapper;
import com.xuebao.demo.entity.User;
import com.xuebao.demo.service.UserService;
import com.xuebao.demo.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
private  final UserService userService;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;

    }

    @PostMapping("/register")
    public ResponseEntity<ResponseWrapper<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        // 调用UserService完成注册逻辑
        RegisterResponse response = userService.register(request);

        // 使用ResponseWrapper统一响应格式
        if (response.getSuccess()) {
            // 注册成功 - 返回201状态码
            ResponseWrapper<RegisterResponse> wrapper = ResponseWrapper.success("注册成功", response);
            return ResponseEntity.status(HttpStatus.CREATED).body(wrapper);
        } else {
            // 注册失败 - 返回400状态码
            ResponseWrapper<RegisterResponse> wrapper = ResponseWrapper.error(400, response.getMessage());
            return ResponseEntity.badRequest().body(wrapper);
        }
    }



}