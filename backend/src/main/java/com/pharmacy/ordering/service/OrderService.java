package com.pharmacy.ordering.service;

import com.pharmacy.ordering.dto.OrderItemResponse;
import com.pharmacy.ordering.dto.OrderPlaceRequest;
import com.pharmacy.ordering.dto.OrderResponse;
import com.pharmacy.ordering.entity.*;
import com.pharmacy.ordering.exception.BadRequestException;
import com.pharmacy.ordering.exception.ResourceNotFoundException;
import com.pharmacy.ordering.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final MedicineRepository medicineRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PaymentRepository paymentRepository;
    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final EmailService emailService;

    @Transactional
    public OrderResponse placeOrder(String email, OrderPlaceRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findByUserUserId(user.getUserId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Your cart is empty. Cannot place an order.");
        }

        // 1. Validation: check stock and check prescription requirements
        boolean requiresPrescription = false;
        for (CartItem item : cartItems) {
            Medicine medicine = item.getMedicine();
            
            // Check stock
            if (medicine.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for medicine: " + medicine.getName() 
                        + ". Available: " + medicine.getStockQuantity());
            }

            // Check if any medicine in cart requires prescription
            if (Boolean.TRUE.equals(medicine.getRequiresPrescription())) {
                requiresPrescription = true;
            }
        }

        // 2. If prescription required, strictly validate latest approved prescription
        Prescription prescription = null;
        if (requiresPrescription) {
            prescription = validatePrescriptionForOrder(user, request.getPrescriptionId());
        }

        // 3. Compute total amount
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            BigDecimal itemTotal = item.getMedicine().getPrice().multiply(new BigDecimal(item.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        // 4. Create Order (Status defaults to PENDING)
        Order order = Order.builder()
                .user(user)
                .totalAmount(totalAmount)
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .prescription(prescription)
                .build();

        Order savedOrder = orderRepository.save(order);

        // 5. Create OrderItems (Do NOT deduct stock yet - it will be done on CONFIRMED)
        List<OrderItem> orderItemsList = new ArrayList<>();
        for (CartItem item : cartItems) {
            Medicine medicine = item.getMedicine();
            
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .medicine(medicine)
                    .quantity(item.getQuantity())
                    .price(medicine.getPrice())
                    .build();
            
            orderItemsList.add(orderItem);
        }
        savedOrder.setOrderItems(orderItemsList);
        orderRepository.save(savedOrder);

        // 6. Create Initial Payment details
        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();
        paymentRepository.save(payment);

        // 7. Update Loyalty Points (1 point per $10 spent)
        int pointsToEarn = totalAmount.divide(new BigDecimal(10)).intValue();
        if (pointsToEarn > 0) {
            LoyaltyPoints loyaltyPoints = loyaltyPointsRepository.findByUserUserId(user.getUserId())
                    .orElseGet(() -> LoyaltyPoints.builder().user(user).totalPoints(0).build());
            loyaltyPoints.setTotalPoints(loyaltyPoints.getTotalPoints() + pointsToEarn);
            loyaltyPointsRepository.save(loyaltyPoints);
        }

        // 8. Clear the Cart
        cartItemRepository.deleteAll(cartItems);

        return mapToResponse(savedOrder);
    }

    public List<OrderResponse> getOrderHistory(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return orderRepository.findByUserUserIdOrderByCreatedAtDesc(user.getUserId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public OrderResponse getOrderDetails(Integer orderId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Ensure user is authorized to see the order (ADMIN or the order owner)
        if (user.getRole() != Role.ADMIN && !order.getUser().getUserId().equals(user.getUserId())) {
            throw new BadRequestException("Access denied: You cannot view this order.");
        }

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Integer orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus previousStatus = order.getOrderStatus();
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status + ". Allowed: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED");
        }

        // 1. Transactional stock reduction on confirmation
        if ((newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.SHIPPED || newStatus == OrderStatus.DELIVERED) 
                && previousStatus == OrderStatus.PENDING) {
            for (OrderItem item : order.getOrderItems()) {
                Medicine medicine = item.getMedicine();
                if (medicine.getStockQuantity() < item.getQuantity()) {
                    throw new BadRequestException("Insufficient stock for: " + medicine.getName() 
                            + ". Available: " + medicine.getStockQuantity() + ", Ordered: " + item.getQuantity());
                }
                medicine.setStockQuantity(medicine.getStockQuantity() - item.getQuantity());
                medicineRepository.save(medicine);
            }
        }

        // 2. Transactional stock restoration on cancellation
        if (newStatus == OrderStatus.CANCELLED 
                && (previousStatus == OrderStatus.CONFIRMED || previousStatus == OrderStatus.SHIPPED)) {
            for (OrderItem item : order.getOrderItems()) {
                Medicine medicine = item.getMedicine();
                medicine.setStockQuantity(medicine.getStockQuantity() + item.getQuantity());
                medicineRepository.save(medicine);
            }
            // Update payment status if paid
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                Payment payment = paymentRepository.findByOrderOrderId(orderId).orElse(null);
                if (payment != null) {
                    payment.setPaymentStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                }
            }
        }

        order.setOrderStatus(newStatus);
        Order saved = orderRepository.save(order);
        
        if (newStatus == OrderStatus.CONFIRMED && previousStatus != OrderStatus.CONFIRMED) {
            emailService.sendOrderConfirmedEmail(saved.getUser(), saved);
        }
        
        return mapToResponse(saved);
    }

    @Transactional
    public OrderResponse cancelOrder(Integer orderId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getUser().getUserId().equals(user.getUserId())) {
            throw new BadRequestException("Access denied: You cannot cancel this order.");
        }

        if (order.getOrderStatus() != OrderStatus.PENDING && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Cannot cancel order in status: " + order.getOrderStatus() 
                    + ". Only PENDING or CONFIRMED orders can be cancelled.");
        }

        OrderStatus previousStatus = order.getOrderStatus();
        order.setOrderStatus(OrderStatus.CANCELLED);

        // Restore stock if previously confirmed
        if (previousStatus == OrderStatus.CONFIRMED) {
            for (OrderItem item : order.getOrderItems()) {
                Medicine medicine = item.getMedicine();
                medicine.setStockQuantity(medicine.getStockQuantity() + item.getQuantity());
                medicineRepository.save(medicine);
            }
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                order.setPaymentStatus(PaymentStatus.FAILED);
                Payment payment = paymentRepository.findByOrderOrderId(orderId).orElse(null);
                if (payment != null) {
                    payment.setPaymentStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                }
            }
        }

        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    /**
     * Enforces prescription approval rules before order placement:
     * - prescription must exist and belong to the current user
     * - must be the user's latest upload
     * - latest status must be APPROVED
     * - prevents duplicate orders for the same prescription
     */
    private Prescription validatePrescriptionForOrder(User user, Integer prescriptionId) {
        List<Prescription> userPrescriptions = prescriptionRepository
                .findByUserUserIdOrderByUploadedAtDesc(user.getUserId());

        if (userPrescriptions.isEmpty()) {
            throw new BadRequestException("Prescription upload is required for this order.");
        }

        Prescription latestPrescription = userPrescriptions.get(0);

        if (prescriptionId == null) {
            throw new BadRequestException("Prescription upload is required for this order.");
        }

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id: " + prescriptionId));

        if (!prescription.getUser().getUserId().equals(user.getUserId())) {
            throw new BadRequestException("Invalid prescription. It does not belong to your account.");
        }

        if (!prescription.getPrescriptionId().equals(latestPrescription.getPrescriptionId())) {
            throw new BadRequestException("You must use your latest uploaded prescription for checkout.");
        }

        PrescriptionStatus status = prescription.getStatus();
        if (status == null) {
            throw new BadRequestException("Prescription status is unavailable. Please upload a new prescription.");
        }

        if (status == PrescriptionStatus.PENDING) {
            throw new BadRequestException("Prescription approval is pending from admin.");
        }

        if (status == PrescriptionStatus.REJECTED) {
            String message = "Prescription was rejected by admin.";
            if (prescription.getRejectionReason() != null && !prescription.getRejectionReason().isBlank()) {
                message += " Reason: " + prescription.getRejectionReason();
            } else {
                message += " Please upload a new prescription.";
            }
            throw new BadRequestException(message);
        }

        if (status != PrescriptionStatus.APPROVED) {
            throw new BadRequestException("Prescription must be approved before placing an order.");
        }

        orderRepository.findByPrescriptionPrescriptionId(prescriptionId).ifPresent(existingOrder -> {
            if (existingOrder.getOrderStatus() != OrderStatus.CANCELLED) {
                throw new BadRequestException("An order has already been placed with this prescription.");
            }
        });

        return prescription;
    }

    private OrderResponse mapToResponse(Order order) {
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
                .prescriptionId(order.getPrescription() != null ? order.getPrescription().getPrescriptionId() : null)
                .prescriptionFileUrl(order.getPrescription() != null ? order.getPrescription().getFileUrl() : null)
                .orderItems(items)
                .build();
    }
}
