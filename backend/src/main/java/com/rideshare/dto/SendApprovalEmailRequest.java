package com.rideshare.dto;

import lombok.Data;

@Data
public class SendApprovalEmailRequest {
    private String email;
    private String name;
    private String tempPassword;
}
