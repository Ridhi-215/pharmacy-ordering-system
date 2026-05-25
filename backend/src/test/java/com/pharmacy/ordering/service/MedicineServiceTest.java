package com.pharmacy.ordering.service;

import com.pharmacy.ordering.entity.*;
import com.pharmacy.ordering.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepository;
    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private MedicineService medicineService;

    private Medicine mockMedicine;
    private Category mockCategory;

    @BeforeEach
    void setUp() {
        mockCategory = Category.builder()
                .categoryId(1)
                .categoryName("Analgesics")
                .description("Pain relievers")
                .build();

        mockMedicine = Medicine.builder()
                .medicineId(10)
                .name("Paracetamol")
                .category(mockCategory)
                .price(new BigDecimal("5.00"))
                .stockQuantity(10)
                .requiresPrescription(false)
                .build();
    }

    @Test
    void getAllMedicines_Success() {
        when(medicineRepository.findAll()).thenReturn(List.of(mockMedicine));

        List<Medicine> responses = medicineService.getAllMedicines(null, null);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Paracetamol", responses.get(0).getName());
    }

    @Test
    void getMedicineById_Success() {
        when(medicineRepository.findById(10)).thenReturn(Optional.of(mockMedicine));

        Medicine response = medicineService.getMedicineById(10);

        assertNotNull(response);
        assertEquals("Paracetamol", response.getName());
    }
}
