package com.sonic.sonictaskhub.repository;

import com.sonic.sonictaskhub.model.entity.HabitProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitProgressRepository extends JpaRepository<HabitProgress, Long> {
    
    List<HabitProgress> findByHabitIdOrderBySessionDateDesc(Long habitId);
    
    Optional<HabitProgress> findByHabitIdAndSessionDate(Long habitId, LocalDate sessionDate);
    
    @Query("SELECT COUNT(hp) FROM HabitProgress hp WHERE hp.habit.id = :habitId")
    Long countByHabitId(@Param("habitId") Long habitId);
    
    @Query("SELECT hp FROM HabitProgress hp WHERE hp.habit.id = :habitId AND hp.sessionDate BETWEEN :startDate AND :endDate ORDER BY hp.sessionDate DESC")
    List<HabitProgress> findByHabitIdAndDateRange(@Param("habitId") Long habitId,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);
}