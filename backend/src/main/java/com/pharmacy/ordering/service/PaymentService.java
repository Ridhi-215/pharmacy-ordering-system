package com.pharmacy.ordering.service;

import com.pharmacy.ordering.entity.Order;
import com.pharmacy.ordering.entity.Payment;
import com.pharmacy.ordering.entity.PaymentStatus;
import com.pharmacy.ordering.exception.ResourceNotFoundException;
import com.pharmacy.ordering.repository.OrderRepository;
import com.pharmacy.ordering.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final com.pharmacy.ordering.repository.MedicineRepository medicineRepository;
    private final EmailService emailService;

    @Transactional
    public Payment processPayment(Integer orderId, String transactionId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = paymentRepository.findByOrderOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for order: " + orderId));

        payment.setPaymentStatus(PaymentStatus.PAID);
        if (transactionId != null && !transactionId.trim().isEmpty()) {
            payment.setTransactionId(transactionId);
        }
        paymentRepository.save(payment);

        order.setPaymentStatus(PaymentStatus.PAID);
        
        // Automatically CONFIRM order and reduce stock when PAID
        if (order.getOrderStatus() == com.pharmacy.ordering.entity.OrderStatus.PENDING) {
            order.setOrderStatus(com.pharmacy.ordering.entity.OrderStatus.CONFIRMED);
            for (com.pharmacy.ordering.entity.OrderItem item : order.getOrderItems()) {
                com.pharmacy.ordering.entity.Medicine medicine = item.getMedicine();
                if (medicine.getStockQuantity() < item.getQuantity()) {
                    throw new com.pharmacy.ordering.exception.BadRequestException("Insufficient stock for: " + medicine.getName() 
                            + ". Available: " + medicine.getStockQuantity() + ", Ordered: " + item.getQuantity());
                }
                medicine.setStockQuantity(medicine.getStockQuantity() - item.getQuantity());
                medicineRepository.save(medicine);
            }
            
            // Trigger confirmation email
            emailService.sendOrderConfirmedEmail(order.getUser(), order);
        }
        
        orderRepository.save(order);

        return payment;
    }

    public Payment getPaymentDetails(Integer orderId) {
        return paymentRepository.findByOrderOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order: " + orderId));
    }
}
