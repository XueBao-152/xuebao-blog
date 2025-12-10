package com.xuebao.demo.controller;

import com.xuebao.demo.dto.request.SearchRequest;
import com.xuebao.demo.dto.response.MessageResponse;
import com.xuebao.demo.dto.response.ResponseWrapper;
import com.xuebao.demo.entity.Post;
import com.xuebao.demo.entity.User;
import com.xuebao.demo.enums.PostStatus;
import com.xuebao.demo.service.PostService;
import com.xuebao.demo.service.UserService;
import com.xuebao.demo.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping(value = "/api/posts", produces = "application/json;charset=UTF-8")
public class PostController {
    private final PostService postService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public PostController(PostService postService, UserService userService, JwtUtil jwtUtil) {
        this.postService = postService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 创建文章
     */
    @PostMapping
    public ResponseEntity<ResponseWrapper<Post>> createPost(
            @Valid @RequestBody Post post,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            User author = userService.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户不存在: " + username));

            post.setAuthor(author);
            post.setCreatedAt(LocalDateTime.now());

            Post savedPost = postService.save(post);
            ResponseWrapper<Post> response = ResponseWrapper.created("文章创建成功", savedPost);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            ResponseWrapper<Post> response = ResponseWrapper.error(401, "创建文章失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * 删除文章
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseWrapper<Void>> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id);
            ResponseWrapper<Void> response = ResponseWrapper.success("文章删除成功", null);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ResponseWrapper<Void> response = ResponseWrapper.error(404, "删除文章失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * 获取所有文章
     */
    @GetMapping("/all")
    public ResponseEntity<ResponseWrapper<List<Post>>> getAllPosts() {
        try {
            List<Post> posts = postService.getAllPosts();
            ResponseWrapper<List<Post>> response = ResponseWrapper.success("获取成功", posts);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ResponseWrapper<List<Post>> response = ResponseWrapper.error(500, "获取文章列表失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 获取文章详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResponseWrapper<Post>> getPost(@PathVariable Long id) {
        try {
            Post post = postService.getPostById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "文章不存在"));
            ResponseWrapper<Post> response = ResponseWrapper.success("获取成功", post);
            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            ResponseWrapper<Post> response = ResponseWrapper.error(e.getStatusCode().value(), e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(response);
        } catch (Exception e) {
            ResponseWrapper<Post> response = ResponseWrapper.error(500, "获取文章详情失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 更新文章
     */
    @PutMapping("/{id}")
    public ResponseEntity<ResponseWrapper<Post>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody Post postDetails) {
        try {
            Post updatedPost = postService.updatePost(id, postDetails);
            ResponseWrapper<Post> response = ResponseWrapper.success("文章更新成功", updatedPost);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ResponseWrapper<Post> response = ResponseWrapper.error(400, "更新文章失败: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 搜索文章
     */
    @PostMapping("/search")
    public ResponseEntity<ResponseWrapper<List<Post>>> searchPosts(@Valid @RequestBody SearchRequest request) {
        try {
            if (request.getKeyword() == null || request.getKeyword().isBlank()) {
                ResponseWrapper<List<Post>> response = ResponseWrapper.error(400, "搜索关键词不能为空");
                return ResponseEntity.badRequest().body(response);
            }

            List<Post> results = postService.comprehensiveSearch(request.getKeyword().trim());

            if (results.isEmpty()) {
                ResponseWrapper<List<Post>> response = ResponseWrapper.success("未找到相关文章", results);
                return ResponseEntity.ok(response);
            } else {
                ResponseWrapper<List<Post>> response = ResponseWrapper.success("搜索成功", results);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            ResponseWrapper<List<Post>> response = ResponseWrapper.error(500, "搜索失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 分页获取文章
     */
    @GetMapping
    public ResponseEntity<ResponseWrapper<Page<Post>>> getPostsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Post> result;

            if (keyword != null && !keyword.trim().isEmpty()) {
                result = postService.searchPostsWithPagination(keyword.trim(), pageable);
            } else {
                result = postService.getAllPostsPaged(pageable);
            }

            ResponseWrapper<Page<Post>> response = ResponseWrapper.success("获取成功", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ResponseWrapper<Page<Post>> response = ResponseWrapper.error(500, "分页查询失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 按状态分页查询
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ResponseWrapper<Page<Post>>> getPostsByStatusPaged(
            @PathVariable PostStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            size = Math.min(size, 100);
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Post> result = postService.getPostsByStatus(status, pageable);

            ResponseWrapper<Page<Post>> response = ResponseWrapper.success("获取成功", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ResponseWrapper<Page<Post>> response = ResponseWrapper.error(500, "按状态查询失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 条件分页查询
     */
    @GetMapping("/filter")
    public ResponseEntity<ResponseWrapper<Page<Post>>> filterPostsPaged(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Post> result = postService.getPostsWithPagination(keyword, pageable);

            ResponseWrapper<Page<Post>> response = ResponseWrapper.success("获取成功", result);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ResponseWrapper<Page<Post>> response = ResponseWrapper.error(500, "筛选查询失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}