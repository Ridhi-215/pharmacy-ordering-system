package com.pharmacy.ordering.service;

import com.pharmacy.ordering.dto.*;
import com.pharmacy.ordering.entity.*;
import com.pharmacy.ordering.exception.BadRequestException;
import com.pharmacy.ordering.exception.ResourceNotFoundException;
import com.pharmacy.ordering.repository.*;
import com.pharmacy.ordering.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoyaltyPointsRepository loyaltyPointsRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("John Doe");
        registerRequest.setEmail("john@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setPhone("1234567890");
        registerRequest.setAddress("123 Street");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("john@example.com");
        loginRequest.setPassword("password123");

        mockUser = User.builder()
                .userId(1)
                .fullName("John Doe")
                .email("john@example.com")
                .password("encodedPassword")
                .role(Role.CUSTOMER)
                .isVerified(true)
                .build();
    }

    @Test
    void registerUser_Success() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(loyaltyPointsRepository.save(any(LoyaltyPoints.class))).thenReturn(new LoyaltyPoints());

        User result = authService.registerUser(registerRequest);

        assertNotNull(result);
        assertEquals("john@example.com", result.getEmail());
        assertTrue(result.getIsVerified());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerUser(registerRequest));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void authenticateUser_Success() {
        Authentication mockAuth = mock(Authentication.class);
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(mockUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(mockAuth);
        when(tokenProvider.generateToken(mockAuth)).thenReturn("mockJwtToken");

        AuthResponse result = authService.authenticateUser(loginRequest);

        assertNotNull(result);
        assertEquals("mockJwtToken", result.getToken());
        assertEquals("john@example.com", result.getEmail());
        assertEquals("John Doe", result.getFullName());
    }

    @Test
    void authenticateUser_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.authenticateUser(loginRequest));
    }
}
