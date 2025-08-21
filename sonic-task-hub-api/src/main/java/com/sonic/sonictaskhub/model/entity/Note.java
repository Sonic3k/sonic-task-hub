package com.sonic.sonictaskhub.model.entity;

import com.sonic.sonictaskhub.model.enums.*;
import jakarta.persistence.*;

@Entity
@Table(name = "notes",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "note_number"}))
public class Note extends BaseEntity {
    
    @Column(name = "note_number", nullable = false)
    private Long noteNumber;
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority = Priority.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NoteStatus status = NoteStatus.ACTIVE;
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // Default constructor
    public Note() {}

    // Getters and Setters
    public Long getNoteNumber() { return noteNumber; }
    public void setNoteNumber(Long noteNumber) { this.noteNumber = noteNumber; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    
    public NoteStatus getStatus() { return status; }
    public void setStatus(NoteStatus status) { this.status = status; }
    
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
}