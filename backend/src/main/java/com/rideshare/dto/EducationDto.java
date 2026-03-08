package com.rideshare.dto;

import lombok.Data;

@Data
public class EducationDto {
    private String level;
    private String institutionName;
    private String passingYear;
    private String percentage; // Received as string from form input; parsed to Double in AuthService
}
