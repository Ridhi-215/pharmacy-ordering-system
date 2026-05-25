package com.pharmacy.ordering.repository;

import com.pharmacy.ordering.entity.Prescription;
import com.pharmacy.ordering.entity.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
    List<Prescription> findByUserUserIdOrderByUploadedAtDesc(Integer userId);
    List<Prescription> findByStatus(PrescriptionStatus status);
}
