# 🎓 学宝博客系统 (XueBao Blog)

> 一个基于Spring Boot + PostgreSQL的全栈博客系统，支持文章发布、评论回复、用户认证等功能。

[![Java](https://img.shields.io/badge/Java-17-blue.svg)](https://www.java.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green.svg)](https://spring.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ 功能特性

### 后端功能
- ✅ **用户认证系统** - JWT令牌认证，支持注册/登录
- ✅ **博客文章管理** - 完整的CRUD操作，支持分类标签
- ✅ **智能评论系统** - 无限层级嵌套回复，支持点赞
- ✅ **RESTful API** - 规范的接口设计，前后端分离
- ✅ **数据库持久化** - PostgreSQL关系型数据库
- ✅ **安全防护** - Spring Security + JWT令牌

### 前端功能
- ✅ **响应式设计** - 适配PC和移动端
- ✅ **用户界面** - 登录注册、文章浏览、评论互动
- ✅ **实时交互** - 异步加载，无刷新操作
- ✅ **管理功能** - 文章发布、编辑、删除

## 🏗️ 技术栈

### 后端技术
- **框架**: Spring Boot 3.x
- **安全**: Spring Security 6.x + JWT
- **数据库**: PostgreSQL 14+ + JPA/Hibernate
- **构建工具**: Maven 3.6+
- **开发语言**: Java 17

### 前端技术
- **核心**: HTML5 + CSS3 + JavaScript (ES6+)
- **HTTP客户端**: Fetch API
- **样式**: 原生CSS3，响应式设计
- **架构**: 前后端分离

### 开发工具
- **IDE**: IntelliJ IDEA
- **数据库工具**: pgAdmin / DBeaver
- **API测试**: Postman

## 🚀 快速开始

### 环境要求
- JDK 17 或更高版本
- PostgreSQL 14 或更高版本
- Maven 3.6 或更高版本
- Git

### 数据库设置

sql
CREATE DATABASE blog_system;
\c blog_system
\i database/schema.sql
### 后端启动
bash
cd backend
mvn spring-boot:run
### 前端启动
bash
cd frontend
使用任何HTTP服务器
python -m http.server 5500
## 📡 API示例

### 用户认证
http
POST /login
Content-Type: application/json
{
"username": "admin",
"password": "password"
}
### 获取文章
http
GET /api/posts
### 创建评论
http
POST /api/comments
Authorization: Bearer {token}
{
"content": "评论内容",
"postId": 1
}
## 📁 项目结构
demo/
├── backend/ # Spring Boot后端
├── frontend/ # 前端文件
├── database/ # 数据库脚本
└── README.md # 项目说明
## 🔧 开发指南

### 代码规范
- 遵循RESTful API设计
- 统一的异常处理
- 清晰的代码注释

### 分支策略
- `main` - 生产分支
- `develop` - 开发分支
- `feature/*` - 功能分支

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件

## 📞 联系方式

- 作者: XueBao
- GitHub: XueBao-152 (https://github.com/XueBao-152)

---

**如果觉得有用，请给个⭐️ Star支持！**