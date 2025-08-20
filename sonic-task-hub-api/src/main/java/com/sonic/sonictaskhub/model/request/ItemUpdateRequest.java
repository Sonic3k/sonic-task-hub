package com.sonic.sonictaskhub.model.request;

import java.time.LocalDateTime;

public class ItemUpdateRequest {
    private String title;
    private String description;
    private String type;
    private String priority;
    private String complexity;
    private LocalDateTime dueDate;
    private Long categoryId;
    private Integer estimatedDuration;
    private String habitStage;
    private Integer habitTargetDays;

    // Getters and Setters (same as ItemCreateRequest)
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    
    public String getComplexity() { return complexity; }
    public void setComplexity(String complexity) { this.complexity = complexity; }
    
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public Integer getEstimatedDuration() { return estimatedDuration; }
    public void setEstimatedDuration(Integer estimatedDuration) { this.estimatedDuration = estimatedDuration; }
    
    public String getHabitStage() { return habitStage; }
    public void setHabitStage(String habitStage) { this.habitStage = habitStage; }
    
    public Integer getHabitTargetDays() { return habitTargetDays; }
    public void setHabitTargetDays(Integer habitTargetDays) { this.habitTargetDays = habitTargetDays; }
}