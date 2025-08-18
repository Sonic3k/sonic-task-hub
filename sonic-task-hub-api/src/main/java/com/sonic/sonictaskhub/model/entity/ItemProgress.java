package com.sonic.sonictaskhub.model.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "item_progress")
public class ItemProgress extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;
    
    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;
    
    @Column(name = "duration") // in minutes
    private Integer duration;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "progress_value") // for quantifiable progress (e.g., pages read, exercises done)
    private Double progressValue;
    
    @Column(name = "progress_unit", length = 50) // unit of measurement (e.g., "pages", "minutes", "reps")
    private String progressUnit;

    // Default constructor
    public ItemProgress() {}

    // Getters and Setters
    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Double getProgressValue() {
        return progressValue;
    }

    public void setProgressValue(Double progressValue) {
        this.progressValue = progressValue;
    }

    public String getProgressUnit() {
        return progressUnit;
    }

    public void setProgressUnit(String progressUnit) {
        this.progressUnit = progressUnit;
    }
}