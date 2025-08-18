package com.sonic.sonictaskhub.repository;

import com.sonic.sonictaskhub.model.entity.Item;
import com.sonic.sonictaskhub.model.enums.ItemStatus;
import com.sonic.sonictaskhub.model.enums.ItemType;
import com.sonic.sonictaskhub.model.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    
    Page<Item> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    @Query("SELECT i FROM Item i WHERE i.user.id = :userId AND " +
           "(:type IS NULL OR i.type = :type) AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:priority IS NULL OR i.priority = :priority) AND " +
           "(:categoryId IS NULL OR i.category.id = :categoryId) AND " +
           "(:searchTerm IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(i.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY i.priority DESC, i.dueDate ASC, i.createdAt DESC")
    Page<Item> findItemsWithFilters(@Param("userId") Long userId,
                                   @Param("type") ItemType type,
                                   @Param("status") ItemStatus status,
                                   @Param("priority") Priority priority,
                                   @Param("categoryId") Long categoryId,
                                   @Param("searchTerm") String searchTerm,
                                   Pageable pageable);
    
    List<Item> findByParentItemId(Long parentItemId);
    
    List<Item> findByUserIdAndParentItemIsNull(Long userId);
    
    @Query("SELECT i FROM Item i WHERE i.user.id = :userId AND i.status = :status AND i.dueDate < :date")
    List<Item> findOverdueItems(@Param("userId") Long userId, @Param("status") ItemStatus status, @Param("date") LocalDateTime date);
    
    @Query("SELECT i FROM Item i WHERE i.user.id = :userId AND i.status = 'SNOOZED' AND i.snoozedUntil <= :now")
    List<Item> findItemsToUnsnooze(@Param("userId") Long userId, @Param("now") LocalDateTime now);
}