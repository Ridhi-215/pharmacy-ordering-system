package com.pharmacy.ordering.service;

import com.pharmacy.ordering.dto.AdminDashboardResponse;
import com.pharmacy.ordering.dto.OrderItemResponse;
import com.pharmacy.ordering.dto.OrderResponse;
import com.pharmacy.ordering.dto.PrescriptionResponse;
import com.pharmacy.ordering.entity.*;
import com.pharmacy.ordering.repository.MedicineRepository;
import com.pharmacy.ordering.repository.OrderRepository;
import com.pharmacy.ordering.repository.PrescriptionRepository;
import com.pharmacy.ordering.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicineRepository medicineRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public AdminDashboardResponse getDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();
        
        // Sum total amount of orders where payment is PAID
        BigDecimal totalSales = allOrders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrdersCount = allOrders.size();
        
        long pendingPrescriptionsCount = prescriptionRepository.findByStatus(PrescriptionStatus.PENDING).size();
        long totalMedicinesCount = medicineRepository.count();
        long totalUsersCount = userRepository.count();
        long lowStockCount = medicineRepository.countByStockQuantityLessThanEqual(10);

        // Fetch recent orders (first 5)
        List<OrderResponse> recentOrders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(5)
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        // Fetch recent prescriptions (first 5)
        List<PrescriptionResponse> recentPrescriptions = prescriptionRepository.findAll().stream()
                .sorted((p1, p2) -> p2.getUploadedAt().compareTo(p1.getUploadedAt()))
                .limit(5)
                .map(this::mapToPrescriptionResponse)
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .totalSales(totalSales)
                .totalOrders(totalOrdersCount)
                .pendingPrescriptions(pendingPrescriptionsCount)
                .totalMedicines(totalMedicinesCount)
                .totalUsers(totalUsersCount)
                .lowStockProducts(lowStockCount)
                .recentOrders(recentOrders)
                .recentPrescriptions(recentPrescriptions)
                .build();
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .orderItemId(item.getOrderItemId())
                        .medicineId(item.getMedicine().getMedicineId())
                        .medicineName(item.getMedicine().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .userId(order.getUser().getUserId())
                .customerName(order.getUser().getFullName())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .deliveryAddress(order.getDeliveryAddress())
                .createdAt(order.getCreatedAt())
                .orderItems(items)
                .build();
    }

    private PrescriptionResponse mapToPrescriptionResponse(Prescription p) {
        return PrescriptionResponse.builder()
                .prescriptionId(p.getPrescriptionId())
                .userId(p.getUser().getUserId())
                .userFullName(p.getUser().getFullName())
                .fileUrl(p.getFileUrl())
                .status(p.getStatus().name())
                .uploadedAt(p.getUploadedAt())
                .verifiedBy(p.getVerifiedBy())
                .build();
    }
}
