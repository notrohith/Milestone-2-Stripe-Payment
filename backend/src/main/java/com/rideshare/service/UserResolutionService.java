package com.rideshare.service;

import com.rideshare.model.Role;
import com.rideshare.model.User;
import com.rideshare.model.UserStatus;
import com.rideshare.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

import java.util.Optional;
import java.util.UUID;

/**
 * Handles JWT-time user resolution with proper transaction support.
 * The filter itself cannot use @Transactional reliably, so we delegate here.
 */
@Service
public class UserResolutionService {

    private final UserRepository userRepository;

    public UserResolutionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<User> resolveOrCreate(UUID authUserId, String email, String name, String rawRole) {
        // 1. Try by UUID
        Optional<User> userOpt = userRepository.findById(authUserId);
        if (userOpt.isPresent()) return userOpt;

        // 2. Try by email
        if (email != null) {
            userOpt = userRepository.findFirstByEmail(email);
            if (userOpt.isPresent()) {
                System.out.println("[Auth] Found user by email fallback: " + email);
                return userOpt;
            }
        }

        // 3. Auto-create from JWT claims
        if (email != null) {
            System.out.println("[Auth] Auto-creating user for: " + email);
            try {
                Role role;
                try {
                    role = rawRole != null ? Role.fromString(rawRole) : Role.RIDER;
                } catch (Exception ex) {
                    role = Role.RIDER;
                }

                String displayName = (name != null && !name.isBlank()) ? name : email.split("@")[0];

                User newUser = new User();
                newUser.setId(authUserId);
                newUser.setEmail(email);
                newUser.setName(displayName);
                newUser.setRole(role);
                newUser.setStatus(UserStatus.PENDING);
                User saved = userRepository.save(newUser);
                System.out.println("[Auth] Auto-created user id=" + saved.getId() + " role=" + saved.getRole());
                return Optional.of(saved);
            } catch (Exception ex) {
                System.err.println("[Auth] Auto-create FAILED: " + ex.getMessage());
            }
        }

        return Optional.empty();
    }
}
