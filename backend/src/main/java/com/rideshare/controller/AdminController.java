package com.rideshare.controller;

import com.rideshare.dto.SendApprovalEmailRequest;
import com.rideshare.model.User;
import com.rideshare.model.UserStatus;
import com.rideshare.repository.UserRepository;
import com.rideshare.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public AdminController(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<User>> getPendingUsers() {
        // This query requires a method in UserRepository. 
        // We will assume findAll().stream().filter... for now if custom query not added, 
        // or add findByStatus to repository. 
        // For efficiency, let's just do client side filtering or simple find all for this iteration 
        // unless I strictly update repository.
        // Let's filter on valid users.
        List<User> pendingUsers = userRepository.findAll().stream()
                .filter(u -> u.getStatus() == UserStatus.PENDING)
                .toList();
        return ResponseEntity.ok(pendingUsers);
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<User> approveUser(@PathVariable("id") UUID id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setStatus(UserStatus.APPROVED);
                    // Here we would trigger an email service to send "email and temp password" 
                    // (mocked for now as we don't have email infra)
                    System.out.println("Sending approval email to " + user.getEmail());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/users/{id}/reject")
    public ResponseEntity<User> rejectUser(@PathVariable("id") UUID id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setStatus(UserStatus.REJECTED);
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Sends the approval email via Google SMTP (called by the frontend after creating the Supabase Auth account).
     */
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/send-approval-email")
    public ResponseEntity<String> sendApprovalEmail(@RequestBody SendApprovalEmailRequest req) {
        try {
            String loginUrl = "http://localhost:3000/login";
            emailService.sendApprovalEmail(req.getEmail(), req.getName(), req.getTempPassword(), loginUrl);
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send email: " + e.getMessage());
        }
    }

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @org.springframework.transaction.annotation.Transactional
    @PostMapping("/reload-schema")
    public ResponseEntity<String> reloadSchema() {
        entityManager.createNativeQuery("NOTIFY pgrst, 'reload schema'").executeUpdate();
        return ResponseEntity.ok("Schema cache reloaded");
    }
}
