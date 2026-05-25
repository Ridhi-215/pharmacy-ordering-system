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
public class CartItemResponse {
    private Integer cartId;
    private Integer medicineId;
    private String name;
    private BigDecimal price;
    private Integer quantity;
    private Boolean requiresPrescription;
    private Integer stockQuantity;
    private String dosage;
    private String packaging;
}
