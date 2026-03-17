package com.rideshare.controller;

import com.rideshare.model.Vehicle;
import com.rideshare.repository.VehicleRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {
    
    private final VehicleRepository vehicleRepository;

    public VehicleController(VehicleRepository vehicleRepository) {
         this.vehicleRepository = vehicleRepository;
    }

    @GetMapping
    public List<Vehicle> getVehicles(@RequestParam("email") String email) {
        return vehicleRepository.findByDriverEmail(email);
    }
}
