package com.xuebao.demo.service;

import com.xuebao.demo.entity.User;
import com.xuebao.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        System.out.println("=== UserDetailsService调试 ===");
        System.out.println("查询用户: " + username);

        // 1. 查询用户
        Optional<User> userOpt = userRepository.findByUsername(username);
        System.out.println("用户存在: " + userOpt.isPresent());

        User user = userOpt.orElseThrow(() -> {
            System.out.println("❌ 用户不存在: " + username);
            return new UsernameNotFoundException("用户不存在: " + username);
        });

        System.out.println("用户数据: " + user.getUsername() + ", 角色: " + user.getRole());

        // 2. 构建UserDetails
        try {
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(user.getUsername())
                    .password(user.getPassword())
                    .roles(user.getRole().name())
                    .disabled(!user.getEnabled())
                    .build();

            System.out.println("✅ UserDetails创建成功");
            return userDetails;

        } catch (Exception e) {
            System.out.println("❌ 创建UserDetails失败: " + e.getMessage());
            throw e;
        }
    }
}