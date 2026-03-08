package com.rideshare.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String company;
    private String model;
    
    @Column(name = "registration_number")
    private String registrationNumber;
    
    @Column(name = "rc_number")
    private String rcNumber;
    
    @Column(name = "insurance_number")
    private String insuranceNumber;
    
    @Column(name = "year_of_model")
    private Integer yearOfModel;
    
    @Column(name = "has_ac")
    private Boolean hasAc;
    
    @Column(name = "audio_system")
    private String audioSystem; // e.g., "Basic", "Premium", "None"
    
    @Column(name = "km_driven")
    private Integer kmDriven;
    
    private String color;

    @ElementCollection
    @CollectionTable(name = "vehicle_images", joinColumns = @JoinColumn(name = "vehicle_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User driver;
}
