package com.xuebao.demo.repository;
import com.xuebao.demo.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // 查找文章的所有顶级评论（无父评论）
    List<Comment> findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(Long postId);

    // 查找特定评论的所有回复
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(Long parentCommentId);

    // 查找用户的所有评论
    List<Comment> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    // 使用JPQL进行复杂查询示例
    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId AND c.content LIKE %:keyword%")
    List<Comment> findByPostAndKeyword(@Param("postId") Long postId,
                                       @Param("keyword") String keyword);

    // 统计文章的评论数量
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.id = :postId")
    Long countByPostId(@Param("postId") Long postId);
}