package com.rideshare.dto;

import com.rideshare.model.Role;
import lombok.Data;
import java.util.UUID;

@Data
public class SyncUserRequest {
    private UUID id;
    private String email;
    private String name;
    private Role role;
}
