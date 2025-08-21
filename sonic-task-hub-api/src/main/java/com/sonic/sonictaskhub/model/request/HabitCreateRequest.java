package com.sonic.sonictaskhub.model.request;

public class HabitCreateRequest {
    private String title;
    private String description;
    private String habitStage;
    private Integer targetDays;
    private Long categoryId;

    public HabitCreateRequest() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getHabitStage() { return habitStage; }
    public void setHabitStage(String habitStage) { this.habitStage = habitStage; }
    
    public Integer getTargetDays() { return targetDays; }
    public void setTargetDays(Integer targetDays) { this.targetDays = targetDays; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
}