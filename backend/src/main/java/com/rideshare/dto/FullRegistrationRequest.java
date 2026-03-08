package com.rideshare.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rideshare.model.Role;
import lombok.Data;
import java.util.UUID;
import java.util.List;
import java.time.LocalDate;

@Data
public class FullRegistrationRequest {
    private UUID id; // Supabase ID
    private String email;
    private String name;
    private Role role;
    private String phoneNumber;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String profilePhotoUrl;
    
    // Document URLs
    private String aadharCardUrl;
    private String panCardUrl;
    private String drivingLicenseUrl;
    
    // Nested details
    private List<EducationDto> educationDetails;
    private VehicleDto vehicleDetails; // Only for Drivers
}
