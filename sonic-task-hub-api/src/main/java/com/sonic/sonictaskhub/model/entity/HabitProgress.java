package com.sonic.sonictaskhub.model.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "habit_progress")
public class HabitProgress extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;
    
    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;
    
    @Column(name = "duration")
    private Integer duration;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "progress_value")
    private Double progressValue;
    
    @Column(name = "progress_unit", length = 50)
    private String progressUnit;

    // Default constructor
    public HabitProgress() {}

    // Getters and Setters
    public Habit getHabit() { return habit; }
    public void setHabit(Habit habit) { this.habit = habit; }
    
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
}