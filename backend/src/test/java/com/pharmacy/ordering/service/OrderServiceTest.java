package com.pharmacy.ordering.service;

import com.pharmacy.ordering.dto.*;
import com.pharmacy.ordering.entity.*;
import com.pharmacy.ordering.exception.BadRequestException;
import com.pharmacy.ordering.exception.ResourceNotFoundException;
import com.pharmacy.ordering.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MedicineRepository medicineRepository;
    @Mock
    private PrescriptionRepository prescriptionRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private LoyaltyPointsRepository loyaltyPointsRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private OrderService orderService;

    private User mockUser;
    private Medicine mockMedicine;
    private CartItem mockCartItem;
    private OrderPlaceRequest orderPlaceRequest;
    private Order mockOrder;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .userId(1)
                .fullName("John Doe")
                .email("john@example.com")
                .role(Role.CUSTOMER)
                .build();

        mockMedicine = Medicine.builder()
                .medicineId(10)
                .name("Paracetamol")
                .price(new BigDecimal("10.00"))
                .stockQuantity(100)
                .requiresPrescription(false)
                .build();

        mockCartItem = CartItem.builder()
                .cartId(100)
                .user(mockUser)
                .medicine(mockMedicine)
                .quantity(2)
                .build();

        orderPlaceRequest = new OrderPlaceRequest();
        orderPlaceRequest.setDeliveryAddress("123 Street Address");
        orderPlaceRequest.setPaymentMethod("CARD");

        mockOrder = Order.builder()
                .orderId(500)
                .user(mockUser)
                .totalAmount(new BigDecimal("20.00"))
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryAddress("123 Street Address")
                .orderItems(new ArrayList<>())
                .build();
    }

    @Test
    void placeOrder_StandardProducts_Success() {
        List<CartItem> cartItems = List.of(mockCartItem);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findByUserUserId(1)).thenReturn(cartItems);
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);
        when(paymentRepository.save(any(Payment.class))).thenReturn(new Payment());

        OrderResponse result = orderService.placeOrder("john@example.com", orderPlaceRequest);

        assertNotNull(result);
        assertEquals("PENDING", result.getOrderStatus());
        verify(orderRepository, times(2)).save(any(Order.class));
        verify(cartItemRepository, times(1)).deleteAll(cartItems);
    }

    @Test
    void placeOrder_PrescriptionRequired_NoUpload_ThrowsException() {
        mockMedicine.setRequiresPrescription(true);
        List<CartItem> cartItems = List.of(mockCartItem);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findByUserUserId(1)).thenReturn(cartItems);

        assertThrows(BadRequestException.class, () -> orderService.placeOrder("john@example.com", orderPlaceRequest));
    }

    @Test
    void placeOrder_PrescriptionPending_ThrowsException() {
        mockMedicine.setRequiresPrescription(true);
        orderPlaceRequest.setPrescriptionId(20);
        List<CartItem> cartItems = List.of(mockCartItem);
        Prescription mockPendingRx = Prescription.builder()
                .prescriptionId(20)
                .user(mockUser)
                .status(PrescriptionStatus.PENDING)
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findByUserUserId(1)).thenReturn(cartItems);
        when(prescriptionRepository.findByUserUserIdOrderByUploadedAtDesc(1)).thenReturn(List.of(mockPendingRx));
        when(prescriptionRepository.findById(20)).thenReturn(Optional.of(mockPendingRx));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> 
            orderService.placeOrder("john@example.com", orderPlaceRequest)
        );
        assertEquals("Prescription approval is pending from admin.", ex.getMessage());
    }

    @Test
    void placeOrder_PrescriptionRejected_ThrowsException() {
        mockMedicine.setRequiresPrescription(true);
        orderPlaceRequest.setPrescriptionId(20);
        List<CartItem> cartItems = List.of(mockCartItem);
        Prescription mockRejectedRx = Prescription.builder()
                .prescriptionId(20)
                .user(mockUser)
                .status(PrescriptionStatus.REJECTED)
                .rejectionReason("Document is not legible")
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findByUserUserId(1)).thenReturn(cartItems);
        when(prescriptionRepository.findByUserUserIdOrderByUploadedAtDesc(1)).thenReturn(List.of(mockRejectedRx));
        when(prescriptionRepository.findById(20)).thenReturn(Optional.of(mockRejectedRx));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
            orderService.placeOrder("john@example.com", orderPlaceRequest)
        );
        assertTrue(ex.getMessage().contains("Prescription was rejected by admin."));
        assertTrue(ex.getMessage().contains("Document is not legible"));
    }

    @Test
    void placeOrder_OldApprovedPrescription_ThrowsException() {
        mockMedicine.setRequiresPrescription(true);
        orderPlaceRequest.setPrescriptionId(10);
        List<CartItem> cartItems = List.of(mockCartItem);
        Prescription oldApprovedRx = Prescription.builder()
                .prescriptionId(10)
                .user(mockUser)
                .status(PrescriptionStatus.APPROVED)
                .build();
        Prescription latestRejectedRx = Prescription.builder()
                .prescriptionId(20)
                .user(mockUser)
                .status(PrescriptionStatus.REJECTED)
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findByUserUserId(1)).thenReturn(cartItems);
        when(prescriptionRepository.findByUserUserIdOrderByUploadedAtDesc(1))
                .thenReturn(List.of(latestRejectedRx, oldApprovedRx));
        when(prescriptionRepository.findById(10)).thenReturn(Optional.of(oldApprovedRx));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
            orderService.placeOrder("john@example.com", orderPlaceRequest)
        );
        assertEquals("You must use your latest uploaded prescription for checkout.", ex.getMessage());
    }

    @Test
    void placeOrder_ApprovedPrescription_Success() {
        mockMedicine.setRequiresPrescription(true);
        orderPlaceRequest.setPrescriptionId(20);
        List<CartItem> cartItems = List.of(mockCartItem);
        Prescription mockApprovedRx = Prescription.builder()
                .prescriptionId(20)
                .user(mockUser)
                .status(PrescriptionStatus.APPROVED)
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findByUserUserId(1)).thenReturn(cartItems);
        when(prescriptionRepository.findByUserUserIdOrderByUploadedAtDesc(1)).thenReturn(List.of(mockApprovedRx));
        when(prescriptionRepository.findById(20)).thenReturn(Optional.of(mockApprovedRx));
        when(orderRepository.findByPrescriptionPrescriptionId(20)).thenReturn(Optional.empty());
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);
        when(paymentRepository.save(any(Payment.class))).thenReturn(new Payment());

        OrderResponse result = orderService.placeOrder("john@example.com", orderPlaceRequest);

        assertNotNull(result);
        verify(cartItemRepository, times(1)).deleteAll(cartItems);
    }

    @Test
    void placeOrder_DuplicatePrescriptionOrder_ThrowsException() {
        mockMedicine.setRequiresPrescription(true);
        orderPlaceRequest.setPrescriptionId(20);
        List<CartItem> cartItems = List.of(mockCartItem);
        Prescription mockApprovedRx = Prescription.builder()
                .prescriptionId(20)
                .user(mockUser)
                .status(PrescriptionStatus.APPROVED)
                .build();
        Order existingOrder = Order.builder()
                .orderId(900)
                .orderStatus(OrderStatus.CONFIRMED)
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findByUserUserId(1)).thenReturn(cartItems);
        when(prescriptionRepository.findByUserUserIdOrderByUploadedAtDesc(1)).thenReturn(List.of(mockApprovedRx));
        when(prescriptionRepository.findById(20)).thenReturn(Optional.of(mockApprovedRx));
        when(orderRepository.findByPrescriptionPrescriptionId(20)).thenReturn(Optional.of(existingOrder));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
            orderService.placeOrder("john@example.com", orderPlaceRequest)
        );
        assertEquals("An order has already been placed with this prescription.", ex.getMessage());
    }

    @Test
    void cancelOrder_Success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(orderRepository.findById(500)).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);

        OrderResponse result = orderService.cancelOrder(500, "john@example.com");

        assertNotNull(result);
        assertEquals("CANCELLED", result.getOrderStatus());
    }
}
