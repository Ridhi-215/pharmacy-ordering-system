package com.pharmacy.ordering.controller;

import com.pharmacy.ordering.entity.Medicine;
import com.pharmacy.ordering.service.MedicineService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = MedicineController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class})
@AutoConfigureMockMvc(addFilters = false)
public class MedicineControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MedicineService medicineService;

    @MockBean
    private com.pharmacy.ordering.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.pharmacy.ordering.security.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.pharmacy.ordering.security.UserDetailsServiceImpl userDetailsService;

    private Medicine medicineResponse;

    @BeforeEach
    void setUp() {
        medicineResponse = Medicine.builder()
                .medicineId(10)
                .name("Paracetamol")
                .price(new BigDecimal("5.00"))
                .stockQuantity(50)
                .build();
    }

    @Test
    void getAllMedicines_Success() throws Exception {
        when(medicineService.getAllMedicines(null, null)).thenReturn(List.of(medicineResponse));

        mockMvc.perform(get("/api/medicines"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Paracetamol"));
    }

    @Test
    void getMedicineById_Success() throws Exception {
        when(medicineService.getMedicineById(10)).thenReturn(medicineResponse);

        mockMvc.perform(get("/api/medicines/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Paracetamol"));
    }
}
