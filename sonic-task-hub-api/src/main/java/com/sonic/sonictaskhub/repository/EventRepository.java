package com.sonic.sonictaskhub.repository;

import com.sonic.sonictaskhub.model.entity.Event;
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
public interface EventRepository extends JpaRepository<Event, Long> {
    
    @Query("SELECT COALESCE(MAX(e.eventNumber), 0) FROM Event e WHERE e.user.id = :userId")
    Long getMaxEventNumberForUser(@Param("userId") Long userId);
    
    Optional<Event> findByUserIdAndEventNumber(Long userId, Long eventNumber);
    
    @Query("SELECT e FROM Event e WHERE e.masterEvent.id = :masterEventId")
    List<Event> findInstancesByMasterEventId(@Param("masterEventId") Long masterEventId);
    
    @Query("SELECT e FROM Event e WHERE e.user.id = :userId AND e.eventDateTime BETWEEN :startDate AND :endDate")
    List<Event> findEventsInDateRange(@Param("userId") Long userId, 
                                     @Param("startDate") LocalDateTime startDate,
                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT e FROM Event e WHERE " +
           "(:userId IS NULL OR e.user.id = :userId) AND " +
           "(:categoryId IS NULL OR e.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Event> findWithFilters(@Param("userId") Long userId,
                               @Param("categoryId") Long categoryId,
                               @Param("search") String search,
                               Pageable pageable);
}