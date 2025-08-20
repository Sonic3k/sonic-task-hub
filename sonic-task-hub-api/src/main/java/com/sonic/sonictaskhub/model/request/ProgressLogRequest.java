package com.sonic.sonictaskhub.model.request;

import java.time.LocalDate;

public class ProgressLogRequest {
    private LocalDate sessionDate;
    private Integer duration;
    private String notes;
    private Double progressValue;
    private String progressUnit;

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