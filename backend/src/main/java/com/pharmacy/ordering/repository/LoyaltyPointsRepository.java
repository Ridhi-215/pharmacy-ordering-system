package com.pharmacy.ordering.repository;

import com.pharmacy.ordering.entity.LoyaltyPoints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoyaltyPointsRepository extends JpaRepository<LoyaltyPoints, Integer> {
    Optional<LoyaltyPoints> findByUserUserId(Integer userId);
}
