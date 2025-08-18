package com.sonic.sonictaskhub.model.enums;

public enum Complexity {
    EASY("Easy", 2.0),
    MEDIUM("Medium", 1.5),
    HARD("Hard", 1.0);

    private final String displayName;
    private final double multiplier;

    Complexity(String displayName, double multiplier) {
        this.displayName = displayName;
        this.multiplier = multiplier;
    }

    public String getDisplayName() {
        return displayName;
    }

    public double getMultiplier() {
        return multiplier;
    }
}