package com.pharmacy.ordering.service;

import com.pharmacy.ordering.entity.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendPrescriptionApprovedEmail(User user, Prescription prescription) {
        String toEmail = user.getEmail();
        log.info("Generating prescription approval email for user: {}", toEmail);

        String emailText = "====================================================================\n"
                + "                    PHARMACY RX APPROVAL NOTIFICATION              \n"
                + "====================================================================\n"
                + "Dear " + user.getFullName() + ",\n\n"
                + "Great news! Your uploaded medical prescription has been reviewed and approved.\n\n"
                + "Prescription reference: #Rx-200" + prescription.getPrescriptionId() + "\n"
                + "Verified By: " + (prescription.getVerifiedBy() != null ? prescription.getVerifiedBy() : "Pharmacy Medical Administrator") + "\n\n"
                + "STATUS: APPROVED (Rx AUTHORIZED)\n\n"
                + "You are now authorized to order prescription-restricted medicines in our online store.\n"
                + "Your items in the cart are ready for immediate checkout!\n\n"
                + "If you did not upload this, please contact support immediately.\n\n"
                + "Best regards,\n"
                + "The PharmaCare Medical Team\n"
                + "====================================================================";

        System.out.println("====================================================================");
        System.out.println("                 SENDING PRESCRIPTION APPROVED EMAIL                ");
        System.out.println("To: " + toEmail);
        System.out.println(emailText);
        System.out.println("====================================================================");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@pharmacy.com");
            message.setTo(toEmail);
            message.setSubject("Prescription Reviewed & Approved - PharmaCare");
            message.setText(emailText);

            mailSender.send(message);
            log.info("Prescription approval email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send prescription approval email to {} via SMTP: {}. (Development bypass: Details printed to console!)", 
                    toEmail, e.getMessage());
        }
    }

    @Async
    public void sendOrderConfirmedEmail(User user, Order order) {
        String toEmail = user.getEmail();
        log.info("Generating order confirmation email for user: {}", toEmail);

        // Check if any medicine in the order requires prescription
        boolean containsPrescriptionMedicine = false;
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                if (Boolean.TRUE.equals(item.getMedicine().getRequiresPrescription())) {
                    containsPrescriptionMedicine = true;
                    break;
                }
            }
        }

        StringBuilder itemsListText = new StringBuilder();
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                itemsListText.append(" - ")
                        .append(item.getMedicine().getName())
                        .append(" (Qty: ").append(item.getQuantity()).append(") - $")
                        .append(String.format("%.2f", item.getPrice().multiply(new java.math.BigDecimal(item.getQuantity()))))
                        .append("\n");
            }
        }

        String rxBanner = "";
        if (containsPrescriptionMedicine) {
            rxBanner = "\n>>> Your prescription has been approved and your order has been successfully placed. <<<\n";
        }

        String emailText = "====================================================================\n"
                + "                     PHARMACY ORDER CONFIRMATION                    \n"
                + "====================================================================\n"
                + "Dear " + user.getFullName() + ",\n"
                + rxBanner + "\n"
                + "Your order #100" + order.getOrderId() + " has been successfully CONFIRMED!\n\n"
                + "--- ORDER DETAILS ---\n"
                + "Order ID: #100" + order.getOrderId() + "\n"
                + "Order Status: " + order.getOrderStatus() + "\n"
                + "Payment Status: " + order.getPaymentStatus() + "\n"
                + "Delivery Address:\n" + order.getDeliveryAddress() + "\n\n"
                + "--- ORDER SUMMARY ---\n"
                + itemsListText.toString()
                + "---------------------\n"
                + "TOTAL BILLED: $" + String.format("%.2f", order.getTotalAmount()) + "\n\n"
                + "Delivery Message: Your order will be processed and dispatched swiftly to your delivery address.\n"
                + "A tracking number will be provided once shipped.\n\n"
                + "Thank you for shopping with PharmaCare!\n"
                + "====================================================================";

        System.out.println("====================================================================");
        System.out.println("                    SENDING ORDER CONFIRMED EMAIL                   ");
        System.out.println("To: " + toEmail);
        System.out.println(emailText);
        System.out.println("====================================================================");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@pharmacy.com");
            message.setTo(toEmail);
            message.setSubject("Order Confirmed #" + order.getOrderId() + " - PharmaCare");
            message.setText(emailText);

            mailSender.send(message);
            log.info("Order confirmation email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send order confirmation email to {} via SMTP: {}. (Development bypass: Details printed to console!)", 
                    toEmail, e.getMessage());
        }
    }
}
