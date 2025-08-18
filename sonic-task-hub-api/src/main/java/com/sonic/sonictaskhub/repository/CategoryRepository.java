package com.sonic.sonictaskhub.repository;

import com.sonic.sonictaskhub.model.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    @Query("SELECT c FROM Category c WHERE c.isDefault = true OR c.user.id = :userId ORDER BY c.isDefault DESC, c.name ASC")
    List<Category> findAvailableCategoriesForUser(@Param("userId") Long userId);
    
    List<Category> findByIsDefaultTrueAndIsActiveTrue();
    
    List<Category> findByUserIdAndIsActiveTrue(Long userId);
    
    @Query("SELECT c FROM Category c WHERE c.user.id = :userId AND c.name = :name AND c.isActive = true")
    List<Category> findByUserIdAndName(@Param("userId") Long userId, @Param("name") String name);
}