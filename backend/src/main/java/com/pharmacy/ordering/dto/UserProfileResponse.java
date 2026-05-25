package com.pharmacy.ordering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Integer userId;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String address;
    private Integer loyaltyPoints;
}
