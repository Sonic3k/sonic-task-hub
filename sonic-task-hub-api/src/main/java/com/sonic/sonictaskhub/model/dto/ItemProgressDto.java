package com.sonic.sonictaskhub.model.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ItemProgressDto {
    private Long id;
    private Long itemId;
    private String itemTitle;
    private LocalDate sessionDate;
    private Integer duration;
    private String notes;
    private Double progressValue;
    private String progressUnit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ItemProgressDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    
    public String getItemTitle() { return itemTitle; }
    public void setItemTitle(String itemTitle) { this.itemTitle = itemTitle; }
    
    public LocalDate getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDate sessionDate) { this.sessionDate = sessionDate; }
    
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public Double getProgressValue() { return progressValue; }
    public void setProgressValue(Double progressValue) { this.progressValue = progressValue; }
    
    public String getProgressUnit() { return progressUnit; }
    public void setProgressUnit(String progressUnit) { this.progressUnit = progressUnit; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}