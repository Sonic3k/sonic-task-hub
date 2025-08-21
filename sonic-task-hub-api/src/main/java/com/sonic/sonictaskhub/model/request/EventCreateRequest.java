package com.sonic.sonictaskhub.model.request;

import java.time.LocalDateTime;

public class EventCreateRequest {
    private String title;
    private String description;
    private LocalDateTime eventDateTime;
    private String location;
    private Integer reminderMinutes;
    private Boolean isRecurring;
    private String recurringPattern;
    private Integer recurringInterval;
    private LocalDateTime recurringEndDate;
    private Long categoryId;

    public EventCreateRequest() {}

    // Getters and Setters
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
    
    public String getRecurringPattern() { return recurringPattern; }
    public void setRecurringPattern(String recurringPattern) { this.recurringPattern = recurringPattern; }
    
    public Integer getRecurringInterval() { return recurringInterval; }
    public void setRecurringInterval(Integer recurringInterval) { this.recurringInterval = recurringInterval; }
    
    public LocalDateTime getRecurringEndDate() { return recurringEndDate; }
    public void setRecurringEndDate(LocalDateTime recurringEndDate) { this.recurringEndDate = recurringEndDate; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
}