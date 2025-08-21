package com.sonic.sonictaskhub.repository;

import com.sonic.sonictaskhub.model.entity.Task;
import com.sonic.sonictaskhub.model.enums.Priority;
import com.sonic.sonictaskhub.model.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    @Query("SELECT COALESCE(MAX(t.taskNumber), 0) FROM Task t WHERE t.user.id = :userId")
    Long getMaxTaskNumberForUser(@Param("userId") Long userId);
    
    Optional<Task> findByUserIdAndTaskNumber(Long userId, Long taskNumber);
    
    List<Task> findByUserIdAndParentTaskIsNull(Long userId);
    
    List<Task> findByParentTaskId(Long parentTaskId);
    
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.dueDate < :now AND t.status != 'COMPLETED'")
    List<Task> findOverdueTasks(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.snoozedUntil <= :now AND t.status = 'SNOOZED'")
    List<Task> findTasksReadyToUnsnooze(@Param("userId") Long userId, @Param("now") LocalDateTime now);
    
    @Query("SELECT t FROM Task t WHERE " +
           "(:userId IS NULL OR t.user.id = :userId) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:priority IS NULL OR t.priority = :priority) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> findWithFilters(@Param("userId") Long userId,
                              @Param("status") TaskStatus status,
                              @Param("priority") Priority priority,
                              @Param("categoryId") Long categoryId,
                              @Param("search") String search,
                              Pageable pageable);
}