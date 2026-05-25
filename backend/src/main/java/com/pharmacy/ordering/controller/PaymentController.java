package com.pharmacy.ordering.controller;

import com.pharmacy.ordering.entity.Payment;
import com.pharmacy.ordering.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(
            @RequestParam Integer orderId,
            @RequestParam(required = false) String transactionId) {
        Payment payment = paymentService.processPayment(orderId, transactionId);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Payment> getPaymentDetails(@PathVariable Integer orderId) {
        Payment payment = paymentService.getPaymentDetails(orderId);
        return ResponseEntity.ok(payment);
    }
}
