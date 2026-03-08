package com.rideshare.dto;

import lombok.Data;
import java.util.List;

@Data
public class VehicleDto {
    private String company;
    private String model;
    private String registrationNumber;
    private String rcNumber;
    private String insuranceNumber;
    private Integer yearOfModel;
    private Boolean hasAc;
    private String audioSystem;
    private Integer kmDriven;
    private String color;
    private List<String> imageUrls;
}
