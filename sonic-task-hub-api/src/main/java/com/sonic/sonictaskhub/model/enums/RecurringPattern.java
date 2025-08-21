package com.sonic.sonictaskhub.model.enums;

public enum RecurringPattern {
    DAILY("Daily"),
    WEEKLY("Weekly"),
    MONTHLY("Monthly"),
    YEARLY("Yearly"),
    EVERY_N_DAYS("Every N Days"),
    EVERY_N_WEEKS("Every N Weeks");

    private final String displayName;

    RecurringPattern(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}