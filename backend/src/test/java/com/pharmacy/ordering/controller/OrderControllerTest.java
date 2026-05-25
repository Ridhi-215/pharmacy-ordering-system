package com.pharmacy.ordering.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy.ordering.dto.*;
import com.pharmacy.ordering.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = OrderController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @MockBean
    private com.pharmacy.ordering.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.pharmacy.ordering.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.pharmacy.ordering.security.UserDetailsServiceImpl userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    private OrderPlaceRequest orderPlaceRequest;
    private OrderResponse orderResponse;

    @BeforeEach
    void setUp() {
        orderPlaceRequest = new OrderPlaceRequest();
        orderPlaceRequest.setDeliveryAddress("123 Street");
        orderPlaceRequest.setPaymentMethod("CARD");

        orderResponse = OrderResponse.builder()
                .orderId(500)
                .userId(1)
                .customerName("John Doe")
                .totalAmount(new BigDecimal("20.00"))
                .orderStatus("PENDING")
                .paymentStatus("PENDING")
                .deliveryAddress("123 Street")
                .orderItems(new ArrayList<>())
                .build();
    }

    @Test
    void placeOrder_Success() throws Exception {
        when(orderService.placeOrder(any(), any(OrderPlaceRequest.class))).thenReturn(orderResponse);

        mockMvc.perform(post("/api/orders/place")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderPlaceRequest))
                        .principal(() -> "john@example.com"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(500))
                .andExpect(jsonPath("$.orderStatus").value("PENDING"));
    }

    @Test
    void getOrderHistory_Success() throws Exception {
        when(orderService.getOrderHistory(any())).thenReturn(List.of(orderResponse));

        mockMvc.perform(get("/api/orders/history")
                        .principal(() -> "john@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderId").value(500));
    }
}
