package com.pharmacy.ordering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private Integer orderItemId;
    private Integer medicineId;
    private String medicineName;
    private Integer quantity;
    private BigDecimal price;
}
