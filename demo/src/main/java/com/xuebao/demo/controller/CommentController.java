package com.xuebao.demo.controller;

import com.xuebao.demo.dto.CommentDTO;
import com.xuebao.demo.dto.request.UpdateCommentRequest;
import com.xuebao.demo.dto.response.ResponseWrapper;
import com.xuebao.demo.entity.Comment;
import com.xuebao.demo.entity.User;
import com.xuebao.demo.service.CommentService;
import com.xuebao.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private UserService userService;

    // 创建评论
    @PostMapping
    public ResponseEntity<ResponseWrapper<CommentDTO>> createComment(
            @RequestBody Comment comment,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            // 直接获取当前用户信息
            String username = userDetails.getUsername();
            User author = userService.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "未找到用户: " + username));

            comment.setAuthor(author);
            Comment savedComment = commentService.createComment(comment);
            CommentDTO commentDTO = CommentDTO.fromEntity(savedComment);

            ResponseWrapper<CommentDTO> response = ResponseWrapper.created("评论创建成功", commentDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (ResponseStatusException e) {
            ResponseWrapper<CommentDTO> response = ResponseWrapper.error(e.getStatusCode().value(), e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(response);
        } catch (Exception e) {
            ResponseWrapper<CommentDTO> response = ResponseWrapper.error(500, "创建评论失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 获取评论详情
    @GetMapping("/{id}")
    public ResponseEntity<ResponseWrapper<CommentDTO>> getComment(@PathVariable Long id) {
        try {
            Comment comment = commentService.getCommentById(id);
            if (comment == null) {
                ResponseWrapper<CommentDTO> response = ResponseWrapper.error(404, "评论不存在");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            CommentDTO commentDTO = CommentDTO.fromEntity(comment);
            ResponseWrapper<CommentDTO> response = ResponseWrapper.success("获取成功", commentDTO);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            ResponseWrapper<CommentDTO> response = ResponseWrapper.error(500, "获取评论失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 获取文章评论列表
    @GetMapping("/post/{postId}")
    public ResponseEntity<ResponseWrapper<List<CommentDTO>>> getCommentsByPost(@PathVariable Long postId) {
        try {
            List<Comment> comments = commentService.getCommentsByPostId(postId);
            List<CommentDTO> commentDTOs = comments.stream()
                    .map(CommentDTO::fromEntity)
                    .collect(Collectors.toList());

            ResponseWrapper<List<CommentDTO>> response = ResponseWrapper.success("获取成功", commentDTOs);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            ResponseWrapper<List<CommentDTO>> response = ResponseWrapper.error(500, "获取评论列表失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 获取评论的回复
    @GetMapping("/{commentId}/replies")
    public ResponseEntity<ResponseWrapper<List<CommentDTO>>> getCommentReplies(@PathVariable Long commentId) {
        try {
            List<Comment> replies = commentService.getRepliesByCommentId(commentId);
            List<CommentDTO> replyDTOs = replies.stream()
                    .map(CommentDTO::fromEntity)
                    .collect(Collectors.toList());

            ResponseWrapper<List<CommentDTO>> response = ResponseWrapper.success("获取成功", replyDTOs);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            ResponseWrapper<List<CommentDTO>> response = ResponseWrapper.error(500, "获取评论回复失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 更新评论内容
    @PutMapping("/{id}")
    public ResponseEntity<ResponseWrapper<CommentDTO>> updateComment(
            @PathVariable Long id,
            @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {  // 改用userDetails

        try {
            // 获取当前用户
            String username = userDetails.getUsername();
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在"));

            Long currentUserId = currentUser.getId();
            Comment updatedComment = commentService.updateCommentContent(id, request.getContent(), currentUserId);
            CommentDTO commentDTO = CommentDTO.fromEntity(updatedComment);

            ResponseWrapper<CommentDTO> response = ResponseWrapper.success("评论更新成功", commentDTO);
            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            ResponseWrapper<CommentDTO> response = ResponseWrapper.error(e.getStatusCode().value(), e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(response);
        } catch (Exception e) {
            ResponseWrapper<CommentDTO> response = ResponseWrapper.error(500, "更新评论失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // 删除评论
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseWrapper<Void>> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {  // 改用userDetails

        try {
            // 获取当前用户
            String username = userDetails.getUsername();
            User currentUser = userService.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "用户不存在"));

            Long currentUserId = currentUser.getId();
            commentService.deleteComment(id, currentUserId);

            ResponseWrapper<Void> response = ResponseWrapper.success("评论删除成功", null);
            return ResponseEntity.ok(response);

        } catch (ResponseStatusException e) {
            ResponseWrapper<Void> response = ResponseWrapper.error(e.getStatusCode().value(), e.getReason());
            return ResponseEntity.status(e.getStatusCode()).body(response);
        } catch (Exception e) {
            ResponseWrapper<Void> response = ResponseWrapper.error(500, "删除评论失败: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}