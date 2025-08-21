package com.sonic.sonictaskhub.repository;

import com.sonic.sonictaskhub.model.entity.Note;
import com.sonic.sonictaskhub.model.enums.NoteStatus;
import com.sonic.sonictaskhub.model.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    
    @Query("SELECT COALESCE(MAX(n.noteNumber), 0) FROM Note n WHERE n.user.id = :userId")
    Long getMaxNoteNumberForUser(@Param("userId") Long userId);
    
    Optional<Note> findByUserIdAndNoteNumber(Long userId, Long noteNumber);
    
    @Query("SELECT n FROM Note n WHERE " +
           "(:userId IS NULL OR n.user.id = :userId) AND " +
           "(:status IS NULL OR n.status = :status) AND " +
           "(:priority IS NULL OR n.priority = :priority) AND " +
           "(:categoryId IS NULL OR n.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(n.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Note> findWithFilters(@Param("userId") Long userId,
                              @Param("status") NoteStatus status,
                              @Param("priority") Priority priority,
                              @Param("categoryId") Long categoryId,
                              @Param("search") String search,
                              Pageable pageable);
}