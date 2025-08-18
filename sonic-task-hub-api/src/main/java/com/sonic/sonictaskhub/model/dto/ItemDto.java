package com.sonic.sonictaskhub.model.dto;

import com.sonic.sonictaskhub.model.enums.*;
import java.time.LocalDateTime;
import java.util.List;

public class ItemDto {
    private Long id;
    private String title;
    private String description;
    private ItemType type;
    private Priority priority;
    private Complexity complexity;
    private ItemStatus status;
    private LocalDateTime dueDate;
    private LocalDateTime completedAt;
    private LocalDateTime snoozedUntil;
    private Integer estimatedDuration;
    private Integer actualDuration;
    private Long userId;
    private String userDisplayName;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private Long parentItemId;
    private String parentItemTitle;
    private List<ItemDto> subtasks;
    private Integer subtaskCount;
    private Integer completedSubtaskCount;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ItemDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public ItemType getType() { return type; }
    public void setType(ItemType type) { this.type = type; }
    
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    
    public Complexity getComplexity() { return complexity; }
    public void setComplexity(Complexity complexity) { this.complexity = complexity; }
    
    public ItemStatus getStatus() { return status; }
    public void setStatus(ItemStatus status) { this.status = status; }
    
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    public LocalDateTime getSnoozedUntil() { return snoozedUntil; }
    public void setSnoozedUntil(LocalDateTime snoozedUntil) { this.snoozedUntil = snoozedUntil; }
    
    public Integer getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(Integer estimatedDuration) { this.estimatedDuration = estimatedDuration; }
    
    public Integer getActualDuration() { return actualDuration; }
    public void setActualDuration(Integer actualDuration) { this.actualDuration = actualDuration; }
    
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
    
    public Long getParentItemId() { return parentItemId; }
    public void setParentItemId(Long parentItemId) { this.parentItemId = parentItemId; }
    
    public String getParentItemTitle() { return parentItemTitle; }
    public void setParentItemTitle(String parentItemTitle) { this.parentItemTitle = parentItemTitle; }
    
    public List<ItemDto> getSubtasks() { return subtasks; }
    public void setSubtasks(List<ItemDto> subtasks) { this.subtasks = subtasks; }
    
    public Integer getSubtaskCount() { return subtaskCount; }
    public void setSubtaskCount(Integer subtaskCount) { this.subtaskCount = subtaskCount; }
    
    public Integer getCompletedSubtaskCount() { return completedSubtaskCount; }
    public void setCompletedSubtaskCount(Integer completedSubtaskCount) { this.completedSubtaskCount = completedSubtaskCount; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}