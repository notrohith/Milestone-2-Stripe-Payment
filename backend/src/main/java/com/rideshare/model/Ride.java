package com.rideshare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Column(nullable = false)
    private String sourceCity;

    @Column(nullable = false)
    private String destinationCity;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private BigDecimal pricePerSeat;

    @Column(nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private Integer availableSeats;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status;

    // Extended fields
    @Column(columnDefinition = "TEXT")
    private String pickupPoints; // Comma-separated

    @Column(columnDefinition = "TEXT")
    private String dropPoints; // Comma-separated

    @Column
    private Boolean hasAc;

    @Column
    private Boolean luggageAllowed;

    @Column
    private String genderPreference;

    @Column
    private Double distanceKm;

    @Column
    private String vehicleId;

    @OneToMany(mappedBy = "ride", fetch = FetchType.EAGER)
    private java.util.List<RideParticipant> participants;
}
