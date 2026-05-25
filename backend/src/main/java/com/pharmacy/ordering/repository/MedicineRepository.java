package com.pharmacy.ordering.repository;

import com.pharmacy.ordering.entity.Medicine;
import com.pharmacy.ordering.entity.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Integer> {
    List<Medicine> findByCategoryCategoryId(Integer categoryId);
    
    List<Medicine> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrManufacturerContainingIgnoreCase(
            String name, String description, String manufacturer);

    List<Medicine> findByProductType(ProductType productType);
    
    List<Medicine> findByProductTypeAndCategoryCategoryId(ProductType productType, Integer categoryId);
    
    List<Medicine> findByStockQuantityLessThanEqual(Integer threshold);
    
    long countByStockQuantityLessThanEqual(Integer threshold);
}
