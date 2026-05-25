package com.pharmacy.ordering.controller;

import com.pharmacy.ordering.dto.PrescriptionResponse;
import com.pharmacy.ordering.service.PrescriptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = PrescriptionController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
public class PrescriptionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PrescriptionService prescriptionService;

    @MockBean
    private com.pharmacy.ordering.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.pharmacy.ordering.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.pharmacy.ordering.security.UserDetailsServiceImpl userDetailsService;

    private PrescriptionResponse prescriptionResponse;

    @BeforeEach
    void setUp() {
        prescriptionResponse = PrescriptionResponse.builder()
                .prescriptionId(200)
                .userId(1)
                .userFullName("John Doe")
                .fileUrl("/uploads/mockfile.pdf")
                .status("PENDING")
                .build();
    }

    @Test
    void getPrescriptions_AsCustomer_Success() throws Exception {
        Authentication mockPrincipal = mock(Authentication.class);
        when(mockPrincipal.getName()).thenReturn("john@example.com");
        when(mockPrincipal.getAuthorities()).thenReturn(Collections.emptyList());
        when(prescriptionService.getCustomerPrescriptions("john@example.com")).thenReturn(List.of(prescriptionResponse));

        mockMvc.perform(get("/api/prescriptions")
                        .principal(mockPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].prescriptionId").value(200));
    }

    @Test
    void approvePrescription_Success() throws Exception {
        when(prescriptionService.approvePrescription(eq(200), any())).thenReturn(prescriptionResponse);

        mockMvc.perform(put("/api/prescriptions/200/approve")
                        .principal(() -> "admin@pharmacy.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prescriptionId").value(200));
    }
}
