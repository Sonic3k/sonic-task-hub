package com.sonic.sonictaskhub.model.dto;

import com.sonic.sonictaskhub.model.enums.*;
import java.time.LocalDateTime;

public class EventDto {
    private Long id;
    private Long eventNumber;
    private String title;
    private String description;
    private LocalDateTime eventDateTime;
    private String location;
    private Integer reminderMinutes;
    private Boolean isRecurring;
    private RecurringPattern recurringPattern;
    private Integer recurringInterval;
    private LocalDateTime recurringEndDate;
    private Long masterEventId;
    private String masterEventTitle;
    private Integer sortOrder;
    private Long userId;
    private String userDisplayName;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EventDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getEventNumber() { return eventNumber; }
    public void setEventNumber(Long eventNumber) { this.eventNumber = eventNumber; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getEventDateTime() { return eventDateTime; }
    public void setEventDateTime(LocalDateTime eventDateTime) { this.eventDateTime = eventDateTime; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public Integer getReminderMinutes() { return reminderMinutes; }
    public void setReminderMinutes(Integer reminderMinutes) { this.reminderMinutes = reminderMinutes; }
    
    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }
    
    public RecurringPattern getRecurringPattern() { return recurringPattern; }
    public void setRecurringPattern(RecurringPattern recurringPattern) { this.recurringPattern = recurringPattern; }
    
    public Integer getRecurringInterval() { return recurringInterval; }
    public void setRecurringInterval(Integer recurringInterval) { this.recurringInterval = recurringInterval; }
    
    public LocalDateTime getRecurringEndDate() { return recurringEndDate; }
    public void setRecurringEndDate(LocalDateTime recurringEndDate) { this.recurringEndDate = recurringEndDate; }
    
    public Long getMasterEventId() { return masterEventId; }
    public void setMasterEventId(Long masterEventId) { this.masterEventId = masterEventId; }
    
    public String getMasterEventTitle() { return masterEventTitle; }
    public void setMasterEventTitle(String masterEventTitle) { this.masterEventTitle = masterEventTitle; }
    
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