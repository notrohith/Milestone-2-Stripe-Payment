package com.rideshare.controller;

import com.rideshare.dto.PublishRideRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/ride-realtime")   // Moved off /api/rides to avoid mapping conflict with RideController
@CrossOrigin(origins = "*")
public class RidePublishController {

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    // Track active rides for GPS simulation
    private final Map<String, double[]> activeRides = new ConcurrentHashMap<>();
    private final Random random = new Random();

    /**
     * POST /api/ride-realtime/publish
     * Accepts ride details from the frontend, returns a ride ID.
     */
    @PostMapping("/publish")
    public ResponseEntity<Map<String, Object>> publishRide(@RequestBody PublishRideRequest request) {
        String rideId = "RIDE-" + System.currentTimeMillis();

        activeRides.put(rideId, new double[]{20.5937, 78.9629, 0});

        Map<String, Object> response = new HashMap<>();
        response.put("id", rideId);
        response.put("sourceCity", request.getSourceCity());
        response.put("destinationCity", request.getDestinationCity());
        response.put("startTime", request.getStartTime());
        response.put("pricePerSeat", request.getPricePerSeat());
        response.put("totalSeats", request.getTotalSeats());
        response.put("status", "OPEN");
        response.put("createdAt", LocalDateTime.now().toString());
        response.put("message", "Ride published successfully! Real-time tracking enabled.");

        return ResponseEntity.ok(response);
    }

    @GetMapping("/route")
    public ResponseEntity<Map<String, Object>> getRoute(
            @RequestParam(required = false) Double startLat,
            @RequestParam(required = false) Double startLng,
            @RequestParam(required = false) Double destLat,
            @RequestParam(required = false) Double destLng) {

        double dist = 0;
        if (startLat != null && destLat != null) {
            double R = 6371;
            double dLat = Math.toRadians(destLat - startLat);
            double dLon = Math.toRadians(destLng - startLng);
            double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                    + Math.cos(Math.toRadians(startLat)) * Math.cos(Math.toRadians(destLat))
                    * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("distanceKm", Math.round(dist * 10.0) / 10.0);
        response.put("estimatedDurationMin", (int) (dist / 60 * 60));
        return ResponseEntity.ok(response);
    }

    @Scheduled(fixedDelay = 3000)
    public void broadcastGpsUpdates() {
        if (messagingTemplate == null || activeRides.isEmpty()) return;

        activeRides.forEach((rideId, state) -> {
            double lat = state[0] + (random.nextDouble() - 0.5) * 0.01;
            double lng = state[1] + (random.nextDouble() - 0.5) * 0.01;
            state[0] = lat;
            state[1] = lng;

            Map<String, Double> payload = Map.of("lat", lat, "lng", lng);
            messagingTemplate.convertAndSend("/topic/ride/" + rideId, payload);
        });
    }
}
