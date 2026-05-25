package com.pharmacy.ordering.service;

import com.pharmacy.ordering.dto.CartItemResponse;
import com.pharmacy.ordering.dto.CartAddRequest;
import com.pharmacy.ordering.entity.*;
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
public class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private CartService cartService;

    private User mockUser;
    private Medicine mockMedicine;
    private CartItem mockCartItem;
    private CartAddRequest cartRequest;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .userId(1)
                .email("john@example.com")
                .fullName("John Doe")
                .build();

        mockMedicine = Medicine.builder()
                .medicineId(10)
                .name("Paracetamol")
                .price(new BigDecimal("5.00"))
                .stockQuantity(50)
                .build();

        mockCartItem = CartItem.builder()
                .cartId(100)
                .user(mockUser)
                .medicine(mockMedicine)
                .quantity(2)
                .build();

        cartRequest = new CartAddRequest();
        cartRequest.setMedicineId(10);
        cartRequest.setQuantity(2);
    }

    @Test
    void addToCart_Success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(medicineRepository.findById(10)).thenReturn(Optional.of(mockMedicine));
        when(cartItemRepository.findByUserUserIdAndMedicineMedicineId(1, 10)).thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(mockCartItem);

        CartItemResponse response = cartService.addToCart("john@example.com", cartRequest);

        assertNotNull(response);
        assertEquals(2, response.getQuantity());
        assertEquals("Paracetamol", response.getName());
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    void getCart_Success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findByUserUserId(1)).thenReturn(List.of(mockCartItem));

        List<CartItemResponse> responses = cartService.getCart("john@example.com");

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Paracetamol", responses.get(0).getName());
    }
}
