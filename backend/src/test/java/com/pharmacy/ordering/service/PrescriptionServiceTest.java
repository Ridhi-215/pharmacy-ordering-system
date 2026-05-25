package com.pharmacy.ordering.service;

import com.pharmacy.ordering.dto.PrescriptionResponse;
import com.pharmacy.ordering.entity.*;
import com.pharmacy.ordering.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PrescriptionServiceTest {

    @Mock
    private PrescriptionRepository prescriptionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private PrescriptionService prescriptionService;

    private User mockUser;
    private Prescription mockPrescription;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .userId(1)
                .email("john@example.com")
                .fullName("John Doe")
                .build();

        mockPrescription = Prescription.builder()
                .prescriptionId(200)
                .user(mockUser)
                .fileUrl("/uploads/mockfile.pdf")
                .status(PrescriptionStatus.PENDING)
                .build();
    }

    @Test
    void approvePrescription_Success() {
        when(prescriptionRepository.findById(200)).thenReturn(Optional.of(mockPrescription));
        when(prescriptionRepository.save(any(Prescription.class))).thenReturn(mockPrescription);
        when(orderRepository.findByPrescriptionPrescriptionId(200)).thenReturn(Optional.empty());

        PrescriptionResponse response = prescriptionService.approvePrescription(200, "admin@pharmacy.com");

        assertNotNull(response);
        assertEquals("APPROVED", response.getStatus());
        assertEquals("admin@pharmacy.com", response.getVerifiedBy());
        verify(emailService, times(1)).sendPrescriptionApprovedEmail(any(User.class), any(Prescription.class));
    }

    @Test
    void rejectPrescription_Success() {
        when(prescriptionRepository.findById(200)).thenReturn(Optional.of(mockPrescription));
        when(prescriptionRepository.save(any(Prescription.class))).thenReturn(mockPrescription);
        when(orderRepository.findByPrescriptionPrescriptionId(200)).thenReturn(Optional.empty());

        PrescriptionResponse response = prescriptionService.rejectPrescription(200, "admin@pharmacy.com", "Image is unclear");

        assertNotNull(response);
        assertEquals("REJECTED", response.getStatus());
        assertEquals("admin@pharmacy.com", response.getVerifiedBy());
    }
}
