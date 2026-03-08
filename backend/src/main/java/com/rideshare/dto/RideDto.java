package com.rideshare.dto;

import com.rideshare.model.ParticipantStatus;
import com.rideshare.model.Ride;
import com.rideshare.model.RideParticipant;
import com.rideshare.model.RideStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class RideDto {
    private Long id;
    private String sourceCity;
    private String destinationCity;
    private LocalDateTime startTime;
    private BigDecimal pricePerSeat;
    private Integer totalSeats;
    private Integer availableSeats;
    private RideStatus status;
    private String pickupPoints;
    private String dropPoints;
    private Boolean hasAc;
    private Boolean luggageAllowed;
    private String genderPreference;
    private Double distanceKm;
    private String vehicleId;
    private DriverDto driver;
    private List<ParticipantDto> participants;

    @Data
    public static class DriverDto {
        private UUID id;
        private String name;
        private String email;
        private String profilePhotoUrl;
    }

    @Data
    public static class ParticipantDto {
        private Long id;
        private RiderDto rider;
        private BigDecimal fareAtBooking;
        private LocalDateTime joinedAt;
        private ParticipantStatus status;
    }

    @Data
    public static class RiderDto {
        private UUID id;
        private String name;
        private String email;
        private String profilePhotoUrl;
    }

    public static RideDto from(Ride ride) {
        RideDto dto = new RideDto();
        dto.setId(ride.getId());
        dto.setSourceCity(ride.getSourceCity());
        dto.setDestinationCity(ride.getDestinationCity());
        dto.setStartTime(ride.getStartTime());
        dto.setPricePerSeat(ride.getPricePerSeat());
        dto.setTotalSeats(ride.getTotalSeats());
        dto.setAvailableSeats(ride.getAvailableSeats());
        dto.setStatus(ride.getStatus());
        dto.setPickupPoints(ride.getPickupPoints());
        dto.setDropPoints(ride.getDropPoints());
        dto.setHasAc(ride.getHasAc());
        dto.setLuggageAllowed(ride.getLuggageAllowed());
        dto.setGenderPreference(ride.getGenderPreference());
        dto.setDistanceKm(ride.getDistanceKm());
        dto.setVehicleId(ride.getVehicleId());

        if (ride.getDriver() != null) {
            DriverDto d = new DriverDto();
            d.setId(ride.getDriver().getId());
            d.setName(ride.getDriver().getName());
            d.setEmail(ride.getDriver().getEmail());
            d.setProfilePhotoUrl(ride.getDriver().getProfilePhotoUrl());
            dto.setDriver(d);
        }

        if (ride.getParticipants() != null) {
            dto.setParticipants(ride.getParticipants().stream().map(p -> {
                ParticipantDto pd = new ParticipantDto();
                pd.setId(p.getId());
                pd.setFareAtBooking(p.getFareAtBooking());
                pd.setJoinedAt(p.getJoinedAt());
                pd.setStatus(p.getStatus());
                if (p.getRider() != null) {
                    RiderDto rd = new RiderDto();
                    rd.setId(p.getRider().getId());
                    rd.setName(p.getRider().getName());
                    rd.setEmail(p.getRider().getEmail());
                    rd.setProfilePhotoUrl(p.getRider().getProfilePhotoUrl());
                    pd.setRider(rd);
                }
                return pd;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
