package com.sonic.sonictaskhub.model.enums;

public enum NoteStatus {
    ACTIVE("Active"),
    ARCHIVED("Archived");

    private final String displayName;

    NoteStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}