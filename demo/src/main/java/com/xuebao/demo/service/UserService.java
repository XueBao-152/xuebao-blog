package com.xuebao.demo.service;

import com.xuebao.demo.dto.request.LoginRequest;
import com.xuebao.demo.dto.request.RegisterRequest;
import com.xuebao.demo.dto.response.LoginResponse;
import com.xuebao.demo.dto.response.RegisterResponse;
import com.xuebao.demo.dto.response.UserProfileDto;
import com.xuebao.demo.entity.User;
import com.xuebao.demo.enums.Role;
import com.xuebao.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {


    private final UserRepository userRepository;


    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 用户注册
     */
    public RegisterResponse register(RegisterRequest request) {
        // 检查用户名是否已存在
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return new RegisterResponse(false,"用户名已经存在");
        }

        // 检查邮箱是否已存在
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return  new RegisterResponse(false,"邮箱已被注册");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // 密码加密
        user.setEmail(request.getEmail());
        user.setRole(Role.USER);
        user.setEnabled(true);

        userRepository.save(user);
        return new RegisterResponse(true,"register finished", user.getId(), generateToken(user));
    }

    /**
     * 用户登录
     */
//    public LoginResponse login(LoginRequest request) { // 注意：方法返回类型改为 LoginResponse
//        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
//
//        if (userOptional.isEmpty()) {
//            // 保持错误处理的一致性，这里可以返回LoginResponse或自定义错误响应
//            return new LoginResponse(false, "用户名或密码错误");
//        }
//
//        User user = userOptional.get();
//
//        // 验证密码
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            return new LoginResponse(false, "用户名或密码错误");
//        }
//
//        if (!user.getEnabled()) {
//            return new LoginResponse(false, "账户已被禁用");
//        }
//
//        // 生成JWT token
//        String token = generateToken(user);
//
//        // 创建用户概要信息（包含安全、非敏感信息）
//        UserProfileDto userProfile = new UserProfileDto(user);
//
//        // 返回包含完整用户信息的响应
//        return new LoginResponse(true, "successed", token, userProfile);
//    }

    private String generateToken(User user) {
        // JWT token生成逻辑（后续实现）
        return "temp-token"; // 临时返回
    }


    public Optional<User>findByUsername(String currentUsername) {
        return userRepository.findByUsername(currentUsername);
    }
}