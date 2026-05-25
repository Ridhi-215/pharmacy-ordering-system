package com.pharmacy.ordering.repository;

import com.pharmacy.ordering.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    List<CartItem> findByUserUserId(Integer userId);
    Optional<CartItem> findByUserUserIdAndMedicineMedicineId(Integer userId, Integer medicineId);
    void deleteByUserUserId(Integer userId);
}
