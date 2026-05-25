package com.pharmacy.ordering.service;

import com.pharmacy.ordering.dto.MedicineRequest;
import com.pharmacy.ordering.entity.Category;
import com.pharmacy.ordering.entity.Medicine;
import com.pharmacy.ordering.entity.ProductType;
import com.pharmacy.ordering.exception.ResourceNotFoundException;
import com.pharmacy.ordering.exception.BadRequestException;
import com.pharmacy.ordering.repository.CategoryRepository;
import com.pharmacy.ordering.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final CategoryRepository categoryRepository;

    public List<Medicine> getAllMedicines(Integer categoryId, String productTypeStr) {
        ProductType productType = null;
        if (productTypeStr != null && !productTypeStr.trim().isEmpty()) {
            try {
                productType = ProductType.valueOf(productTypeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid productType: " + productTypeStr);
            }
        }

        if (categoryId != null && productType != null) {
            return medicineRepository.findByProductTypeAndCategoryCategoryId(productType, categoryId);
        } else if (categoryId != null) {
            return medicineRepository.findByCategoryCategoryId(categoryId);
        } else if (productType != null) {
            return medicineRepository.findByProductType(productType);
        }
        return medicineRepository.findAll();
    }

    public Medicine getMedicineById(Integer id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
    }

    @Transactional
    public Medicine createMedicine(MedicineRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        ProductType type = ProductType.MEDICINE;
        if (request.getProductType() != null && !request.getProductType().trim().isEmpty()) {
            try {
                type = ProductType.valueOf(request.getProductType().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid productType: " + request.getProductType());
            }
        }

        Medicine medicine = Medicine.builder()
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .dosage(request.getDosage())
                .packaging(request.getPackaging())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .requiresPrescription(request.getRequiresPrescription())
                .manufacturer(request.getManufacturer())
                .productType(type)
                .build();

        return medicineRepository.save(medicine);
    }

    @Transactional
    public Medicine updateMedicine(Integer id, MedicineRequest request) {
        Medicine medicine = getMedicineById(id);
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        ProductType type = ProductType.MEDICINE;
        if (request.getProductType() != null && !request.getProductType().trim().isEmpty()) {
            try {
                type = ProductType.valueOf(request.getProductType().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid productType: " + request.getProductType());
            }
        }

        medicine.setCategory(category);
        medicine.setName(request.getName());
        medicine.setDescription(request.getDescription());
        medicine.setDosage(request.getDosage());
        medicine.setPackaging(request.getPackaging());
        medicine.setPrice(request.getPrice());
        medicine.setStockQuantity(request.getStockQuantity());
        medicine.setRequiresPrescription(request.getRequiresPrescription());
        medicine.setManufacturer(request.getManufacturer());
        medicine.setProductType(type);

        return medicineRepository.save(medicine);
    }

    @Transactional
    public void deleteMedicine(Integer id) {
        Medicine medicine = getMedicineById(id);
        medicineRepository.delete(medicine);
    }

    public List<Medicine> searchMedicines(String query) {
        if (query == null || query.trim().isEmpty()) {
            return medicineRepository.findAll();
        }
        return medicineRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrManufacturerContainingIgnoreCase(
                query, query, query
        );
    }

    public List<Medicine> getLowStockMedicines() {
        return medicineRepository.findByStockQuantityLessThanEqual(10);
    }
}
