package com.pharmacy.ordering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionResponse {
    private Integer prescriptionId;
    private Integer userId;
    private String userFullName;
    private String fileUrl;
    private String status;
    private LocalDateTime uploadedAt;
    private String verifiedBy;
    private String rejectionReason;
    private Integer orderId;
}
