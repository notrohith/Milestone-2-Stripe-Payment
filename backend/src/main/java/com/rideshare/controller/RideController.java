package com.rideshare.controller;

import com.rideshare.dto.CreateRideRequest;
import com.rideshare.dto.RideDto;
import com.rideshare.dto.UpdateRideStatusRequest;
import com.rideshare.model.RideParticipant;
import com.rideshare.model.User;
import com.rideshare.service.RideService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @PostMapping
    public ResponseEntity<RideDto> createRide(@RequestBody CreateRideRequest request) {
        return ResponseEntity.ok(RideDto.from(rideService.createRideByEmail(request)));
    }

    @GetMapping("/search")
    public ResponseEntity<List<RideDto>> searchRides(
            @RequestParam(name = "source", required = false, defaultValue = "") String source,
            @RequestParam(name = "dest", required = false, defaultValue = "") String dest) {
        return ResponseEntity.ok(
                rideService.searchRides(source, dest)
                        .stream().map(RideDto::from).collect(Collectors.toList())
        );
    }

    @GetMapping("/my-rides")
    public ResponseEntity<List<RideDto>> getMyRides(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(
                rideService.getMyRides(user.getId(), user.getEmail())
                        .stream().map(RideDto::from).collect(Collectors.toList())
        );
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingDto>> getMyBookings(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        List<RideParticipant> bookings = rideService.getMyBookings(user.getId());
        List<BookingDto> result = bookings.stream().map(p -> {
            BookingDto dto = new BookingDto();
            dto.setParticipantId(p.getId());
            dto.setStatus(p.getStatus() != null ? p.getStatus().name() : "PENDING");
            dto.setFareAtBooking(p.getFareAtBooking());
            dto.setJoinedAt(p.getJoinedAt() != null ? p.getJoinedAt().toString() : null);
            dto.setRide(RideDto.from(p.getRide()));
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideDto> getRide(@PathVariable("id") Long id) {
        return ResponseEntity.ok(RideDto.from(rideService.getRide(id)));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinRide(@PathVariable("id") Long id, @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        rideService.joinRide(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RideDto> updateStatus(@PathVariable("id") Long id, @RequestBody UpdateRideStatusRequest request, @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(RideDto.from(rideService.updateStatus(id, request.getStatus(), user.getId(), user.getEmail())));
    }

    @PostMapping("/{rideId}/participants/{participantId}/approve")
    public ResponseEntity<Void> approveRider(@PathVariable("rideId") Long rideId, @PathVariable("participantId") Long participantId, @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        rideService.approveRider(rideId, participantId, user.getId(), user.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{rideId}/participants/{participantId}/reject")
    public ResponseEntity<Void> rejectRider(@PathVariable("rideId") Long rideId, @PathVariable("participantId") Long participantId, @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        rideService.rejectRider(rideId, participantId, user.getId(), user.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{rideId}/participants/{participantId}/confirm-payment")
    public ResponseEntity<Void> confirmPayment(@PathVariable("rideId") Long rideId, @PathVariable("participantId") Long participantId, @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        rideService.confirmPayment(rideId, participantId, user.getId());
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/rides/{rideId}/participants/{participantId}/cancel
     * Rider cancels their own booking.
     */
    @PostMapping("/{rideId}/participants/{participantId}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable("rideId") Long rideId, @PathVariable("participantId") Long participantId, @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        rideService.cancelBooking(rideId, participantId, user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{rideId}/participants/{participantId}/rate")
    public ResponseEntity<Void> rateDriver(
            @PathVariable("rideId") Long rideId,
            @PathVariable("participantId") Long participantId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        int rating = ((Number) body.get("rating")).intValue();
        String review = body.containsKey("review") ? (String) body.get("review") : "";
        rideService.rateDriver(rideId, participantId, user.getId(), rating, review);
        return ResponseEntity.ok().build();
    }

    // Inner DTO for bookings response
    public static class BookingDto {
        private Long participantId;
        private String status;
        private java.math.BigDecimal fareAtBooking;
        private String joinedAt;
        private RideDto ride;

        public Long getParticipantId() { return participantId; }
        public void setParticipantId(Long participantId) { this.participantId = participantId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public java.math.BigDecimal getFareAtBooking() { return fareAtBooking; }
        public void setFareAtBooking(java.math.BigDecimal fareAtBooking) { this.fareAtBooking = fareAtBooking; }
        public String getJoinedAt() { return joinedAt; }
        public void setJoinedAt(String joinedAt) { this.joinedAt = joinedAt; }
        public RideDto getRide() { return ride; }
        public void setRide(RideDto ride) { this.ride = ride; }
    }
}
