package com.sonic.sonictaskhub.model.entity;

import com.sonic.sonictaskhub.model.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "event_number"}))
public class Event extends BaseEntity {
    
    @Column(name = "event_number", nullable = false)
    private Long eventNumber;
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "event_datetime", nullable = false)
    private LocalDateTime eventDateTime;
    
    @Column(name = "location", length = 500)
    private String location;
    
    @Column(name = "reminder_minutes")
    private Integer reminderMinutes;
    
    @Column(name = "is_recurring", nullable = false)
    private Boolean isRecurring = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "recurring_pattern")
    private RecurringPattern recurringPattern;
    
    @Column(name = "recurring_interval")
    private Integer recurringInterval;
    
    @Column(name = "recurring_end_date")
    private LocalDateTime recurringEndDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_event_id")
    private Event masterEvent;
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // Default constructor
    public Event() {}

    // Getters and Setters
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
    
    public Event getMasterEvent() { return masterEvent; }
    public void setMasterEvent(Event masterEvent) { this.masterEvent = masterEvent; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
}