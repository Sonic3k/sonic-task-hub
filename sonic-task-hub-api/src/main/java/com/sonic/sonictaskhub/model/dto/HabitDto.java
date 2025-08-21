package com.sonic.sonictaskhub.model.dto;

import com.sonic.sonictaskhub.model.enums.*;
import java.time.LocalDateTime;

public class HabitDto {
    private Long id;
    private Long habitNumber;
    private String title;
    private String description;
    private String habitStage;
    private Integer targetDays;
    private Integer completedDays;
    private HabitStatus status;
    private Integer sortOrder;
    private Long userId;
    private String userDisplayName;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HabitDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getHabitNumber() { return habitNumber; }
    public void setHabitNumber(Long habitNumber) { this.habitNumber = habitNumber; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getHabitStage() { return habitStage; }
    public void setHabitStage(String habitStage) { this.habitStage = habitStage; }
    
    public Integer getTargetDays() { return targetDays; }
    public void setTargetDays(Integer targetDays) { this.targetDays = targetDays; }
    
    public Integer getCompletedDays() { return completedDays; }
    public void setCompletedDays(Integer completedDays) { this.completedDays = completedDays; }
    
    public HabitStatus getStatus() { return status; }
    public void setStatus(HabitStatus status) { this.status = status; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUserDisplayName() { return userDisplayName; }
    public void setUserDisplayName(String userDisplayName) { this.userDisplayName = userDisplayName; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    
    public String getCategoryColor() { return categoryColor; }
    public void setCategoryColor(String categoryColor) { this.categoryColor = categoryColor; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}