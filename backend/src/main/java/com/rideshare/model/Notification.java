package com.rideshare.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String role; // DRIVER or RIDER

    /**
     * Event type. One of:
     * JOIN_REQUEST, REQUEST_APPROVED, REQUEST_REJECTED,
     * PAYMENT_SUCCESS, RIDE_STARTED, RIDE_ENDED,
     * RIDE_CANCELLED, RIDER_CANCELLED, RIDE_FULL, RATING_RECEIVED
     */
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(name = "ride_id")
    private Long rideId;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
