package com.rideshare.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateRideRequest {
    private String sourceCity;
    private String destinationCity;
    private LocalDateTime startTime;
    private BigDecimal pricePerSeat;
    private Integer totalSeats;

    // Driver identity — sent from the authenticated frontend (eliminates JWT dep)
    private String driverEmail;

    // Extended fields
    private List<String> pickupPoints;
    private List<String> dropPoints;
    private Boolean hasAc;
    private Boolean luggageAllowed;
    private String genderPreference;
    private Double distanceKm;
    private String vehicleId;
}
