package com.sonic.sonictaskhub.model.enums;

public enum ItemType {
    TASK("Task"),
    HABIT("Habit"), 
    REMINDER("Reminder");

    private final String displayName;

    ItemType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}