package com.rideshare.service;

import com.rideshare.dto.CreateRideRequest;
import com.rideshare.model.*;
import com.rideshare.repository.RideParticipantRepository;
import com.rideshare.repository.RideRepository;
import com.rideshare.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final RideParticipantRepository participantRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public RideService(RideRepository rideRepository, UserRepository userRepository, RideParticipantRepository participantRepository, EmailService emailService, NotificationService notificationService) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
        this.emailService = emailService;
        this.notificationService = notificationService;
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
        try {
            if ((source == null || source.isBlank()) && (dest == null || dest.isBlank())) {
                return rideRepository.findAllAvailable();
            }
            return rideRepository.searchRides(
                    source != null ? source : "",
                    dest != null ? dest : ""
            );
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("SEARCH ERROR: " + e.getMessage());
            throw e;
        }
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

    // ─────────────────────────────────────────────────────────────────────────
    // JOIN_REQUEST — Rider sends join request → Driver gets notification
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public void joinRide(Long rideId, UUID riderId) {
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

        // Add participant
        RideParticipant participant = new RideParticipant();
        participant.setRide(ride);
        participant.setRider(rider);
        participant.setFareAtBooking(ride.getPricePerSeat());
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
            System.err.println("Failed to send driver notification email: " + e.getMessage());
        }

        // ▸ Notification → DRIVER: JOIN_REQUEST
        notificationService.createNotification(
                ride.getDriver().getId(),
                "DRIVER",
                "JOIN_REQUEST",
                "New Ride Request",
                "A rider requested to join your ride from " + ride.getSourceCity() + " to " + ride.getDestinationCity() + ". Approve in Driver Hub.",
                rideId
        );
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<RideParticipant> getMyBookings(UUID riderId) {
        return participantRepository.findByRiderId(riderId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE STATUS — Handles STARTED, COMPLETED, CANCELLED ride transitions
    // Notifications: RIDE_STARTED, RIDE_ENDED, RIDE_CANCELLED → all APPROVED riders
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public Ride updateStatus(Long rideId, RideStatus status, UUID driverId, String driverEmail) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!canManageRide(rideId, driverId, driverEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (ride.getStatus() == RideStatus.COMPLETED) {
            throw new RuntimeException("Cannot update completed ride");
        }
        
        if (ride.getStatus() == RideStatus.STARTED && status == RideStatus.CREATED) {
             throw new RuntimeException("Cannot revert started ride to created");
        }

        ride.setStatus(status);
        Ride saved = rideRepository.save(ride);

        // Get all approved riders for this ride to send notifications
        List<RideParticipant> approvedRiders = participantRepository.findByRideIdAndStatus(rideId, ParticipantStatus.APPROVED);

        if (status == RideStatus.STARTED) {
            // ▸ Notification → all RIDERS: RIDE_STARTED
            for (RideParticipant p : approvedRiders) {
                notificationService.createNotification(
                        p.getRider().getId(),
                        "RIDER",
                        "RIDE_STARTED",
                        "Ride Started! 🚗",
                        "Your ride has started.",
                        rideId
                );
            }
        } else if (status == RideStatus.COMPLETED) {
            // ▸ Notification → all RIDERS: RIDE_ENDED
            for (RideParticipant p : approvedRiders) {
                notificationService.createNotification(
                        p.getRider().getId(),
                        "RIDER",
                        "RIDE_ENDED",
                        "Ride Completed 🏁",
                        "Ride completed. Please rate your driver.",
                        rideId
                );
            }
        } else if (status == RideStatus.CANCELLED) {
            // ▸ Notification → all participants (not just APPROVED): RIDE_CANCELLED
            List<RideParticipant> allParticipants = participantRepository.findByRideId(rideId);
            for (RideParticipant p : allParticipants) {
                ParticipantStatus pStatus = p.getStatus();
                if (pStatus == ParticipantStatus.APPROVED || pStatus == ParticipantStatus.PENDING || pStatus == ParticipantStatus.PAYMENT_PENDING) {
                    notificationService.createNotification(
                            p.getRider().getId(),
                            "RIDER",
                            "RIDE_CANCELLED",
                            "Ride Cancelled",
                            "The driver cancelled the ride.",
                            rideId
                    );
                }
            }
        }

        return saved;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REQUEST_APPROVED — Driver approves rider → Rider gets notification
    // ─────────────────────────────────────────────────────────────────────────
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
            System.err.println("Failed to send ride approval email: " + e.getMessage());
        }
        
        // ▸ Notification → RIDER: REQUEST_APPROVED
        notificationService.createNotification(
                participant.getRider().getId(),
                "RIDER",
                "REQUEST_APPROVED",
                "Ride Request Approved!",
                "Your ride request was approved. Please complete payment to confirm your seat.",
                rideId
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAYMENT_SUCCESS — Rider pays → Driver gets notification + check RIDE_FULL
    // ─────────────────────────────────────────────────────────────────────────
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

        // ▸ Notification → RIDER: PAYMENT_SUCCESS
        notificationService.createNotification(
                participant.getRider().getId(),
                "RIDER",
                "PAYMENT_SUCCESS",
                "Payment Successful ✓",
                "Your payment was successful. Your seat is confirmed.",
                rideId
        );

        // ▸ Notification → DRIVER: PAYMENT_SUCCESS
        String riderName = participant.getRider().getName() != null ? participant.getRider().getName() : participant.getRider().getEmail();
        notificationService.createNotification(
                ride.getDriver().getId(),
                "DRIVER",
                "PAYMENT_SUCCESS",
                "Payment Received!",
                "A rider has confirmed their seat by completing payment.",
                rideId
        );

        try {
            String subject = "Seat Confirmed for Ride to " + ride.getDestinationCity();
            String text = "Hello " + ride.getDriver().getName() + ",\n\n" +
                    riderName + " has successfully paid for their seat.\n\n" +
                    "Ride: " + ride.getSourceCity() + " to " + ride.getDestinationCity() + "\n\n" +
                    "You can view the full details in your Driver Hub.\n\n" +
                    "Thanks,\nRideWithMe";
            emailService.sendSimpleMessage(ride.getDriver().getEmail(), subject, text);
        } catch (Exception e) {
            System.err.println("Failed to send driver notification: " + e.getMessage());
        }

        // Check if ride is now full → RIDE_FULL notifications
        if (ride.getAvailableSeats() <= 0) {
            // ▸ Notification → DRIVER: RIDE_FULL
            notificationService.createNotification(
                    ride.getDriver().getId(),
                    "DRIVER",
                    "RIDE_FULL",
                    "Ride Fully Booked! 🎉",
                    "Your ride is now fully booked.",
                    rideId
            );

            // ▸ Notification → all approved RIDERS: RIDE_FULL
            List<RideParticipant> approvedRiders = participantRepository.findByRideIdAndStatus(rideId, ParticipantStatus.APPROVED);
            for (RideParticipant p : approvedRiders) {
                notificationService.createNotification(
                        p.getRider().getId(),
                        "RIDER",
                        "RIDE_FULL",
                        "Ride Full",
                        "This ride is now full.",
                        rideId
                );
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REQUEST_REJECTED — Driver rejects rider → Rider gets notification
    // ─────────────────────────────────────────────────────────────────────────
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

        // ▸ Notification → RIDER: REQUEST_REJECTED
        notificationService.createNotification(
                participant.getRider().getId(),
                "RIDER",
                "REQUEST_REJECTED",
                "Ride Request Rejected",
                "Your ride request was rejected by the driver.",
                rideId
        );

        try {
            String subject = "Ride Request Update";
            String text = "Hello " + participant.getRider().getName() + ",\n\n" +
                    "Unfortunately, your request to join the ride from " + ride.getSourceCity() + " to " + ride.getDestinationCity() + " has been rejected by the driver.\n\n" +
                    "You can search for other available rides on RideWithMe.\n\n" +
                    "Thanks,\nRideWithMe";
            emailService.sendSimpleMessage(participant.getRider().getEmail(), subject, text);
        } catch (Exception e) {
            System.err.println("Failed to send rider rejection email: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RIDER_CANCELLED — Rider cancels their booking → Driver gets notification
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public void cancelBooking(Long rideId, Long participantId, UUID riderId) {
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
        if (participant.getStatus() == ParticipantStatus.CANCELLED || participant.getStatus() == ParticipantStatus.REJECTED) {
            throw new RuntimeException("Booking is already cancelled or rejected");
        }

        // If seat was reserved (APPROVED status), free it back
        if (participant.getStatus() == ParticipantStatus.APPROVED) {
            ride.setAvailableSeats(ride.getAvailableSeats() + 1);
            rideRepository.save(ride);
        }

        participant.setStatus(ParticipantStatus.CANCELLED);
        participantRepository.save(participant);

        // ▸ Notification → DRIVER: RIDER_CANCELLED
        notificationService.createNotification(
                ride.getDriver().getId(),
                "DRIVER",
                "RIDER_CANCELLED",
                "Booking Cancelled",
                "A rider cancelled their booking.",
                rideId
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RATING_RECEIVED — Rider rates driver → Driver gets notification
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public void rateDriver(Long rideId, Long participantId, UUID riderId, int rating, String review) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() != RideStatus.COMPLETED) {
            throw new RuntimeException("Can only rate after ride is completed");
        }

        RideParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        if (!participant.getRide().getId().equals(rideId)) {
            throw new RuntimeException("Participant not part of this ride");
        }
        if (!participant.getRider().getId().equals(riderId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (participant.getStatus() != ParticipantStatus.APPROVED) {
            throw new RuntimeException("Only approved riders can rate");
        }

        // ▸ Notification → DRIVER: RATING_RECEIVED
        notificationService.createNotification(
                ride.getDriver().getId(),
                "DRIVER",
                "RATING_RECEIVED",
                "New Rating ⭐",
                "You received a new rating from a rider.",
                rideId
        );
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
