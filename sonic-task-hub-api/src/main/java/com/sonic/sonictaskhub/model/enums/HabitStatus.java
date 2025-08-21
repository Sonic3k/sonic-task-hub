package com.sonic.sonictaskhub.model.enums;

public enum HabitStatus {
    ACTIVE("Active"),
    PAUSED("Paused"),
    COMPLETED("Completed"),
    ARCHIVED("Archived");

    private final String displayName;

    HabitStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}