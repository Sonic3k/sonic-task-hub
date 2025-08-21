package com.sonic.sonictaskhub.repository;

import com.sonic.sonictaskhub.model.entity.Habit;
import com.sonic.sonictaskhub.model.enums.HabitStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {
    
    @Query("SELECT COALESCE(MAX(h.habitNumber), 0) FROM Habit h WHERE h.user.id = :userId")
    Long getMaxHabitNumberForUser(@Param("userId") Long userId);
    
    Optional<Habit> findByUserIdAndHabitNumber(Long userId, Long habitNumber);
    
    @Query("SELECT h FROM Habit h WHERE " +
           "(:userId IS NULL OR h.user.id = :userId) AND " +
           "(:status IS NULL OR h.status = :status) AND " +
           "(:categoryId IS NULL OR h.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(h.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(h.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Habit> findWithFilters(@Param("userId") Long userId,
                               @Param("status") HabitStatus status,
                               @Param("categoryId") Long categoryId,
                               @Param("search") String search,
                               Pageable pageable);
}