package com.pharmacy.ordering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Integer orderId;
    private Integer userId;
    private String customerName;
    private BigDecimal totalAmount;
    private String orderStatus;
    private String paymentStatus;
    private String deliveryAddress;
    private LocalDateTime createdAt;
    private Integer prescriptionId;
    private String prescriptionFileUrl;
    private List<OrderItemResponse> orderItems;
}
