package com.rideshare.service;

import com.rideshare.model.Notification;
import com.rideshare.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Create a notification and persist it to Supabase (via JPA).
     */
    @Transactional
    public Notification createNotification(UUID userId, String role, String type, String title, String message, Long rideId) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setRole(role);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setRideId(rideId);
        return notificationRepository.save(n);
    }

    /**
     * Get all notifications for a user, newest first.
     */
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get only unread notifications for a user.
     */
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(UUID userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    /**
     * Mark a single notification as read, only if it belongs to the given user.
     */
    @Transactional
    public boolean markNotificationAsRead(UUID notificationId, UUID userId) {
        Optional<Notification> opt = notificationRepository.findById(notificationId);
        if (opt.isPresent()) {
            Notification n = opt.get();
            if (n.getUserId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
                return true;
            }
        }
        return false;
    }

    /**
     * Mark all notifications as read for a user.
     */
    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
