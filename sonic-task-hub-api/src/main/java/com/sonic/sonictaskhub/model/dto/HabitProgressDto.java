package com.sonic.sonictaskhub.model.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class HabitProgressDto {
    private Long id;
    private Long habitId;
    private String habitTitle;
    private LocalDate sessionDate;
    private Integer duration;
    private String notes;
    private Double progressValue;
    private String progressUnit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HabitProgressDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getHabitId() { return habitId; }
    public void setHabitId(Long habitId) { this.habitId = habitId; }
    
    public String getHabitTitle() { return habitTitle; }
    public void setHabitTitle(String habitTitle) { this.habitTitle = habitTitle; }
    
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