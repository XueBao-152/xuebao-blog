package com.xuebao.demo.repository;

import com.xuebao.demo.entity.Post;
import com.xuebao.demo.enums.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // 目前不需要写任何方法，基本的save, findAll, findById, deleteById都已存在
    List<Post> findByTitleContaining(String keyword);
    Page<Post> findByTitleContaining(String keyword, Pageable pageable);
    // 同时搜索标题和内容
    List<Post> findByTitleContainingOrContentContaining(String title, String content);
    Page<Post> findAll(Pageable pageable);

    // 按状态筛选分页查询
    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    // 按作者筛选分页查询
    Page<Post> findByAuthor(String author, Pageable pageable);

    // 综合条件分页查询（标题或内容包含关键词）
    Page<Post> findByTitleContainingOrContentContaining(String title, String content, Pageable pageable);
}