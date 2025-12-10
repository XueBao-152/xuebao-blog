package com.xuebao.demo.enums;

public enum Role {
    // 定义系统角色常量
    SUPER_ADMIN("超级管理员", 100),
    ADMIN("管理员", 90),
    EDITOR("编辑", 70),
    AUTHOR("作者", 50),
    USER("普通用户", 30),
    GUEST("游客", 10);

    // 角色属性
    private final String displayName; // 显示名称
    private final int permissionLevel; // 权限等级

    // 私有构造函数
    private Role(String displayName, int permissionLevel) {
        this.displayName = displayName;
        this.permissionLevel = permissionLevel;
    }

    // Getter 方法
    public String getDisplayName() {
        return displayName;
    }

    public int getPermissionLevel() {
        return permissionLevel;
    }

    // 实用方法：根据权限等级判断是否具有某种权限
    public boolean hasPermission(int requiredLevel) {
        return this.permissionLevel >= requiredLevel;
    }

    // 实用方法：判断当前角色是否比另一个角色权限更高
    public boolean isHigherThan(Role otherRole) {
        return this.permissionLevel > otherRole.permissionLevel;
    }

    // 静态方法：根据名称查找角色（不区分大小写）
    public static Role fromName(String name) {
        for (Role role : values()) {
            if (role.name().equalsIgnoreCase(name)) {
                return role;
            }
        }
        throw new IllegalArgumentException("未知的角色: " + name);
    }
}