package com.rideshare.service;

import com.rideshare.dto.CreateRideRequest;
import com.rideshare.model.*;
import com.rideshare.repository.RideParticipantRepository;
import com.rideshare.repository.RideRepository;
import com.rideshare.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final RideParticipantRepository participantRepository;
    private final EmailService emailService;

    public RideService(RideRepository rideRepository, UserRepository userRepository, RideParticipantRepository participantRepository, EmailService emailService) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Ride createRide(CreateRideRequest request, UUID driverId) {
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (driver.getRole() != Role.DRIVER) {
            throw new RuntimeException("Only drivers can create rides");
        }

        return buildAndSaveRide(request, driver);
    }

    @Transactional
    public Ride createRideByEmail(CreateRideRequest request) {
        String email = request.getDriverEmail();
        if (email == null || email.isBlank()) {
            throw new RuntimeException("driverEmail is required");
        }

        User driver = userRepository.findFirstByEmail(email)
                .orElseThrow(() -> new RuntimeException("Driver not found for email: " + email));

        if (driver.getRole() != Role.DRIVER) {
            System.out.println("Warning: user " + email + " has role " + driver.getRole() + " but is creating a ride.");
        }

        return buildAndSaveRide(request, driver);
    }

    private Ride buildAndSaveRide(CreateRideRequest request, User driver) {
        Ride ride = new Ride();
        ride.setDriver(driver);
        ride.setSourceCity(request.getSourceCity());
        ride.setDestinationCity(request.getDestinationCity());
        ride.setStartTime(request.getStartTime());
        ride.setPricePerSeat(request.getPricePerSeat());
        ride.setTotalSeats(request.getTotalSeats());
        ride.setAvailableSeats(request.getTotalSeats());
        ride.setStatus(RideStatus.CREATED);

        if (request.getPickupPoints() != null) {
            ride.setPickupPoints(String.join("|", request.getPickupPoints()));
        }
        if (request.getDropPoints() != null) {
            ride.setDropPoints(String.join("|", request.getDropPoints()));
        }
        ride.setHasAc(request.getHasAc());
        ride.setLuggageAllowed(request.getLuggageAllowed());
        ride.setGenderPreference(request.getGenderPreference());
        ride.setDistanceKm(request.getDistanceKm());
        ride.setVehicleId(request.getVehicleId());

        return rideRepository.save(ride);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Ride> searchRides(String source, String dest) {
        if ((source == null || source.isBlank()) && (dest == null || dest.isBlank())) {
            return rideRepository.findAllAvailable();
        }
        return rideRepository.searchRides(
                source != null ? source : "",
                dest != null ? dest : ""
        );
    }
    
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Ride> getMyRides(UUID driverId, String driverEmail) {
        // First try by exact UUID
        List<Ride> rides = rideRepository.findByDriverId(driverId);
        if (!rides.isEmpty()) return rides;

        // Fallback 1: use authenticated email directly.
        String normalizedEmail = normalizeEmail(driverEmail);
        if (normalizedEmail != null) {
            List<Ride> byEmail = rideRepository.findByDriverEmail(normalizedEmail);
            if (!byEmail.isEmpty()) return byEmail;
        }

        // Fallback 2: resolve email from user table for this UUID.
        return userRepository.findById(driverId)
                .map(u -> rideRepository.findByDriverEmail(u.getEmail()))
                .orElse(rides);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Ride getRide(Long rideId) {
        return rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
    }

    @Transactional
    public void joinRide(Long rideId, UUID riderId) {
        // PESSIMISTIC LOCK could be added on the repository query, but here we use transactional isolation.
        // For stricter concurrency control, we should ideally lock the row.
        // Assuming default isolation level usually READ_COMMITTED, explicit locking is safer.
        
        // Simpler approach for this demo: Check available seats inside transaction
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
                
        if (ride.getStatus() != RideStatus.CREATED && ride.getStatus() != RideStatus.STARTED) {
             throw new RuntimeException("Ride is not active");
        }

        if (ride.getAvailableSeats() <= 0) {
            throw new RuntimeException("Ride is full");
        }

        boolean alreadyJoined = participantRepository.existsByRideIdAndRiderId(rideId, riderId);
        if (alreadyJoined) {
            throw new RuntimeException("You have already joined this ride");
        }
        
        User rider = userRepository.findById(riderId)
                .orElseThrow(() -> new RuntimeException("Rider not found"));

        // Don't decrement seats yet, wait for approval
        // ride.setAvailableSeats(ride.getAvailableSeats() - 1);
        // rideRepository.save(ride);

        // Add participant
        RideParticipant participant = new RideParticipant();
        participant.setRide(ride);
        participant.setRider(rider);
        participant.setFareAtBooking(ride.getPricePerSeat()); // Snapshot price
        participantRepository.save(participant);

        // Notify driver via email
        try {
            String timeStr = ride.getStartTime() != null ? ride.getStartTime().toString() : "Unknown";
            emailService.sendDriverBookingNotification(
                    ride.getDriver().getEmail(),
                    ride.getDriver().getName() != null ? ride.getDriver().getName() : ride.getDriver().getEmail(),
                    rider.getName() != null ? rider.getName() : rider.getEmail(),
                    rider.getEmail(),
                    ride.getSourceCity(),
                    ride.getDestinationCity(),
                    timeStr
            );
        } catch (Exception e) {
            System.err.println("Failed to send driver notification: " + e.getMessage());
        }
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<RideParticipant> getMyBookings(UUID riderId) {
        return participantRepository.findByRiderId(riderId);
    }

    @Transactional
    public Ride updateStatus(Long rideId, RideStatus status, UUID driverId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!canManageRide(rideId, driverId, driverEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        
        // Basic lifecycle validation
        if (ride.getStatus() == RideStatus.COMPLETED) {
            throw new RuntimeException("Cannot update completed ride");
        }
        
        // Prevent going back
        if (ride.getStatus() == RideStatus.STARTED && status == RideStatus.CREATED) {
             throw new RuntimeException("Cannot revert started ride to created");
        }

        ride.setStatus(status);
        return rideRepository.save(ride);
    }

    @Transactional
    public void approveRider(Long rideId, Long participantId, UUID driverId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        if (!canManageRide(rideId, driverId, driverEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        RideParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        if (!participant.getRide().getId().equals(rideId)) {
            throw new RuntimeException("Participant not part of this ride");
        }
        if (participant.getStatus() == ParticipantStatus.PAYMENT_PENDING
                || participant.getStatus() == ParticipantStatus.APPROVED) {
            return;
        }
        if (ride.getAvailableSeats() <= 0) {
            throw new RuntimeException("Ride is full");
        }

        // Set to PAYMENT_PENDING — seat is NOT reserved yet until payment
        participant.setStatus(ParticipantStatus.PAYMENT_PENDING);
        participantRepository.save(participant);

        // Email rider to complete payment
        try {
            String timeStr = ride.getStartTime() != null ? ride.getStartTime().toString() : "Unknown";
            emailService.sendRideApprovalEmail(
                    participant.getRider().getEmail(),
                    participant.getRider().getName(),
                    ride.getSourceCity(),
                    ride.getDestinationCity(),
                    timeStr,
                    ride.getDriver().getName()
            );
        } catch (Exception e) {
            // Approval should not fail if notification email fails.
            System.err.println("Failed to send ride approval email: " + e.getMessage());
        }
    }

    @Transactional
    public void confirmPayment(Long rideId, Long participantId, UUID riderId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        RideParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        if (!participant.getRide().getId().equals(rideId)) {
            throw new RuntimeException("Participant not part of this ride");
        }
        if (!participant.getRider().getId().equals(riderId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (participant.getStatus() != ParticipantStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Payment not expected for this participant");
        }

        // Mark as fully APPROVED and reserve the seat
        participant.setStatus(ParticipantStatus.APPROVED);
        participantRepository.save(participant);

        ride.setAvailableSeats(ride.getAvailableSeats() - 1);
        rideRepository.save(ride);
    }

    @Transactional
    public void rejectRider(Long rideId, Long participantId, UUID driverId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        if (!canManageRide(rideId, driverId, driverEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        RideParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        if (!participant.getRide().getId().equals(rideId)) {
            throw new RuntimeException("Participant not part of this ride");
        }

        // Seat was only reserved after APPROVED (post-payment), so only refund then
        if (participant.getStatus() == ParticipantStatus.APPROVED) {
            ride.setAvailableSeats(ride.getAvailableSeats() + 1);
            rideRepository.save(ride);
        }

        participant.setStatus(ParticipantStatus.REJECTED);
        participantRepository.save(participant);
    }

    private boolean isDriverAuthorizedForRide(Ride ride, UUID authDriverId, String authDriverEmail) {
        if (ride == null || ride.getDriver() == null) return false;

        if (authDriverId != null && ride.getDriver().getId() != null && ride.getDriver().getId().equals(authDriverId)) {
            return true;
        }

        String actorEmail = normalizeEmail(authDriverEmail);
        String rideDriverEmail = normalizeEmail(ride.getDriver().getEmail());
        if (actorEmail != null && actorEmail.equals(rideDriverEmail)) {
            return true;
        }

        if (authDriverId == null) {
            return false;
        }

        // Last fallback: resolve by DB user id if present.
        return userRepository.findById(authDriverId)
                .map(u -> normalizeEmail(u.getEmail()))
                .map(dbEmail -> dbEmail != null && dbEmail.equals(rideDriverEmail))
                .orElse(false);
    }

    private boolean canManageRide(Long rideId, UUID authDriverId, String authDriverEmail) {
        if (rideId == null) return false;
        return rideRepository.findById(rideId)
                .map(ride -> isDriverAuthorizedForRide(ride, authDriverId, authDriverEmail))
                .orElse(false);
    }

    private String normalizeEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
