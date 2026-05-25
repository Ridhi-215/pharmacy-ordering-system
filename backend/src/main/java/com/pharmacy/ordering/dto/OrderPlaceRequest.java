package com.pharmacy.ordering.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderPlaceRequest {

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // e.g., CARD, CASH_ON_DELIVERY, PAYPAL

    private Integer prescriptionId;
}
