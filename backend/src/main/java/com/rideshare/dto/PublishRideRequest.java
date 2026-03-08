package com.rideshare.dto;

import lombok.Data;
import java.util.List;

@Data
public class PublishRideRequest {
    private String sourceCity;
    private String destinationCity;
    private String startTime;          // ISO: "2026-03-01T10:00:00"
    private Double pricePerSeat;
    private Integer totalSeats;
    private String vehicleId;
    private List<String> pickupPoints;
    private List<String> dropPoints;
    private Boolean hasAc;
    private Boolean luggageAllowed;
    private String genderPreference;
    private String driverEmail;
    private Double distanceKm;
}
