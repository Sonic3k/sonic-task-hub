package com.sonic.sonictaskhub.model.entity;

import com.sonic.sonictaskhub.model.enums.*;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "habits",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "habit_number"}))
public class Habit extends BaseEntity {
    
    @Column(name = "habit_number", nullable = false)
    private Long habitNumber;
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "habit_stage", length = 100)
    private String habitStage;
    
    @Column(name = "target_days")
    private Integer targetDays;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HabitStatus status = HabitStatus.ACTIVE;
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @OneToMany(mappedBy = "habit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HabitProgress> progressEntries = new ArrayList<>();

    // Default constructor
    public Habit() {}

    // Getters and Setters
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
    
    public HabitStatus getStatus() { return status; }
    public void setStatus(HabitStatus status) { this.status = status; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    
    public List<HabitProgress> getProgressEntries() { return progressEntries; }
    public void setProgressEntries(List<HabitProgress> progressEntries) { this.progressEntries = progressEntries; }
}