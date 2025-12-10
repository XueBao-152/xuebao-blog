package com.xuebao.demo.controller;

import com.xuebao.demo.dto.response.ResponseWrapper;
import com.xuebao.demo.entity.User;
import com.xuebao.demo.service.UserService;
import com.xuebao.demo.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 获取当前登录用户信息
     * 前端在调用这个接口
     */
    @GetMapping("/auth/me")
    public ResponseEntity<ResponseWrapper<User>> getCurrentUser(HttpServletRequest request) {
        try {
            // 从请求头获取Token
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ResponseWrapper.error(401, "未提供认证令牌"));
            }

            String token = authHeader.substring(7);

            // 验证Token
            if (!jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ResponseWrapper.error(401, "令牌无效或已过期"));
            }

            // 从Token中提取用户名
            String username = jwtUtil.extractUsername(token);

            // 查找用户
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("用户不存在: " + username));

            // 不返回密码
            user.setPassword(null);

            return ResponseEntity.ok(ResponseWrapper.success("获取成功", user));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseWrapper.error(500, "获取用户信息失败: " + e.getMessage()));
        }
    }
}