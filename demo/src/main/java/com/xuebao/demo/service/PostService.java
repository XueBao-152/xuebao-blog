package com.xuebao.demo.service;

import com.xuebao.demo.entity.Post;
import com.xuebao.demo.entity.User;
import com.xuebao.demo.enums.PostStatus;
import com.xuebao.demo.repository.PostRepository;
import com.xuebao.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    private final PostRepository postRepository;
    @Autowired
    private UserRepository userRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Transactional // 确保方法在事务中执行
    public Post save(Post post) {
        validatePost(post);

        // 如果post有ID，说明是更新操作，需要先查询再合并字段，防止数据覆盖
        if (post.getId() != null) {
            Post existingPost = postRepository.findById(post.getId())
                    .orElseThrow(() -> new RuntimeException("文章不存在，id: " + post.getId()));

            // 只更新允许修改的字段，避免覆盖不该改的数据
            if (post.getTitle() != null) {
                existingPost.setTitle(post.getTitle());
            }
            if (post.getContent() != null) {
                existingPost.setContent(post.getContent());
            }
            // ... 合并其他需要更新的字段

            // 确保更新时间戳也被设置
            existingPost.setUpdatedAt(LocalDateTime.now());

            return postRepository.save(existingPost); // 此时保存的是从数据库查出的完整实体
        } else {
            // 新增操作，设置创建时间等初始信息
            post.setCreatedAt(LocalDateTime.now());
            return postRepository.save(post);
        }
    }
    private User getDefaultAuthor() {
        return userRepository.findByUsername("匿名用户")
                .orElseGet(() -> {
                    User anonymousUser = new User();
                    anonymousUser.setUsername("匿名用户");
                    anonymousUser.setEmail("anonymous@example.com");
                    anonymousUser.setCreatedAt(LocalDateTime.now());
                    return userRepository.save(anonymousUser);
                });
    }
    private void validatePost(Post post) {
        // 验证标题
        if (post.getTitle() == null || post.getTitle().isBlank()) {
            throw new IllegalArgumentException("文章标题不能为空");
        }

        // 验证内容
        if (post.getContent() == null || post.getContent().isBlank()) {
            throw new IllegalArgumentException("文章内容不能为空");
        }

        // 验证标题长度
        if (post.getTitle().length() > 100) {
            throw new IllegalArgumentException("标题长度不能超过100个字符");
        }


    }

    public void deletePost(Long id) {
        if (postRepository.existsById(id)) {
            postRepository.deleteById(id);
        }
    }

    // 或者使用异常方式
    public void deletePostOrThrow(Long id) {
        if (!postRepository.existsById(id)) {
            throw new IllegalArgumentException("文章不存在，id: " + id);
        }
        postRepository.deleteById(id);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    // ✅ Optional方式：更安全、更函数式
    public Post updatePost(Long id, Post postDetails) {
        return postRepository.findById(id)
                .map(existingPost -> {
                    // ✅ 必须添加字段更新逻辑！
                    if (postDetails.getTitle() != null) {
                        existingPost.setTitle(postDetails.getTitle());
                    }
                    if (postDetails.getContent() != null) {
                        existingPost.setContent(postDetails.getContent());
                    }
                    if (postDetails.getAuthor() != null) {
                        existingPost.setAuthor(postDetails.getAuthor());
                    }

                    // 然后保存更新后的文章
                    return postRepository.save(existingPost);
                })
                .orElseThrow(() -> new RuntimeException("文章不存在"));
    }

    public List<Post> searchByTitle(String keyword) {
        // 如果关键词为空，可以返回空列表或所有文章，按需调整
        if (keyword == null || keyword.trim().isEmpty()) {
            // return postRepository.findAll(); // 或者返回空列表
            return List.of();
        }
        return postRepository.findByTitleContaining(keyword.trim());
    }

    /**
     * 综合搜索（标题或内容）
     */
    public List<Post> comprehensiveSearch(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            // return postRepository.findAll(); // 或者返回空列表
            return List.of();
        }
        String trimmedKeyword = keyword.trim();
        // 注意：这里是 OR 条件，查询标题或内容包含关键词的文章
        return postRepository.findByTitleContainingOrContentContaining(trimmedKeyword, trimmedKeyword);
    }
    /**
     * 分页搜索（标题或内容）
     */
    public Page<Post> searchPostsWithPagination(String keyword, Pageable pageable) {
        return postRepository.findByTitleContaining(keyword, pageable);
    }
    public Page<Post> getAllPostsPaged(Pageable pageable) {
        return postRepository.findAll(pageable);
    }

    /**
     * 根据状态获取文章（分页）
     */
    public Page<Post> getPostsByStatus(PostStatus status, Pageable pageable) {
        return postRepository.findByStatus(status, pageable);
    }

    /**
     * 根据作者获取文章（分页）
     */
    public Page<Post> getPostsByAuthor(String author, Pageable pageable) {
        return postRepository.findByAuthor(author, pageable);
    }

    /**
     * 综合分页查询 - 与您的搜索功能区分开
     */
    public Page<Post> getPostsWithPagination(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return postRepository.findAll(pageable);
        }
        return postRepository.findByTitleContainingOrContentContaining(keyword,keyword,pageable);
    }


}