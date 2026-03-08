package com.rideshare.dto;

import com.rideshare.model.RideStatus;
import lombok.Data;

@Data
public class UpdateRideStatusRequest {
    private RideStatus status;
}
