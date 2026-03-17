package com.rideshare.controller;

import com.rideshare.model.Notification;
import com.rideshare.model.User;
import com.rideshare.service.NotificationService;
import com.rideshare.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    /**
     * Resolve the DB-specific UUID using the authenticated user's email.
     * This handles cases where the JWT 'sub' differs from the DB record's 'id',
     * and specifically prefers the principal ID if it exists (handling duplicates).
     */
    private UUID resolveDbId(User user) {
        if (user == null) return null;
        if (userRepository.existsById(user.getId())) return user.getId();
        return userRepository.findFirstByEmail(user.getEmail())
                .map(User::getId)
                .orElse(user.getId());
    }

    /**
     * GET /api/notifications
     * Returns all notifications for the authenticated user, newest first.
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        UUID dbId = resolveDbId(user);
        return ResponseEntity.ok(notificationService.getUserNotifications(dbId));
    }

    /**
     * PATCH /api/notifications/{id}/read
     * Marks a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable("id") UUID id, @AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        UUID dbId = resolveDbId(user);
        boolean ok = notificationService.markNotificationAsRead(id, dbId);
        return ok ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    /**
     * PATCH /api/notifications/read-all
     * Marks all notifications as read for the authenticated user.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).build();
        UUID dbId = resolveDbId(user);
        notificationService.markAllAsRead(dbId);
        return ResponseEntity.ok().build();
    }
}
