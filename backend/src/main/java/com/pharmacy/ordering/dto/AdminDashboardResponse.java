package com.pharmacy.ordering.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {
    private BigDecimal totalSales;
    private Long totalOrders;
    private Long pendingPrescriptions;
    private Long totalMedicines;
    private Long totalUsers;
    private Long lowStockProducts;
    private List<OrderResponse> recentOrders;
    private List<PrescriptionResponse> recentPrescriptions;
}
