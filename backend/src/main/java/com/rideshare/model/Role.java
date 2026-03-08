package com.rideshare.model;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    DRIVER,
    RIDER,
    ADMIN;

    @JsonCreator
    public static Role fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return Role.valueOf(value.toUpperCase());
    }
}
