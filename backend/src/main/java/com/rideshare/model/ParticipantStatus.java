package com.rideshare.model;

public enum ParticipantStatus {
    PENDING,          // Rider requested, waiting for driver
    PAYMENT_PENDING,  // Driver approved, waiting for rider payment
    APPROVED,         // Rider paid — seat confirmed
    REJECTED,         // Driver rejected
    CANCELLED         // Rider cancelled their booking
}
