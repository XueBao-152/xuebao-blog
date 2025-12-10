package com.xuebao.demo.service;
import com.xuebao.demo.dto.CommentDTO;
import com.xuebao.demo.entity.Comment;
import com.xuebao.demo.entity.Post;
import com.xuebao.demo.entity.User;
import com.xuebao.demo.repository.CommentRepository;
import com.xuebao.demo.repository.PostRepository;
import com.xuebao.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 创建评论
     */
    public CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());

        // 安全地设置作者名
        if (comment.getAuthor() != null) {
            dto.setAuthorName(comment.getAuthor().getUsername());
        }

        if (comment.getPost() != null) {
            dto.setPostId(comment.getPost().getId());
        }

        if (comment.getParentComment() != null) {
            dto.setParentCommentId(comment.getParentComment().getId());
        }

        return dto;
    }
    public Comment createComment(Comment comment) {
        // 基础数据验证
        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("评论内容不能为空");
        }

        if (comment.getPost() == null || comment.getPost().getId() == null) {
            throw new IllegalArgumentException("评论必须关联文章");
        }

        if (comment.getAuthor() == null || comment.getAuthor().getId() == null) {
            throw new IllegalArgumentException("评论必须有关联作者");
        }

        // 确保关联的实体存在
        Post post = postRepository.findById(comment.getPost().getId())
                .orElseThrow(() -> new RuntimeException("关联的文章不存在"));

        User author = userRepository.findById(comment.getAuthor().getId())
                .orElseThrow(() -> new RuntimeException("关联的用户不存在"));

        comment.setPost(post);
        comment.setAuthor(author);

        // 处理父级评论（如果是回复）
        if (comment.getParentComment() != null && comment.getParentComment().getId() != null) {
            Comment parentComment = commentRepository.findById(comment.getParentComment().getId())
                    .orElseThrow(() -> new RuntimeException("父级评论不存在"));
            comment.setParentComment(parentComment);
        }

        // 时间戳由 @PrePersist 自动处理
        return commentRepository.save(comment);
    }
    /**
     * 根据ID获取评论
     */
    @Transactional(readOnly = true)
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
    }
    /**
     * 获取文章的所有评论（顶级评论）
     */
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByPostId(Long postId) {
        // 确保文章存在
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("未找到ID为 " + postId + " 的文章");
        }
        // 假设您在 CommentRepository 中定义了该方法：查找所有父评论为空的评论（即顶级评论）
        return commentRepository.findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(postId);
    }

    /**
     * 获取评论的所有回复
     */
    @Transactional(readOnly = true)
    public List<Comment> getRepliesByCommentId(Long parentCommentId) {
        // 确保父评论存在
        if (!commentRepository.existsById(parentCommentId)) {
            throw new RuntimeException("未找到ID为 " + parentCommentId + " 的评论");
        }
        // 假设您在 CommentRepository 中定义了该方法
        return commentRepository.findByParentCommentIdOrderByCreatedAtAsc(parentCommentId);
    }

    /**
     * 更新评论内容（包含权限验证：只能修改自己的评论）
     */
    public Comment updateCommentContent(Long commentId, String newContent, Long currentUserId) {
        Comment comment = getCommentById(commentId);

        // 权限验证：确保当前用户是评论的作者
        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new SecurityException("无权修改他人的评论");
        }

        comment.setContent(newContent);
        // @PreUpdate 注解会自动更新 updatedAt
        return commentRepository.save(comment);
    }

    /**
     * 删除评论（包含权限验证：只能删除自己的评论）
     */
    public void deleteComment(Long commentId, Long currentUserId) {
        Comment comment = getCommentById(commentId);

        // 权限验证：确保当前用户是评论的作者
        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new SecurityException("无权删除他人的评论");
        }

        commentRepository.delete(comment);
    }

    /**
     * 获取用户的所有评论
     */
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByUserId(Long userId) {
        // 确保用户存在
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("未找到ID为 " + userId + " 的用户");
        }
        // 假设您在 CommentRepository 中定义了该方法
        return commentRepository.findByAuthorIdOrderByCreatedAtDesc(userId);
    }
}