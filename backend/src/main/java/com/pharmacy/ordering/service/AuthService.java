package com.pharmacy.ordering.service;

import com.pharmacy.ordering.dto.AuthResponse;
import com.pharmacy.ordering.dto.LoginRequest;
import com.pharmacy.ordering.dto.RegisterRequest;
import com.pharmacy.ordering.dto.UserProfileResponse;
import com.pharmacy.ordering.entity.LoyaltyPoints;
import com.pharmacy.ordering.entity.Role;
import com.pharmacy.ordering.entity.User;
import com.pharmacy.ordering.exception.BadRequestException;
import com.pharmacy.ordering.exception.ResourceNotFoundException;
import com.pharmacy.ordering.repository.LoyaltyPointsRepository;
import com.pharmacy.ordering.repository.UserRepository;
import com.pharmacy.ordering.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final LoyaltyPointsRepository loyaltyPointsRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Transactional
    public User registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email address already in use.");
        }

        User user = User.builder()
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .phone(registerRequest.getPhone())
                .role(Role.CUSTOMER) // Default to CUSTOMER
                .address(registerRequest.getAddress())
                .isVerified(true)
                .verificationToken(null)
                .build();

        User savedUser = userRepository.save(user);

        // Initialize Loyalty Points
        LoyaltyPoints loyaltyPoints = LoyaltyPoints.builder()
                .user(savedUser)
                .totalPoints(0)
                .build();
        loyaltyPointsRepository.save(loyaltyPoints);

        return savedUser;
    }

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginRequest.getEmail()));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(
                jwt,
                user.getEmail(),
                user.getRole().name(),
                user.getFullName(),
                user.getUserId()
        );
    }

    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Integer points = loyaltyPointsRepository.findByUserUserId(user.getUserId())
                .map(LoyaltyPoints::getTotalPoints)
                .orElse(0);

        return UserProfileResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .address(user.getAddress())
                .loyaltyPoints(points)
                .build();
    }
}
