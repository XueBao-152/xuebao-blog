package com.xuebao.demo.dto.response;

import com.xuebao.demo.entity.User;
import com.xuebao.demo.enums.Role;

import java.time.LocalDateTime;

/**
 * 用户公开信息数据传输对象 (基于你当前的User实体精简版)
 * 用于安全返回用户基本信息到前端
 */
public class UserProfileDto {
    private Long id;
    private String username;
    private String nickname;
    private String avatarUrl;
    private String bio;
    private String website;
    private Role role;
    private LocalDateTime createdAt;

    // 无参构造器 (为JSON反序列化)
    public UserProfileDto() {
    }

    // 核心构造器：从User实体转换
    public UserProfileDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.nickname = user.getNickname() != null ? user.getNickname() : user.getUsername(); // 昵称回退
        this.avatarUrl = user.getAvatarUrl();
        this.bio = user.getBio();
        this.website = user.getWebsite();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
    }

    // Getter 和 Setter 方法
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}