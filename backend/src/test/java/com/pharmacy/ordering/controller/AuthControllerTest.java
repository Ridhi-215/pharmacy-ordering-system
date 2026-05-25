package com.pharmacy.ordering.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy.ordering.dto.*;
import com.pharmacy.ordering.entity.*;
import com.pharmacy.ordering.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = AuthController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private com.pharmacy.ordering.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.pharmacy.ordering.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.pharmacy.ordering.security.UserDetailsServiceImpl userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User mockUser;
    private AuthResponse authResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("John Doe");
        registerRequest.setEmail("john@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setPhone("1234567890");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("john@example.com");
        loginRequest.setPassword("password123");

        mockUser = User.builder()
                .userId(1)
                .fullName("John Doe")
                .email("john@example.com")
                .role(Role.CUSTOMER)
                .build();

        authResponse = new AuthResponse("mockJwtToken", "john@example.com", "CUSTOMER", "John Doe", 1);
    }

    @Test
    void registerUser_Success() throws Exception {
        when(authService.registerUser(any(RegisterRequest.class))).thenReturn(mockUser);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.fullName").value("John Doe"));
    }

    @Test
    void loginUser_Success() throws Exception {
        when(authService.authenticateUser(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mockJwtToken"))
                .andExpect(jsonPath("$.fullName").value("John Doe"));
    }
}
