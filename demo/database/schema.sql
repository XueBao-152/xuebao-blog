-- 学宝博客系统 - PostgreSQL数据库脚本
-- 创建时间: 2024年

-- 用户表
CREATE TABLE IF NOT EXISTS users (
                                     id BIGSERIAL PRIMARY KEY,
                                     username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
                                     id BIGSERIAL PRIMARY KEY,
                                     title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- 评论表（支持无限层级回复）
CREATE TABLE IF NOT EXISTS comments (
                                        id BIGSERIAL PRIMARY KEY,
                                        content TEXT NOT NULL,
                                        post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    like_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- 插入示例数据
INSERT INTO users (username, email, password, nickname, role) VALUES
                                                                  ('admin', 'admin@xuebao.com', '$2a$10$exampleHash', '系统管理员', 'ADMIN'),
                                                                  ('user1', 'user1@xuebao.com', '$2a$10$exampleHash', '测试用户1', 'USER')
    ON CONFLICT (username) DO NOTHING;

INSERT INTO posts (title, content, summary, author_id) VALUES
                                                           ('欢迎使用学宝博客', '欢迎使用学宝博客系统！这是一个基于Spring Boot和PostgreSQL构建的全栈博客系统。', '欢迎使用学宝博客系统介绍', 1),
                                                           ('Spring Boot入门指南', '本文将介绍Spring Boot的基本概念和快速入门方法。', 'Spring Boot快速入门教程', 1)
    ON CONFLICT DO NOTHING;

INSERT INTO comments (content, post_id, author_id, parent_comment_id) VALUES
                                                                          ('很好的博客系统！', 1, 2, NULL),
                                                                          ('感谢分享！', 1, 1, 1),
                                                                          ('期待更多教程！', 2, 2, NULL)
    ON CONFLICT DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);