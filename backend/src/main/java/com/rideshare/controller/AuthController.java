package com.rideshare.controller;

import com.rideshare.dto.FullRegistrationRequest;
import com.rideshare.dto.SyncUserRequest;
import com.rideshare.model.User;
import com.rideshare.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/sync")
    public ResponseEntity<User> syncUser(@RequestBody SyncUserRequest request) {
        return ResponseEntity.ok(authService.syncUser(request));
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody FullRegistrationRequest request) {
        return ResponseEntity.ok(authService.registerUser(request));
    }

    /** Debug: returns what user the backend sees for the current JWT */
    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal User user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "not authenticated"));
        return ResponseEntity.ok(Map.of(
            "id", user.getId().toString(),
            "email", user.getEmail(),
            "role", user.getRole().name(),
            "status", user.getStatus().name()
        ));
    }
}
