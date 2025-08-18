package com.sonic.sonictaskhub.repository;

import com.sonic.sonictaskhub.model.entity.ItemProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ItemProgressRepository extends JpaRepository<ItemProgress, Long> {
    
    List<ItemProgress> findByItemIdOrderBySessionDateDesc(Long itemId);
    
    @Query("SELECT ip FROM ItemProgress ip WHERE ip.item.id = :itemId AND ip.sessionDate BETWEEN :startDate AND :endDate ORDER BY ip.sessionDate ASC")
    List<ItemProgress> findProgressInDateRange(@Param("itemId") Long itemId, 
                                             @Param("startDate") LocalDate startDate, 
                                             @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(ip) FROM ItemProgress ip WHERE ip.item.id = :itemId AND ip.sessionDate = :date")
    Long countProgressByItemAndDate(@Param("itemId") Long itemId, @Param("date") LocalDate date);
}